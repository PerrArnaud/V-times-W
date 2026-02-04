import Card from "../components/cards"
import bgVtimes from '../img/bg-vtimes.png';
import LogoPWhite from '../img/Logo-P-White.svg';
import videoVTimesMp4 from '../img/Vidéo_pres_VTimes.mp4';
import Section from '../components/Section';
import './About.css';

function About() {
    return (
        <div className="Section">
            <Section
                size='L'
                title="À propos de V-Times"
            >

            <Card
                image={LogoPWhite}
                title="Notre Histoire"
                subtitle="V-Times est née de la passion pour la musique vinyle et l'artisanat. Chaque horloge 
                        que nous créons est une pièce unique, fabriquée à partir de vinyles authentiques 
                        soigneusement sélectionnés."
            />

            <Card
                image={bgVtimes}
                title="Notre Mission"
                subtitle="Donner une seconde vie aux vinyles tout en créant des objets décoratifs uniques et 
                        fonctionnels. Nous croyons en l'économie circulaire et à la valorisation du patrimoine 
                        musical."
            />

            <Card
                image={LogoPWhite}
                title="Notre Savoir-Faire"
                subtitle="Chaque horloge est fabriquée artisanalement dans notre atelier. Nous sélectionnons 
                        des vinyles aux visuels remarquables, les transformons avec soin et y installons 
                        un mécanisme d'horloge de qualité."
            />
        </Section>

        <Section
            size='L'
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
                        Vidéo de présentation de V-Times.
                    </video>
                </div>
            </div>
        </Section>

        </div>
           
    )
}

export default About
