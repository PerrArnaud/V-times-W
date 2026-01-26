import React, { useState, useEffect, useRef } from 'react';
import './CustomClock/tabs.css';

/**
 * Composant Tabs
 * Navigation style "pill" avec indicateur glissant (Blob)
 * 
 * @param {Object} props
 * @param {Array<string>} props.tabs - Liste des labels des onglets
 * @param {string} props.activeTab - Label de l'onglet actif
 * @param {function} props.onTabChange - Callback appelé au clic avec le nouveau tab
 */
const Tabs = ({ tabs, activeTabId, onTabChange }) => {
    const [blobStyle, setBlobStyle] = useState({ left: 0, width: 0 });
    const [isCarousel, setIsCarousel] = useState(false);
    const tabsRef = useRef([]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const count = tabs.length;

            // Mobile (< 768px): Carousel if items > 3
            // Tablet (< 1024px): Carousel if items > 5
            const isMobile = width < 768 && count > 3;
            const isTablet = width >= 768 && width < 1024 && count > 5;

            setIsCarousel(isMobile || isTablet);
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [tabs.length]);

    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === activeTabId);
        const currentTab = tabsRef.current[activeIndex];

        if (currentTab) {
            setBlobStyle({
                left: currentTab.offsetLeft,
                width: currentTab.offsetWidth
            });

            // If in carousel mode, ensure active tab is visible
            if (isCarousel) {
                currentTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeTabId, tabs, isCarousel]);

    return (
        <div className={`tabs-container ${isCarousel ? 'carousel-mode' : ''}`}>
            <div className="tab-blob" style={blobStyle} />
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    ref={el => tabsRef.current[index] = el}
                    className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
