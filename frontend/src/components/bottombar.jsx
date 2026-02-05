import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './bottombar.css';

const Bottombar = () => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);
    const baseOffset = 24;
    const [raiseOffset, setRaiseOffset] = useState(0);

    useEffect(() => {
        switch (location.pathname) {
            case '/': setActiveIndex(0); break;
            case '/products': setActiveIndex(1); break;
            case '/about': setActiveIndex(2); break;
            case '/contact': setActiveIndex(3); break;
            default: setActiveIndex(0);
        }
    }, [location.pathname]);

    useEffect(() => {
        const footer = document.querySelector('.site-footer');
        if (!footer) return;

        let ticking = false;

        const updatePosition = () => {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const overlap = Math.max(0, (viewportHeight - baseOffset) - footerRect.top);
            setRaiseOffset(overlap);
        };

        const onScroll = () => {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(() => {
                updatePosition();
                ticking = false;
            });
        };

        updatePosition();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [baseOffset]);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav
            className="bottom-bar"
            style={{
                bottom: `${baseOffset}px`,
                transform: `translateX(-50%) translateY(-${raiseOffset}px)`
            }}
        >
            {/* The Blob */}
            <div
                className="nav-blob"
                style={{ '--blob-x': `${activeIndex * 100}%` }}
            ></div>

            <Link to="/" className={`bottom-nav-link ${isActive('/')}`}>
                <img src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png" alt="Home" className="bottom-nav-icon" />
                <span>Accueil</span>
            </Link>
            <Link to="/products" className={`bottom-nav-link ${isActive('/products')}`}>
                <img src="https://cdn-icons-png.flaticon.com/512/679/679720.png" alt="Products" className="bottom-nav-icon" />
                <span>Produits</span>
            </Link>
            <Link to="/about" className={`bottom-nav-link ${isActive('/about')}`}>
                <img src="https://cdn-icons-png.flaticon.com/512/1152/1152912.png" alt="About" className="bottom-nav-icon" />
                <span>À propos</span>
            </Link>
            <Link to="/contact" className={`bottom-nav-link ${isActive('/contact')}`}>
                <img src="https://cdn-icons-png.flaticon.com/512/3059/3059502.png" alt="Contact" className="bottom-nav-icon" />
                <span>Contact</span>
            </Link>
        </nav>
    );
};

export default Bottombar;