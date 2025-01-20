import { Outlet } from 'react-router-dom'
import './App.css'
import Header from './comp/Header/Header'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export default Layout
