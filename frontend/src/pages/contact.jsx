import { useState } from 'react';
import './Contact.css';

function Contact() {
    const [status, setStatus] = useState('');

    const url = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_CONTACT_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('Envoi en cours...');

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        try {
            await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            setStatus('Votre message a été envoyé avec succès !');
            event.target.reset();
        } catch (error) {
            console.error("Erreur React Fetch:", error);
            setStatus('Erreur lors de l\'envoi.');
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-container">
                <div className="contact-card">
                    <h1 className="contact-title">Contactez-nous</h1>

                    {status && (
                        <div className="contact-alert" role="status">
                            {status}
                        </div>
                    )}

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="contact-field">
                            <label htmlFor="contact-name">Nom</label>
                            <input
                                id="contact-name"
                                name="name"
                                type="text"
                                placeholder="Entrez votre nom"
                                required
                            />
                        </div>

                        <div className="contact-field">
                            <label htmlFor="contact-email">Email</label>
                            <input
                                id="contact-email"
                                name="email"
                                type="email"
                                placeholder="Entrez votre email"
                                required
                            />
                        </div>

                        <div className="contact-field">
                            <label htmlFor="contact-message">Message</label>
                            <textarea
                                id="contact-message"
                                name="message"
                                placeholder="Entrez votre message"
                                rows={5}
                                required
                            />
                        </div>

                        <button type="submit" className="section-button">
                            Envoyer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Contact;
