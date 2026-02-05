import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import './bottombar.css';

const Bottombar = () => {
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(0);
    const baseOffset = 24;
    const [raiseOffset, setRaiseOffset] = useState(0);
    const [isDocked, setIsDocked] = useState(false);
    const rafIdRef = useRef(null);
    const dockedRef = useRef(false);
    const navRef = useRef(null);

    useEffect(() => {
        switch (location.pathname) {
            case '/': setActiveIndex(0); break;
            case '/products': setActiveIndex(1); break;
            case '/presales': setActiveIndex(2); break;
            case '/about': setActiveIndex(3); break;
            case '/contact': setActiveIndex(4); break;
            default: setActiveIndex(0);
        }
    }, [location.pathname]);

    useEffect(() => {
        let isMounted = true;
        const mediaQuery = window.matchMedia('(max-width: 1060px)');

        const updatePosition = () => {
            const footer = document.querySelector('.site-footer');
            const navHeight = navRef.current?.offsetHeight || 0;
            const liftAmount = navHeight + baseOffset;

            if (!footer) {
                setRaiseOffset(prev => (prev !== 0 ? 0 : prev));
                return;
            }

            if (mediaQuery.matches) {
                footer.style.setProperty('--bottom-bar-height', `${liftAmount}px`);
                const footerRect = footer.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const dockThreshold = viewportHeight - 4;
                const undockThreshold = viewportHeight + 8;

                let shouldLift = dockedRef.current;
                if (!dockedRef.current && footerRect.bottom <= dockThreshold) {
                    shouldLift = true;
                } else if (dockedRef.current && footerRect.bottom > undockThreshold) {
                    shouldLift = false;
                }

                dockedRef.current = shouldLift;
                footer.classList.toggle('footer-lift', shouldLift);
                setIsDocked(shouldLift);
                setRaiseOffset(prev => (prev !== 0 ? 0 : prev));
                return;
            }

            footer.classList.remove('footer-lift');
            dockedRef.current = false;
            setIsDocked(false);
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const overlap = Math.max(0, (viewportHeight - baseOffset) - footerRect.top);
            setRaiseOffset(prev => (prev !== overlap ? overlap : prev));
        };

        const loop = () => {
            if (!isMounted) return;
            updatePosition();
            rafIdRef.current = window.requestAnimationFrame(loop);
        };

        rafIdRef.current = window.requestAnimationFrame(loop);

        const handleMediaChange = () => {
            updatePosition();
        };

        mediaQuery.addEventListener('change', handleMediaChange);

        return () => {
            isMounted = false;
            const footer = document.querySelector('.site-footer');
            if (footer) {
                footer.classList.remove('footer-lift');
            }
            dockedRef.current = false;
            setIsDocked(false);
            mediaQuery.removeEventListener('change', handleMediaChange);
            if (rafIdRef.current) {
                window.cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [baseOffset]);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const nav = (
        <nav
            ref={navRef}
            className={`bottom-bar ${isDocked ? 'bottom-bar-docked' : ''}`}
            style={{
                bottom: isDocked ? '0px' : `${baseOffset}px`,
                transform: isDocked ? 'none' : `translateX(-50%) translateY(-${raiseOffset}px)`
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
            <Link to="/presales" className={`bottom-nav-link ${isActive('/presales')}`}>
                <img src="https://cdn-icons-png.flaticon.com/512/633/633640.png" alt="Pré-vente" className="bottom-nav-icon" />
                <span>Pré-vente</span>
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

    const footerSlot = typeof document !== 'undefined'
        ? document.getElementById('footer-bottom-bar-slot')
        : null;

    if (isDocked && footerSlot) {
        return createPortal(nav, footerSlot);
    }

    return nav;
};

export default Bottombar;