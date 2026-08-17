const API_BASE_URL = 'http://localhost:3000/api'; // Ajustez selon le port de votre serveur Node.js

const API = {
  // 1. Récupère le token JWT depuis le localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // 2. Client Fetch générique avec gestion d'en-tête et d'erreurs
  async request(endpoint, options = {}) {
    const token = this.getToken();

    // Configuration par défaut des en-têtes
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    
      if (response.status === 401 || response.status === 403) {
        console.warn("[API] Session expirée ou accès non autorisé.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur serveur (${response.status})`);
      }

      return data;
    } catch (error) {
      console.error(`[ERREUR API] (${endpoint}):`, error.message);
      throw error;
    }
  },

  // 3. Méthodes Raccourcis HTTP
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

 auth: {
    login: (credentials) => API.post('/auth/login', credentials),
    me: () => API.get('/auth/me'),
    // Prévient le backend puis nettoie la session locale et redirige vers le login
    async logout() {
      try {
        await API.post('/auth/logout');
      } catch (error) {
        // Même si l'appel échoue (token déjà expiré, réseau, etc.), on déconnecte quand même localement
        console.warn('[API] Déconnexion serveur échouée, nettoyage local quand même.', error.message);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
  },

  admin: {
     getUsers: () => API.get('/users'),
    createUser: (userData) => API.post('/users', userData),
    updateUser: (id, userData) => API.put(`/users/${id}`, userData),
    deleteUser: (id) => API.delete(`/users/${id}`)
  },

  students: {
    getAll: () => API.get('/students'),
    getById: (id) => API.get(`/students/${id}`),
    getByMatricule: (matricule) => API.get(`/students/matricule/${matricule}`),
    getMyProfile: () => API.get('/students/me'),
    create: (studentData) => API.post('/students', studentData),
    update: (id, studentData) => API.put(`/students/${id}`, studentData),
    delete: (id) => API.delete(`/students/${id}`)
  }
};