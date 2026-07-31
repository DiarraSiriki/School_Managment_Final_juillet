
// Ce fichier contient une fonction utilitaire pour communiquer avec le serveur
// Elle simplifie les appels API en gérant automatiquement :

// Fonction apiFetch - Fonction réutilisable pour les appels API

async function apiFetch(endpoint, options = {}) {
    // Étape 1 : Récupérer le token JWT depuis le localStorage
    // Le token est stocké dans le navigateur après la connexion
    const token = localStorage.getItem('token');

    // Étape 2 : Préparer les headers de la requête
    const headers = {
        'Content-Type': 'application/json',  // Indique qu'on envoie du JSON
        ...(token && { 'Authorization': `Bearer ${token}` }),  // Ajoute le token s'il existe
        ...options.headers  // Permet de surcharger les headers si nécessaire
    };

    // Étape 3 : Normaliser l'URL vers l'API backend
    const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const requestUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
        ? endpoint
        : normalizedEndpoint;
    const isLoginRequest = endpoint === '/auth/login' || endpoint === '/api/auth/login';

    try {
        const response = await fetch(requestUrl, {
            ...options,      // Options supplémentaires (method, body, etc.)
            headers          // Headers préparés ci-dessus
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
            ? await response.json()
            : { success: false, message: await response.text() };

        if (response.status === 401 || response.status === 403) {
            if (!isLoginRequest) {
                localStorage.clear();
                window.location.href = '/login.html';
            }
            return data;
        }

        return data;
    } catch (error) {
        console.error(`[ERREUR API] ${endpoint}:`, error);
        return { success: false, message: "Impossible de contacter le serveur." };
    }
}