import React from 'react';
import './Search.css';

/**
 * Composant Search
 * @param {string} placeholder - Texte indicatif (défaut: "Nom de votre vinyle")
 * @param {function} onSearch - Callback déclenché à la soumission
 */
const Search = ({ placeholder = "Nom de votre vinyle", onSearch }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const value = e.target.elements.search.value;
        if (onSearch) onSearch(value);
    };

    return (
        <form className="search-container" onSubmit={handleSubmit}>
            <input
                type="text"
                name="search"
                className="search-input"
                placeholder={placeholder}
            />
            <button type="submit" className="search-button" aria-label="Rechercher">
                <svg viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
            </button>
        </form>
    );
};

export default Search;
