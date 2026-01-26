import { Link } from 'react-router-dom';
import './navbar.css';
import LogoPBlack from '../img/Logo-P-Black.svg';

const Navbar = () => {
    return (
        <nav className="navbar">

            {/* Desktop Navigation */}
            <div className="nav-container">
                <ul className="nav-links nav-links-left">
                    <li><Link to="/">Accueil</Link></li>
                    <li><Link to="/products">Produits</Link></li>
                    <li><Link to="/about">À propos</Link></li>
                </ul>

                <Link to="/" className="brand">
                    <div className="logo-canvas">
                        <img src={LogoPBlack} alt="V-Times" className="logo-img" />
                    </div>
                </Link>

                <div className="nav-right">
                    <ul className="nav-links nav-links-right">
                        <li><Link to="/commitments">Engagements</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                    <Link to="/presales" className="nav-cta">Pré-ventes</Link>
                </div>
            </div>
            {/* Bottom Navigation handled by separate component */}
        </nav>
    );
};

export default Navbar;
