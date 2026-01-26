import Header from '../components/Header';
import Section from '../components/Section';
import './Home.css'
import bgVtimes from '../img/bg-vtimes.png';
import bgVtimes2 from '../img/bg-vtimes.mp4';
import Card from '../components/cards';
import IconCard from '../components/IconCard';
import recycle from '../img/recycle.svg';

function Home() {

    return (
        <div className="home">
            <Header
                title="Bienvenue chez V-Times"
                subtitle="Collection Exclusive"
                description="Découvrez notre collection exclusive d'horloges"
                image={bgVtimes}
                video={bgVtimes2}
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
                    image={bgVtimes}
                    title="Horloges"
                    subtitle="Découvrez notre collection exclusive d'horloges"
                />
                <Card
                    image={bgVtimes}
                    title="Horloges"
                    subtitle="Découvrez notre collection exclusive d'horloges"
                />
                <Card
                    image={bgVtimes}
                    title="Horloges"
                    subtitle="Découvrez notre collection exclusive d'horloges"
                />
            </Section>
            <Section
                size="M"
                context="products"
                subtitle="Nos services"
                title="Un savoir-faire unique"
                description="Jelly cake soufflé macaroon sweet oat cake halvah. Cake danish chocolate jelly-o lollipop pastry pie I love. Sesame snaps cake candy biscuit halvah powder lemon drops.
I love sesame snaps I love biscuit jelly-o tart caramels. Cookie cake gummies cake jelly biscuit. Pie gingerbread croissant croissant marshmallow I love caramels dessert. Topping candy canes icing I love dessert apple pie cupcake candy apple pie.
Chupa chups tiramisu marshmallow candy canes dessert candy I love biscuit. Shortbread carrot cake I love brownie marzipan. Halvah cake jelly-o toffee caramels."
                image={bgVtimes}
            />
            <Section
                size="S"
                title="Recyclons ensemble"
            />
            <Section
                size="M-alt"
                context="engagement"
            >
                <IconCard
                    icon={recycle}
                    title="Recyclage"
                    subtitle="Découvrez notre collection exclusive d'horloges"
                />
                <IconCard
                    icon={recycle}
                    title="Horloges"
                    subtitle="Découvrez notre collection exclusive d'horloges"
                />

            </Section>
        </div>
    )
}

export default Home
