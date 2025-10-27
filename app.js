// Configuration Firebase (clés publiques - OK pour GitHub Pages)
const firebaseConfig = {
    apiKey: "AIzaSyA2UMd9kJEde_Jmcu0gIM4X-jyygtpmST4",
    authDomain: "kolisa-likabo.firebaseapp.com",
    projectId: "kolisa-likabo",
    storageBucket: "kolisa-likabo.firebasestorage.app",
    messagingSenderId: "247371468055",
    appId: "1:247371468055:web:0ea8159b8c9a5209a1bb52",
    measurementId: "G-XH75BBPTXC"
};

// Configuration The Odds API
const ODDS_API_KEY = '3afd3012fe40f11c26e867de98086032';
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Variables globales
let selectedMatch = null;
let oddsUpdateInterval = null;
let lastUpdateTime = 0;

// Mapping des compétitions avec les clés de l'API The Odds
const competitions = [
    {
        id: 'soccer_germany_bundesliga',
        name: 'Bundesliga',
        icon: '🇩🇪',
        displayName: 'Bundesliga',
        logo: 'Bundesliga.jpg'
    },
    {
        id: 'soccer_spain_la_liga',
        name: 'La Liga',
        icon: '🇪🇸',
        displayName: 'La Liga',
        logo: 'la liga.png'
    },
    {
        id: 'soccer_epl',
        name: 'Premier League',
        icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        displayName: 'Premier League',
        logo: 'Premier League.png'
    },
    {
        id: 'soccer_france_ligue_one',
        name: 'Ligue 1',
        icon: '🇫🇷',
        displayName: 'Ligue 1',
        logo: 'ligue 1.jpg'
    },
    {
        id: 'soccer_italy_serie_a',
        name: 'Serie A',
        icon: '🇮🇹',
        displayName: 'Serie A',
        logo: 'serie a.png'
    },
    {
        id: 'soccer_turkey_super_league',
        name: 'Süper Lig',
        icon: '🇹🇷',
        displayName: 'Süper Lig',
        logo: 'Süper Lig.png'
    },
    {
        id: 'soccer_france_ligue_two',
        name: 'Ligue 2',
        icon: '🇫🇷',
        displayName: 'Ligue 2',
        logo: 'ligue 2.png'
    },
    {
        id: 'soccer_netherlands_eredivisie',
        name: 'Eredivisie',
        icon: '🇳🇱',
        displayName: 'Eredivisie',
        logo: 'eredeviste.png'
    }
];

// Variables pour stocker les matchs récupérés de l'API
let matchesData = [];

// Bookmakers
const bookmakers = [
    {
        id: 'winner_bet',
        name: 'Winner.bet',
        logo: 'winner.bet.jpg'
    },
    {
        id: '1xbet',
        name: '1xBet',
        logo: '1xbet.png'
    },
    {
        id: 'betwinner',
        name: 'BetWinner',
        logo: 'betwinner.png'
    }
];

// Éléments DOM
const matchesContainer = document.getElementById('matches-container');
const championshipSelect = document.getElementById('championship-select');

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initialisation de l\'application...');
    
    // Initialiser l'interface
    initializeCompetitions();
    
    // Charger les matchs depuis Firestore (ne pas les remplacer !)
    await loadAllMatches();
    
    console.log('✅ Application initialisée avec succès');
});

// Note: Les fonctions fetchTodaysMatches() et getDemoMatches() ont été supprimées
// car elles remplaçaient les vrais matchs par des matchs de démonstration.
// Utilisez le script update_firestore.js pour mettre à jour les matchs.

// Fonction pour supprimer la base de données existante
async function clearDatabase() {
    console.log('🗑️ Suppression de la base de données existante...');
    
    try {
        // Supprimer tous les matchs
        const matchesSnapshot = await db.collection('matches').get();
        const matchDeletePromises = matchesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(matchDeletePromises);
        
        // Supprimer toutes les cotes
        const oddsSnapshot = await db.collection('odds').get();
        const oddsDeletePromises = oddsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(oddsDeletePromises);
        
        console.log('✅ Base de données nettoyée');
    } catch (error) {
        console.log('⚠️ Erreur lors du nettoyage (normal si première utilisation):', error.message);
    }
}

// Initialiser les compétitions dans le menu déroulant
function initializeCompetitions() {
    console.log('🏆 Initialisation des compétitions...');
    
    // Créer une select box personnalisée avec logos
    createCustomSelect();
    
    // Sélectionner automatiquement "Tout"
    loadAllMatches();
}

// Créer une select box personnalisée avec logos
function createCustomSelect() {
    const container = document.querySelector('.championship-select-container');
    
    // Remplacer la select native par une version personnalisée
    const customSelectHTML = `
        <label class="championship-label">Championnats</label>
        <div class="custom-select" id="custom-championship-select">
            <div class="select-selected">
                <span class="select-icon"></span>
                <span class="select-text">Tout</span>
                <span class="select-arrow">▼</span>
            </div>
            <div class="select-items select-hide">
                <div class="select-option" data-value="all">
                    <span class="select-icon"></span>
                    <span class="select-text">Tout</span>
                </div>
                ${competitions.map(competition => `
                    <div class="select-option" data-value="${competition.id}">
                        <img src="${competition.logo}" alt="${competition.displayName}" class="select-logo">
                        <span class="select-text">${competition.displayName}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = customSelectHTML;
    
    // Ajouter les événements pour la select personnalisée
    setupCustomSelectEvents();
}

// Configurer les événements pour la select personnalisée
function setupCustomSelectEvents() {
    const customSelect = document.getElementById('custom-championship-select');
    const selected = customSelect.querySelector('.select-selected');
    const items = customSelect.querySelector('.select-items');
    const options = customSelect.querySelectorAll('.select-option');
    
    // Ouvrir/fermer la liste
    selected.addEventListener('click', () => {
        items.classList.toggle('select-hide');
        selected.classList.toggle('select-arrow-active');
    });
    
    // Sélectionner une option
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.dataset.value;
            const icon = option.querySelector('.select-icon, .select-logo');
            const text = option.querySelector('.select-text').textContent;
            
            // Mettre à jour l'affichage sélectionné
            const selectedIcon = selected.querySelector('.select-icon, .select-logo');
            const selectedText = selected.querySelector('.select-text');
            
            if (selectedIcon && selectedText) {
                if (icon && icon.tagName === 'IMG') {
                    selectedIcon.outerHTML = `<img src="${icon.src}" alt="${text}" class="select-logo">`;
                } else if (icon) {
                    if (selectedIcon.tagName === 'IMG') {
                        selectedIcon.outerHTML = `<span class="select-icon">${icon.textContent}</span>`;
                    } else {
                        selectedIcon.textContent = icon.textContent;
                    }
                }
                selectedText.textContent = text;
            }
            
            // Fermer la liste
            items.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
            
            // Déclencher l'action
            if (value === 'all') {
                loadAllMatches();
            } else if (value) {
                selectCompetition(value);
            }
        });
    });
    
    // Fermer la liste si on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            items.classList.add('select-hide');
            selected.classList.remove('select-arrow-active');
        }
    });
}

// Note: La fonction initializeMatches() a été supprimée car elle remplaçait
// les vrais matchs de Firestore par des matchs générés localement.
// Les matchs sont maintenant gérés par le script update_firestore.js

// Sélectionner une compétition
function selectCompetition(competitionId) {
    console.log(`🎯 Sélection de la compétition: ${competitionId}`);
    
    // Charger les matchs de cette compétition
    loadMatchesForCompetition(competitionId);
}

// Charger tous les matchs (toutes compétitions confondues)
async function loadAllMatches() {
    console.log('📋 Chargement de tous les matchs...');
    
    matchesContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">Chargement des matchs</div>
        </div>
    `;
    
    try {
        const snapshot = await db.collection('matches').get();
        
        if (snapshot.empty) {
            matchesContainer.innerHTML = '<div class="no-matches">Aucun match trouvé</div>';
            return;
        }
        
        matchesContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const match = doc.data();
            createMatchRow(doc.id, match);
        });
        
        // Charger les cotes pour tous les matchs
        loadAllOdds();
        
        // Démarrer les mises à jour automatiques
        startAllOddsUpdates();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des matchs:', error);
        matchesContainer.innerHTML = '<div class="no-matches">Erreur de chargement</div>';
    }
}

// Charger les matchs d'une compétition
async function loadMatchesForCompetition(competitionId) {
    console.log(`📋 Chargement des matchs pour: ${competitionId}`);
    
    matchesContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">Chargement des matchs</div>
        </div>
    `;
    
    try {
        const snapshot = await db.collection('matches')
            .where('competition', '==', competitionId)
            .get();
        
        if (snapshot.empty) {
            matchesContainer.innerHTML = '<div class="no-matches">Aucun match trouvé pour cette compétition</div>';
            return;
        }
        
        matchesContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const match = doc.data();
            createMatchRow(doc.id, match);
        });
        
        // Charger les cotes pour tous les matchs
        loadAllOdds();
        
        // Démarrer les mises à jour automatiques
        startAllOddsUpdates();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des matchs:', error);
        matchesContainer.innerHTML = '<div class="no-matches">Erreur de chargement</div>';
    }
}

// Créer une ligne de match avec cotes
function createMatchRow(matchId, matchData) {
    const matchRow = document.createElement('div');
    matchRow.className = 'match-row';
    matchRow.dataset.matchId = matchId;
    
    // Vérifier si le match est déjà passé
    const matchTime = new Date(matchData.commence_time);
    const now = new Date();
    const isPastMatch = matchTime < now;
    
    if (isPastMatch) {
        matchRow.classList.add('past-match');
    }
    
    const competition = competitions.find(c => c.id === matchData.competition);
    
    matchRow.innerHTML = `
        <div class="match-cell competitions">
            <div class="competition-item">
                <img src="${competition ? competition.logo : ''}" alt="${competition ? competition.name : 'Football'}" class="competition-logo-img">
                <div class="competition-name">${competition ? competition.displayName : 'Football'}</div>
            </div>
        </div>
        <div class="match-cell time">
            <div>${matchData.date}</div>
            <div>${matchData.time}</div>
            ${isPastMatch ? '<div class="match-status">Terminé</div>' : ''}
        </div>
        <div class="match-cell teams">
            <div class="team">
                <div class="team-logo">${getTeamInitials(matchData.homeTeam)}</div>
                <span>${matchData.homeTeam}</span>
            </div>
            <div class="team">
                <div class="team-logo">${getTeamInitials(matchData.awayTeam)}</div>
                <span>${matchData.awayTeam}</span>
            </div>
        </div>
        ${isPastMatch ? createPastMatchOddsColumns(matchId) : createBookmakerOddsColumns(matchId)}
    `;
    
    matchesContainer.appendChild(matchRow);
}

// Obtenir les initiales d'une équipe
function getTeamInitials(teamName) {
    return teamName.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
}

// Créer les colonnes de cotes pour les bookmakers
function createBookmakerOddsColumns(matchId) {
    return bookmakers.map(bookmaker => `
        <div class="match-cell bookmaker-odds" data-bookmaker="${bookmaker.id}" data-match="${matchId}">
            <div class="odds-pair">
                <div class="odd-button" data-type="home" data-bookmaker="${bookmaker.id}" data-match="${matchId}">
                    <span class="odd-value">-</span>
                </div>
                <div class="odd-button" data-type="away" data-bookmaker="${bookmaker.id}" data-match="${matchId}">
                    <span class="odd-value">-</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Créer les colonnes pour les matchs passés (sans cotes)
function createPastMatchOddsColumns(matchId) {
    return bookmakers.map(bookmaker => `
        <div class="match-cell bookmaker-odds past-odds" data-bookmaker="${bookmaker.id}" data-match="${matchId}">
            <div class="odds-pair">
                <div class="odd-button disabled">
                    <span class="odd-value">-</span>
                </div>
                <div class="odd-button disabled">
                    <span class="odd-value">-</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Démarrer les mises à jour pour tous les matchs
function startAllOddsUpdates() {
    // Arrêter l'ancien intervalle s'il existe
    if (oddsUpdateInterval) {
        clearInterval(oddsUpdateInterval);
    }
    
    // Charger les cotes initiales
    loadAllOdds();
    
    // Démarrer les mises à jour individuelles avec des intervalles aléatoires
    startRandomOddsUpdates();
    
    console.log('⏰ Mise à jour automatique des cotes démarrée (intervalles aléatoires 8-40s)');
}

// Charger toutes les cotes
async function loadAllOdds() {
    const matchRows = document.querySelectorAll('.match-row');
    
    for (const matchRow of matchRows) {
        const matchId = matchRow.dataset.matchId;
        await loadOddsForMatch(matchId);
    }
}

// Charger les cotes d'un match
async function loadOddsForMatch(matchId) {
    try {
        const snapshot = await db.collection('odds')
            .where('matchId', '==', matchId)
            .get();
        
        snapshot.forEach(doc => {
            const odds = doc.data();
            loadMatchOdds(matchId, odds.bookmaker, odds);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des cotes:', error);
    }
}

// Fonction pour charger les cotes initiales (sans animation)
function loadMatchOdds(matchId, bookmaker, oddsData) {
    const bookmakerColumn = document.querySelector(`[data-bookmaker="${bookmaker}"][data-match="${matchId}"]`);
    if (!bookmakerColumn) return;
    
    const homeButton = bookmakerColumn.querySelector('[data-type="home"] .odd-value');
    const awayButton = bookmakerColumn.querySelector('[data-type="away"] .odd-value');
    
    if (homeButton && awayButton) {
        // Mettre à jour les valeurs (format décimal)
        homeButton.textContent = oddsData.homeWin;
        awayButton.textContent = oddsData.awayWin;
    }
}

// Mettre à jour toutes les cotes
async function updateAllOdds() {
    console.log('🔄 Mise à jour de toutes les cotes...');
    
    const matchRows = document.querySelectorAll('.match-row');
    
    for (const matchRow of matchRows) {
        const matchId = matchRow.dataset.matchId;
        await updateOddsForMatch(matchId);
    }
    
    lastUpdateTime = 0; // Reset le compteur
}

// Mettre à jour les cotes d'un match
async function updateOddsForMatch(matchId) {
    try {
        // Mettre à jour les cotes pour chaque bookmaker
        for (const bookmaker of bookmakers) {
            const newOdds = generateRandomOdds();
            const docId = `${matchId}_${bookmaker}`;
            
            // Récupérer les anciennes cotes pour la comparaison
            const oldDoc = await db.collection('odds').doc(docId).get();
            const oldOdds = oldDoc.data();
            
            // Mettre à jour dans Firebase
            await db.collection('odds').doc(docId).update({
                homeWin: newOdds.homeWin,
                draw: newOdds.draw,
                awayWin: newOdds.awayWin,
                over25: newOdds.over25,
                under25: newOdds.under25,
                bothTeamsScore: newOdds.bothTeamsScore,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Mettre à jour l'interface avec animation
            updateMatchOdds(matchId, bookmaker, newOdds, oldOdds);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des cotes:', error);
    }
}

// Mettre à jour une cote individuelle dans l'interface
function updateSingleOddInInterface(matchId, bookmaker, oddType, newValue, oldValue) {
    const bookmakerColumn = document.querySelector(`[data-bookmaker="${bookmaker}"][data-match="${matchId}"]`);
    if (!bookmakerColumn) return;
    
    const oddButton = bookmakerColumn.querySelector(`[data-type="${oddType}"] .odd-value`);
    if (!oddButton) return;
    
    // Mettre à jour la valeur
    oddButton.textContent = newValue;
    
    const oddButtonParent = oddButton.parentElement;
    
    // Ajouter l'animation si la valeur a changé
    if (oldValue && oldValue !== '-' && oldValue !== newValue) {
        const change = parseFloat(newValue) - parseFloat(oldValue);
        const animationClass = change > 0 ? 'odd-increase' : 'odd-decrease';
        oddButtonParent.classList.add(animationClass);
        setTimeout(() => oddButtonParent.classList.remove(animationClass), 600);
    }
}

// Mettre à jour les cotes d'un match avec animation
function updateMatchOdds(matchId, bookmaker, newOdds, oldOdds = null) {
    const bookmakerColumn = document.querySelector(`[data-bookmaker="${bookmaker}"][data-match="${matchId}"]`);
    if (!bookmakerColumn) return;
    
    const homeButton = bookmakerColumn.querySelector('[data-type="home"] .odd-value');
    const awayButton = bookmakerColumn.querySelector('[data-type="away"] .odd-value');
    
    if (homeButton && awayButton) {
        // Stocker les anciennes valeurs pour l'animation
        const oldHome = oldOdds ? oldOdds.homeWin : homeButton.textContent;
        const oldAway = oldOdds ? oldOdds.awayWin : awayButton.textContent;
        
        // Mettre à jour les valeurs
        homeButton.textContent = newOdds.homeWin;
        awayButton.textContent = newOdds.awayWin;
        
        const homeButtonParent = homeButton.parentElement;
        const awayButtonParent = awayButton.parentElement;
        
        // Ajouter les classes d'animation si les valeurs ont changé
        if (oldHome !== '-' && oldHome !== newOdds.homeWin) {
            const homeChange = parseFloat(newOdds.homeWin) - parseFloat(oldHome);
            const animationClass = homeChange > 0 ? 'odd-increase' : 'odd-decrease';
            homeButtonParent.classList.add(animationClass);
            setTimeout(() => homeButtonParent.classList.remove(animationClass), 600);
        }
        
        if (oldAway !== '-' && oldAway !== newOdds.awayWin) {
            const awayChange = parseFloat(newOdds.awayWin) - parseFloat(oldAway);
            const animationClass = awayChange > 0 ? 'odd-increase' : 'odd-decrease';
            awayButtonParent.classList.add(animationClass);
            setTimeout(() => awayButtonParent.classList.remove(animationClass), 600);
        }
    }
}

// Démarrer les mises à jour aléatoires (intelligentes: 10 secondes à 2 minutes)
function startRandomOddsUpdates() {
    const matchRows = document.querySelectorAll('.match-row:not(.past-match)'); // Exclure les matchs passés
    
    matchRows.forEach(matchRow => {
        const matchId = matchRow.dataset.matchId;
        
        bookmakers.forEach(bookmaker => {
            // Créer des intervalles séparés pour chaque cote individuelle
            ['home', 'away'].forEach(oddType => {
                // Intervalle: 10 secondes à 2 minutes (10000ms à 120000ms)
                const randomInterval = Math.random() * 110000 + 10000; // 10 à 120 secondes
                
                setTimeout(() => {
                    updateIndividualOdd(matchId, bookmaker.id, oddType);
                    
                    // Programmer la prochaine mise à jour pour cette cote spécifique
                    setInterval(() => {
                        updateIndividualOdd(matchId, bookmaker.id, oddType);
                    }, Math.random() * 110000 + 10000); // 10 à 120 secondes
                    
                }, randomInterval);
            });
        });
    });
}

// Mettre à jour une cote individuelle (home ou away)
async function updateIndividualOdd(matchId, bookmaker, oddType) {
    try {
        const docId = `${matchId}_${bookmaker}`;
        const doc = await db.collection('odds').doc(docId).get();
        
        if (doc.exists) {
            const currentOdds = doc.data();
            const fieldName = oddType === 'home' ? 'homeWin' : 'awayWin';
            const currentValue = currentOdds[fieldName];
            
            // Vérifier si cette cote est verrouillée (très rare - 0.5% de chance)
            const isLocked = Math.random() < 0.005;
            
            if (isLocked) {
                // Verrouiller la cote avec un cadenas
                lockOddInInterface(matchId, bookmaker, oddType);
                return;
            }
            
            // Générer une nouvelle valeur (avec possibilité de variation drastique)
            const newValue = generateSmartSingleOdd(currentValue);
            
            // Mettre à jour seulement cette cote dans Firebase
            await db.collection('odds').doc(docId).update({
                [fieldName]: newValue,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Mettre à jour l'interface avec animation
            updateSingleOddInInterface(matchId, bookmaker, oddType, newValue, currentValue);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour d\'une cote individuelle:', error);
    }
}

// Mettre à jour une seule cote (fonction conservée pour compatibilité)
async function updateSingleOdd(matchId, bookmaker) {
    try {
        const docId = `${matchId}_${bookmaker}`;
        const doc = await db.collection('odds').doc(docId).get();
        
        if (doc.exists) {
            const currentOdds = doc.data();
            const newOdds = generateSmartOdds(currentOdds);
            
            // Mettre à jour dans Firebase
            await db.collection('odds').doc(docId).update({
                homeWin: newOdds.homeWin,
                awayWin: newOdds.awayWin,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Mettre à jour l'interface avec animation
            updateMatchOdds(matchId, bookmaker, newOdds, currentOdds);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour d\'une cote:', error);
    }
}

// Verrouiller une cote avec un cadenas (très rare)
function lockOddInInterface(matchId, bookmaker, oddType) {
    const selector = `[data-match="${matchId}"][data-bookmaker="${bookmaker}"][data-type="${oddType}"] .odd-value`;
    const oddElement = document.querySelector(selector);
    
    if (oddElement) {
        // Remplacer la cote par un cadenas professionnel SVG
        oddElement.innerHTML = `
            <svg class="lock-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="15" r="2" fill="currentColor"/>
            </svg>
        `;
        oddElement.parentElement.classList.add('locked-odd');
        oddElement.parentElement.title = 'Pari suspendu';
        
        console.log(`🔒 Cote verrouillée: ${matchId} - ${bookmaker} - ${oddType}`);
    }
}

// Générer une cote individuelle intelligente
function generateSmartSingleOdd(currentValue) {
    if (currentValue) {
        // 5% de chance d'avoir une variation drastique
        const isDrasticChange = Math.random() < 0.05;
        
        if (isDrasticChange) {
            // Variation drastique : +/- 30% à 80%
            const drasticVariation = (Math.random() - 0.5) * 1.6; // Variation de ±0.8
            const newValue = parseFloat(currentValue) + drasticVariation;
            return Math.max(1.10, Math.min(15.00, newValue)).toFixed(2);
        } else {
            // Variation normale basée sur la cote actuelle
            const variation = (Math.random() - 0.5) * 0.3; // Variation de ±0.15
            return Math.max(1.10, Math.min(10.00, parseFloat(currentValue) + variation)).toFixed(2);
        }
    } else {
        // Générer une cote initiale décimale
        return (Math.random() * (4.5 - 1.4) + 1.4).toFixed(2);
    }
}

// Générer des cotes intelligentes basées sur les précédentes
function generateSmartOdds(currentOdds = null) {
    let homeWin, awayWin;
    
    if (currentOdds && currentOdds.homeWin && currentOdds.awayWin) {
        // Variation intelligente basée sur les cotes actuelles
        const homeVariation = (Math.random() - 0.5) * 0.3; // Variation de ±0.15
        const awayVariation = (Math.random() - 0.5) * 0.3;
        
        homeWin = Math.max(1.10, Math.min(10.00, parseFloat(currentOdds.homeWin) + homeVariation)).toFixed(2);
        awayWin = Math.max(1.10, Math.min(10.00, parseFloat(currentOdds.awayWin) + awayVariation)).toFixed(2);
    } else {
        // Générer des cotes initiales décimales
        homeWin = (Math.random() * (4.5 - 1.4) + 1.4).toFixed(2);
        awayWin = (Math.random() * (5.0 - 1.6) + 1.6).toFixed(2);
    }
    
    return {
        homeWin,
        awayWin,
        draw: (Math.random() * (4.0 - 2.8) + 2.8).toFixed(2),
        over25: (Math.random() * (3.2 - 1.3) + 1.3).toFixed(2),
        under25: (Math.random() * (3.0 - 1.4) + 1.4).toFixed(2),
        bothTeamsScore: {
            yes: (Math.random() * (2.5 - 1.4) + 1.4).toFixed(2),
            no: (Math.random() * (2.8 - 1.5) + 1.5).toFixed(2)
        }
    };
}

// Générer des cotes aléatoires mais logiques (pour l'initialisation)
function generateRandomOdds() {
    return generateSmartOdds();
}

// Fonction supprimée - plus besoin du timer de mise à jour

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
    if (oddsUpdateInterval) {
        clearInterval(oddsUpdateInterval);
    }
});
