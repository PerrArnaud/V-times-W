import React, { useState } from 'react';
import Section from '../components/Section';
import MiniCard from '../components/MiniCard';
import Tabs from '../components/tabs';
import SectionLinkTabs from '../components/sectionLinkTabs';
import Search from '../components/Search';
import Clock3D from '../components/Clock3D';
import SettingsClock from '../components/settingsClock';
import Selector from '../components/Selector';
import ColorSelector from '../components/ColorSelector';
import { clockTabsData } from '../data/clockOptions';
import bgVtimes from '../img/bg-vtimes.png';
import './Home.css'; // On garde le CSS global pour l'app layout
import VinyleW from '../img/vinyle-w-6977881fdb80a.jpg';
import VinyleG from '../img/vinyle-g-69778872653d9.jpg';
import VinyleRed from '../img/vinyle-red-6977856453885.jpg';

function Products() {
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
        <div className="products-page"> {/* On garde la classe home ou on en crée une products-page */}
            <Section
                title="Notre Collection"
                size="M"
            >
                <MiniCard
                    image={VinyleW}
                    title="Vinyle Blanc"
                    onClick={() => console.log('Produit 1')}
                />
                <MiniCard
                    image={VinyleRed}
                    title="Vinyle Rouge"
                />
                <MiniCard
                    image={VinyleG}
                    title="Édition Limitée"
                />
            </Section>

            <Section
                title="Personnalisez votre horloge !"
                size="L"
            >
                <div className="clock-customization-wrapper">
                    <SectionLinkTabs tabs={tabsData} activeTabId={activeTabId} />
                </div>
            </Section>
        </div>
    )
}

export default Products;
