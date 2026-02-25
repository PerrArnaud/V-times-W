import React from 'react';
import './cards.css';

/**
 * Composant Card
 * Affiche une image en fond et révèle un titre/sous-titre au survol.
 * @param {string} image - URL de l'image de fond
 * @param {string} title - Titre principal (Serif)
 * @param {string} subtitle - Sous-titre ou catégorie (Sans-serif)
 * @param {string} className - Classe CSS additionnelle
 */
const Card = ({ image, title, subtitle, className = '' }) => {
    return (
        <div className={`card-container ${className}`.trim()}>
            <img src={image} alt={title} className="card-image" />
            <div className="card-overlay">
                <h3 className="card-title">{title}</h3>
                {subtitle && <span className="card-subtitle">{subtitle}</span>}
            </div>
        </div>
    );
};

export default Card;
