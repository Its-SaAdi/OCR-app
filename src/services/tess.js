import Tesseract from "tesseract.js";
import cacheService from "../cache/cacheService";

export class TessService {
    lang = 'eng';

    // Generate a cache key for the image
    async generateCacheKey(image) {
        if (typeof image === 'string') {
            // Use the file path directly if available
            return image;
        } else {
            const buffer = await image.arrayBuffer();
            const hash = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hash));
            return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        }
    }

    /**
     * Recognizes text from an image using Tesseract OCR.
     * 
     * This function first checks if the result is already cached. If not, it creates a Tesseract worker,
     * processes the image to recognize text, caches the result, and then returns the recognized text (overall data) and lines.
     */

    async recognizeText(image, language = this.lang) {
        const cacheKey = await this.generateCacheKey(image);

        if (cacheService.has(cacheKey)) {
            console.log("Returning cached result for: ", cacheKey);
            return cacheService.get(cacheKey);
        }

        const worker = await Tesseract.createWorker(language);
        try {
            const result = await worker.recognize(image);
            const resultLines = result?.data?.lines;

            // Cache the result
            cacheService.set(cacheKey, { result, resultLines });
            console.log("Caching result for:", cacheKey);

            return { result, resultLines };
        } catch (error) {
            console.error("Error recognizing text:", error);
        } finally {
            await worker.terminate(); // Ensure worker is terminated
        }
    }
}

const service = new TessService();
export default service;