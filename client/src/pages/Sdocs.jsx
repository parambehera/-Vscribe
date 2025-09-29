import Editor from "../components/Editor.jsx";
import { useParams } from "react-router-dom";
import { AuthContext } from "../providers/authContext.jsx";
import { useContext } from "react";
const Sdocs = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  return (
    <div>
      <Editor docId={id} userId={user.id} />
    </div>
  );
};
export default Sdocs;
