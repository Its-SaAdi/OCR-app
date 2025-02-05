import React, { useState, useCallback } from 'react';
import geminiService from '../../services/GeminiService';
import cacheService from '../../cache/cacheService';
import svgConf from '../../config/svgConfig';
import { generatePDF, generateTxt } from '../../services/pdf_txt_service';
import { generateDocx, generateXlsx } from '../../services/docx_xlsx_service';
import { isTableLike } from '../../services/table_handler';
import imageInputPic from '../../assets/image-input.png'
import { ScanText, Loader, Pencil, Copy, Save, ChevronDown } from 'lucide-react';

const ImageProcessor = () => {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Button disabled flag
  const [isProcessed, setIsProcessed] = useState(false); // Flag to check if images have been processed
  const [editingIndex, setEditingIndex] = useState(null); // Track which text is being edited
  // const [showMenu, setShowMenu] = useState(false);  // display available downlaodable format options
  const [openMenuId, setOpenMenuId] = useState(null);
  
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
    if (images.length === 0) {
      setStatus('Please select at least one image file...');
      return;
    }

    setIsProcessing(true);
    setStatus("Processing images... Please wait ⏳");

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

  // Download functions for different formats
  const handleDownloadForFormat = (format, index) => {
    const textToDownload = texts[index] || 'No text found';

    switch (format) {
      case "txt":
        generateTxt(textToDownload);
        console.log("Downloading as TXT...");
        break;
      case "pdf":
        generatePDF(textToDownload);
        console.log("Downloading as PDF...");
        break;
      case "docx":
        generateDocx(textToDownload);
        console.log("Downloading as DOCX...");
        break;
      case "xlsx":
        generateXlsx(textToDownload);
        console.log("Downloading as Excel...");
        break;
      default:
        console.log("Unknown format");
    }
    setOpenMenuId(null); // Hide menu after selection
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
    generateDocx(textToDownload);
    // const { isTable, delimiter } = isTableLike(textToDownload);

    // let documentContent;
    // if (isTable) {
      
    //   const rows = formatTableData(textToDownload, delimiter);

    //   const table = new Table({
    //     rows: rows.map((row) =>
    //       new TableRow({
    //         children: row.map((cell) =>
    //           new TableCell({
    //             children: [new Paragraph({ children: [new TextRun(cell)] })],
    //           })
    //         ),
    //       })
    //     ),
    //   });

    //   documentContent = [table];
    // } else {
    //   const paragraph = new Paragraph({
    //     children: [new TextRun(textToDownload)],
    //   });

    //   documentContent = [paragraph];
    // }

    // const doc = new Document({
    //   sections: [
    //     {
    //       properties: {},
    //       children: documentContent,
    //     },
    //   ],
    // });

    // Packer.toBlob(doc).then((blob) => {
    //   saveAs(blob, `ExtractedText_${index + 1}.docx`);
    // }); 
  };

  // aoa_to_sheet accepts an array of arrays ([["Row1Col1", "Row1Col2"], ["Row2Col1", "Row2Col2"]]) to create the Excel sheet.
  const handleDownloadExcel = (index) => {
    const text = texts[index] || "No text extracted.";
    generateXlsx(text);

    // const { isTable, delimiter } = isTableLike(text);
  
    // let worksheet;
    // if (isTable) {
    //   // Format as table
    //   const rows = formatTableData(text, delimiter);
        
    //   worksheet = XLSX.utils.aoa_to_sheet(rows);
    // } else {
    //   // Format as sentence
    //   worksheet = XLSX.utils.aoa_to_sheet([["Extracted Text"], [text]]);
    // }
  
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Text");
    // XLSX.writeFile(workbook, `ExtractedText_${index + 1}.xlsx`);
  };

  const handleDownload = (index) => {
    const text = texts[index] || "No text extracted.";
    const { isTable } = isTableLike(text);
    console.log(isTable);

    if (isTable) {
      generateXlsx(text);
      console.log("Generating Excel file...");
      
    } else {
      generateDocx(text);
      console.log("Generating Word file...");
    }
  };
 
  return (
    <article className="container mx-auto p-4 pb-8">
        <h1 className="text-2xl font-bold mb-8">Optical Character Recognition [OCR] - Made Easy</h1>

        <article 
          className='max-w-lg h-auto mx-auto bg-zinc-50 rounded-xl flex flex-col justify-center items-center py-4'
        >
          <figure>
            <img 
              src={imageInputPic} 
              alt="Upload-Image" 
              className='w-[20%] h-auto mx-auto object-cover my-2'
            />
          </figure>

          <p className='text-gray-800 font-semibold italic mb-6'>Upload your images here: </p>

          {status && (
            <p className="text-red-500 mb-6 font-bold italic text-sm">{status}</p>
          )}

          <article className='flex justify-center items-center gap-4 flex-wrap'>

            <input type="file" multiple accept="image/*" onChange={handleImageUpload} 
              className="file:bg-blue-600 file:hover:hover:bg-blue-500 file:duration-100 file:text-zinc-50 file:border-none file:rounded-xl file:py-2 file:px-4 file:mr-4 file:h-12 cursor-pointer file:text-sm file:font-semibold file:italic bg-white text-gray-800 text-sm font-medium border border-gray-300 rounded-xl shadow-md pr-4 file:cursor-pointer" 
            />
            <button
                onClick={processImages}
                className={`bg-zinc-900 text-zinc-50 p-2 shadow-md rounded-md duration-300 ${
                    isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-gray-600'
                }`}
                disabled={isProcessing}
                title='Click to perform OCR on selected images.'
            >
                {isProcessing ? <Loader className='animate-spin' /> : <ScanText size={30} />}
            </button>

          </article>

        </article>

        {isProcessed && (
            <article className="max-w-5xl grid grid-cols-1 gap-4 mt-8 mx-auto">
            {images.map((image, index) => (
              <article
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl shadow-lg bg-zinc-50"
              >
                <article className='max-sm:hidden bg-zinc-300 flex items-center justify-center rounded-xl p-2'>
                  <img
                    src={`data:${image.mimeType};base64,${image.base64}`}
                    alt={`Uploaded ${index}`}
                    className="w-72 h-auto object-cover rounded-lg max-lg:w-60 max-md:w-40"
                  />
                </article>

                <article className='flex-1 relative'>
                {editingIndex === index ? (
                    <>
                      <textarea
                        value={texts[index] || ''}
                        onChange={(e) => {
                          const newTexts = [...texts];
                          newTexts[index] = e.target.value;
                          setTexts(newTexts);
                        }}
                        className="w-full p-2 border border-gray-700 rounded-md mt-2 text-black bg-gray-400"
                        rows={10}
                      />
                      <div className='absolute top-3 right-2 flex gap-1'>
                        <button
                          onClick={() => handleSave(index)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md mt-1 hover:bg-blue-500 duration-200"
                          title='save'
                          >
                          <Save />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='bg-zinc-300 rounded-lg '>
                        <div className='flex justify-end gap-4 pr-3'>
                          <button
                              onClick={() => handleEdit(index)}
                              className=" text-gray-800 hover:text-gray-700 my-2 duration-200"
                              title='Edit'
                          >
                              <Pencil size={21} />
                          </button>
          
                          <button
                              onClick={() => handleCopy(index)}
                              className=" text-gray-800 hover:text-gray-700 my-2 duration-200"  
                              title='Copy'         
                          >
                              <Copy size={21} />
                          </button>
                        </div>
                        <p className="w-full text-gray-800 font-semibold bg-zinc-300 whitespace-pre-wrap text-left p-3 border-t-4 border-dashed border-zinc-400 rounded-b-md">{texts[index]}</p> 
                      </div>     

                      {/* Download Buttons */}
                      <div className="mt-4 flex justify-end items-center gap-2">
                        <p className='text-gray-800 font-semibold mr-1 italic '>Looks like this text works best in: </p>

                        {/* dynamically decide what format should user text downlaod with.. */}
                        <button
                          onClick={() => handleDownload(index)}
                          className='bg-zinc-800 hover:bg-zinc-700 text-zinc-50 p-2 rounded-md font-semibold italic duration-200'
                        >
                          <img 
                            src={isTableLike(texts[index]).isTable ? svgConf.excelLLogo : svgConf.wordLogo} 
                            alt={isTableLike(texts[index]).isTable ? "Download Excel" : "Download Word"} 
                            className='min-w-[24px] w-6'
                          />
                        </button>

                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === index ? null : index)} 
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-50 p-2 rounded-lg font-semibold italic group"
                            title='Export as'
                          >
                            Export as <span className='inline-block align-middle group-hover:animate-bounce duration-1000'><ChevronDown /></span>
                          </button>
                          {openMenuId === index && (
                            <div className="absolute right-0 -mt-48 w-44 bg-zinc-800 text-zinc-50 rounded-md shadow-lg">
                              {[
                                { format: ".txt", icon: svgConf.textLogo },
                                { format: ".pdf", icon: svgConf.pdfLogo },
                                { format: ".docx", icon: svgConf.wordLogo },
                                { format: ".xlsx", icon: svgConf.excelLLogo },
                              ].map(({ format, icon }) => (
                                <button
                                  key={format}
                                  onClick={() => handleDownloadForFormat(format, index)}
                                  className="block w-full text-left px-4 py-2 hover:bg-zinc-700 duration-300 rounded-md text-sm font-semibold"
                                >
                                  <img src={icon} alt="SVG" width={18} className='inline-block mr-1' /> {"Export as " + format.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* .txt file */}
                        {/* <button
                          onClick={() => handleDownloadText(index)}
                          className="bg-white text-black px-2 py-1 rounded hover:bg-gray-300"
                        >
                          Text
                        </button> */}

                        {/* .pdf file */}
                        {/* <button
                          onClick={() => handleDownloadPDF(index)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                        >
                          PDF
                        </button> */}

                        {/* word file */}
                        {/* <button
                          onClick={() => handleDownloadWord(index)}
                          className="bg-blue-500 text-white px-2 py-1 rounded mt-2 hover:bg-blue-600"
                        >
                          Word
                        </button> */}

                        {/* excel file */}
                        {/* <button
                          onClick={() => handleDownloadExcel(index)}
                          className="bg-green-500 text-white px-2 py-1 rounded mt-2 hover:bg-green-600"
                        >
                          Excel
                        </button> */}
                        
                      </div>
                    </>
                  )}
                </article>
              </article>
            ))}
          </article>
        )}
    </article>
  );
};

export default ImageProcessor;
