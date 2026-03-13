# PsyConnect - Plateforme de Psychologie (V2.1)

PsyConnect est une plateforme de consultation psychologique moderne et sécurisée, offrant des outils de communication en temps réel et une gestion fluide des patients et des médecins.

## 🌟 Nouvelles Fonctionnalités (V2.1)

### 📞 Téléconsultation Avancée (WebRTC)
- **Appels Vidéo** : Sessions vidéo haute définition pour des consultations immersives.
- **Appels Audio** : Nouvelle fonctionnalité d'appel audio seul pour une communication simplifiée.
- **Partage d'Écran** : Permet aux médecins de partager des documents ou des présentations.

### 🌍 Internationalisation (i18n)
- **Support Multilingue** : Interface disponible en **Français**, **Anglais** et **Arabe**.
- **Support RTL** : Mise en page adaptée dynamiquement pour l'arabe (Right-to-Left).
- **Persistance** : Le choix de la langue est mémorisé sur l'appareil de l'utilisateur.

### 🛡️ Sécurité Renforcée
- **Helmet.js** : Protection contre les vulnérabilités web courantes (XSS, Clickjacking).
- **Rate Limiting** : Protection contre les attaques par force brute et les abus d'API.
- **Sanitisation NoSQL** : Protection contre les injections MongoDB via `mongo-sanitize`.
- **JWT & Bcrypt** : Authentification sécurisée et stockage robuste des mots de passe.

### 🎨 Design Premium
- **Interface Chat** : Boutons d'action redessinés avec un effet **Glassmorphism**, des dégradés vibrants et des animations fluides.
- **Responsive Design** : Layout optimisé pour mobile avec une navigation intelligente.

---

## 📱 Application Mobile (APK)

Le projet inclut une application mobile native développée avec **React Native** et **Expo**.

- **Emplacement** : Le code source se trouve dans le répertoire `/mobile-app`.
- **Installation** :
  ```bash
  cd mobile-app
  npm install
  npx expo start
  ```
- **APK** : L'application peut être compilée en APK pour Android via `eas build -p android --profile preview`.

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js (v14+)
- MongoDB (local ou Atlas)

---

**PsyConnect** - Votre bien-être mental, notre priorité 💜

---
*Made with ❤️ by **Yassine Kadri***
