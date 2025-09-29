import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/authContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import QuillCursors from "quill-cursors";
import socket from "../utils/socket";
import { useApi } from "../utils/axiosInstance.js";
import toast from "react-hot-toast";

ReactQuill.Quill.register("modules/cursors", QuillCursors);

export default function Editor({ docId, userId }) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Loading...");
  const [collaborators, setCollaborators] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [ownerId, setOwnerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const quillRef = useRef(null);
  const cursorsRef = useRef(null);
  const { user } = useContext(AuthContext);
  const api = useApi();
  const navigate = useNavigate();

  // 🔹 Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { data } = await api.get(`/user/allUsers/${docId}`);
        setUsers(data.users);
        setOwnerId(data.ownerId);
      } catch (err) {
        toast.error("Failed to fetch users");
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, [docId]);

  // 🔹 Fetch collaborators
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const { data } = await api.get(`/documents/${docId}/collaborators`);
        setCollaborators(data);
      } catch (err) {
        toast.error("Failed to fetch collaborators");
        console.error("Error fetching collaborators:", err);
      }
    };
    if (docId) fetchCollaborators();
  }, [docId]);

  // 🔹 Check access
  useEffect(() => {
    if (loading || !user) return;
    const isOwner = user.id === ownerId;
    const isCollaborator = collaborators.some((c) => c.userId === user.id);
    if (!isOwner && !isCollaborator) {
      toast.error("You don’t have access to this document");
      navigate("/docs");
    }
  }, [loading, user, ownerId, collaborators, navigate]);

  // 🔹 Local search
  useEffect(() => {
    if (!searchQuery) return setSearchResults([]);
    const results = users.filter((u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  }, [searchQuery, users]);

 
useEffect(() => {
  if (!docId) return;

  // helper to get the latest editor instance
  const getEditor = () => quillRef.current && quillRef.current.getEditor();

  // mark whether editor is ready
  let editorReady = false;

  // join room
  socket.emit("join-document", { docId, userId });

  // when document payload arrives (initial load)
  socket.on("document", ({ content }) => {
    const editor = getEditor();
    if (!editor) {
      // editor might not be ready yet; setState so ReactQuill shows content when it mounts
      setValue(content || "");
    } else {
      // set Quill contents safely
      try {
        editor.setContents(editor.clipboard.convert(content || ""), "silent");
        setValue(content || "");
      } catch (e) {
        // fallback: set state
        setValue(content || "");
      }
    }
    setStatus("All changes saved");
    editorReady = true;
  });

  // remote changes (delta + optional full content)
  socket.on("remote-changes", ({ delta, content }) => {
    const editor = getEditor();
    if (!editor) {
      // If editor not ready, stash full content into state so it will render once ready
      if (typeof content === "string") setValue(content);
      return;
    }

    if (delta) {
      try {
        editor.updateContents(delta, "remote");
      } catch (e) {
        // if delta fails, and we have content, set whole content
        if (typeof content === "string") {
          try {
            editor.setContents(editor.clipboard.convert(content || ""), "silent");
            setValue(content || "");
          } catch (err) {
            setValue(content || "");
          }
        }
      }
    } else if (typeof content === "string") {
      // no delta — fallback to full content
      try {
        editor.setContents(editor.clipboard.convert(content || ""), "silent");
        setValue(content || "");
      } catch (e) {
        setValue(content || "");
      }
    }
  });

  socket.on("document-saved", () => setStatus("All changes saved"));

  socket.on("user-joined", ({ userId }) => {
    console.log("User joined:", userId);
  });

  socket.on("user-left", ({ userId }) => {
    cursorsRef.current?.removeCursor(userId);
  });

  socket.on("cursor-update", ({ userId: uid, range, color }) => {
    if (!cursorsRef.current) return;
    cursorsRef.current.createCursor(uid, uid, color);
    cursorsRef.current.moveCursor(uid, range);
  });

  // cleanup
  return () => {
    socket.off("document");
    socket.off("remote-changes");
    socket.off("document-saved");
    socket.off("user-joined");
    socket.off("user-left");
    socket.off("cursor-update");
  };
}, [docId, userId]);


  // 🔹 Local changes
  const handleChange = (content, delta, source, editor) => {
    if (source !== "user") return;
    setValue(content);
    setStatus("Saving...");
    socket.emit("doc-changes", { docId, userId, delta, content });

    const range = editor.getSelection();
    if (range) {
      socket.emit("cursor-update", {
        docId,
        userId,
        range,
        color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
      });
    }
  };

  // 🔹 Manual save
  const handleSave = () => {
    socket.emit("save-document", { docId });
    setStatus("Saving...");
    toast.success("Document saved successfully!");
  };

  // 🔹 Copy URL
  const handleCopyUrl = () => {
    const url = `${window.location.origin}/docs/${docId}`;
    navigator.clipboard.writeText(url);
    toast.success("✅ Document URL copied to clipboard!");
  };

  // 🔹 Add collaborator
  const addCollaborator = async (user) => {
    try {
      await api.post(`/documents/${docId}/addCollaborator`, {
        userId: user.userId,
        username: user.username,
      });
      setCollaborators((prev) => [
        ...prev,
        { userId: user.userId, username: user.username },
      ]);
      setShowAddPopup(false);
      setSearchQuery("");
      setSearchResults([]);
      toast.success(`Added ${user.username} as collaborator!`);
    } catch (err) {
      toast.error("Failed to add collaborator");
      console.error(err);
    }
  };

  // 🔹 Remove collaborator
  const removeCollaborator = async (collab) => {
    try {
      await api.post(`/documents/${docId}/removeCollaborator`, {
        userId: collab.userId,
      });
      setCollaborators((prev) =>
        prev.filter((c) => c.userId !== collab.userId)
      );
      toast.success(`Removed ${collab.username || collab.userId}`);
    } catch (err) {
      toast.error("Failed to remove collaborator");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen pt-20 text-lg">
        Checking access...
      </div>
    );
  }
  if(!user){
    navigate('/');
    return null;
  }

  return (

   <div className="flex flex-col md:flex-row h-screen pt-20">
      {/* Sidebar and its toggle */}
      {user.id === ownerId && (
        <>
          <div
            className={`fixed inset-y-0 left-0 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 bg-gray-100 p-4 flex flex-col transition-transform duration-300 ease-in-out z-40 scroll-auto`}
          >
            <h2 className="font-semibold text-lg mb-4  ml-14">Collaborators</h2>
            <ul className="flex-1 overflow-y-auto space-y-2 mb-4">
              {collaborators.map((c) => (
                <li key={c.userId} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
                  <span className="truncate">{c.username || c.userId}</span>
                  <button
                    onClick={() => removeCollaborator(c)}
                    className="text-red-500 text-sm hover:text-red-700 transition"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowAddPopup(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Add Collaborator
            </button>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg transition-all duration-300"
            aria-label="Toggle sidebar"
          >
            {showSidebar ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </>
      )}

      {/* Add Collaborator Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="relative w-11/12 md:w-96 p-6 bg-white rounded-xl shadow-2xl animate-fade-in-up">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Add Collaborator</h3>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <ul className="max-h-40 overflow-y-auto space-y-2 mb-4">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <li key={u.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                    <span className="text-gray-700 truncate">{u.email}</span>
                    <button
                      onClick={() => {
                        addCollaborator(u);
                        setShowAddPopup(false);
                      }}
                      className="text-blue-600 text-sm font-medium hover:text-blue-800 transition"
                    >
                      Add
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">No users found.</p>
              )}
            </ul>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddPopup(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200 shadow-sm">
          <span className="text-sm text-gray-600 font-medium">{status}</span>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="md:px-4 md:py-2 px-1 bg-blue-100 text-black font-medium rounded-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-md"
            >
              Save
            </button>
            <button
              onClick={handleCopyUrl}
              className="md:px-4 md:py-2 px-1 bg-green-100 text-black font-medium rounded-lg hover:bg-green-700 transition transform hover:scale-105 shadow-md"
            >
              Copy URL
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-6 bg-white">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={handleChange}
            modules={{
              cursors: true,
              toolbar: [
                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
              ]
            }}
            className="h-full quill-editor-container"
          />
        </div>
      </div>
    </div>
  );
}
