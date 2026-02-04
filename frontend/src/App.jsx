import { useState } from 'react'
import Navbar from './components/navbar'
import Home from './pages/Home'
import Products from './pages/products'
import Canva from './pages/canva'
import Bottombar from './components/bottombar'
import Footer from './components/Footer'
import About from './pages/About'
import Contact from './pages/contact'
import Presales from './pages/presales'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/canva" element={<Canva />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/presales" element={<Presales />} />
            </Routes>
            <Bottombar />
            <Footer />
        </Router>
    )
}

export default App
