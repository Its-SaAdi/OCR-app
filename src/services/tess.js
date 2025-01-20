import Tesseract from "tesseract.js";

export class TessService {
    lang = 'eng';
    cache = new Map();

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

    clearCache() {
        this.cache.clear();
        console.log("Cache cleared.");
    }

    async recognizeText(image, language = this.lang) {
        const cacheKey = await this.generateCacheKey(image);

        if (this.cache.has(cacheKey)) {
            console.log("Returning cached result for: ", cacheKey);
            return this.cache.get(cacheKey);
        }

        const worker = await Tesseract.createWorker(language);
        try {
            const result = await worker.recognize(image);
            const resultLines = result?.data?.lines;

            // Cache the result
            this.cache.set(cacheKey, { result, resultLines });
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