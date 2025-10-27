# 🔥 Configuration Firebase pour le Script

## 📋 Étapes de Configuration

### 1. 🔑 Créer une Clé de Service Firebase

1. **Aller sur la Console Firebase** : https://console.firebase.google.com/
2. **Sélectionner votre projet** : `kolisa-likabo`
3. **Aller dans Paramètres** → **Comptes de service**
4. **Cliquer sur "Générer une nouvelle clé privée"**
5. **Télécharger le fichier JSON**
6. **Remplacer le contenu** de `firebase-service-account.json` par le contenu téléchargé

### 2. 📊 Règles de Sécurité Firestore

#### **Règles Actuelles Recommandées :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection des matchs - Lecture publique, écriture admin seulement
    match /matches/{matchId} {
      allow read: if true;
      allow write: if false; // Seul le script admin peut écrire
    }
    
    // Collection des cotes - Lecture publique, écriture admin seulement  
    match /odds/{oddId} {
      allow read: if true;
      allow write: if false; // Seul le script admin peut écrire
    }
  }
}
```

#### **Explication des Règles :**

- **`allow read: if true`** : Tout le monde peut lire les matchs et cotes
- **`allow write: if false`** : Seul le script avec les droits admin peut écrire
- **Sécurité** : Empêche les utilisateurs malveillants de modifier les données
- **Performance** : Permet aux utilisateurs de lire sans authentification

### 3. 🚀 Installation et Lancement

#### **Installation des dépendances :**
```bash
npm install
```

#### **Lancement du script :**
```bash
npm run fetch
```

### 4. 📊 Ce que fait le Script

#### **Étape 1 : Nettoyage**
- 🗑️ Supprime tous les matchs existants
- 🗑️ Supprime toutes les cotes existantes
- 📊 Affiche le nombre d'éléments supprimés

#### **Étape 2 : Récupération**
- 📡 Appelle l'API The Odds pour chaque compétition
- ⏱️ Mesure le temps de réponse
- 📋 Traite et formate les données

#### **Étape 3 : Sauvegarde**
- 💾 Sauvegarde les matchs dans Firestore
- 🎲 Génère des cotes aléatoires pour chaque bookmaker
- 📄 Crée un backup JSON local

### 5. 🔍 Vérification des Données

#### **Dans la Console Firebase :**
1. Aller dans **Firestore Database**
2. Vérifier les collections :
   - **`matches`** : Contient les matchs du jour
   - **`odds`** : Contient les cotes pour chaque match/bookmaker

#### **Structure des Documents :**

**Collection `matches` :**
```json
{
  "competition": "soccer_epl",
  "competitionName": "Premier League",
  "homeTeam": "Manchester United",
  "awayTeam": "Liverpool", 
  "time": "15:30",
  "date": "Aujourd'hui",
  "commence_time": "2025-09-21T13:30:00Z",
  "timestamp": "2025-09-21T13:05:00Z"
}
```

**Collection `odds` :**
```json
{
  "matchId": "soccer_epl_0",
  "bookmaker": "winner_bet",
  "homeWin": "2.45",
  "draw": "3.20",
  "awayWin": "2.80",
  "over25": "1.85",
  "under25": "1.95",
  "bothTeamsScore": {
    "yes": "1.75",
    "no": "2.10"
  },
  "timestamp": "2025-09-21T13:05:00Z"
}
```

### 6. 🛡️ Sécurité et Bonnes Pratiques

#### **Fichiers à ne PAS partager :**
- ❌ `firebase-service-account.json` (contient des clés privées)
- ❌ Clé API The Odds dans le code public

#### **Recommandations :**
- ✅ Ajouter `firebase-service-account.json` au `.gitignore`
- ✅ Utiliser des variables d'environnement pour les clés sensibles
- ✅ Limiter les permissions du compte de service
- ✅ Surveiller l'utilisation de l'API The Odds

### 7. 🔧 Dépannage

#### **Erreur "Permission denied" :**
- Vérifier les règles Firestore
- Vérifier le fichier de service account

#### **Erreur "Project not found" :**
- Vérifier le `project_id` dans le service account
- Vérifier que le projet existe dans Firebase

#### **Erreur API The Odds :**
- Vérifier la clé API
- Vérifier les quotas d'utilisation
- Vérifier la connexion Internet

### 8. 📈 Monitoring

#### **Logs à surveiller :**
- Nombre d'appels API réussis/échoués
- Nombre de matchs récupérés
- Temps de réponse de l'API
- Erreurs de sauvegarde Firestore

#### **Métriques importantes :**
- Quota API The Odds utilisé
- Nombre de lectures/écritures Firestore
- Taille de la base de données
