# ⚽ Comparateur de Cotes en Temps Réel

Application web de comparaison de cotes de paris sportifs en temps réel pour les matchs de football.

## 📋 Fonctionnalités

- **8 Championnats** : Bundesliga, La Liga, Premier League, Ligue 1, Ligue 2, Serie A, Süper Lig, Eredivisie
- **3 Bookmakers** : Winner.bet, 1xBet, BetWinner
- **Cotes en temps réel** : Mise à jour automatique toutes les 8-40 secondes
- **Variations drastiques** : 5% de chance de changements spectaculaires des cotes
- **Verrouillage des paris** : 0.5% de chance qu'une cote soit suspendue
- **Interface moderne** : Design responsive avec animations fluides
- **Select personnalisée** : Navigation par championnat avec logos

## 🚀 Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Backend** : Node.js
- **Base de données** : Firebase Firestore
- **API** : The Odds API
- **Déploiement** : Firebase Hosting

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/comparateur-cotes-football.git

# Naviguer dans le dossier
cd comparateur-cotes-football

# Installer les dépendances
npm install
```

## ⚙️ Configuration

### 1. Firebase
- Créer un projet Firebase
- Activer Firestore
- Télécharger la clé de service admin
- Renommer en `kolisa-likabo-firebase-adminsdk-fbsvc-XXXXXXXXXX.json`

### 2. The Odds API
- S'inscrire sur [The Odds API](https://the-odds-api.com/)
- Obtenir une clé API
- Mettre à jour la clé dans les scripts

### 3. Règles Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🎮 Utilisation

### Récupérer les matchs du jour
```bash
node fetch_matches.js
```

### Lancer le site en local
Ouvrez simplement `index.html` dans votre navigateur.

## 📁 Structure du Projet

```
.
├── index.html              # Page principale
├── app.js                  # Logique de l'application
├── styles.css              # Styles CSS
├── fetch_matches.js        # Script de récupération des matchs
├── update_firestore.js     # Script alternatif (API REST)
├── package.json            # Dépendances Node.js
└── assets/                 # Images et logos
    ├── Bundesliga.jpg
    ├── la liga.png
    ├── Premier League.png
    ├── ligue 1.jpg
    ├── ligue 2.png
    ├── serie a.png
    ├── Süper Lig.png
    ├── eredeviste.png
    ├── winner.bet.jpg
    ├── 1xbet.png
    └── betwinner.png
```

## 🎨 Fonctionnalités Clés

### Mise à jour des cotes
- **Variation normale** : ±0.15 (95% du temps)
- **Variation drastique** : ±0.8 (5% du temps)
- **Verrouillage** : Cadenas SVG professionnel (0.5% du temps)

### Interface utilisateur
- **Spinner de chargement** : Animation CSS moderne
- **Select personnalisée** : Avec logos des championnats
- **Animations fluides** : Transitions sur changements de cotes

## 📝 License

Ce projet est un projet étudiant à but éducatif.

## 👨‍💻 Auteur

Projet développé dans le cadre d'études universitaires.

## 🙏 Remerciements

- [The Odds API](https://the-odds-api.com/) pour les données en temps réel
- [Firebase](https://firebase.google.com/) pour l'infrastructure
