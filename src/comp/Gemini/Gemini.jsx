import React, { useState } from "react";
import geminiService from "../../services/llm"; // Import your service class

const GeminiOcrPage = () => {
  const [images, setImages] = useState([]); // Store uploaded images
  const [results, setResults] = useState([]); // Store OCR results
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files); // Handle multiple images
    if (files.length > 0) {
      setImages(files);
      setResults([]); 
      setError(null); 
    }
  };

  const performOcr = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the service class to perform OCR for multiple images
      const ocrResults = await geminiService.performOCRForMultipleImages(images);
      console.log(ocrResults);
      
      setResults(ocrResults);
    } catch (err) {
      console.error("Error performing OCR:", err.message);
      setError("Failed to process the images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Google Gemini Vision OCR</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="my-4 mb-6 border p-2 rounded cursor-pointer"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={URL.createObjectURL(image)}
              alt={`Uploaded ${index + 1}`}
              className="w-32 h-auto border rounded-md"
            />
          ))}
        </div>
      )}

      <button
        onClick={performOcr}
        disabled={loading}
        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Perform OCR"}
      </button>

      {results.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 border rounded w-full max-w-3xl">
          <h2 className="text-lg font-bold mb-2 text-black">OCR Results:</h2>
          {results.map((result, index) => (
            <div key={index} className="mb-4">
              <h2 className="mb-4 text-black">{result.image}</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{result.content}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default GeminiOcrPage;
