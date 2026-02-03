import MiniCard from "../components/MiniCard"
import Card from "../components/cards"
import bgVtimes from '../img/bg-vtimes.png';
import LogoPWhite from '../img/logo-p-white.svg';
import LogoPBlack from '../img/logo-p-black.svg';
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
                <p className="about-video-text">
                Lasciviam incondita sunt errores vieturo ac alia magnificus nati laeditur hic ut hic licentia perfecta indulta ut sunt sed errores sunt incondita ubi ante reputantium enim lasciviam licentia ante patriam ubi levitate coetuum perfecta errores patriam ante splendor alia gloriosam coetuum enim convenit paucorum levitate paucorum lasciviam convenit reputantium ac.
                </p>
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
