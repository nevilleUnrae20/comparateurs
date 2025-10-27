# 🚀 Script de Récupération des Matchs

Ce script récupère automatiquement les matchs du jour depuis l'API The Odds pour les compétitions importantes.

## 📋 Prérequis

1. **Node.js** installé sur votre système
2. **Connexion Internet** pour accéder à l'API
3. **Clé API The Odds** (déjà configurée)

## 🔧 Installation

1. Ouvrir un terminal dans le dossier du projet
2. Installer les dépendances :
```bash
npm install
```

## 🚀 Utilisation

### Méthode 1 : Avec npm
```bash
npm run fetch
```

### Méthode 2 : Directement avec Node
```bash
node fetch_matches.js
```

## 📊 Ce que fait le script

### 🎯 Compétitions surveillées
- 🇩🇪 **Bundesliga** (Allemagne)
- 🇪🇸 **La Liga** (Espagne)  
- 🏴󠁧󠁢󠁥󠁮󠁧󠁿 **Premier League** (Angleterre)
- 🇫🇷 **Ligue 1** (France)
- 🇮🇹 **Serie A** (Italie)
- 🇹🇷 **Süper Lig** (Turquie)

### 📈 Fonctionnalités
- ✅ **Logs détaillés** avec couleurs et timestamps
- ✅ **Gestion d'erreurs** robuste
- ✅ **Statistiques** des appels API
- ✅ **Sauvegarde** des données en JSON
- ✅ **Tri** des matchs par heure
- ✅ **Limitation** à 20 matchs maximum

### 📁 Fichiers générés
- `matches_data.json` : Données complètes des matchs récupérés

## 📝 Exemple de sortie

```
============================================================
           RÉCUPÉRATION DES MATCHS DU JOUR
============================================================
[13:05:39] INFO: 🚀 Démarrage du script de récupération des matchs
[13:05:39] INFO: 📅 Date du jour: 2025-09-21

============================================================
              APPELS API PAR COMPÉTITION
============================================================
[13:05:39] INFO: 📡 [1/6] Appel API pour Bundesliga...
[13:05:39] INFO: 🔗 URL: https://api.the-odds-api.com/v4/sports/soccer_germany_bundesliga/odds/...
[13:05:40] INFO: ⏱️ Temps de réponse: 1250ms
[13:05:40] INFO: 📊 Status HTTP: 200 OK
[13:05:40] SUCCESS: ✅ Réponse reçue: 3 matchs trouvés
[13:05:40] INFO: ⚽ Match ajouté: Bayern Munich vs Borussia Dortmund à 15:30
...
```

## 🛠️ Configuration

### Modifier les compétitions
Éditez le tableau `competitions` dans `fetch_matches.js`

### Changer la clé API
Modifiez la variable `ODDS_API_KEY` dans le script

### Ajuster les filtres
- Modifier les paramètres de l'URL d'API
- Changer la limite de matchs (actuellement 20)

## 🔍 Dépannage

### Erreur "fetch is not defined"
- Vérifiez que Node.js est installé
- Installez les dépendances avec `npm install`

### Erreur 401 (Unauthorized)
- Vérifiez votre clé API The Odds
- Assurez-vous qu'elle n'a pas expiré

### Erreur 429 (Too Many Requests)
- Vous avez dépassé la limite de l'API
- Attendez avant de relancer le script

### Aucun match trouvé
- Normal si aucun match n'est programmé aujourd'hui
- Vérifiez la date et les compétitions

## 📞 Support

En cas de problème, vérifiez :
1. La connexion Internet
2. La validité de la clé API
3. Les logs détaillés du script
