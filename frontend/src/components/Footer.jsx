import React from 'react';
import './Footer.css';
import logo from '../img/Logo-P-White.svg';
import { Link } from 'react-router-dom';


const footerColumns = [
    {
        title: 'Catégorie',
        items: ['Sous-catégorie', 'Sous-catégorie', 'Sous-catégorie']
    },
    {
        title: 'Catégorie',
        items: ['Sous-catégorie', 'Sous-catégorie', 'Sous-catégorie']
    },
    {
        title: 'Catégorie',
        items: ['Sous-catégorie', 'Sous-catégorie', 'Sous-catégorie']
    }
];

const Footer = () => {
    return (
        <footer className="site-footer">

            <div className="footer-bottom">
                <div className="footer-bottom-inner">
                    <div className="footer-brand">
                        <div className="footer-logo-wrap">
                            <img src={logo} alt="V-Times" className="footer-logo" />
                        </div>
                        <span className="footer-brand-text">Made by Campus Beaupuyrat</span>
                    </div>

                    <div className="footer-info">
                        <div className="footer-info-block">
                            <span className="footer-info-title">Adresse</span>
                            <span className="footer-info-text">9 ter Rue Pétinaud Beaupuyrat, 87000 Limoges</span>
                        </div>
                    </div>
                    <div className='footer-info-2'>
                        <ul className="legal-footer-links">
                            <li><Link to="/legal">Mentions légales</Link></li>
                        </ul>
                    </div>
                </div>
                <div id="footer-bottom-bar-slot" className="footer-bottom-bar-slot" />
            </div>
        </footer>
    );
};

export default Footer;
