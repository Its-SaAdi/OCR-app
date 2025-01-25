import React, { useState, useCallback } from 'react';
import geminiService from '../../services/GeminiService';
import cacheService from '../../cache/cacheService';
import { generatePDF, generateTxt } from '../../services/pdf_txt_service';
import { saveAs } from 'file-saver';
import { Document, Paragraph, Packer, TextRun } from 'docx';
import * as XLSX from 'xlsx';

const ImageProcessor = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Button disabled flag
  const [isProcessed, setIsProcessed] = useState(false); // Flag to check if images have been processed
  const [editingIndex, setEditingIndex] = useState(null); // Track which text is being edited
  
  const generateImageHash = useCallback((base64) => {
    let hash = 0;
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
  }, []);

  const handleImageUpload = useCallback((event) => {
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
  }, [setImages, setTexts, setIsProcessed]);

  const processImages = useCallback(async () => {
    setStatus("Processing images... Please wait ⏳");
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
    setStatus('Processing complete! ✅');
    setIsProcessing(false);
    setIsProcessed(true);
  }, [setStatus, setIsProcessing, images, texts, generateImageHash]);

  const handleEdit = useCallback((index) => {
    setEditingIndex(index);
  }, [setEditingIndex]);

  const handleSave = useCallback((index) => {
    const updatedText = texts[index];
    const imageHash = generateImageHash(images[index].base64);

    // Save the updated text to the cache and exit editing mode
    cacheService.update(imageHash, updatedText);
    setEditingIndex(null);
  }, [texts, images, generateImageHash, setEditingIndex]);

  const handleCopy = (index) => {
    const textToCopy = texts[index];
    navigator.clipboard.writeText(textToCopy).then(() => alert('Text copied to clipboard!'));
  };

  const handleDownloadText = (index) => {
    const textToDownload = texts[index];
    generateTxt(textToDownload);
  };

  const handleDownloadPDF = (index) => {
    const textToDownload = texts[index];
    generatePDF(textToDownload);
  }

  const handleDownloadWord = (index) => {
    const textToDownload = texts[index] || 'No text found';
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(textToDownload)],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `ExtractedText_${index + 1}.docx`);
    }); 
  };

  // check for table or sentence like structure
  const isTableLike = (text) => {
    // Check if the text contains multiple lines and has consistent delimiters like commas or tabs
    const rows = text.split("\n").filter((row) => row.trim() !== "");
    if (rows.length > 1) {
      const delimiters = [",", "\t", "  "]; // Common delimiters: comma, tab, or multiple spaces
      for (let delimiter of delimiters) {
        const firstRowCols = rows[0].split(delimiter);
        const otherRowCols = rows.slice(1).map((row) => row.split(delimiter));
        if (otherRowCols.every((cols) => cols.length === firstRowCols.length)) {
          return { isTable: true, delimiter };
        }
      }
    }
    return { isTable: false };
  };

  // aoa_to_sheet accepts an array of arrays ([["Row1Col1", "Row1Col2"], ["Row2Col1", "Row2Col2"]]) to create the Excel sheet.
  const handleDownloadExcel = (index) => {
    const text = texts[index] || "No text extracted.";
    const { isTable, delimiter } = isTableLike(text);
  
    let worksheet;
    if (isTable) {
      // Format as table
      const rows = text
        .split("\n")
        .filter((row) => row.trim() !== "")
        .map((row) => row.split(delimiter));
      worksheet = XLSX.utils.aoa_to_sheet(rows);
    } else {
      // Format as sentence
      worksheet = XLSX.utils.aoa_to_sheet([["Extracted Text"], [text]]);
    }
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Text");
    XLSX.writeFile(workbook, `ExtractedText_${index + 1}.xlsx`);
  };
 
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
                          {/* .txt file */}
                          <button
                            onClick={() => handleDownloadText(index)}
                            className="bg-white text-black px-2 py-1 rounded hover:bg-gray-300"
                          >
                            Text
                          </button>

                          {/* .pdf file */}
                          <button
                            onClick={() => handleDownloadPDF(index)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                          >
                            PDF
                          </button>

                          {/* word file */}
                          <button
                            onClick={() => handleDownloadWord(index)}
                            className="bg-blue-500 text-white px-2 py-1 rounded mt-2 hover:bg-blue-600"
                          >
                            Word
                          </button>

                          {/* excel file */}
                          <button
                            onClick={() => handleDownloadExcel(index)}
                            className="bg-green-500 text-white px-2 py-1 rounded mt-2 hover:bg-green-600"
                          >
                            Excel
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
