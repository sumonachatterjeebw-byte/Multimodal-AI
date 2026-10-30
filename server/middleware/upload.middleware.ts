import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueHash = crypto.randomBytes(6).toString('hex');
    cb(null, `${sanitizedBase}_${uniqueHash}${ext}`);
  },
});

const allowedMimeTypes = [
  // Text
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  // Documents
  'application/pdf',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'audio/webm',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
];

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Check mime type or extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.txt', '.md', '.csv', '.json', '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp3', '.wav', '.ogg', '.m4a', '.mp4', '.webm', '.mov'];
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype || ext}. Please upload text, image, audio, video, or PDF files.`));
    }
  },
});
