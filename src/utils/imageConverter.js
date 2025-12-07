/**
 * Image Format Conversion Utility
 * Handles conversion of Mac-specific image formats (HEIC/HEIF) to web-compatible formats
 */

import heic2any from 'heic2any';

/**
 * Detects if a file is a HEIC/HEIF image
 * @param {File} file - The file to check
 * @returns {boolean} - True if file is HEIC/HEIF
 */
export const isHEICFile = (file) => {
  if (!file) return false;
  
  const fileName = file.name.toLowerCase();
  const fileType = (file.type || '').toLowerCase();
  
  // Check by file extension
  const heicExtensions = ['.heic', '.heif', '.hif'];
  const hasHEICExtension = heicExtensions.some(ext => fileName.endsWith(ext));
  
  // Check by MIME type
  const heicMimeTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
  const hasHEICMimeType = heicMimeTypes.includes(fileType);
  
  return hasHEICExtension || hasHEICMimeType;
};

/**
 * Converts HEIC image to JPEG using heic2any library
 * @param {File} heicFile - The HEIC file to convert
 * @returns {Promise<File>} - Converted JPEG file
 */
const convertHEICWithLibrary = async (heicFile) => {
  try {
    // Convert HEIC to JPEG blob using heic2any
    // heic2any returns an array of blobs (usually one, unless it's a sequence)
    const convertedBlobs = await heic2any({
      blob: heicFile,
      toType: 'image/jpeg',
      quality: 0.9, // 90% quality - good balance between size and quality
    });

    // Get the first blob (in case of sequences, we take the first frame)
    const jpegBlob = Array.isArray(convertedBlobs) ? convertedBlobs[0] : convertedBlobs;

    if (!jpegBlob || !(jpegBlob instanceof Blob)) {
      throw new Error('Conversion failed: Invalid blob returned');
    }

    // Create new File object with JPEG extension
    const fileName = heicFile.name.replace(/\.(heic|heif|hif)$/i, '.jpg');
    const jpegFile = new File([jpegBlob], fileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    return jpegFile;
  } catch (error) {
    console.error('HEIC conversion error:', error);
    throw new Error(
      `Failed to convert HEIC image: ${error.message}. Please try converting the image to JPEG manually.`
    );
  }
};

/**
 * Automatically converts HEIC file to JPEG if needed
 * @param {File} file - The file to convert (if HEIC) or return as-is
 * @param {Function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<File>} - Converted JPEG file or original file
 */
export const convertHEICToJPEG = async (file, onProgress) => {
  if (!isHEICFile(file)) {
    return file; // Not a HEIC file, return as-is
  }
  
  try {
    if (onProgress) {
      onProgress(10); // Start conversion
    }

    // Convert HEIC to JPEG using heic2any library
    const converted = await convertHEICWithLibrary(file);
    
    if (onProgress) {
      onProgress(100); // Conversion complete
    }

    console.log('Successfully converted HEIC to JPEG:', file.name, '→', converted.name);
    return converted;
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    // If conversion fails, provide helpful fallback message
    throw new Error(
      `Unable to convert HEIC image automatically: ${error.message}. ` +
      'Please convert the image to JPEG or PNG format manually. ' +
      'On Mac: Open in Preview → File → Export → Format: JPEG'
    );
  }
};

/**
 * Gets user-friendly error message for unsupported image formats
 * @param {File} file - The file that failed validation
 * @returns {string} - Helpful error message
 */
export const getImageFormatError = (file) => {
  if (isHEICFile(file)) {
    return (
      'HEIC images are not supported. Please convert to JPEG or PNG format.\n\n' +
      'On Mac:\n' +
      '1. Open the image in Preview\n' +
      '2. Go to File → Export\n' +
      '3. Choose Format: JPEG or PNG\n' +
      '4. Save and upload the converted file\n\n' +
      'Alternatively, take photos in JPEG format: Settings → Camera → Formats → Most Compatible'
    );
  }
  
  const fileName = file.name || 'Unknown';
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  const unsupportedExtensions = ['heic', 'heif', 'hif', 'tiff', 'tif', 'bmp', 'raw', 'cr2', 'nef'];
  if (unsupportedExtensions.includes(fileExtension)) {
    return (
      `The ${fileExtension.toUpperCase()} format is not supported for web display.\n\n` +
      'Please convert to JPEG, PNG, GIF, or WebP format before uploading.'
    );
  }
  
  return (
    'Unsupported image format. Please use JPEG, PNG, GIF, or WebP format.'
  );
};
