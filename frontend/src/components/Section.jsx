import { Link } from 'react-router-dom';
import './Section.css';

const PAGES = {
    home: { path: '/', buttonText: 'Accueil' },
    products: { path: '/products', buttonText: 'Voir les produits' },
    about: { path: '/about', buttonText: 'À propos' },
    contact: { path: '/contact', buttonText: 'Nous contacter' },
    commitments: { path: '/commitments', buttonText: 'Nos engagements' },
};

function Section({
    title,
    subtitle,
    description,
    buttonText,
    buttonLink,
    size = 'M',
    context,
    showButton = true,
    image,
    bgImage,
    children
}) {
    const page = context ? PAGES[context] : null;
    const finalButtonLink = buttonLink || page?.path;
    const finalButtonText = buttonText || page?.buttonText;
    const sizeClass = size.toLowerCase();

    const bgStyle = bgImage ? { backgroundImage: `url(${bgImage})` } : {};
    const bgClass = bgImage ? 'section-bg' : '';

    // Section S - Minimaliste avec titre serif
    if (sizeClass === 's') {
        return (
            <section className={`section section-s ${bgClass}`} style={bgStyle}>
                {bgImage && <div className="section-overlay" />}
                <h1 className="section-title">{title}</h1>
            </section>
        )
    }

    // Section M avec image - Grid layout
    if (sizeClass === 'm' && image) {
        return (
            <section className={`section section-m section-m-grid ${bgClass}`} style={bgStyle}>
                {bgImage && <div className="section-overlay" />}
                <div className="section-image">
                    <img src={image} alt={title} />
                </div>
                <div className="section-content">
                    {subtitle && <span className="section-subtitle">{subtitle}</span>}
                    <h1 className="section-title">{title}</h1>
                    <p className="section-description">{description}</p>
                    {showButton && finalButtonText && finalButtonLink && (
                        <Link to={finalButtonLink} className="section-button">
                            {finalButtonText}
                        </Link>
                    )}
                </div>
            </section>
        )
    }

    // Section M Alt - Variante spécifique
    if (sizeClass === 'm-alt') {
        return (
            <section className={`section section-m-alt ${bgClass}`} style={bgStyle}>
                {bgImage && <div className="section-overlay" />}
                <div className="section-content-alt">
                    {subtitle && <span className="section-subtitle">{subtitle}</span>}
                    <p className="section-description">{description}</p>
                    {children && <div className="section-children">{children}</div>}
                    {showButton && finalButtonText && finalButtonLink && (
                        <Link to={finalButtonLink} className="section-button">
                            {finalButtonText}
                        </Link>
                    )}
                </div>
            </section>
        )
    }

    // Section par défaut (L, M sans image)
    return (
        <section className={`section section-${sizeClass} ${bgClass}`} style={bgStyle}>
            {bgImage && <div className="section-overlay" />}
            {subtitle && <span className="section-subtitle">{subtitle}</span>}
            <h1 className="section-title">{title}</h1>
            <p className="section-description">{description}</p>
            {showButton && finalButtonText && finalButtonLink && (
                <Link to={finalButtonLink} className="section-button">
                    {finalButtonText}
                </Link>
            )}
            {children && <div className="section-children">{children}</div>}
        </section>
    )
}

export default Section;
export { PAGES };
