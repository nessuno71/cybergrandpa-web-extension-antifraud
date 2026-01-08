import { logger } from './logger';

// Utility to compress a ReadableStream to base64String
export const compressReadableStream = async (readableStream: ReadableStream<Uint8Array>) => {
  try {
    // Create a compression stream (ensure correct type handling for cross-browser compatibility)
    const compressionStream = new CompressionStream('gzip');
    const compressedStream = readableStream.pipeThrough<Uint8Array>({
      writable: compressionStream.writable as WritableStream<Uint8Array>,
      readable: compressionStream.readable,
    });

    // Convert the compressed stream to a Uint8Array
    const reader = compressedStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value as Uint8Array);
    }

    // Create a Blob from the chunks
    const blob = new Blob(chunks as BlobPart[]);

    // Convert Blob to base64 using FileReader
    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Get the base64 string from the result
          // Remove the Data-URL prefix (e.g., "data:application/octet-stream;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('FileReader result is not a string.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    return base64String ? String(base64String) : '';
  } catch (error) {
    logger.error('Error compressing stream:', error);
    throw error;
  }
};

// Utility to retrieve and decompress data from Chrome Storage
export const decompressReadableStream = (base64String: string) => {
  try {
    // Convert base64 to Blob
    const byteString = atob(base64String);
    const bytes = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([bytes]);

    // Create a stream from the Blob
    const compressedStream = blob.stream();

    // Decompress the stream
    return compressedStream.pipeThrough(new DecompressionStream('gzip'));
  } catch (error) {
    logger.error('Error retrieving compressed stream:', error);
    throw error;
  }
};

export const convertReadableStreamToString = async (readableStream: ReadableStream<Uint8Array>) => {
  try {
    // Read the decompressed data
    const reader = readableStream.getReader();
    let result = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value as unknown as AllowSharedBufferSource, { stream: true });
    }

    // Final decode to handle any remaining bytes
    result += decoder.decode();

    return result;
  } catch (error) {
    logger.error('Error converting readable stream to string:', error);
    throw error;
  }
};
