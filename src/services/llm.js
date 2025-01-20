// import { GoogleGenerativeAI } from "@google/generative-ai";
// import conf from "../config/conf";

// export class GeminiOCR {
//     genAI;
//     model;
//     prompt = {
//         text: "Extract only the text content from this image without any additional description or commentary. Provide the text exactly as it appears in the image.",
//     }

//     constructor() {
//         try {
//             this.genAI = new GoogleGenerativeAI(conf.geminiApi);
//             this.model = this.genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     convertImageToBase64 = (file) => {
//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onload = () => resolve(reader.result.split(",")[1]);
//             reader.onerror = (error) => reject(error);
//             reader.readAsDataURL(file);
//         });
//     }

//     // performOCR = async (image) => {
//     //     try {
//     //         const base64Image = await this.convertImageToBase64(image);

//     //         const imagePart = {
//     //             inlineData: {
//     //             mimeType: image.type,
//     //             data: base64Image,
//     //             },
//     //         };

//     //         const result = await this.model.generateContent([this.prompt, imagePart]);
//     //         if (result) {
//     //             const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
//     //             console.log(result.response.text());
//     //             return responseText;
//     //         }

//     //     } catch (error) {
//     //         console.log(error);
//     //     }
//     // }

//     performOCR = async (images) => {
//         try {
//             const imageArray = Array.isArray(images) ? images : [images];
    
//             // Convert all images to Base64
//             const imageParts = await Promise.all(
//                 imageArray.map(async (image) => {
//                     const base64Image = await this.convertImageToBase64(image);
//                     return {
//                         inlineData: {
//                             mimeType: image.type,
//                             data: base64Image,
//                         },
//                     };
//                 })
//             );
    
//             // Combine prompt and all image parts
//             const requestParts = [this.prompt, ...imageParts];
    
//             console.log("Request being sent to Gemini API:", requestParts);
    
//             // Send the request
//             const result = await this.model.generateContent(requestParts);
    
//             // Log raw result to debug
//             console.log("Raw response from Gemini API:", result);
    
//             // Extract OCR text result
//             const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
//             return responseText || "No text recognized.";
//         } catch (error) {
//             console.error("Error in performOCR:", error.message);
//             return "Error: Unable to process image(s).";
//         }
//     };
    
// }

// const geminiService = new GeminiOCR();

// export default geminiService;

import { GoogleGenerativeAI } from "@google/generative-ai";
import conf from "../config/conf";

export class GeminiOCR {
  genAI;
  model;
  prompt = {
    text: "For each image, extract only the text content exactly as it appears in the image. Ensure each image result is clearly separated.",
  };

  constructor() {
    try {
      this.genAI = new GoogleGenerativeAI(conf.geminiApi);
      this.model = this.genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
    } catch (error) {
      console.error("Error initializing Google Generative AI:", error);
    }
  }

  convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  cleanApiResponse(data) {
    const lines = data.split('\n');
    const result = [];
  
    let currentImage = null;
    let currentContent = "";
  
    lines.forEach((line) => {
      const trimmedLine = line.trim(); 
      if (trimmedLine.match(/^\*\*Image \d+\*\*/)) {
        // New image section
        if (currentImage) {
          result.push({ image: currentImage, content: currentContent.trim() });
        }
        currentImage = trimmedLine; 
        currentContent = "";
      } else {
        // Add to current content
        currentContent += line + '\n';
      }
    });
  
    // Push the last image and content
    if (currentImage) {
      result.push({ image: currentImage, content: currentContent.trim() });
    }
  
    return result;
  }

  performOCRForMultipleImages = async (images) => {
    try {
      const base64Images = await Promise.all(
        images.map((image) => this.convertImageToBase64(image))
      );

      const imageParts = base64Images.map((base64Image, index) => ({
        inlineData: {
          mimeType: images[index].type,
          data: base64Image,
        },
      }));

      const requestParts = [this.prompt, ...imageParts];
      const result = await this.model.generateContent(requestParts);

      // Extract individual results from the response
      const responseParts = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(responseParts);
      
      return this.cleanApiResponse(responseParts);

    } catch (error) {
      console.error("Error performing OCR:", error);
      throw error;
    }
  };
}


const geminiService = new GeminiOCR();

export default geminiService;