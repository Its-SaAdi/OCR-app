import React from 'react'
import { Link } from "react-router-dom";
import { ChevronsRight } from 'lucide-react';
import blogPosts from './blog_post';

// const blogs = [
//     {
//       id: 1,
//       title: "Efficient Text Extraction from Multiple Images Using OCR",
//       description: "Discover how this OCR tool processes multiple images simultaneously, optimizing speed and accuracy with advanced caching techniques.",
//       image: "https://source.unsplash.com/600x400/?technology,data",
//       date: "February 10, 2025",
//     },
//     {
//       id: 2,
//       title: "Overcoming OCR Accuracy Challenges with Smart Text Recognition",
//       description: "Learn about common OCR challenges like character misinterpretation and how this tool enhances accuracy with editable text correction.",
//       image: "https://source.unsplash.com/600x400/?coding,ai",
//       date: "February 5, 2025",
//     },
//     {
//       id: 3,
//       title: "Real-World Applications of OCR: Transforming Industries",
//       description: "Explore how OCR technology is revolutionizing industries such as healthcare, finance, and document processing with seamless text extraction.",
//       image: "https://source.unsplash.com/600x400/?business,documents",
//       date: "January 28, 2025",
//     },
// ];

export default function Blogs() {
  return (
    <article className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-left text-gray-100 mb-14">Latest Blogs</h1>

      <article className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {blogPosts.map((blog) => (
          <Link
            key={blog.id}
            to={`/blog/${blog.id}`}
            className="group bg-gray-50 text-[#4E4E4E] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col"
          >
            <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
            <article className="p-6 py-4 border-b flex-1">
              <h2 className="text-lg font-bold text-[#4E4E4E]">{blog.title}</h2>
              <p className="text-[#7A7A7A] mt-2 text-xs">{blog.description}</p>
              <button className="text-zinc-50 bg-[#4397d2] rounded-full mt-4 text-xs font-semibold flex items-center gap-1 py-2 px-4">
                READ MORE
                <span className='group-hover:translate-x-1 duration-500'>
                    <ChevronsRight size={12} />
                </span>
              </button>
            </article>
            <p className="text-[#ADADAD] text-sm font-semibold pl-6 py-4">{blog.date}</p>
          </Link>
        ))}
      </article>
    </article>
  );
}
