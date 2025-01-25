import { GoogleGenerativeAI } from '@google/generative-ai';
import conf from '../config/conf';

export class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(conf.geminiApi);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async processImages(images) {
    const results = [];

    for (const image of images) {
      const imageData = {
        inlineData: {
          data: image.base64, // Ensure this is a base64-encoded string
          mimeType: image.mimeType, // e.g., 'image/png'
        },
      };

      const prompt = 'Extract only the text from this image.';
      const response = await this.model.generateContent([prompt, imageData]);
      results.push(response.response.text());
    }

    return results;
  }
}

const geminiService = new GeminiService();
export default geminiService;