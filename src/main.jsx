import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import ImageOcr from './comp/Tesseract/ImageOCR.jsx'
import Gemini from './comp/Gemini/Gemini.jsx'
import Vision from './comp/Vision/Vision.jsx'
import ImageProcessor from './comp/Gemini/GeminiProcessing.jsx'
import Blogs from './comp/Blogs/Blogs.jsx'
import Blog from './comp/Blogs/Blog.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={ <Layout /> }>
      {/* <Route  path='' element={ <ImageOcr /> } /> */}
      <Route  path='' element={ <ImageProcessor /> } />
      {/* <Route  path='gemini' element={ <ImageProcessor /> } />
      <Route  path='vision' element={ <Vision /> } />
      <Route  path='blogs' element={ <Blogs /> } />
      <Route  path='blog/:id' element={ <Blog /> } /> */}
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
