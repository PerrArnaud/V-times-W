import './Legal.css';

const Legal = () => {
    return (
        <div className="legal-page">
            <div className="legal-container">
                <h1 className="legal-title">Mentions légales</h1>

                <div className="legal-grid">
                    <section className="legal-card">
                        <h2>Éditeur</h2>
                        <p><strong>V-Time's</strong></p>
                        <p>9 T Rue Pétinaud‑Beaupeyrat</p>
                        <p>87000 Limoges</p>
                        <p>Téléphone : +33 (0)5 55 45 81 00</p>
                        <p>
                            Site :{' '}
                            <a href="https://beaupeyrat.fr" target="_blank" rel="noreferrer">
                                beaupeyrat.fr
                            </a>
                        </p>
                    </section>

                    <section className="legal-card">
                        <h2>Responsable de publication</h2>
                        <p><strong>LÉA CHATELAIS</strong></p>
                        <p>
                            Email :{' '}
                            <a href="mailto:campus@beaupeyrat.com">
                                campus@beaupeyrat.com
                            </a>
                        </p>
                    </section>

                    <section className="legal-card">
                        <h2>Hébergeur</h2>
                        <p><strong>CAMPUS BEAUPEYRAT</strong></p>
                        <p>9 T Rue Pétinaud‑Beaupeyrat</p>
                        <p>87000 Limoges</p>
                        <p>Téléphone : +33 (0)5 55 45 81 00</p>
                        <p>
                            Site :{' '}
                            <a href="https://beaupeyrat.fr" target="_blank" rel="noreferrer">
                                beaupeyrat.fr
                            </a>
                        </p>
                    </section>
                </div>

                <section className="legal-section">
                    <h2>Propriété intellectuelle</h2>
                    <p>
                        V‑Time's est propriétaire des droits de propriété intellectuelle et détient les droits
                        d’usage sur tous les éléments accessibles sur le site internet, notamment les textes,
                        images, graphismes, logos et vidéos.
                    </p>
                    <p>
                        Toute reproduction, représentation, modification, publication, adaptation de tout ou
                        partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite,
                        sauf autorisation écrite préalable de V‑Time's.
                    </p>
                    <p>
                        Toute exploitation non autorisée du site ou de l’un quelconque des éléments qu’il
                        contient sera considérée comme constitutive d’une contrefaçon et poursuivie
                        conformément aux dispositions des articles L.335‑2 et suivants du Code de la
                        Propriété Intellectuelle.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>Limitations de responsabilité</h2>
                    <p>
                        V‑Time's ne pourra être tenu pour responsable des dommages directs et indirects causés
                        au matériel de l’utilisateur, lors de l’accès au site www.campus.beaupeyrat.fr.
                    </p>
                    <p>
                        V‑Time's décline toute responsabilité quant à l’utilisation qui pourrait être faite des
                        informations et contenus présents sur www.campus.beaupeyrat.fr.
                    </p>
                    <p>
                        V‑Time's s’engage à sécuriser au mieux le site www.campus.beaupeyrat.fr, cependant sa
                        responsabilité ne pourra être mise en cause si des données indésirables sont importées
                        et installées sur son site à son insu.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>Liens hypertextes et cookies</h2>
                    <p>
                        Le site www.campus.beaupeyrat.fr contient des liens hypertextes vers d’autres sites et
                        dégage toute responsabilité à propos de ces liens externes ou des liens créés par
                        d’autres sites vers www.campus.beaupeyrat.fr.
                    </p>
                    <p>
                        La navigation sur le site www.campus.beaupeyrat.fr est susceptible de provoquer
                        l’installation de cookie(s) sur l’ordinateur de l’utilisateur.
                    </p>
                    <p>
                        Vous avez la possibilité d’accepter ou de refuser les cookies en modifiant les paramètres
                        de votre navigateur. Aucun cookie excepté le fonctionnel ne sera déposé sans votre
                        consentement.
                    </p>
                    <p>Les cookies sont enregistrés pour une durée maximale de 12 mois.</p>
                </section>
            </div>
        </div>
    );
};

export default Legal;
