import express from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  getDocument, 
  signDocument, 
  serveFile,
  deleteDocument,
  serveDocumentFile
} from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../utils/fileHelpers.js';

const router = express.Router();

// Log all routes to check them
console.log('Setting up document routes:');
console.log(' - POST /upload (protected)');
console.log(' - GET /documents (protected)');
console.log(' - GET /documents/:id (protected)');
console.log(' - POST /documents/:id/sign (protected)');
console.log(' - GET /files/:filename (public)');
console.log(' - DELETE /documents/:id (protected)');

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/documents', protect, getDocuments);
router.get('/documents/:id', protect, getDocument);
router.post('/documents/:id/sign', protect, signDocument);
router.get('/files/:filename', serveFile);
router.delete('/documents/:id', protect, deleteDocument);
router.get('/:id/file', protect, serveDocumentFile);
// Add this to your documentRoutes.js
router.get('/test', (req, res) => {
  res.json({ message: 'API endpoint is working' });
});

export default router;