import React, { useState } from 'react';
import Tabs from './tabsClock.jsx';
import './customSection.css';

/**
 * CustomSection
 * Section principale du configurateur qui change de contenu selon l'onglet actif.
 */
const CustomSection = () => {
    const [activeTab, setActiveTab] = useState('Cadrant');
    const tabs = ['Cadrant', 'Chiffre', 'Aiguille'];

    return (
        <section className="custom-section">
            <div className="custom-section-header">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            <div className="custom-section-content">
                {activeTab === 'Cadrant' && (
                    <div>
                        <h3>Sélection du Cadrant</h3>
                        <p>Ici s'afficheront les options de cadrants...</p>
                        {/* Composant CadrantSelector à venir */}
                    </div>
                )}

                {activeTab === 'Chiffre' && (
                    <div>
                        <h3>Sélection des Chiffres</h3>
                        <p>Ici s'afficheront les options de typographie...</p>
                    </div>
                )}

                {activeTab === 'Aiguille' && (
                    <div>
                        <h3>Sélection des Aiguilles</h3>
                        <p>Ici s'afficheront les types d'aiguilles...</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CustomSection;
