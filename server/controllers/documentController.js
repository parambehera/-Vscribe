import DocumentModel from "../models/Document.model.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const createDocument = asyncHandler(async (req, res, next) => {
  {
    const { title, owner } = req.body;
    const doc = new DocumentModel({ title, owner });
    // console.log(req.owner);
    await doc.save();
    res.status(201).json(doc);
  }
});

export const getDocument = asyncHandler(async (req, res, next) => {
  try {
    const { owner } = req.query; // coming as ?owner=userId
    console.log(owner);
    if (!owner) {
      return res.status(400).json({ error: "Owner ID is required" });
    }
    const docs = await DocumentModel.find({ owner });
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

export async function updateDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { content, title } = req.body;
    const updated = await DocumentModel.findOneAndUpdate(
      { _id: id },
      { content, ...(title ? { title } : {}), $inc: { version: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}



export async function addCollaborator(req, res, next) {
  console.log("add colbartoer fucntionn triggerd");
  try {
    // const { docId } = req.params;
    const { userId, username } = req.body;
    // const document = await DocumentModel.findById(req.params.docId);
    await DocumentModel.findByIdAndUpdate(req.params.docId, {
      $push: { collaborators: { userId, username } },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function removeCollaborator(req, res, next) {
  const { userId } = req.body;
  try {
    await DocumentModel.findByIdAndUpdate(req.params.docId, {
      $pull: { collaborators: { userId } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove collaborator" });
    next(err);
  }
}

export async function renameDocument(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const updatedDoc = await DocumentModel.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    if (!updatedDoc) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(updatedDoc);
  } catch (error) {
    console.error("Error renaming document:", err);
    res.status(500).json({ message: "Error renaming document" });
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const deletedDoc = await DocumentModel.findByIdAndDelete(req.params.id);
    if (!deletedDoc) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ message: "Error deleting document" });
  }
}
export async function getCollaborators(req, res, next) {
  try {
    const document = await DocumentModel.findById(req.params.docId);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json(document.collaborators);
  } catch (err) {
    next(err);
  }
}
