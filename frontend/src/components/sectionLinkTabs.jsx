import React, { useRef, useEffect } from 'react';
import '../components/CustomClock/customSection.css';
import './sectionLinkTabs.css';

const SectionLinkTabs = ({ activeTabId, tabs = [] }) => {
    const prevActiveTabIdRef = useRef(activeTabId);
    const directionRef = useRef('right');

    const activeTabData = tabs.find(tab => tab.id === activeTabId);

    useEffect(() => {
        const prevIndex = tabs.findIndex(tab => tab.id === prevActiveTabIdRef.current);
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);

        if (prevIndex !== -1 && currentIndex !== -1) {
            directionRef.current = currentIndex > prevIndex ? 'right' : 'left';
        }

        prevActiveTabIdRef.current = activeTabId;
    }, [activeTabId, tabs]);

    const animationClass = directionRef.current === 'right' ? 'tab-content-enter-right' : 'tab-content-enter-left';
    const commonStyle = { textAlign: 'center', padding: '2rem' };

    if (!activeTabData) return null;

    const renderVisual = (visual) => {
        if (!visual) return null;

        if (visual.type === 'icon') {
            return (
                <div style={{ margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', ...visual.style }}>
                    {visual.value}
                </div>
            );
        }
        if (visual.type === 'text') {
            return (
                <div style={{ margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', ...visual.style }}>
                    {visual.value}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="section-link-tabs" style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '20px', overflow: 'hidden' }} key={activeTabId}>
            <div className={`section-content-alt ${animationClass}`} style={commonStyle}>
                {activeTabData.title && <h2>{activeTabData.title}</h2>}
                {activeTabData.description && <p>{activeTabData.description}</p>}
                {renderVisual(activeTabData.visual)}
                {activeTabData.component}
            </div>
        </div>
    );
};

export default SectionLinkTabs;
