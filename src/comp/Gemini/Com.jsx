import { useState } from "react";

export default function OCRResult({ extractedText, defaultFormat = "docx" }) {
  const [text, setText] = useState(extractedText);
  const [downloadFormat, setDownloadFormat] = useState(defaultFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleDownload = (format) => {
    console.log(`Downloading as ${format}`);
    // Implement actual download logic
  };

  return (
    <div className="max-w-2xl bg-gray-900 text-white rounded-lg shadow-lg p-4">
      <div className="flex gap-4">
        {/* Image Placeholder */}
        <div className="w-32 h-32 bg-gray-800 flex items-center justify-center rounded-md">
          <span className="text-sm text-gray-400">Image</span>
        </div>

        {/* Text Block */}
        <div className="flex-1 relative">
          <textarea
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md p-2 resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={handleCopy} className="p-1 bg-gray-700 rounded hover:bg-gray-600">
              📋
            </button>
            <button className="p-1 bg-gray-700 rounded hover:bg-gray-600">✏️</button>
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => handleDownload(downloadFormat)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {downloadFormat === "xlsx" ? "Download Excel" : "Download Word"}
        </button>

        <div className="relative">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
            More Formats ▼
          </button>
          <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-white rounded shadow-lg hidden group-hover:block">
            {["txt", "pdf", "docx", "xlsx"].map((format) => (
              <button
                key={format}
                onClick={() => handleDownload(format)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700"
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
