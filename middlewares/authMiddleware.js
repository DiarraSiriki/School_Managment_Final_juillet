import jwt from 'jsonwebtoken';

// Clé secrète pour vérifier les tokens JWT
// Doit être la même que celle utilisée pour signer les tokens
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_super_securisee';


// Middleware verifyToken - Vérification du token JWT
 

const verifyToken = (req, res, next) => {
    // Étape 1 : Récupérer le header Authorization
    // Le frontend doit envoyer le token dans ce format : "Bearer <token>"
    const authHeader = req.headers.authorization;

    // Étape 2 : Vérifier si le header existe et a le bon format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Accès refusé. Jeton d'authentification manquant ou mal formé."
        });
    }

    // Étape 3 : Extraire le token du header
    // On sépare "Bearer" du token avec split(' ') et on prend la partie [1]
    const token = authHeader.split(' ')[1];

    try {
        // Étape 4 : Vérifier et décoder le token
      
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Étape 5 : Attacher les infos de l'utilisateur à la requête
        
        req.user = decoded; 

        // Étape 6 : Passer au middleware ou contrôleur suivant
        // next() dit à Express de continuer la chaîne des middlewares
        next();
    } catch (error) {
        // Si le token est invalide ou expiré, on rejette la requête
        return res.status(403).json({
            success: false,
            message: "Jeton invalide ou expiré. Veuillez vous reconnecter."
        });
    }
};

// Middleware checkRole - Vérification du rôle de l'utilisateur
// Ce middleware vérifie si l'utilisateur a le bon rôle pour accéder à une route


const checkRole = (allowedRoles) => {
    // checkRole retourne une fonction middleware (c'est un pattern de fonction qui retourne une fonction)
    return (req, res, next) => {
        // Étape 1 : Vérifier que verifyToken a été exécuté
        // Si req.user n'existe pas, c'est que verifyToken n'a pas été appelé
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: "Accès refusé. Profil utilisateur non identifié."
            });
        }

        // Étape 2 : Vérifier si le rôle de l'utilisateur est dans la liste des rôles autorisés
        // allowedRoles est un tableau comme ['admin'] ou ['admin', 'teacher']
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès interdit. Le rôle '${req.user.role}' n'a pas les privilèges requis.`
            });
        }

        // Étape 3 : Si le rôle est autorisé, on continue
        next();
    };
};

// Exportation des middlewares pour les utiliser dans les routes
export { verifyToken, checkRole };