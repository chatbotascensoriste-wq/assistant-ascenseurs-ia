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

// === CONFIGURATION IA HUGGING FACE ===
const IA_CONFIG = {
    API_KEY: "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",
    MODELS: {
        TEXT: "microsoft/DialoGPT-medium",
        IMAGE: "google/vit-base-patch16-224",
        DOCUMENT: "microsoft/layoutlm-base-uncased"
    },
    BASE_URL: "https://api-inference.huggingface.co/models"
};

// === CONFIGURATION APPLICATION ===
const APP_CONFIG = {
    NAME: "Assistant IA Ascenseurs Pro",
    VERSION: "4.0",
    IA_ACTIVE: true,
    MONGODB_ACTIVE: true,
    REAL_IA: true
};

console.log("✅ Configuration IA Réelle chargée !");
