export const sharedColors = [
    { name: 'Noir & Blanc', hex: '#1F1F1F' },
    { name: 'Sable', hex: '#F2C27A' },
    { name: 'Océan', hex: '#1E88FF' },
    { name: 'Forêt', hex: '#2ECC71' },
    { name: 'Mystic Purple', hex: '#9B51E0' },
    // { name: 'Deep Space', hex: '#2F2FA2' },
    { name: 'Corail', hex: '#FF6B6B' },
    // { name: 'Soleil', hex: '#FFD166' },
    // { name: 'Lagune', hex: '#00B4D8' }
];

export const formatOptions = ['Alphanumérique', 'Romain', 'Abstrait'];
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
            // { type: 'selector', label: 'Motif', options: patternOptions }
        ]
    },
    {
        id: 'Chiffre',
        libelle: 'Chiffre',
        content: [
            { type: 'selector', label: 'Format', options: formatOptions },
            // { type: 'selector', label: 'Taille', options: numberSizeOptions },
            { type: 'colorSelector', label: 'Couleur', options: sharedColors } // Using selector for color as requested, but populated with sharedColors (might need ColorSelector if desired, technically spec said selector)
        ]
    },
    {
        id: 'Aiguilles',
        libelle: 'Aiguilles',
        content: [
            { type: 'selector', label: 'Style', options: needleOptions },
            { type: 'colorSelector', label: 'Heure et Minute', options: sharedColors },
            // { type: 'colorSelector', label: 'Minute', options: sharedColors },
            // { type: 'colorSelector', label: 'Seconde', options: sharedColors }
        ]
    }
];
