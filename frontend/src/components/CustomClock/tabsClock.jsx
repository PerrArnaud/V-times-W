import React, { useState, useEffect, useRef } from 'react';
import './tabs.css';

/**
 * Composant Tabs
 * Navigation style "pill" avec indicateur glissant (Blob)
 * 
 * @param {Array<string>} tabs - Liste des labels des onglets
 * @param {string} activeTab - Label de l'onglet actif
 * @param {function} onTabChange - Callback appelé au clic avec le nouveau tab
 */
const Tabs = ({ tabs, activeTab, onTabChange }) => {
    const [blobStyle, setBlobStyle] = useState({ left: 0, width: 0 });
    const tabsRef = useRef([]);

    useEffect(() => {
        const activeIndex = tabs.indexOf(activeTab);
        const currentTab = tabsRef.current[activeIndex];

        if (currentTab) {
            setBlobStyle({
                left: currentTab.offsetLeft,
                width: currentTab.offsetWidth
            });
        }
    }, [activeTab, tabs]);

    return (
        <div className="tabs-container">
            <div className="tab-blob" style={blobStyle} />
            {tabs.map((tab, index) => (
                <button
                    key={tab}
                    ref={el => tabsRef.current[index] = el}
                    className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
