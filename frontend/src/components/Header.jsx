import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Composant Header (Hero)
 * @param {string} video - (Optionnel) URL de la vidéo de fond
 * @param {boolean} loop - (Optionnel) Si true, la vidéo boucle. Défaut: true
 * @param {string} image - Image de fond (fallback si pas de vidéo ou poster)
 */
const Header = ({
    title,
    subtitle,
    description,
    image,
    video,
    loop = true,
    buttonText,
    buttonLink
}) => {
    return (
        <header className="header-hero">
            {video ? (
                <video
                    className="header-bg-video"
                    src={video}
                    autoPlay
                    muted
                    loop={loop}
                    playsInline
                    poster={image} // L'image sert de poster le temps du chargement
                />
            ) : (
                <div
                    className="header-bg"
                    style={{ backgroundImage: `url(${image})` }}
                />
            )}

            <div className="header-overlay" />

            <div className="header-content">
                {subtitle && <span className="header-subtitle">{subtitle}</span>}
                <h1 className="header-title">{title}</h1>
                {description && <p className="header-description">{description}</p>}

                {buttonText && buttonLink && (
                    <Link to={buttonLink} className="header-cta">
                        {buttonText}
                    </Link>
                )}
            </div>

            <div className="scroll-indicator" />
        </header>
    );
};

export default Header;
