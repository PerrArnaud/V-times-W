import React from 'react';
import './IconCard.css';

/**
 * Composant IconCard
 * Affiche une icône, un titre et une description centrés.
 * @param {string} icon - URL de l'icône (img/svg)
 * @param {string} title - Titre principal
 * @param {string} description - Texte de description
 * @param {string} theme - 'dark' (texte noir) ou 'light' (texte blanc). Défaut: 'dark'
 */
const IconCard = ({ icon, title, description, theme = 'dark' }) => {
    return (
        <div className={`icon-card ${theme}`}>
            {typeof icon === 'string' ? (
                <img src={icon} alt={title} className="icon-card-image" />
            ) : (
                <div className="icon-card-image icon-svg-wrapper">
                    {icon}
                </div>
            )}
            <h3 className="icon-card-title">{title}</h3>
            {description && <p className="icon-card-description">{description}</p>}
        </div>
    );
};

export default IconCard;
