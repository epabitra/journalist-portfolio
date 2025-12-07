/**
 * Firebase Storage Service
 * Handles uploading images and videos to Firebase Storage
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '@/config/firebase';
import { FILE_UPLOAD } from '@/config/constants';
import { toast } from 'react-toastify';
import { convertHEICToJPEG, isHEICFile, getImageFormatError } from '@/utils/imageConverter';

/**
 * Gets file extension from filename
 */
const getFileExtension = (filename) => {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * Validates file before upload
 */
const validateFile = (file, type = 'image') => {
  const maxSize = type === 'video' ? FILE_UPLOAD.MAX_VIDEO_SIZE : FILE_UPLOAD.MAX_IMAGE_SIZE;
  const allowedTypes = type === 'video' ? FILE_UPLOAD.ALLOWED_VIDEO_TYPES : FILE_UPLOAD.ALLOWED_IMAGE_TYPES;

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }

  // Note: HEIC files are automatically converted before reaching validation
  // So we don't need to reject them here - they'll already be JPEG by validation time

  // Check file extension for images (more reliable than MIME type)
  // Note: HEIC files are handled separately and converted automatically
  if (type === 'image') {
    const extension = getFileExtension(file.name);
    // Exclude HEIC extensions as they are automatically converted
    const unsupportedExtensions = ['tiff', 'tif', 'bmp', 'raw', 'cr2', 'nef', 'orf', 'arw'];
    if (unsupportedExtensions.includes(extension)) {
      const errorMsg = getImageFormatError(file);
      throw new Error(errorMsg);
    }
  }

  // Validate MIME type
  if (!allowedTypes.includes(file.type)) {
    // Provide more helpful error message for unsupported formats
    if (type === 'image') {
      const formatError = getImageFormatError(file);
      throw new Error(formatError);
    }
    throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return true;
};

/**
 * Generates a unique file path for storage
 */
const generateFilePath = (file, folder = 'uploads') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}_${randomString}.${fileExtension}`;
  return `${folder}/${fileName}`;
};

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder path in storage (default: 'uploads')
 * @param {string} options.type - File type: 'image' or 'video' (default: 'image')
 * @param {Function} options.onProgress - Progress callback (progress: 0-100)
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, options = {}) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }

  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const { folder = 'uploads', type = 'image', onProgress } = options;

  try {
    // Automatically convert HEIC files to JPEG before validation and upload
    let fileToUpload = file;
    if (type === 'image' && isHEICFile(file)) {
      try {
        toast.info('Converting HEIC image to JPEG format...', { autoClose: 3000 });
        fileToUpload = await convertHEICToJPEG(file, (progress) => {
          // Update progress if callback is provided
          if (onProgress && progress === 100) {
            // Conversion complete, now start upload
            toast.success('HEIC image converted successfully, uploading...', { autoClose: 2000 });
          }
        });
      } catch (conversionError) {
        // If conversion fails, show helpful error
        const errorMsg = conversionError.message || getImageFormatError(file);
        toast.error(errorMsg, { autoClose: 10000 });
        throw new Error(errorMsg);
      }
    }
    
    // Validate file (use converted file if HEIC was converted)
    validateFile(fileToUpload, type);

    // Generate file path (use converted file name if HEIC was converted)
    const filePath = generateFilePath(fileToUpload, folder);

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Create upload task (use converted file if HEIC was converted)
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    // Return promise that resolves with download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('File upload failed: ' + error.message);
          reject(error);
        },
        async () => {
          try {
            // Upload completed, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            toast.success('File uploaded successfully');
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to get file URL');
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload validation error:', error);
    toast.error(error.message || 'File upload failed');
    throw error;
  }
};

/**
 * Uploads an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImage = async (file, options = {}) => {
  return uploadFile(file, { ...options, type: 'image', folder: options.folder || 'images' });
};

/**
 * Uploads a video to Firebase Storage
 * @param {File} file - The video file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - The download URL of the uploaded video
 */
export const uploadVideo = async (file, options = {}) => {
  return uploadFile(file, { ...options, type: 'video', folder: options.folder || 'videos' });
};

/**
 * Deletes a file from Firebase Storage
 * @param {string} fileUrl - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileUrl) => {
  if (!isFirebaseConfigured() || !storage) {
    throw new Error('Firebase Storage is not configured');
  }

  try {
    // Extract file path from URL
    // Firebase Storage URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid Firebase Storage URL');
    }

    // Decode the path (Firebase encodes special characters)
    const filePath = decodeURIComponent(pathMatch[1]);

    // Create storage reference and delete
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    
    toast.success('File deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file: ' + error.message);
    throw error;
  }
};

/**
 * Firebase Storage Service Object
 */
export const firebaseStorageService = {
  uploadFile,
  uploadImage,
  uploadVideo,
  deleteFile,
  isConfigured: isFirebaseConfigured,
};

export default firebaseStorageService;





