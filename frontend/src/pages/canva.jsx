import React, { useState } from 'react';
import Tabs from '../components/tabs';
import SectionLinkTabs from '../components/sectionLinkTabs';
import Search from '../components/Search';
import Clock3D from '../components/Clock3D';
import SettingsClock from '../components/settingsClock';
import Selector from '../components/Selector';
import ColorSelector from '../components/ColorSelector';
import { formatOptions, needleOptions, dialOptions, colorOptions } from '../data/clockOptions';
import './Home.css';

const Canva = () => {
    const [activeTabId, setActiveTabId] = useState('clock');

    // Config States
    const [clockFormat, setClockFormat] = useState('Alphanumérique');
    const [clockNeedles, setClockNeedles] = useState('Bâton');
    const [clockDial, setClockDial] = useState('Minimaliste');
    const [clockColor, setClockColor] = useState('Noir & Blanc');
    const [isExploded, setIsExploded] = useState(false);

    const handleSearch = (value) => {
        console.log("Recherche:", value);
        // Implement search logic here
    };

    const tabsData = [
        {
            id: 'clock',
            label: 'Horloge',

            title: "Configuration de l'Horloge",
            description: "Personnalisez chaque détail de votre horloge.",
            component: (
                <div className="clock-config-container">
                    <Search onSearch={handleSearch} />

                    <div className="clock-layout-wrapper">
                        {/* Left: 3D Clock Visualization */}
                        <div className="clock-visual-wrapper">
                            <div className="clock-visual">
                                <Clock3D isExploded={isExploded} />
                            </div>
                            <SettingsClock isExploded={isExploded} setIsExploded={setIsExploded} />
                        </div>

                        {/* Right: Selectors Configuration */}
                        <div className="clock-selectors">
                            <Selector
                                label="Format"
                                options={formatOptions}
                                value={clockFormat}
                                onChange={setClockFormat}
                            />
                            <Selector
                                label="Aiguilles"
                                options={needleOptions}
                                value={clockNeedles}
                                onChange={setClockNeedles}
                            />
                            <Selector
                                label="Cadran"
                                options={dialOptions}
                                value={clockDial}
                                onChange={setClockDial}
                            />
                            <ColorSelector
                                label="Couleur"
                                options={colorOptions}
                                value={clockColor}
                                onChange={setClockColor}
                            />
                        </div>
                    </div>
                </div>
            ),
        },
        // Add other tabs here if needed
    ];

    return (
        <div className="canva-page" style={{ minHeight: '100vh', backgroundColor: '#F9F9F9' }}>
            <div style={{ paddingTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1>Configurateur</h1>
                <div style={{ marginBottom: '2rem', maxWidth: '100vw', overflow: 'hidden', padding: '0 10px' }}>
                    <Tabs tabs={tabsData} activeTabId={activeTabId} onTabChange={setActiveTabId} />
                </div>

                <SectionLinkTabs tabs={tabsData} activeTabId={activeTabId} />
            </div>
        </div>
    );
};

export default Canva;
