# PsyConnect - Plateforme de Psychologie

Backend complet avec authentification basée sur les rôles pour la plateforme PsyConnect.

## 🎯 Fonctionnalités

### Rôles Utilisateurs
- **Patient** : Peut s'inscrire et se connecter via le formulaire public
- **Médecin** : Peut uniquement se connecter (comptes créés par l'admin)
- **Admin** : Gère la plateforme, crée des comptes médecins, consulte les statistiques

### Authentification
- Inscription des patients avec validation
- Connexion universelle pour tous les rôles
- JWT (JSON Web Tokens) pour la gestion des sessions
- Hachage des mots de passe avec bcrypt

### Tableau de Bord Admin
- Statistiques de la plateforme (patients, médecins, inscriptions récentes)
- Création de comptes médecins
- Liste et suppression des médecins
- Interface moderne et responsive

## 🚀 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)

### Étapes d'installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
Le fichier `.env` est déjà créé avec les valeurs par défaut :
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/psyconnect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV=development
```

⚠️ **IMPORTANT** : Changez `JWT_SECRET` en production !

3. **Démarrer MongoDB**
```bash
# Si MongoDB est installé localement
mongod
```

Ou utilisez MongoDB Atlas et mettez à jour `MONGODB_URI` dans `.env`

4. **Créer le compte administrateur**
```bash
npm run seed-admin
```

Credentials par défaut :
- **Email** : admin@psyconnect.com
- **Mot de passe** : Admin@123456

⚠️ Changez ce mot de passe après la première connexion !

5. **Démarrer le serveur**
```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

## 📁 Structure du Projet

```
psyconnect 2/
├── controllers/
│   ├── authController.js      # Gestion authentification
│   └── adminController.js     # Gestion admin
├── middleware/
│   └── auth.js                # Middleware JWT et rôles
├── models/
│   └── User.js                # Modèle utilisateur
├── routes/
│   ├── auth.js                # Routes authentification
│   └── admin.js               # Routes admin
├── scripts/
│   └── seedAdmin.js           # Script création admin
├── public/
│   ├── index.html             # Page d'accueil
│   ├── login.html             # Page de connexion
│   ├── register.html          # Page d'inscription
│   └── admin-dashboard.html   # Tableau de bord admin
├── server.js                  # Point d'entrée serveur
├── package.json
└── .env                       # Variables d'environnement
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription patient
- `POST /api/auth/login` - Connexion (tous rôles)

### Admin (requiert token JWT + rôle admin)
- `POST /api/admin/create-doctor` - Créer un compte médecin
- `GET /api/admin/dashboard` - Statistiques de la plateforme
- `GET /api/admin/doctors` - Liste des médecins
- `DELETE /api/admin/doctors/:id` - Supprimer un médecin

### Health Check
- `GET /api/health` - Vérifier l'état du serveur

## 🧪 Test du Système

### 1. Tester l'inscription patient
1. Ouvrir `http://localhost:5000/register.html`
2. Remplir le formulaire
3. Vérifier la redirection vers login

### 2. Tester la connexion admin
1. Ouvrir `http://localhost:5000/login.html`
2. Email : `admin@psyconnect.com`
3. Mot de passe : `Admin@123456`
4. Vérifier la redirection vers le dashboard admin

### 3. Créer un médecin
1. Dans le dashboard admin, aller à "Ajouter un médecin"
2. Remplir le formulaire
3. Le médecin peut maintenant se connecter

### 4. Tester la connexion médecin
1. Se déconnecter
2. Se connecter avec les credentials du médecin
3. Vérifier le message de bienvenue

## 🔒 Sécurité

- Mots de passe hachés avec bcrypt (10 rounds)
- JWT avec expiration de 7 jours
- Validation des données côté serveur
- Protection des routes avec middleware d'authentification
- Vérification des rôles pour les endpoints admin

## 📝 Scripts NPM

```bash
npm start          # Démarrer le serveur
npm run dev        # Démarrer avec nodemon (auto-reload)
npm run seed-admin # Créer le compte admin
```

## 🛠️ Technologies Utilisées

- **Backend** : Node.js, Express.js
- **Base de données** : MongoDB, Mongoose
- **Authentification** : JWT, bcryptjs
- **Frontend** : HTML, CSS, JavaScript vanilla
- **Autres** : dotenv, cors

## 📌 Notes Importantes

1. **Seuls les patients peuvent s'inscrire** via le formulaire public
2. **Les médecins** sont créés uniquement par l'admin
3. **L'admin** est créé via le script seed
4. Tous les mots de passe doivent avoir au moins 8 caractères
5. Les tokens JWT sont stockés dans localStorage

## 🚧 Développements Futurs

- [ ] Tableau de bord médecin
- [ ] Tableau de bord patient
- [ ] Système de rendez-vous
- [ ] Messagerie interne
- [ ] Gestion des profils
- [ ] Réinitialisation de mot de passe

## 📧 Support

Pour toute question ou problème, contactez l'équipe de développement.

---

**PsyConnect** - Votre bien-être mental, notre priorité 💜
