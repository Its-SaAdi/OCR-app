import React, { useState } from 'react';
import tessService from '../../services/tess';
import cacheService from '../../cache/cacheService';

const ImageOcr = () => {
  const [processedImages, setProcessedImages] = useState([]);
  const [progress, setProgress] = useState("")
  const [loading, setLoading] = useState(false);

  // Handle multiple file input change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProcessedImages(files.map(file => ({ image: file, text: null }))); // Initialize with null text
  };

  // Process the images using Tesseract.js
  const processImages = async () => {
    if (processedImages.length === 0) {
      setProgress("Please select at least one image file..");
      return;
    }

    setLoading(true);
    setProgress("Processing images... Please wait ⏳");

    const updatedImages = [...processedImages];
    
    for (let i = 0; i < updatedImages.length; i++) {
      try {
        const { result, resultLines } = await tessService.recognizeText(
          updatedImages[i].image,
          'eng'
        );
        const {data: {text}} = result;
        updatedImages[i].text = text;
        setProgress(`Processed image ${i + 1} of ${updatedImages.length}`);
        console.log(result, resultLines);
      } catch (error) {
        console.error(`Error processing ${updatedImages[i].image.name}: `, error);
        updatedImages[i].text = [{ text: "Error processing image." }];
      }
    }

    setProcessedImages(updatedImages);
    setLoading(false);
    setProgress("Done! 👍✅");
  };

  return (
    <article className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OCR Multiple Images</h1>
      <p className='py-4 text-sm text-zinc-400 font-bold italic'>
        {progress}
      </p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="my-4 cursor-pointer"
      />
      
      <button
        onClick={processImages}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Process Images'}
      </button>

      <article className="mt-4">
        {
          processedImages.map((item, index) => (
            item.text && (
              <article className='p-3 my-6 flex justify-center items-center gap-4 bg-zinc-800 rounded-3xl' key={index}>
                  <figure className='max-w-[400px] min-w-[300px] h-auto rounded-2xl overflow-hidden'>
                      <img 
                          src={URL.createObjectURL(item.image)} 
                          alt="Target Image"
                          width={300}
                          height='auto' 
                      />
                  </figure>
          
                  <article className='p-4 rounded-2xl mb-1 border-dashed border-zinc-300 border-2 w-2/3 text-left'>
                      <h2 className='mb-4 font-bold text-zinc-400 italic'>Text from {item.image.name}:</h2>
                      {
                          <p className='whitespace-pre-wrap'>
                            {item.text}
                          </p>
                      }
                  </article>
              </article>
            )
          ))
        }
      </article>
    </article>
  );
};

export default ImageOcr;