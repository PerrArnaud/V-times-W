import Section from '../components/Section';
import MiniCard from '../components/MiniCard';
import bgVtimes from '../img/bg-vtimes.png';
import './Home.css'; // On garde le CSS global pour l'app layout

function Products() {

    return (
        <div className="home"> {/* On garde la classe home ou on en crée une products-page */}
            <Section
                title="Notre Collection"
                size="L"
            >
                <MiniCard
                    image={bgVtimes}
                    title="Vinyle Noir"
                    onClick={() => console.log('Produit 1')}
                />
                <MiniCard
                    image={bgVtimes}
                    title="Vinyle Rouge"
                />
                <MiniCard
                    image={bgVtimes}
                    title="Édition Limitée"
                />
            </Section>

            <Section
                title="Personnalisez votre horloge !"
                size="L"
            />

        <Section // Soulignage à enlever sous cette section
                title="Nos produits vous intéressent ?"
                size="L"
            />
        </div>
    )
}

export default Products;
