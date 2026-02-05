import React, { useState } from 'react';
import Tabs from '../components/tabs';
import SectionLinkTabs from '../components/sectionLinkTabs';
import Search from '../components/Search';
import Clock3D from '../components/Clock3D';
import SettingsClock from '../components/settingsClock';
import Selector from '../components/Selector';
import ColorSelector from '../components/ColorSelector';
import { clockTabsData } from '../data/clockOptions';
import './Home.css';

const Canva = () => {
    const [activeTabId, setActiveTabId] = useState('clock');

    // Config States
    const [activeConfigTab, setActiveConfigTab] = useState(clockTabsData[0].id);
    const [clockConfig, setClockConfig] = useState(() => {
        // Initialize config with default values (first option of each selector)
        const initialConfig = {};
        clockTabsData.forEach(tab => {
            tab.content.forEach(item => {
                if (item.options && item.options.length > 0) {
                    // Handle color objects vs simple strings
                    const firstOption = item.options[0];
                    initialConfig[item.label] = typeof firstOption === 'object' ? firstOption.name : firstOption;
                }
            });
        });
        if (Object.prototype.hasOwnProperty.call(initialConfig, 'Couleur Primaire')) {
            initialConfig['Couleur Primaire'] = 'Sable';
        }
        return initialConfig;
    });

    const [isExploded, setIsExploded] = useState(false);

    const handleConfigChange = (label, value) => {
        setClockConfig(prev => ({
            ...prev,
            [label]: value
        }));
    };

    const handleSearch = (value) => {
        console.log("Recherche:", value);
        // Implement search logic here
    };

    // Prepare tabs for the Tabs component
    const configTabs = clockTabsData.map(tab => ({
        id: tab.id,
        label: tab.libelle
    }));

    const activeTabContent = clockTabsData.find(t => t.id === activeConfigTab)?.content || [];

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
                                <Clock3D isExploded={isExploded} clockConfig={clockConfig} />
                            </div>
                            <SettingsClock isExploded={isExploded} setIsExploded={setIsExploded} />
                        </div>

                        {/* Right: Selectors Configuration */}
                        <div className="clock-selectors">
                            {/* Sub-tabs for configuration sections */}
                            <div style={{ marginBottom: '20px' }}>
                                <Tabs
                                    tabs={configTabs}
                                    activeTabId={activeConfigTab}
                                    onTabChange={setActiveConfigTab}
                                />
                            </div>

                            {/* Dynamic Selectors Render */}
                            <div className="selectors-list">
                                {activeTabContent.map((item, index) => {
                                    const value = clockConfig[item.label];

                                    if (item.type === 'colorSelector') {
                                        return (
                                            <ColorSelector
                                                key={`${activeConfigTab}-${index}`}
                                                label={item.label}
                                                options={item.options}
                                                value={value}
                                                onChange={(newValue) => handleConfigChange(item.label, newValue)}
                                            />
                                        );
                                    } else {
                                        // Ensure options are primitives (strings/numbers) for Selector
                                        // If options are objects (like colors), extract the 'name' property
                                        const selectorOptions = item.options.map(opt =>
                                            typeof opt === 'object' && opt !== null ? opt.name : opt
                                        );

                                        return (
                                            <Selector
                                                key={`${activeConfigTab}-${index}`}
                                                label={item.label}
                                                options={selectorOptions}
                                                value={value}
                                                onChange={(newValue) => handleConfigChange(item.label, newValue)}
                                            />
                                        );
                                    }
                                })}
                            </div>
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
