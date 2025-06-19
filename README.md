# Taawoniyate

Application de vente de produits naturels (multi-vendeurs)

---

## Présentation

**Taawoniyate** est une plateforme web et mobile permettant la vente et l'achat de produits naturels, mettant en relation plusieurs vendeurs et clients. Le projet comprend :
- Un backend RESTful sécurisé (Spring Boot, Java)
- Un frontend mobile (Expo/React Native)
- Une base de données PostgreSQL

## Fonctionnalités principales
- Authentification JWT (clients, vendeurs, admins)
- Gestion des utilisateurs (inscription, connexion, profil)
- Catalogue de produits (recherche, catégories, images)
- Gestion du panier d'achat
- Gestion des vendeurs et des boutiques
- API documentée (Swagger)

## Architecture du projet

```
/ (racine)
├── backend (Java Spring Boot)
│   ├── src/main/java/esi/ma/taawoniyate
│   ├── src/main/resources
│   └── ...
├── frontend/taawoniyat (Expo/React Native)
│   ├── app
│   ├── components, screens, services, etc.
│   └── ...
└── docs, scripts, etc.
```

## Installation et démarrage

### Backend (Spring Boot)
1. **Prérequis** : Java 17+, Maven, PostgreSQL
2. **Configurer la base de données** :
   - Les paramètres sont dans `src/main/resources/application.properties`
3. **Lancer l'application** :
   ```bash
   mvn spring-boot:run
   ```
   L'API sera disponible sur `http://localhost:8080/api/v1`

### Frontend (Expo/React Native)
1. **Prérequis** : Node.js, npm, Expo CLI
2. **Installation** :
   ```bash
   cd frontend/taawoniyat
   npm install
   ```
3. **Démarrage** :
   ```bash
   npx expo start
   ```
   Suivez les instructions pour lancer sur un émulateur ou appareil.

## Documentation de l'API
- L'API est documentée via Swagger :
  - Accès : `http://localhost:8080/swagger-ui.html`
- Authentification par JWT (header `Authorization: Bearer <token>`)
- Voir le fichier `API_DOCUMENTATION.md` pour le détail des endpoints (inscription, connexion, produits, panier, etc.)

## Technologies principales
- **Backend** : Java 17, Spring Boot, Spring Security, JPA, PostgreSQL, Cloudinary, JWT, Swagger
- **Frontend** : React Native, Expo, React Navigation, Axios

## Scripts utiles
- Backend :
  - `mvn spring-boot:run` (démarrage)
- Frontend :
  - `npm start` ou `npx expo start` (démarrage)
  - `npm run reset-project` (réinitialiser le projet Expo)

## Contribution
- Forkez le repo, créez une branche, proposez vos modifications via Pull Request.
- Merci de consulter la documentation et de respecter la structure du projet.

## Ressources complémentaires
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) : détails des endpoints
- [HELP.md](./HELP.md) : ressources Spring Boot/Maven
- `frontend/taawoniyat/README.md` : guide Expo/React Native

---

© 2024 Taawoniyate. Tous droits réservés.
