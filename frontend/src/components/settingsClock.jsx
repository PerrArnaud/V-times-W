import React from 'react';
import './settingsClock.css';

/**
 * Composant Settings Clock
 * Contrôles de configuration pour l'horloge 3D
 * @param {boolean} isExploded - État de la vue éclatée
 * @param {function} setIsExploded - Callback pour changer l'état
 */
const SettingsClock = ({ isExploded, setIsExploded }) => {
    return (
        <div className="settings-clock-container">
            <div className="settings-clock-header">
                <span className="settings-label">Paramètres</span>
            </div>

            <div className="settings-controls">
                <button
                    className={`settings-button ${isExploded ? 'active' : ''}`}
                    onClick={() => setIsExploded(!isExploded)}
                >
                    <svg className="settings-icon" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2L15 8L21 9L16 14L18 21L12 17L6 21L8 14L3 9L9 8L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="settings-button-text">Vue Éclatée</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsClock;
