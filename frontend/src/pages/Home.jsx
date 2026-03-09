import Header from '../components/Header';
import Section from '../components/Section';
import './Home.css'
import bgVtimes from '../img/bg-vtimes.png';
import bgVtimesVideo from '../img/bg-vtimes.mp4';
import photoGroupe from '../img/photo-groupe2.jpeg';
import Card from '../components/cards';
import IconCard from '../components/IconCard';
import recycle from '../img/recycle.svg';
import Pole_Production from '../img/Pole_Production3.jpeg';
import Pole_Coordination from '../img/Pole_Communication3.jpeg';
import Pole_Communication from '../img/Pole_Communication2.jpeg';
import LogoPWhite from '../img/Logo-P-White.svg';
import PhotoVinyle from '../img/photo_vinyle3.jpeg';

function Home() {

    return (
        <div className="home">
            <Header
                title="Bienvenue chez V-Time's"
                subtitle="V-Time's une seconde vie au temps"
                description="Découvrez notre collection exclusive d'horloges"
                image={bgVtimes}
                video={bgVtimesVideo}
                sliderImage={photoGroupe}
                slideInterval={4000}
                loop={true}
                buttonText="Voir les produits"
                buttonLink="/products"
            />
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
                size='M'> 
                <div className="backstage-text">
                    <img src={LogoPWhite} alt="V-Time's" className="logo-img" />
                    <p>C’est au sein du Campus Beaupeyrat que le projet V-Time’s a vu le jour, porté par la collaboration des étudiants de première année en BTS MCO, SIO et Comptabilité. Réunis autour d’un objectif commun, ils mettent en œuvre leurs compétences complémentaires pour concevoir, développer et valoriser une véritable mini-entreprise, de l’idée initiale jusqu’à sa concrétisation.</p>
                    <p>Encadré par une échéance fixée, ce projet s’inscrit dans une démarche professionnalisante, aboutissant à une présentation devant un jury lors d’un concours. Chaque étape permet d’appliquer concrètement les enseignements théoriques. V-Time’s devient ainsi bien plus qu’un projet scolaire : une expérience immersive qui prépare les étudiants aux réalités du monde professionnel.</p>
                </div>
            </Section>
            <Section
                size="L"
                context="services"
                title="Un savoir-faire unique"
                description="Chez V-Time’s, notre savoir-faire repose sur la revalorisation de vinyles abîmés en objets décoratifs uniques et personnalisés.
Nous transformons des disques inutilisables en créations originales telles que des décorations murales et des cadeaux sur mesure, en privilégiant une approche artisanale et responsable.
V-Time’s associe ainsi écologie et créativité pour donner une seconde vie à la musique du passé."
                image={PhotoVinyle}
            />
            {/* <Section
                    size="S"
                    title="Recyclons ensemble" /><Section
                        size="M-alt"
                        context="engagement"
                    >
                        <IconCard
                            icon={recycle}
                            title="Recyclage"
                            subtitle="Découvrez notre collection exclusive d'horloges" />
                        <IconCard
                            icon={recycle}
                            title="Horloges"
                            subtitle="Découvrez notre collection exclusive d'horloges" />

                    </Section> */}
        </div>
    )
}

export default Home
