# Gestion des Pages et du Routage en React

En React, la navigation entre les "pages" est gérée par une bibliothèque appelée `react-router-dom`. Contrairement à un site web traditionnel, le navigateur ne recharge pas la page entière à chaque clic.

## 1. Structure Recommandée
```
src/
  components/  # Petits morceaux réutilisables (Navbar, Boutons...)
  pages/       # Composants représentant une page entière (Home, About...)
  App.jsx      # Configuration des routes
```

## 2. Créer une Nouvelle Page
1. Créez un fichier dans `src/pages/`, par exemple `Contact.jsx`.
2. Créez un composant React simple :
   ```jsx
   function Contact() {
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold">Contactez-nous</h1>
         <p>Formulaire de contact...</p>
       </div>
     )
   }
   export default Contact
   ```

## 3. Ajouter la Route
1. Ouvrez `src/App.jsx`.
2. Importez votre nouvelle page :
   ```jsx
   import Contact from './pages/Contact'
   ```
3. Ajoutez une balise `<Route>` dans `<Routes>` :
   ```jsx
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} /> {/* Nouvelle route */}
    </Routes>
   ```

## 4. Ajouter un Lien dans le Menu
1. Ouvrez `src/components/navbar.jsx`.
2. Utilisez le composant `<Link>` (et non `<a>`) pour pointer vers la nouvelle route :
   ```jsx
   <Link to="/contact" className="...">Contact</Link>
   ```
