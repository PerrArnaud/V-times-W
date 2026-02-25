import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

/**
 * Composant Header (Hero)
 * @param {string} video - (Optionnel) URL de la vidéo de fond
 * @param {string} sliderImage - (Optionnel) image utilisée avec la vidéo pour un slider auto
 * @param {number} slideInterval - (Optionnel) intervalle en ms entre les slides. Défaut: 7000
 * @param {boolean} loop - (Optionnel) Si true, la vidéo boucle. Défaut: true
 * @param {string} image - Image de fond (fallback si pas de vidéo ou poster)
 */
const Header = ({
    title,
    subtitle,
    description,
    image,
    video,
    sliderImage,
    slideInterval = 7000,
    loop = true,
    buttonText,
    buttonLink
}) => {
    const slides = useMemo(() => {
        if (video && sliderImage) {
            return [
                { type: 'video', src: video },
                { type: 'image', src: sliderImage }
            ];
        }

        if (video) {
            return [{ type: 'video', src: video }];
        }

        if (image) {
            return [{ type: 'image', src: image }];
        }

        return [];
    }, [video, sliderImage, image]);

    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [previousSlideIndex, setPreviousSlideIndex] = useState(null);

    useEffect(() => {
        setActiveSlideIndex(0);
        setPreviousSlideIndex(null);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;

        const intervalId = window.setInterval(() => {
            setPreviousSlideIndex(activeSlideIndex);
            setActiveSlideIndex((prev) => (prev + 1) % slides.length);
        }, slideInterval);

        return () => window.clearInterval(intervalId);
    }, [activeSlideIndex, slideInterval, slides.length]);

    useEffect(() => {
        if (previousSlideIndex === null) return;

        const timeoutId = window.setTimeout(() => {
            setPreviousSlideIndex(null);
        }, 900);

        return () => window.clearTimeout(timeoutId);
    }, [previousSlideIndex]);

    const renderSlide = (slide) => {
        if (!slide) return null;

        if (slide.type === 'video') {
            return (
                <video
                    className="header-bg-video"
                    src={slide.src}
                    autoPlay
                    muted
                    loop={loop}
                    playsInline
                    poster={image}
                />
            );
        }

        return (
            <div
                className="header-bg"
                style={{ backgroundImage: `url(${slide.src})` }}
            />
        );
    };

    return (
        <header className="header-hero">
            <div className="header-background-slider">
                {previousSlideIndex !== null && (
                    <div className="header-slide header-slide-exit">
                        {renderSlide(slides[previousSlideIndex])}
                    </div>
                )}
                <div className={`header-slide ${previousSlideIndex !== null ? 'header-slide-enter' : ''}`}>
                    {renderSlide(slides[activeSlideIndex])}
                </div>
            </div>

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
