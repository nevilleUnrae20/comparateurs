# 📋 Changelog - Comparateur de Cotes

## Version 2.0 - 23 Octobre 2025

### ✨ Nouvelles Fonctionnalités

#### 🎯 **Vraies Cotes de l'API**
- Récupération des **vraies cotes** depuis The Odds API
- Stockage des cotes initiales pour référence
- Fallback intelligent vers des cotes générées si indisponibles

#### ⏰ **Gestion des Matchs Passés**
- **Détection automatique** des matchs déjà joués
- **Affichage grisé** pour les matchs passés
- **Badge "Terminé"** sur les matchs passés
- **Désactivation des cotes** pour les matchs terminés
- **Aucune mise à jour** des cotes pour les matchs passés

#### 🔄 **Simulation Intelligente des Cotes**
- **Intervalle réaliste** : 1-2 minutes entre chaque changement
- **Variations normales** : ±0.15 (95% du temps)
- **Variations drastiques** : ±0.8 (5% du temps)
- **Verrouillage rare** : 0.5% de chance avec cadenas SVG
- Basées sur les vraies cotes initiales

### 🎨 **Améliorations Visuelles**

#### Matchs Passés
- Opacité réduite (50%)
- Fond gris clair
- Texte grisé
- Boutons de cotes désactivés
- Curseur "not-allowed"
- Badge rouge "TERMINÉ"

### 🏆 **Nouvelles Compétitions**
- ✅ **Ligue 2** (France)
- ✅ **Eredivisie** (Pays-Bas)
- **Total** : 8 championnats

### 🔧 **Améliorations Techniques**

#### Performance
- Suppression de la limite de 20 matchs
- Récupération de **tous les matchs du jour**
- Optimisation des requêtes Firestore
- Exclusion des matchs passés des mises à jour

#### Code
- Fonction `createPastMatchOddsColumns()` pour matchs terminés
- Fonction `generateSingleOdd()` pour cotes individuelles
- Détection automatique du statut des matchs
- Stockage des cotes initiales (`initialHomeWin`, `initialAwayWin`)

### 📊 **Statistiques**
- **Compétitions** : 8
- **Bookmakers** : 3
- **Intervalle de mise à jour** : 60-120 secondes
- **Variation normale** : ±0.15
- **Variation drastique** : ±0.8 (5%)
- **Verrouillage** : 0.5%

### 🚀 **Utilisation**

```bash
# Récupérer les matchs avec vraies cotes
node update_firestore.js

# Vérifier le quota API
node check_api_quota.js
```

### 📝 **Notes Importantes**

1. **Matchs passés** : Automatiquement grisés si l'heure du match < heure actuelle
2. **Vraies cotes** : Récupérées depuis l'API puis simulées intelligemment
3. **Intervalles** : Plus longs (1-2 min) pour plus de réalisme
4. **Quota API** : 8 requêtes par exécution (1 par compétition)

---

## Version 1.0 - 21 Octobre 2025

### Fonctionnalités Initiales
- 6 championnats
- 3 bookmakers
- Cotes simulées
- Interface moderne
- Animations fluides
