import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-zinc-900 text-zinc-50 py-2">
      <nav className="container mx-auto flex justify-between items-center">
        <article className="logo">
          <NavLink to="/" className="font-bold text-2xl">OCR</NavLink>
        </article>
        
        {/* <ul className="flex space-x-4">
          <li>
            <NavLink to="/" className={({ isActive }) =>
              `px-3 py-2 rounded-md ${isActive ? 'bg-zinc-700 text-zinc-50 font-bold' : 'hover:bg-zinc-800 hover:text-zinc-50'}`
            }>
              Using Tesseract
            </NavLink>
          </li>
          <li>
            <NavLink to="/gemini" className={({ isActive }) =>
              `px-3 py-2 rounded-md ${isActive ? 'bg-zinc-700 text-zinc-50 font-bold' : 'hover:bg-zinc-800 hover:text-zinc-50'}`
            }>
              Gemini
            </NavLink>
          </li>
          <li>
            <NavLink to="/vision" className={({ isActive }) =>
              `px-3 py-2 rounded-md ${isActive ? 'bg-zinc-700 text-zinc-50 font-bold' : 'hover:bg-zinc-800 hover:text-zinc-50'}`
            }>
              Vision API
            </NavLink>
          </li>
          <li>
            <NavLink to="/blogs" className={({ isActive }) =>
              `px-3 py-2 rounded-md ${isActive ? 'bg-zinc-700 text-zinc-50 font-bold' : 'hover:bg-zinc-800 hover:text-zinc-50'}`
            }>
              Blogs
            </NavLink>
          </li>
        </ul> */}
      </nav>
    </header>
  );
};

export default Header;