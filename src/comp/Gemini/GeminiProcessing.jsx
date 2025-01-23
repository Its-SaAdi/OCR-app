import React, { useState } from 'react';
import GeminiService from '../../services/GeminiService';
import cacheService from '../../cache/cacheService';
import { jsPDF } from 'jspdf';

const generateImageHash = (base64) => {
    let hash = 0;
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  };

const ImageProcessor = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Button disabled flag
  const [isProcessed, setIsProcessed] = useState(false); // Flag to check if images have been processed
  const [editingIndex, setEditingIndex] = useState(null); // Track which text is being edited

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const imagePromises = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            base64: reader.result.split(',')[1], // Extract base64 string
            mimeType: file.type,
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((imageData) => {
      setImages(imageData);
      setTexts(Array(imageData.length).fill(''));
      setIsProcessed(false);
    });
  };

  const processImages = async () => {
    const geminiService = new GeminiService();
    setStatus('Processing images...');
    setIsProcessing(true);

    const newTexts = [...texts];

    // Separate cached images from new ones
    const cachedResults = [];
    const newImages = [];
    const newImageIndices = [];

    images.forEach((image, index) => {
      const imageHash = generateImageHash(image.base64);
      if (cacheService.has(imageHash)) {
        cachedResults.push({ index, text: cacheService.get(imageHash) });
        console.log('Cached result found for image', imageHash);
      } else {
        newImages.push(image);
        newImageIndices.push(index);
      }
    });

    // Update texts with cached results
    cachedResults.forEach(({ index, text }) => {
      newTexts[index] = text;
    });

    // Process new images collectively
    if (newImages.length > 0) {
      const results = await geminiService.processImages(newImages);

      // Update texts and cache for new images
      results.forEach((text, i) => {
        const imageIndex = newImageIndices[i];
        newTexts[imageIndex] = text;

        // Cache the processed result
        const imageHash = generateImageHash(newImages[i].base64);
        cacheService.set(imageHash, text);
        console.log('Cached result set for image', imageHash);
      });
    }

    setTexts(newTexts);
    setStatus('Processing complete!');
    setIsProcessing(false);
    setIsProcessed(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = (index) => {
    const updatedText = texts[index];
    const imageHash = generateImageHash(images[index].base64);

    // Save the updated text to the cache
    cacheService.update(imageHash, updatedText);
    setEditingIndex(null); // Exit editing mode
  };

  const handleCopy = (index) => {
    const textToCopy = texts[index];
    navigator.clipboard.writeText(textToCopy).then(() => alert('Text copied to clipboard!'));
  };

  const handleDownloadText = (index) => {
    const textToDownload = texts[index];
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_text_${index + 1}.txt`;
    a.click();
  };

  const handleDownloadPDF = (index) => {
    const textToDownload = texts[index];
    const doc = new jsPDF();
    doc.text(textToDownload, 10, 10);
    doc.save(`extracted_text_${index + 1}.pdf`);
  }
 
  return (
    <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Google Gemini Vision OCR</h1>

        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="m-8" />
        <button
            onClick={processImages}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${
                isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isProcessing}
        >
            Process Images
        </button>

        <p className="text-gray-500 mt-4 mb-8 font-bold italic">{status}</p>

        {isProcessed && (
            <div className="grid grid-cols-1 gap-4 mt-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex items-center border p-4 rounded-lg shadow-lg bg-zinc-800"
              >
                <img
                  src={`data:${image.mimeType};base64,${image.base64}`}
                  alt={`Uploaded ${index}`}
                  className="w-72 h-auto object-cover rounded-md mr-4"
                />
                <div className='flex-1'>
                {editingIndex === index ? (
                    <>
                      <textarea
                        value={texts[index] || ''}
                        onChange={(e) => {
                          const newTexts = [...texts];
                          newTexts[index] = e.target.value;
                          setTexts(newTexts);
                        }}
                        className="w-full p-2 border rounded mt-2 text-black bg-gray-400"
                        rows={10}
                      />
                      <button
                        onClick={() => handleSave(index)}
                        className="bg-green-500 text-white px-2 py-1 rounded mt-2 hover:bg-green-600"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-zinc-50 whitespace-pre-wrap text-left border-dashed border py-3 pl-3 rounded-lg">{texts[index]}</p>
                      <div className='w-full flex justify-end pr-2 pt-1'>
                        <button
                            onClick={() => handleEdit(index)}
                            className="bg-zinc-900 text-zinc-50 px-3 py-1 rounded mt-2 hover:bg-zinc-700"
                        >
                            Edit
                        </button>
        
                        <button
                            onClick={() => handleCopy(index)}
                            className="bg-blue-500 text-white px-3 py-1 rounded mt-2 ml-2 hover:bg-blue-600"           
                        >
                            Copy
                        </button>

                        {/* Download Buttons */}
                        <div className="ml-2 mt-2 flex space-x-2">
                          <button
                            onClick={() => handleDownloadText(index)}
                            className="bg-white text-black px-2 py-1 rounded hover:bg-gray-300"
                          >
                            Download Text
                          </button>

                          <button
                            onClick={() => handleDownloadPDF(index)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                          >
                            Download PDF
                          </button>
                          
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default ImageProcessor;
