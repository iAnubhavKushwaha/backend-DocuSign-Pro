import fs from "fs";
import path from "path";
import Document from "../models/Document.js";
import { uploadsDir } from "../../config/paths.js";
import { getContentType } from "../utils/fileHelpers.js";

// @desc    Upload a document
// @route   POST /api/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const document = new Document({
      user: req.user._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      signed: false,
      signatures: [],
    });

    const createdDocument = await document.save();

    res.status(201).json({
      message: "File uploaded successfully",
      document: createdDocument,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Use deleteOne() instead of remove()
    await Document.deleteOne({ _id: document._id });

    // Or alternatively:
    // await document.deleteOne();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    next(error);
  }
};

// @desc    Serve document file
// @route   GET /api/files/:filename
// @access  Public (but should have validation in production)
export const serveFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    console.log(`Request to serve file: ${filename}`);

    const filePath = path.join(uploadsDir, filename);
    console.log(`Looking for file at path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);

      // List files in uploads directory to help with debugging
      const files = fs.readdirSync(uploadsDir);
      console.log(`Files in uploads directory: ${files.join(", ")}`);

      return res.status(404).json({ error: "File not found" });
    }

    // Log the file details
    const stats = fs.statSync(filePath);
    console.log(
      `File exists. Size: ${stats.size} bytes, Created: ${stats.birthtime}`
    );

    // Set proper headers for file serving
    const contentType = getContentType(filename);
    console.log(`Serving file with content type: ${contentType}`);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    // Send the file with a callback to handle errors
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        next(err);
      } else {
        console.log(`File ${filename} sent successfully`);
      }
    });
  } catch (error) {
    console.error("Error serving file:", error);
    next(error);
  }
};

// In documentController.js
export const signDocument = async (req, res, next) => {
  try {
    console.log("Sign document request received:");
    console.log(" - Document ID:", req.params.id);
    console.log(" - User ID:", req.user?._id);
    console.log(" - Request body:", JSON.stringify(req.body));

    const { signatures } = req.body;

    if (!signatures || !Array.isArray(signatures)) {
      console.log("Invalid signatures data:", req.body);
      return res.status(400).json({ error: "Invalid signatures data" });
    }

    console.log("Finding document...");
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      console.log(
        "Document not found for ID:",
        req.params.id,
        "and user:",
        req.user._id
      );
      return res.status(404).json({ error: "Document not found" });
    }

    console.log("Document found, updating signatures");
    document.signatures = signatures;
    document.signed = true;
    document.signedAt = Date.now();

    const updatedDocument = await document.save();
    console.log("Document updated successfully");

    res.json({
      message: "Document signed successfully",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Error in signDocument controller:", error);
    next(error);
  }
};

// @desc    Serve document file by document ID
// @route   GET /api/documents/:id/file
// @access  Private
export const serveDocumentFile = async (req, res, next) => {
  try {
    console.log(`Request to serve file for document ID: ${req.params.id}`);
    console.log(`User ID from token: ${req.user?._id}`);

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!document) {
      console.log(
        `Document not found with ID ${req.params.id} for user ${req.user?._id}`
      );
      return res.status(404).json({ error: "Document not found" });
    }

    console.log(
      `Document found: ${document._id}, filename: ${document.filename}`
    );

    const filePath = path.join(uploadsDir, document.filename);
    console.log(`Looking for file at path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found at path: ${filePath}`);
      return res.status(404).json({ error: "File not found on server" });
    }

    console.log(
      `File exists, serving with content type: ${getContentType(
        document.filename
      )}`
    );

    res.setHeader("Content-Type", getContentType(document.filename));
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.originalName}"`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err.message}`);
      } else {
        console.log(`File ${document.filename} sent successfully`);
      }
    });
  } catch (error) {
    console.error("Error serving document file:", error);
    next(error);
  }
};
