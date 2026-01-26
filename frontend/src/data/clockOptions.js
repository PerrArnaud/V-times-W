export const sharedColors = [
    { name: 'Noir & Blanc', hex: '#2C2C2C' },
    { name: 'Sable', hex: '#E6BE8A' },
    { name: 'Océan', hex: '#2B65EC' },
    { name: 'Mystic Purple', hex: '#8A2BE2' },
    { name: 'Deep Space', hex: '#191970' },

];

export const formatOptions = ['Numérique', 'Alphanumérique', 'Romain', 'Abstrait', 'Binaire', 'Hexadécimal', '24 Heures', 'Mots', 'Planétaire'];
export const needleOptions = ['Bâton', 'Flèche', 'Goutte', 'Fil', 'Seringue', 'Breguet', 'Glaive', 'Dauphine', 'Crayon'];
export const dialOptions = ['Minimaliste', 'Complet', 'Chiffres', 'Points', 'Squelette', 'Astronomie', 'Aviateur', 'Dégradé', 'Art Déco'];
export const patternOptions = ['Uni', 'Dégradé Linéaire', 'Dégradé Radial', 'Marbre', 'Bois', 'Métal Brossé', 'Carbone'];
export const numberSizeOptions = ['Très Petit', 'Petit', 'Moyen', 'Grand', 'Très Grand'];

// Backward compatibility
export const colorOptions = sharedColors;

export const clockTabsData = [
    {
        id: 'Base',
        libelle: 'Base',
        content: [
            { type: 'colorSelector', label: 'Couleur Primaire', options: sharedColors },
            { type: 'colorSelector', label: 'Couleur Secondaire', options: sharedColors },
            { type: 'selector', label: 'Motif', options: patternOptions }
        ]
    },
    {
        id: 'Chiffre',
        libelle: 'Chiffre',
        content: [
            { type: 'selector', label: 'Format', options: formatOptions },
            { type: 'selector', label: 'Taille', options: numberSizeOptions },
            { type: 'selector', label: 'Couleur', options: sharedColors } // Using selector for color as requested, but populated with sharedColors (might need ColorSelector if desired, technically spec said selector)
        ]
    },
    {
        id: 'Aiguilles',
        libelle: 'Aiguilles',
        content: [
            { type: 'selector', label: 'Style', options: needleOptions },
            { type: 'colorSelector', label: 'Heure', options: sharedColors },
            { type: 'colorSelector', label: 'Minute', options: sharedColors },
            { type: 'colorSelector', label: 'Seconde', options: sharedColors }
        ]
    }
];
