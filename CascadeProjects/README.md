# 🏆 FootCotes - Comparateur de Cotes Football

Un site web moderne pour comparer les cotes de football en temps réel avec Firebase comme base de données.

## 📋 Fonctionnalités

- **5 Championnats** : Ligue 1, Premier League, La Liga, Bundesliga, Serie A
- **5 Matchs** : Un match par championnat avec des équipes réelles
- **3 Bookmakers** : Bet365, Betway, 1xBet
- **Cotes en temps réel** : Mise à jour automatique toutes les 4 secondes
- **Interface moderne** : Design inspiré des sites de paris sportifs
- **Base de données Firebase** : Stockage et synchronisation des données

## 🚀 Installation et Utilisation

### Prérequis
- Un navigateur web moderne
- Connexion internet (pour Firebase)

### Lancement
1. Ouvrez le fichier `index.html` dans votre navigateur
2. L'application se connecte automatiquement à Firebase
3. La base de données est automatiquement nettoyée et réinitialisée à chaque lancement

### Utilisation
1. **Sélectionnez un championnat** dans la barre latérale gauche
2. **Choisissez un match** dans la liste des matchs disponibles
3. **Consultez les cotes** qui s'affichent pour les 3 bookmakers
4. **Observez les mises à jour** automatiques toutes les 4 secondes

## 🎯 Types de Cotes Disponibles

### 1X2 (Résultat du match)
- **1** : Victoire équipe domicile
- **X** : Match nul
- **2** : Victoire équipe extérieure

### Plus/Moins 2.5 buts
- **Plus 2.5** : Plus de 2.5 buts dans le match
- **Moins 2.5** : Moins de 2.5 buts dans le match

### Les deux équipes marquent
- **Oui** : Les deux équipes marquent
- **Non** : Au moins une équipe ne marque pas

## 🏟️ Matchs Disponibles

1. **Ligue 1** : Paris Saint-Germain vs Olympique de Marseille
2. **Premier League** : Manchester United vs Liverpool
3. **La Liga** : Real Madrid vs FC Barcelona
4. **Bundesliga** : Bayern Munich vs Borussia Dortmund
5. **Serie A** : Juventus vs AC Milan

## 🔧 Configuration Firebase

Le projet utilise la configuration Firebase suivante :
- **Project ID** : kolisa-likabo
- **Collections** : `matches` et `odds`
- **Suppression automatique** : La base est nettoyée à chaque lancement

## 📱 Responsive Design

L'interface s'adapte automatiquement aux différentes tailles d'écran :
- **Desktop** : Vue complète avec sidebar
- **Tablet** : Sidebar réduite
- **Mobile** : Vue empilée

## 🎨 Animations

- **Cotes en hausse** : Animation verte
- **Cotes en baisse** : Animation rouge
- **Indicateur live** : Pulsation rouge
- **Hover effects** : Sur tous les éléments interactifs

## 📊 Structure des Données

### Collection `matches`
```javascript
{
  competition: "ligue1",
  homeTeam: "Paris Saint-Germain",
  awayTeam: "Olympique de Marseille",
  time: "20:45",
  date: "Aujourd'hui",
  timestamp: ServerTimestamp
}
```

### Collection `odds`
```javascript
{
  matchId: "match1",
  bookmaker: "Bet365",
  homeWin: "2.15",
  draw: "3.20",
  awayWin: "2.85",
  over25: "1.75",
  under25: "2.10",
  bothTeamsScore: {
    yes: "1.65",
    no: "2.25"
  },
  timestamp: ServerTimestamp
}
```

## 🔄 Mise à Jour des Cotes

- **Fréquence** : Toutes les 4 secondes
- **Génération** : Cotes aléatoires mais logiques
- **Animation** : Changements visuels selon l'évolution
- **Persistance** : Sauvegarde automatique dans Firebase

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec animations
- **JavaScript ES6** : Logique applicative
- **Firebase** : Base de données en temps réel
- **Google Fonts** : Police Inter

## 📝 Notes Importantes

- Les cotes sont **simulées** et ne proviennent pas de vrais bookmakers
- Les matchs sont **fictifs** mais utilisent de vraies équipes
- La base de données est **réinitialisée** à chaque lancement
- L'application nécessite une **connexion internet** pour Firebase

## 🎓 Projet Étudiant

Ce projet a été développé dans le cadre d'un travail étudiant pour démontrer :
- L'intégration Firebase
- La manipulation du DOM
- Les animations CSS
- Le design responsive
- La gestion des données en temps réel
