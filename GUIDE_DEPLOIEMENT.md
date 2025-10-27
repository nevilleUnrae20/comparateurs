# 🚀 Guide de Déploiement - Comparateur de Cotes

## 📋 Table des Matières
1. [Tester en Local](#tester-en-local)
2. [Déployer sur GitHub Pages](#déployer-sur-github-pages)
3. [Configuration des Clés API](#configuration-des-clés-api)

---

## 🏠 Tester en Local

### Méthode Simple (Sans Serveur)
1. Ouvrez le dossier du projet : `C:\Users\Hp\Documents\memoire`
2. Double-cliquez sur le fichier **`index.html`**
3. Le site s'ouvrira dans votre navigateur par défaut

### Méthode avec Serveur Local (Recommandée)
Si vous avez Python installé :

```bash
# Ouvrez un terminal dans le dossier du projet
cd C:\Users\Hp\Documents\memoire

# Python 3
python -m http.server 8000

# Puis ouvrez : http://localhost:8000
```

Ou avec Node.js (si installé) :
```bash
npx http-server -p 8000
```

---

## 🌐 Déployer sur GitHub Pages (GRATUIT)

### Étape 1 : Accéder aux Paramètres
1. Allez sur votre dépôt : https://github.com/nevilleUnrae20/comparateurs
2. Cliquez sur **"Settings"** (⚙️ en haut à droite)

### Étape 2 : Activer GitHub Pages
1. Dans le menu de gauche, cliquez sur **"Pages"**
2. Sous **"Source"** :
   - Branch : Sélectionnez **`main`**
   - Folder : Laissez **`/ (root)`**
3. Cliquez sur **"Save"**

### Étape 3 : Attendre le Déploiement
- ⏱️ Attendez 1-2 minutes
- 🔄 Rafraîchissez la page
- ✅ Vous verrez un message : **"Your site is live at..."**

### Étape 4 : Accéder à Votre Site
Votre site sera accessible à :
```
https://nevilleunrae20.github.io/comparateurs/
```

---

## 🔑 Configuration des Clés API

### ⚠️ IMPORTANT : Sécurité
Les clés API ne doivent **JAMAIS** être partagées publiquement sur GitHub !

### Configuration Locale
1. Copiez le fichier `config.example.js` en `config.js`
2. Ouvrez `config.js` et remplacez les valeurs par vos vraies clés
3. Le fichier `config.js` est ignoré par Git (dans `.gitignore`)

### Pour GitHub Pages
**Option 1 : Utiliser les clés publiques Firebase**
- Les clés Firebase publiques sont OK pour GitHub Pages
- Elles sont protégées par les règles de sécurité Firebase

**Option 2 : Variables d'environnement (Avancé)**
- Utilisez GitHub Secrets pour les clés sensibles
- Nécessite un workflow GitHub Actions

---

## 🔧 Résolution de Problèmes

### Le site ne s'affiche pas sur GitHub Pages
1. Vérifiez que `index.html` est à la racine du projet
2. Attendez 5 minutes après l'activation
3. Videz le cache du navigateur (Ctrl + F5)

### Erreur "config.js not found"
1. Assurez-vous que `config.js` existe dans le dossier
2. Vérifiez que le fichier est bien chargé dans `index.html`

### Les cotes ne se mettent pas à jour
1. Vérifiez votre connexion internet
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez que vos clés Firebase sont correctes

---

## 📱 Partager Votre Site

Une fois déployé sur GitHub Pages, vous pouvez partager le lien :
```
https://nevilleunrae20.github.io/comparateurs/
```

Le site sera accessible :
- ✅ Sur ordinateur
- ✅ Sur mobile
- ✅ Sur tablette
- ✅ Partout dans le monde !

---

## 🆘 Besoin d'Aide ?

### Commandes Git Utiles
```bash
# Voir l'état de votre projet
git status

# Ajouter tous les changements
git add .

# Faire un commit
git commit -m "Description des changements"

# Pousser sur GitHub
git push origin main
```

### Liens Utiles
- 📖 Documentation GitHub Pages : https://pages.github.com/
- 🔥 Documentation Firebase : https://firebase.google.com/docs
- 💬 Support GitHub : https://support.github.com/

---

## ✅ Checklist de Déploiement

- [ ] Le fichier `config.js` existe localement
- [ ] Le fichier `config.js` est dans `.gitignore`
- [ ] Le site fonctionne en local
- [ ] Le code est poussé sur GitHub
- [ ] GitHub Pages est activé dans les paramètres
- [ ] Le site est accessible via l'URL GitHub Pages

**Félicitations ! Votre site est en ligne ! 🎉**
