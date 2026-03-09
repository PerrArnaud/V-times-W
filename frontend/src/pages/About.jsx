import Card from "../components/cards"
import bgVtimes from '../img/bg-vtimes.png';
import LogoPWhite from '../img/Logo-P-White.svg';
import videoVTimesMp4 from '../img/Vidéo_pres_VTimes.mp4';
import Section from '../components/Section';
import './About.css';
import Pole_Production from '../img/Pole_Production2.jpeg';
import Pole_Coordination from '../img/Pole_Coordination.jpeg';
import Pole_Communication from '../img/Pole_Communication.jpeg';

function About() {
    return (
        <div className="Section">
            <Section
                size='L'
                title="À propos de V-Time's"
            >

            <Card
                image={bgVtimes}
                title="Notre Histoire"
                subtitle="V-Time's est née de la passion pour la musique vinyle et l'artisanat. Chaque horloge 
                        que nous créons est une pièce unique, fabriquée à partir de vinyles authentiques 
                        soigneusement sélectionnés."
            />

            <Card
                image={LogoPWhite}
                title="Notre Mission"
                className="card-bg-black"
                subtitle="Donner une seconde vie aux vinyles tout en créant des objets décoratifs uniques et 
                        fonctionnels. Nous croyons en l'économie circulaire et à la valorisation du patrimoine 
                        musical."
            />

            <Card
                image={bgVtimes}
                title="Notre Savoir-Faire"
                subtitle="Chaque horloge est fabriquée artisanalement dans notre atelier. Nous sélectionnons 
                        des vinyles aux visuels remarquables, les transformons avec soin et y installons 
                        un mécanisme d'horloge de qualité."
            />
        </Section>

        <Section
            size='M'
            title="Présentation"> 
            <div className="about-text">
                <p>Entreprise étudiante indépendante, V-Time’s se développe grâce à l’engagement et à la créativité de ses membres, mais également grâce au soutien du public. Chaque création réalisée participe à faire vivre notre projet et à promouvoir une démarche à la fois écologique et artistique. En donnant une seconde vie à des vinyles destinés à être jetés, nous nous inscrivons dans une logique de consommation responsable, tout en proposant des objets uniques et personnalisés. Soutenir V-Time’s, c’est encourager une initiative jeune, engagée et innovante, où la créativité se met au service de l’environnement.</p>
            </div>
        </Section>

        <Section
                size='L'
                context="services"
                title="Nos services"
            >
                <Card
                    image={Pole_Production}
                    title="Pôle Production"
                    subtitle="Notre équipe de production se charge de récupérer des vinyles abimés ou inutilisés pour les transformer en beaux objets décoratifs. Peintures, paillettes, colles, aiguilles… dites-leur ce que vous souhaitez et ils vous le créent"
                />
                <Card
                    image={Pole_Communication}
                    title="Pôle Marketing-Communication"
                    subtitle="Etudes de marché, enquêtes clients, création des visuels, animation des réseaux sociaux, site internet … les missions sont nombreuses et variées, mais ne font pas peur à notre équipe de choc"
                />
                <Card
                    image={Pole_Coordination}
                    title="Pôle Gestion-Finance"
                    subtitle="Nos étudiants en BTS Comptabilité-Gestion mettent leurs talents de gestionnaires et de comptables au service de V-Time’s ! Comparaison des coûts, achats, fixation des prix de vente, fixation du seuil de rentabilité, n’ont plus de secret pour eux"
                />
            </Section>

        <Section
            size='M'
            title="Vidéo de Présentation"> 
            <div className="about-video-row">
                        <a
                            href="https://www.instagram.com/vtime.s/"
                            target="_blank"
                            rel="noreferrer"
                            className="section-button"
                        >
                            Suivre sur Instagram
                        </a>
                <div className="about-video-player">
                    <video controls>
                        <source src={videoVTimesMp4} type="video/mp4" />
                        Vidéo de présentation de V-Time's.
                    </video>
                </div>
            </div>
        </Section>

        </div>
           
    )
}

export default About
