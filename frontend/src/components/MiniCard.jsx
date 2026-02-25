import React from 'react';
import './MiniCard.css';

/**
 * Composant MiniCard
 * Carte simple avec fond beige et effet "produit"
 * @param {string} image - URL de l'image
 * @param {string} title - Titre du produit
 * @param {string} subtitle - Sous-titre du produit
 * @param {function} onClick - Action au clic
 */
const MiniCard = ({ image, title, subtitle, onClick }) => {
    return (
        <div className="mini-card" onClick={onClick}>
            <div className="mini-card-image-container">
                <img src={image} alt={title} className="mini-card-image" />
            </div>
            <h3 className="mini-card-title">{title}</h3>
            {subtitle && <p className="mini-card-subtitle">{subtitle}</p>}
        </div>
    );
};

export default MiniCard;
