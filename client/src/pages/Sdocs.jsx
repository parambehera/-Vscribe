import Editor from "../components/Editor.jsx";
import { useParams, Navigate } from "react-router-dom";
import { AuthContext } from "../providers/authContext.jsx";
import { useContext } from "react";

const Sdocs = () => {
  const { id } = useParams();
  const { user, isLoading, isAuthenticated } = useContext(AuthContext);

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-gray-600">
            Please wait while we authenticate you
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Editor docId={id} userId={user.id} />
    </div>
  );
};
export default Sdocs;
