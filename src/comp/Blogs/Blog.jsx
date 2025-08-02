import { useParams, useNavigate } from "react-router-dom";
import blogPosts from "./blog_post";
import { CalendarDays, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

// const blogs = [
//   {
//     id: "1",
//     title: "Efficient Text Extraction from Multiple Images Using OCR",
//     date: "February 10, 2025",
//     image: "https://source.unsplash.com/900x500/?technology,data",
//     content: `OCR (Optical Character Recognition) technology is revolutionizing the way we extract and process text from images. This OCR tool enables seamless multi-image processing with caching techniques, reducing redundancy and improving performance. 

//     Key Features:
//     - Supports bulk image uploads.
//     - Smart text correction for improved accuracy.
//     - Works efficiently with various file formats including PDFs and scanned documents.`,
//   },
//   {
//     id: "2",
//     title: "Overcoming OCR Accuracy Challenges with Smart Text Recognition",
//     date: "February 5, 2025",
//     image: "https://source.unsplash.com/900x500/?coding,ai",
//     content: `One of the biggest challenges in OCR technology is accuracy, especially with complex fonts and handwritten text. This OCR tool implements intelligent text recognition and correction, ensuring higher accuracy. 

//     Improvements in OCR Accuracy:
//     - Enhanced AI-powered text recognition.
//     - Manual text correction features.
//     - Supports multiple languages for better global usability.`,
//   },
//   {
//     id: "3",
//     title: "Real-World Applications of OCR: Transforming Industries",
//     date: "January 28, 2025",
//     image: "https://source.unsplash.com/900x500/?business,documents",
//     content: `OCR is widely used in industries such as healthcare, finance, and document management. The ability to extract, process, and store text from physical documents has improved efficiency across sectors.

//     Use Cases:
//     - Automating invoice processing in finance.
//     - Converting medical records into digital formats.
//     - Extracting data from legal contracts for quick searches.`,
//   },
// ];

export default function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const blog = blogPosts.find((post) => post.id === id);

  if (!blog) {
    return (
      <div className="text-center text-gray-300 p-6">
        <h1 className="text-3xl font-bold">Blog Not Found</h1>
        <button
          onClick={() => navigate("/blogs")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate("/blogs")}
        className="my-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-gray-100" id="top">{blog.title}</h1>
      <p className="text-gray-400 text-sm font-semibold italic my-4 flex items-center justify-center gap-3">
        <span className="">
          <CalendarDays /> 
        </span>
        {blog.date}
      </p>

      <img src={blog.image} alt={blog.title} className="w-full h-96 object-cover rounded-xl mt-8" />

      <div className="text-gray-300 whitespace-pre-line text-justify " dangerouslySetInnerHTML={{__html: blog.content}}></div>

      {showScrollToTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-4 right-4 bg-zinc-950 text-zinc-50 p-3 rounded-full shadow-lg group"
          aria-label="Back to top"
        >
          <ChevronUp className="group-hover:animate-bounce transition duration-300" />
        </button>
      )}

    </div>
  );
}
