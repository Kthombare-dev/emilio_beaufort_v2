import sharp from 'sharp';

// Configure Sharp for better performance
sharp.cache({ memory: 50 }); // Limit memory cache to 50MB
sharp.concurrency(2); // Limit concurrent operations

export interface CompressedImage {
  buffer: Buffer;
  format: string;
  size: number;
  width: number;
  height: number;
}

/**
 * Optimized image compression to WebP format with faster processing
 * @param imageBuffer - The input image buffer
 * @param maxSizeBytes - Maximum size in bytes (default: 1MB)
 * @param quality - Initial quality setting (default: 70)
 * @returns Promise<CompressedImage>
 */
export async function compressImageToWebP(
  imageBuffer: Buffer,
  maxSizeBytes: number = 1024 * 1024, // 1MB default
  quality: number = 70 // Reduced from 80 for faster processing
): Promise<CompressedImage> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  
  // Calculate optimal dimensions upfront to avoid multiple iterations
  let targetWidth = metadata.width || 1920;
  let targetHeight = metadata.height || 1080;
  
  // Pre-resize if image is very large (saves processing time)
  if (targetWidth > 1920 || targetHeight > 1080) {
    const ratio = Math.min(1920 / targetWidth, 1080 / targetHeight);
    targetWidth = Math.floor(targetWidth * ratio);
    targetHeight = Math.floor(targetHeight * ratio);
  }
  
  // Single compression attempt with optimized settings
  const compressed = await sharp(imageBuffer)
    .resize(targetWidth, targetHeight, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ 
      quality,
      effort: 3, // Reduced from 6 for faster processing
      smartSubsample: true
    })
    .toBuffer();

  // If still too large, do one more pass with lower quality
  let finalBuffer = compressed;
  if (compressed.length > maxSizeBytes) {
    finalBuffer = await sharp(imageBuffer)
      .resize(Math.floor(targetWidth * 0.8), Math.floor(targetHeight * 0.8), { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ 
        quality: Math.max(quality - 20, 30),
        effort: 3,
        smartSubsample: true
      })
      .toBuffer();
  }

  const finalMetadata = await sharp(finalBuffer).metadata();

  return {
    buffer: finalBuffer,
    format: 'webp',
    size: finalBuffer.length,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
  };
}

/**
 * Converts a base64 data URL to a Buffer
 * @param dataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @returns Buffer
 */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64Data = dataUrl.split(',')[1];
  return Buffer.from(base64Data, 'base64');
}

/**
 * Converts a Buffer to a base64 data URL
 * @param buffer - Image buffer
 * @param mimeType - MIME type (default: 'image/webp')
 * @returns Base64 data URL string
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'image/webp'): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Compresses multiple images with optimized concurrency and batching
 * @param imageDataUrls - Array of base64 data URLs
 * @param maxSizeBytes - Maximum size per image in bytes
 * @param batchSize - Number of images to process concurrently (default: 3)
 * @returns Promise<string[]> - Array of compressed WebP data URLs
 */
export async function compressMultipleImages(
  imageDataUrls: string[],
  maxSizeBytes: number = 1024 * 1024,
  batchSize: number = 3
): Promise<string[]> {
  if (imageDataUrls.length === 0) return [];
  
  const results: string[] = new Array(imageDataUrls.length);
  
  // Process images in batches to avoid overwhelming the system
  for (let i = 0; i < imageDataUrls.length; i += batchSize) {
    const batch = imageDataUrls.slice(i, i + batchSize);
    const batchPromises = batch.map(async (dataUrl, batchIndex) => {
      const globalIndex = i + batchIndex;
      try {
        const buffer = dataUrlToBuffer(dataUrl);
        const compressed = await compressImageToWebP(buffer, maxSizeBytes);
        return { index: globalIndex, result: bufferToDataUrl(compressed.buffer, 'image/webp') };
      } catch (error) {
        console.error(`Error compressing image ${globalIndex}:`, error);
        return { index: globalIndex, result: dataUrl }; // Return original if compression fails
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ index, result }) => {
      results[index] = result;
    });
  }
  
  return results;
}

/**
 * Fast estimation of blog content size including images
 * @param content - HTML content string
 * @param images - Array of image data URLs
 * @returns Estimated size in bytes
 */
export function estimateBlogSize(content: string, images: string[]): number {
  // Fast content size estimation (UTF-8 encoding approximation)
  const contentSize = content.length * 1.2; // Approximate UTF-8 overhead
  
  // Fast images size estimation
  const imagesSize = images.reduce((total, dataUrl) => {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) return total;
    const base64Data = dataUrl.slice(commaIndex + 1);
    // Base64 to binary size: (base64.length * 3) / 4
    return total + Math.floor((base64Data.length * 3) / 4);
  }, 0);

  return Math.floor(contentSize + imagesSize);
}
