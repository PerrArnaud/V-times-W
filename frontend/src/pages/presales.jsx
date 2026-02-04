import { useState } from 'react';
import './Presales.css';

const productOptions = [
    { value: '', label: 'Sélectionnez un produit' },
    { value: 'vinyle-noir', label: 'Vinyle Noir (20,00 €)' },
    { value: 'vinyle-rouge', label: 'Vinyle Rouge (25,00 €)' },
    { value: 'edition-limitee', label: 'Édition Limitée (35,00 €)' }
];

function Presales() {
    const [status, setStatus] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        setStatus('Votre pré-commande a été enregistrée avec succès !');
    };

    return (
        <div className="presales-page">
            <div className="presales-container">
                <div className="presales-card">
                    <h1 className="presales-title">Formulaire de pré-commande</h1>

                    {status && (
                        <div className="presales-alert" role="status">
                            {status}
                        </div>
                    )}

                    <form className="presales-form" onSubmit={handleSubmit}>
                        <div className="presales-grid">
                            <div className="presales-field">
                                <label htmlFor="presales-nom">Nom</label>
                                <input
                                    id="presales-nom"
                                    name="nom"
                                    type="text"
                                    placeholder="Votre nom"
                                    required
                                />
                            </div>
                            <div className="presales-field">
                                <label htmlFor="presales-prenom">Prénom</label>
                                <input
                                    id="presales-prenom"
                                    name="prenom"
                                    type="text"
                                    placeholder="Votre prénom"
                                    required
                                />
                            </div>
                        </div>

                        <div className="presales-field">
                            <label htmlFor="presales-email">Adresse email</label>
                            <input
                                id="presales-email"
                                name="email"
                                type="email"
                                placeholder="votre@email.com"
                                required
                            />
                        </div>

                        <div className="presales-field">
                            <label htmlFor="presales-produit">Produit</label>
                            <select id="presales-produit" name="produit" required>
                                {productOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="presales-field">
                            <label htmlFor="presales-quantite">Quantité</label>
                            <input
                                id="presales-quantite"
                                name="quantite"
                                type="number"
                                min="1"
                                max="10"
                                defaultValue="1"
                                required
                            />
                            <p className="presales-help">Maximum 10 unités par commande</p>
                        </div>

                        <div className="presales-field">
                            <label htmlFor="presales-message">Message (optionnel)</label>
                            <textarea
                                id="presales-message"
                                name="message"
                                rows={4}
                                placeholder="Des précisions sur votre commande..."
                            />
                        </div>

                        <button type="submit" className="presales-submit">
                            Valider la pré-commande
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Presales;
