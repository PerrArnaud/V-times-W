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
