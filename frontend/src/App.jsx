import { useEffect, useLayoutEffect } from 'react'
import Navbar from './components/navbar'
import Home from './pages/Home'
import Products from './pages/products'
import Canva from './pages/canva'
import Bottombar from './components/bottombar'
import Footer from './components/Footer'
import About from './pages/About'
import Contact from './pages/contact'
import Presales from './pages/presales'
import Legal from './pages/Legal'
import Commitments from './pages/Commitments'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const root = document.getElementById('root');
        if (root) {
            root.scrollTop = 0;
        }

        const rafId = window.requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            if (root) {
                root.scrollTop = 0;
            }
        });

        return () => window.cancelAnimationFrame(rafId);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/canva" element={<Canva />} />
                <Route path="/about" element={<About />} />
                <Route path="/commitments" element={<Commitments />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/presales" element={<Presales />} />
                <Route path="/legal" element={<Legal />} />
            </Routes>
            <Bottombar />
            <Footer />
        </Router>
    )
}

export default App
