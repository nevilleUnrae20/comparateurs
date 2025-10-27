// Script pour vérifier le quota d'API The Odds
// Usage: node check_api_quota.js

const fetch = require('node-fetch');

const ODDS_API_KEY = '3afd3012fe40f11c26e867de98086032';
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';

async function checkApiQuota() {
    console.log('============================================================');
    console.log('           VÉRIFICATION DU QUOTA API THE ODDS              ');
    console.log('============================================================\n');
    
    try {
        // Faire un appel simple pour obtenir les headers
        const url = `${ODDS_API_BASE_URL}/sports/?apiKey=${ODDS_API_KEY}`;
        
        console.log('📡 Envoi d\'une requête de test...\n');
        
        const response = await fetch(url);
        
        // Récupérer les headers importants
        const requestsUsed = response.headers.get('x-requests-used');
        const requestsRemaining = response.headers.get('x-requests-remaining');
        const requestsLimit = response.headers.get('x-requests-limit');
        
        console.log('📊 VOTRE QUOTA API:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        if (requestsUsed !== null) {
            console.log(`✅ Requêtes utilisées ce mois : ${requestsUsed}`);
        }
        
        if (requestsRemaining !== null) {
            console.log(`🔄 Requêtes restantes        : ${requestsRemaining}`);
        }
        
        if (requestsLimit !== null) {
            console.log(`📈 Limite mensuelle          : ${requestsLimit}`);
        }
        
        // Calculer le pourcentage utilisé
        if (requestsUsed && requestsLimit) {
            const percentUsed = ((requestsUsed / requestsLimit) * 100).toFixed(2);
            console.log(`📊 Pourcentage utilisé       : ${percentUsed}%`);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Afficher tous les headers de quota disponibles
        console.log('\n🔍 DÉTAILS SUPPLÉMENTAIRES:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        response.headers.forEach((value, name) => {
            if (name.startsWith('x-')) {
                console.log(`   ${name}: ${value}`);
            }
        });
        
        console.log('\n============================================================');
        console.log('✅ Vérification terminée avec succès!');
        console.log('============================================================\n');
        
    } catch (error) {
        console.error('\n❌ Erreur lors de la vérification:', error.message);
    }
}

// Exécuter le script
checkApiQuota();
