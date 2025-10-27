// Script pour mettre à jour Firestore avec les vrais matchs via l'API REST
// Usage: node update_firestore.js

const fetch = require('node-fetch');

// --- CONFIGURATION ---
const ODDS_API_KEY = '3afd3012fe40f11c26e867de98086032';
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const FIREBASE_PROJECT_ID = 'kolisa-likabo';
// --- FIN CONFIGURATION ---

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

const competitions = [
    { id: 'soccer_germany_bundesliga', displayName: 'Bundesliga' },
    { id: 'soccer_spain_la_liga', displayName: 'La Liga' },
    { id: 'soccer_epl', displayName: 'Premier League' },
    { id: 'soccer_france_ligue_one', displayName: 'Ligue 1' },
    { id: 'soccer_italy_serie_a', displayName: 'Serie A' },
    { id: 'soccer_turkey_super_league', displayName: 'Süper Lig' }
];

// --- FONCTIONS UTILITAIRES ---
function log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const colors = { 'INFO': '\x1b[36m', 'SUCCESS': '\x1b[32m', 'WARNING': '\x1b[33m', 'ERROR': '\x1b[31m', 'RESET': '\x1b[0m' };
    console.log(`${colors[type] || colors.RESET}[${timestamp}] ${type}: ${message}${colors.RESET}`);
}

function separator(title = '') {
    const line = '='.repeat(60);
    console.log(`\x1b[35m${line}\x1b[0m`);
    if (title) console.log(`\x1b[35m${' '.repeat((60 - title.length) / 2)}${title}\x1b[0m`);
    console.log(`\x1b[35m${line}\x1b[0m`);
}

// --- LOGIQUE FIRESTORE VIA REST ---

// Vider une collection entière
async function clearCollection(collectionId) {
    log(`🗑️ Démarrage du nettoyage de la collection "${collectionId}"...`);
    const listUrl = `${FIRESTORE_BASE_URL}/${collectionId}?pageSize=500`;
    const response = await fetch(listUrl);
    const data = await response.json();

    if (!data.documents || data.documents.length === 0) {
        log(`✅ Collection "${collectionId}" est déjà vide.`, 'SUCCESS');
        return;
    }

    const deletePromises = data.documents.map(doc => {
        const docId = doc.name.split('/').pop();
        const deleteUrl = `${FIRESTORE_BASE_URL}/${collectionId}/${docId}`;
        return fetch(deleteUrl, { method: 'DELETE' });
    });

    await Promise.all(deletePromises);
    log(`✅ ${data.documents.length} documents supprimés de "${collectionId}".`, 'SUCCESS');
}

// Convertir un objet JS simple en format Firestore
function toFirestoreFormat(obj) {
    const fields = {};
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'string') fields[key] = { stringValue: value };
        else if (typeof value === 'number') fields[key] = { doubleValue: value };
        else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
        else if (value instanceof Date) fields[key] = { timestampValue: value.toISOString() };
        else if (Array.isArray(value)) fields[key] = { arrayValue: { values: value.map(v => toFirestoreFormat({v}).v) } };
        else if (typeof value === 'object' && value !== null) fields[key] = { mapValue: { fields: toFirestoreFormat(value) } };
    }
    return fields;
}

// Sauvegarder les données dans Firestore
async function saveToFirestore(data) {
    separator('SAUVEGARDE DANS FIRESTORE');
    const collections = Object.keys(data);
    for (const collectionId of collections) {
        const documents = data[collectionId];
        const docIds = Object.keys(documents);
        log(`💾 Sauvegarde de ${docIds.length} documents dans "${collectionId}"...`);

        const savePromises = docIds.map(docId => {
            const docData = documents[docId];
            const url = `${FIRESTORE_BASE_URL}/${collectionId}/${docId}`;
            const body = JSON.stringify({ fields: toFirestoreFormat(docData) });
            return fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });
        });

        await Promise.all(savePromises);
        log(`✅ ${docIds.length} documents sauvegardés dans "${collectionId}".`, 'SUCCESS');
    }
}

// --- LOGIQUE MÉTIER ---

// Récupérer les matchs de The Odds API
async function fetchTodaysMatches() {
    separator('RÉCUPÉRATION DES MATCHS');
    const today = new Date().toISOString().split('T')[0];
    const allMatches = [];

    for (const competition of competitions) {
        const url = `${ODDS_API_BASE_URL}/sports/${competition.id}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&dateFormat=iso&commenceTimeFrom=${today}T00:00:00Z&commenceTimeTo=${today}T23:59:59Z`;
        log(`📡 Appel API pour ${competition.displayName}...`);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            log(`✅ ${data.length} matchs trouvés.`, 'SUCCESS');
            data.forEach((match, index) => {
                allMatches.push({
                    id: `${competition.id}_${index}`,
                    competition: competition.id,
                    competitionName: competition.displayName,
                    homeTeam: match.home_team,
                    awayTeam: match.away_team,
                    time: new Date(match.commence_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    date: 'Aujourd\'hui',
                    commence_time: match.commence_time
                });
            });
        } catch (error) {
            log(`Erreur pour ${competition.displayName}: ${error.message}`, 'ERROR');
        }
    }
    return allMatches.sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time)).slice(0, 20);
}

// Générer des cotes aléatoires
function generateRandomOdds() {
    return {
        homeWin: (Math.random() * 3.5 + 1.4).toFixed(2),
        awayWin: (Math.random() * 4.0 + 1.6).toFixed(2),
        draw: (Math.random() * 1.2 + 2.8).toFixed(2)
    };
}

// Créer la structure de données finale pour Firestore
function createFirestoreData(matches) {
    const data = { matches: {}, odds: {} };
    matches.forEach(match => {
        data.matches[match.id] = { ...match, timestamp: new Date() };
        ['winner_bet', '1xbet', 'betwinner'].forEach(bookmaker => {
            const oddId = `${match.id}_${bookmaker}`;
            data.odds[oddId] = { ...generateRandomOdds(), matchId: match.id, bookmaker, timestamp: new Date() };
        });
    });
    return data;
}

// --- POINT D'ENTRÉE ---
async function main() {
    try {
        await clearCollection('matches');
        await clearCollection('odds');

        const matches = await fetchTodaysMatches();
        if (matches.length === 0) {
            log('Aucun match trouvé. Arrêt.', 'WARNING');
            return;
        }

        const firestoreData = createFirestoreData(matches);
        await saveToFirestore(firestoreData);

        separator('TERMINÉ');
        log('✅ Firestore a été vidé et rempli avec les vrais matchs du jour.', 'SUCCESS');
        log('🔄 Actualisez votre page web pour voir les changements.');

    } catch (error) {
        log(`💥 Erreur fatale: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

main();
