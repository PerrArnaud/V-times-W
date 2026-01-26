import React from 'react';
import './ColorSelector.css';

/**
 * Composant ColorSelector
 * @param {string} label - Titre (ex: "Couleur")
 * @param {Array<{name: string, hex: string}>} options - Liste des options de couleur
 * @param {string} value - Nom de la couleur sélectionnée
 * @param {function} onChange - Callback de changement
 */
const ColorSelector = ({ label, options = [], value, onChange }) => {
    return (
        <div className="color-selector-container">
            {label && <div className="color-selector-header">{label}</div>}

            <div className="color-options-wrapper">
                {options.map((option) => (
                    <div
                        key={option.name}
                        className={`color-swatch ${value === option.name ? 'active' : ''}`}
                        style={{ backgroundColor: option.hex }}
                        onClick={() => onChange(option.name)}
                        title={option.name}
                    />
                ))}
            </div>
        </div>
    );
};

export default ColorSelector;
