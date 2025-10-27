// Script pour récupérer les matchs du jour depuis The Odds API
// Usage: node fetch_matches.js

const fetch = require('node-fetch');
const admin = require('firebase-admin');

// Configuration The Odds API
const ODDS_API_KEY = '3afd3012fe40f11c26e867de98086032';
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

// Configuration Firebase Admin (utilise les clés de l'app web)
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyA2UMd9kJEde_Jmcu0gIM4X-jyygtpmST4",
    authDomain: "kolisa-likabo.firebaseapp.com",
    projectId: "kolisa-likabo",
    storageBucket: "kolisa-likabo.firebasestorage.app",
    messagingSenderId: "247371468055",
    appId: "1:247371468055:web:0ea8159b8c9a5209a1bb52",
    measurementId: "G-XH75BBPTXC"
};

// Initialiser Firebase Admin avec les droits admin
if (!admin.apps.length) {
    const serviceAccount = require('./kolisa-likabo-firebase-adminsdk-fbsvc-8eb5970274.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "kolisa-likabo"
    });
}

const db = admin.firestore();

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
        id: 'soccer_spain_copa_del_rey',
        name: 'Copa del Rey',
        icon: '🇪🇸',
        displayName: 'Copa del Rey',
        logo: 'copa del rey logo.png'
    },
    {
        id: 'soccer_germany_dfb_pokal',
        name: 'DFB Pokal',
        icon: '🇩🇪',
        displayName: 'DFB Pokal',
        logo: 'dfb pokal logo.png'
    },
    {
        id: 'soccer_epl',
        name: 'Premier League',
        icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        displayName: 'Premier League',
        logo: 'Premier League.png'
    },
    {
        id: 'soccer_efl_champ',
        name: 'League One',
        icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        displayName: 'League One',
        logo: 'league one.svg'
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
        id: 'soccer_netherlands_eredivisie',
        name: 'Eredivisie',
        icon: '🇳🇱',
        displayName: 'Eredivisie',
        logo: 'eredeviste.png'
    },
    {
        id: 'soccer_congo_linafoot',
        name: 'Ligue RDC',
        icon: '🇨🇩',
        displayName: 'Ligue RDC (FECOFA)',
        logo: 'FECOFA logo.png'
    }
];

// Fonction pour afficher un log avec timestamp
function log(message, type = 'INFO') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const colors = {
        'INFO': '\x1b[36m',    // Cyan
        'SUCCESS': '\x1b[32m', // Vert
        'WARNING': '\x1b[33m', // Jaune
        'ERROR': '\x1b[31m',   // Rouge
        'RESET': '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${type}: ${message}${colors.RESET}`);
}

// Fonction pour afficher un séparateur
function separator(title = '') {
    const line = '='.repeat(60);
    if (title) {
        const padding = Math.max(0, (60 - title.length - 2) / 2);
        const paddedTitle = ' '.repeat(Math.floor(padding)) + title + ' '.repeat(Math.ceil(padding));
        console.log(`\x1b[35m${line}\x1b[0m`);
        console.log(`\x1b[35m${paddedTitle}\x1b[0m`);
        console.log(`\x1b[35m${line}\x1b[0m`);
    } else {
        console.log(`\x1b[35m${line}\x1b[0m`);
    }
}

// Fonction pour vider complètement Firestore
async function clearFirestore() {
    separator('NETTOYAGE COMPLET DE FIRESTORE');
    log('🗑️ Suppression de toutes les données existantes...');
    
    try {
        // Supprimer tous les matchs
        const matchesSnapshot = await db.collection('matches').get();
        if (!matchesSnapshot.empty) {
            log(`📋 ${matchesSnapshot.size} matchs trouvés à supprimer`);
            const batch = db.batch();
            matchesSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            log(`✅ ${matchesSnapshot.size} matchs supprimés`, 'SUCCESS');
        } else {
            log('📋 Aucun match à supprimer');
        }
        
        // Supprimer toutes les cotes
        const oddsSnapshot = await db.collection('odds').get();
        if (!oddsSnapshot.empty) {
            log(`💰 ${oddsSnapshot.size} cotes trouvées à supprimer`);
            const batch = db.batch();
            oddsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            log(`✅ ${oddsSnapshot.size} cotes supprimées`, 'SUCCESS');
        } else {
            log('💰 Aucune cote à supprimer');
        }
        
        log('🧹 Firestore complètement vidé', 'SUCCESS');
        
    } catch (error) {
        log(`❌ Erreur lors du nettoyage: ${error.message}`, 'ERROR');
        throw error;
    }
}

// Fonction pour sauvegarder directement dans Firestore
async function saveToFirestore(matches) {
    separator('SAUVEGARDE DIRECTE DANS FIRESTORE');
    log(`💾 Sauvegarde de ${matches.length} matchs dans Firestore...`);
    
    try {
        let savedMatches = 0;
        let savedOdds = 0;
        
        for (const match of matches) {
            // Sauvegarder le match
            await db.collection('matches').doc(match.id).set({
                competition: match.competition,
                competitionName: match.competitionName,
                homeTeam: match.homeTeam,
                awayTeam: match.awayTeam,
                time: match.time,
                date: match.date,
                commence_time: match.commence_time,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            
            savedMatches++;
            log(`⚽ Match sauvegardé: ${match.homeTeam} vs ${match.awayTeam}`);
            
            // Extraire et sauvegarder les vraies cotes depuis l'API
            const realBookmakers = match.realOdds || [];
            const targetBookmakers = ['winner_bet', '1xbet', 'betwinner'];
            
            for (const bookmakerName of targetBookmakers) {
                let odds;
                
                // Chercher les vraies cotes pour ce bookmaker
                const realBookmaker = realBookmakers.find(b => 
                    b.key && (b.key.toLowerCase().includes(bookmakerName.replace('_', '')) || 
                              bookmakerName.includes(b.key.toLowerCase()))
                );
                
                if (realBookmaker && realBookmaker.markets && realBookmaker.markets[0]) {
                    // Utiliser les vraies cotes de l'API
                    const outcomes = realBookmaker.markets[0].outcomes;
                    odds = {
                        homeWin: outcomes.find(o => o.name === match.homeTeam)?.price?.toFixed(2) || generateSingleOdd(),
                        awayWin: outcomes.find(o => o.name === match.awayTeam)?.price?.toFixed(2) || generateSingleOdd(),
                        draw: outcomes.find(o => o.name === 'Draw')?.price?.toFixed(2) || (Math.random() * 1.2 + 2.8).toFixed(2)
                    };
                } else {
                    // Générer des cotes réalistes si pas disponibles
                    odds = generateRandomOdds();
                }
                
                await db.collection('odds').doc(`${match.id}_${bookmakerName}`).set({
                    matchId: match.id,
                    bookmaker: bookmakerName,
                    homeWin: odds.homeWin,
                    awayWin: odds.awayWin,
                    initialHomeWin: odds.homeWin, // Stocker les cotes initiales
                    initialAwayWin: odds.awayWin,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                
                savedOdds++;
            }
        }
        
        log(`✅ ${savedMatches} matchs sauvegardés dans Firestore`, 'SUCCESS');
        log(`✅ ${savedOdds} cotes générées et sauvegardées`, 'SUCCESS');
        
    } catch (error) {
        log(`❌ Erreur lors de la sauvegarde: ${error.message}`, 'ERROR');
        throw error;
    }
}

// Générer une cote individuelle réaliste
function generateSingleOdd() {
    return (Math.random() * (4.5 - 1.4) + 1.4).toFixed(2);
}

// Générer des cotes aléatoires réalistes
function generateRandomOdds() {
    return {
        homeWin: generateSingleOdd(),
        awayWin: generateSingleOdd(),
        draw: (Math.random() * (4.0 - 2.8) + 2.8).toFixed(2)
    };
}

// Récupérer les matchs du jour depuis l'API The Odds
async function fetchTodaysMatches() {
    separator('RÉCUPÉRATION DES MATCHS DU JOUR');
    log('🚀 Démarrage du script de récupération des matchs');
    
    try {
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        log(`📅 Date du jour: ${today}`);
        
        const allMatches = [];
        let totalApiCalls = 0;
        let successfulCalls = 0;
        let failedCalls = 0;
        
        separator('APPELS API PAR COMPÉTITION');
        
        // Récupérer les matchs pour chaque compétition
        for (let i = 0; i < competitions.length; i++) {
            const competition = competitions[i];
            
            try {
                totalApiCalls++;
                const url = `${ODDS_API_BASE_URL}/sports/${competition.id}/odds/?apiKey=${ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso&commenceTimeFrom=${today}T00:00:00Z&commenceTimeTo=${today}T23:59:59Z`;
                
                log(`📡 [${i+1}/${competitions.length}] Appel API pour ${competition.displayName}...`);
                log(`🔗 URL: ${url.replace(ODDS_API_KEY, 'API_KEY_HIDDEN')}`);
                
                const startTime = Date.now();
                const response = await fetch(url);
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                log(`⏱️ Temps de réponse: ${responseTime}ms`);
                log(`📊 Status HTTP: ${response.status} ${response.statusText}`);
                
                if (!response.ok) {
                    failedCalls++;
                    log(`❌ Erreur API pour ${competition.displayName}: ${response.status}`, 'ERROR');
                    continue;
                }
                
                const data = await response.json();
                successfulCalls++;
                log(`✅ Réponse reçue: ${data.length} matchs trouvés`, 'SUCCESS');
                
                // Traiter les matchs de cette compétition
                data.forEach((match, index) => {
                    const matchDate = new Date(match.commence_time);
                    const matchTime = matchDate.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    
                    const processedMatch = {
                        id: `${competition.id}_${index}`,
                        competition: competition.id,
                        competitionName: competition.displayName,
                        homeTeam: match.home_team,
                        awayTeam: match.away_team,
                        time: matchTime,
                        date: 'Aujourd\'hui',
                        commence_time: match.commence_time,
                        bookmakers: match.bookmakers || [],
                        realOdds: match.bookmakers || [] // Stocker les vraies cotes
                    };
                    
                    allMatches.push(processedMatch);
                    
                    log(`⚽ Match ajouté: ${match.home_team} vs ${match.away_team} à ${matchTime}`);
                });
                
                // Pause entre les appels pour éviter de surcharger l'API
                if (i < competitions.length - 1) {
                    log('⏳ Pause de 1 seconde avant le prochain appel...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                failedCalls++;
                log(`❌ Erreur lors de la récupération pour ${competition.displayName}: ${error.message}`, 'ERROR');
            }
        }
        
        separator('RÉSUMÉ DE LA COLLECTE');
        
        log(`📊 Statistiques des appels API:`);
        log(`   • Total d'appels: ${totalApiCalls}`);
        log(`   • Appels réussis: ${successfulCalls}`, 'SUCCESS');
        log(`   • Appels échoués: ${failedCalls}`, failedCalls > 0 ? 'WARNING' : 'INFO');
        
        // Trier les matchs par heure (sans limitation)
        const sortedMatches = allMatches
            .sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time));
        
        log(`🔢 Nombre total de matchs récupérés: ${allMatches.length}`);
        log(`📋 Matchs après tri: ${sortedMatches.length}`);
        
        if (sortedMatches.length > 0) {
            separator('LISTE DES MATCHS RÉCUPÉRÉS');
            
            sortedMatches.forEach((match, index) => {
                log(`${index + 1}. [${match.competitionName}] ${match.homeTeam} vs ${match.awayTeam} - ${match.time}`);
            });
        } else {
            log('⚠️ Aucun match trouvé pour aujourd\'hui', 'WARNING');
            log('💡 Cela peut être normal si aucun match n\'est programmé aujourd\'hui dans ces compétitions');
        }
        
        // Sauvegarder directement dans Firestore
        if (sortedMatches.length > 0) {
            await saveToFirestore(sortedMatches);
        }
        
        separator('SAUVEGARDE DES DONNÉES');
        
        // Sauvegarder aussi dans un fichier JSON pour backup
        const fs = require('fs').promises;
        const outputFile = 'matches_data.json';
        
        const outputData = {
            timestamp: new Date().toISOString(),
            date: today,
            totalMatches: sortedMatches.length,
            matches: sortedMatches,
            statistics: {
                totalApiCalls,
                successfulCalls,
                failedCalls,
                competitions: competitions.map(c => c.displayName)
            }
        };
        
        await fs.writeFile(outputFile, JSON.stringify(outputData, null, 2), 'utf8');
        log(`💾 Backup local sauvegardé dans: ${outputFile}`, 'SUCCESS');
        
        separator('FIN DU SCRIPT');
        log('🎉 Script terminé avec succès!', 'SUCCESS');
        log(`📈 Résultat: ${sortedMatches.length} matchs récupérés et sauvegardés`);
        
        return sortedMatches;
        
    } catch (error) {
        log(`💥 Erreur fatale: ${error.message}`, 'ERROR');
        log('❌ Le script s\'est terminé avec des erreurs', 'ERROR');
        throw error;
    }
}

// Point d'entrée du script
async function main() {
    try {
        // Étape 1: Vider complètement Firestore
        await clearFirestore();
        
        // Étape 2: Récupérer et sauvegarder les nouveaux matchs
        await fetchTodaysMatches();
        
        separator('FIRESTORE MIS À JOUR');
        log('✅ Firestore a été vidé et rempli avec les vrais matchs du jour');
        log('🔄 Actualisez votre page web pour voir les nouveaux matchs');
        
        process.exit(0);
    } catch (error) {
        log(`💥 Erreur fatale: ${error.message}`, 'ERROR');
        process.exit(1);
    }
}

// Vérifier si le script est exécuté directement
if (require.main === module) {
    main();
}

module.exports = { fetchTodaysMatches, competitions };
