import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/authContext.jsx";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useApi } from "../utils/axiosInstance";
import toast from "react-hot-toast";

const Docs = () => {
  const { user } = useContext(AuthContext);
  const { isAuthenticated } = useKindeAuth();
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [renameModal, setRenameModal] = useState(false); // ✅ New state for rename popup
  const [renameTitle, setRenameTitle] = useState("");
  const [renameDocId, setRenameDocId] = useState(null);
  const api = useApi();
  const navigate = useNavigate();

  const fakeUserId = "user-" + Math.floor(Math.random() * 1000);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const sendProfileData = async () => {
      if (!isAuthenticated) return;
      try {
        await api.post("/user/profile", {
          email: user.email,
          firstName: user.givenName,
          lastName: user.familyName,
          userId: user.id,
        });
      } catch (error) {
        toast.error("Error sending profile data");
        console.error("Error sending profile data:", error);
      }
    };

    const fetchDocs = async () => {
      try {
        const response = await api.get(`/documents/getDocs`, {
          params: { owner: user ? user.id : fakeUserId },
        });
        setDocuments(response.data);
      } catch (error) {
        toast.error("Error fetching documents");
        console.error("Error fetching documents:", error);
      }
    };

    sendProfileData();
    fetchDocs();
  }, []);

  // ✅ Create Document
  const handleCreateDoc = async () => {
    if (!title.trim()) {
      toast.error("Document title cannot be empty!");
      return;
    }

    try {
      const response = await api.post("/documents/createDoc", {
        title,
        owner: user.id,
      });
      setDocuments([...documents, response.data]);
      setTitle("");
      setShowModal(false);
      toast.success("Document created successfully!");
    } catch (error) {
      toast.error("Error creating document");
      console.error("Error creating document:", error);
    }
  };

  // ✏️ Open Rename Modal
  const openRenameModal = (doc) => {
    setRenameDocId(doc._id);
    setRenameTitle(doc.title);
    setRenameModal(true);
  };

  // ✏️ Confirm Rename
  const handleRenameDoc = async () => {
    if (!renameTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const response = await api.put(`/documents/renameDoc/${renameDocId}`, {
        title: renameTitle,
      });
      setDocuments(
        documents.map((doc) =>
          doc._id === renameDocId ? { ...doc, title: response.data.title } : doc
        )
      );
      setRenameModal(false);
      toast.success("Document renamed!");
    } catch (error) {
      toast.error("Error renaming document");
      console.error("Error renaming document:", error);
    }
  };

  // 🗑 Delete Document
  const handleDeleteDoc = async (id) => {
    toast((t) => (
      <span>
        Are you sure?
        <button
          onClick={async () => {
            try {
              await api.delete(`/documents/deleteDoc/${id}`);
              setDocuments(documents.filter((doc) => doc._id !== id));
              toast.dismiss(t.id);
              toast.success("Document deleted!");
            } catch (error) {
              toast.error("Error deleting document");
              console.error("Error deleting document:", error);
            }
          }}
          className="ml-3 px-2 py-1 bg-red-500 text-white rounded"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-2 px-2 py-1 bg-gray-300 rounded"
        >
          No
        </button>
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-[5rem]">
        <h1 className=" md:text-2xl text-[15px] font-bold text-gray-800">My Documents</h1>
        <button
          onClick={() => setShowModal(true)}
          className="md:px-4 md:py-2 py-1 px-2 text-[15px] bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          + New Document
        </button>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <p className="text-gray-500">No documents yet. Create one!</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <div
                onClick={() => navigate(`/docs/${doc._id}`)}
                className="cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Owner: {doc.owner || "You"}
                </p>
              </div>

              <div className="flex justify-end mt-3 space-x-2">
                <button
                  onClick={() => openRenameModal(doc)}
                  className="px-2 py-1 text-sm rounded bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDeleteDoc(doc._id)}
                  className="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Create New Document
            </h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDoc}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Rename Document</h2>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Enter new title"
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRenameModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameDoc}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Docs;
