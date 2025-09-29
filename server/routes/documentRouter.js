import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {createDocument} from "../controllers/documentController.js";
import {getDocument} from "../controllers/documentController.js";
import {addCollaborator} from "../controllers/documentController.js";
import {removeCollaborator} from "../controllers/documentController.js";
import {updateDocument} from "../controllers/documentController.js";
import {deleteDocument} from "../controllers/documentController.js";
import {getCollaborators} from "../controllers/documentController.js";

const router = Router();
router.post("/createDoc", requireAuth, createDocument);
router.get("/getDocs",requireAuth,getDocument)
router.post("/:docId/addCollaborator", requireAuth, addCollaborator)
router.post("/:docId/removeCollaborator", requireAuth, removeCollaborator)
router.put("/renameDoc/:id",requireAuth,updateDocument)
router.delete("/deleteDoc/:id",requireAuth,deleteDocument)
router.get("/:docId/collaborators", requireAuth, getCollaborators);
export default router;