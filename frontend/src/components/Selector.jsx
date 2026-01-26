import React from 'react';
import './Selector.css';

/**
 * Composant Selector
 * @param {string} label - Titre du sélecteur (ex: "Format")
 * @param {Array} options - Liste des options
 * @param {any} value - Valeur actuelle
 * @param {function} onChange - Callback de changement
 */
const Selector = ({ label, options = [], value, onChange }) => {
    const [direction, setDirection] = React.useState('');

    const currentIndex = options.indexOf(value);

    const handlePrev = () => {
        setDirection('left');
        const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[newIndex]);
    };

    const handleNext = () => {
        setDirection('right');
        const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[newIndex]);
    };

    return (
        <div className="selector-container">
            {label && <div className="selector-header">{label}</div>}

            <div className="selector-controls">
                <button className="selector-arrow left" onClick={handlePrev} aria-label="Previous">
                    <svg viewBox="0 0 24 24">
                        <path d="M16 6 L6 12 L16 18 Z" />
                    </svg>
                </button>

                <div key={value} className={`selector-value ${direction}`}>
                    {value}
                </div>

                <button className="selector-arrow right" onClick={handleNext} aria-label="Next">
                    <svg viewBox="0 0 24 24">
                        <path d="M8 6 L18 12 L8 18 Z" />
                    </svg>
                </button>
            </div>

            <div className="selector-dots">
                {options.map((opt, idx) => (
                    <div
                        key={idx}
                        className={`dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => onChange(opt)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Selector;
