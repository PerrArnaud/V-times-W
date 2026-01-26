import Section from '../components/Section';
import './Home.css'

function Home() {

    return (
        <div className="home">
            <Section
                title="Bienvenue chez V-Times"
                description="Découvrez notre collection exclusive d'horloge"
                buttonText="Voir les produits"
                buttonLink="/products"
            />
            <Section
                title="Nos services"
                description="Découvrez notre collection exclusive de montres"
                buttonText="Voir les produits"
                buttonLink="/services"
            />
        </div>
    )
}

export default Home
