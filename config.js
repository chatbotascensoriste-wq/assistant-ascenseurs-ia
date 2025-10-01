// === CONFIGURATION MONGODB ATLAS ===
const MONGODB_CONFIG = {
    URI: "mongodb+srv://ascenseurs_admin:portdebouc.13@cluster0.j9ruhhe.mongodb.net/ascenseurs?retryWrites=true&w=majority",
    DATABASE_NAME: "ascenseurs",
    COLLECTIONS: {
        USERS: "utilisateurs",
        DOCUMENTS: "documents_techniques",
        DIAGNOSTICS: "diagnostics_pannes"
    }
};

// === CONFIGURATION APPLICATION ===
const APP_CONFIG = {
    NAME: "Assistant IA Ascenseurs Pro",
    VERSION: "3.0",
    AUTHOR: "Votre Entreprise",
    IA_ACTIVE: true,
    MONGODB_ACTIVE: true,
    
    // Marques supportées
    BRANDS: ["Kone", "Thyssen", "Otis", "Schindler", "Sodimas"],
    
    // Types de documents
    DOC_TYPES: [
        "manuel_technique",
        "schema_electrique", 
        "guide_depannage",
        "notice_installation",
        "plan_mecanique"
    ]
};

console.log("✅ Configuration MongoDB chargée - Cluster connecté");
