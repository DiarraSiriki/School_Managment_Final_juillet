import { authenticate } from '../services/userService.js';
import jwt from 'jsonwebtoken';
import { logToFile } from '../utils/logger.js';


// Clé secrète pour signer les tokens JWT
// En production, cette clé doit être dans le fichier .env et jamais commitée
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_securisee';

// Fonction de connexion (login)
// Cette fonction est appelée quand un utilisateur essaie de se connecter


const login = (req, res) => {
    // Récupérer les données envoyées dans le corps de la requête
    // req.body contient les données envoyées par le frontend (format JSON)
    const { email, mot_passe } = req.body;
    
    // Log de la tentative de connexion (pour le suivi et la sécurité)
    logToFile('INFO', `Tentative de connexion: ${email}`);

    // Validation des données entrantes
    // On vérifie que l'email et le mot de passe sont présents
    if (!email || !mot_passe) {
        logToFile('WARN', `Connexion échouée (champs manquants): ${email}`);
        return res.status(400).json({ 
            success: false,
            message: "L'email et le mot de passe sont requis." 
        });
    }

    try {
       
        const user = authenticate(email, mot_passe);

        // Si authenticate retourne null, c'est que les identifiants sont incorrects
        if (!user) {
            logToFile('WARN', `Connexion échouée (identifiants incorrects): ${email}`);
            return res.status(401).json({ 
                success: false,
                message: "Email ou mot de passe incorrect." 
            });
        }

        // Génération du token JWT

        const token = jwt.sign(
            { 
                id: user.id,           
                email: user.email,     
                role: user.role,       
                name: user.name        
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        logToFile('INFO', `Connexion réussie: ${email} (role: ${user.role})`);

        return res.json({
            success: true,
            message: "Connexion réussie !",
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });
    } catch (error) {
        console.error("[ERREUR LOGIN]", error);
        logToFile('ERROR', `Erreur lors de la connexion: ${email} - ${error.message}`);
        return res.status(500).json({ 
            success: false,
            error: "Erreur lors de la connexion." 
        });
    }
};

// Fonction de déconnexion (logout)


const logout = (req, res) => {
    // req.user contient les informations de l'utilisateur décodées du token
   
    const user = req.user;
    
  
    logToFile('INFO', `Déconnexion: ${user?.email} (role: ${user?.role})`);
    
    // Réponse de succès
    return res.json({
        success: true,
        message: "Déconnexion réussie !"
    });
};


export {
    login,
    logout
};
