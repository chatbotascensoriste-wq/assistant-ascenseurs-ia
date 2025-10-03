// === CONFIGURATION APPLICATION ===
const APP_CONFIG = {
    NAME: "Assistant IA Ascenseurs Pro",
    VERSION: "4.0",
    IA_ACTIVE: true,
    MONGODB_ACTIVE: false, // Désactivé pour le moment
    REAL_IA: false
};

// === CONFIGURATION IA HUGGING FACE (Backup) ===
const IA_CONFIG = {
    API_KEY: "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",
    MODELS: {
        TEXT: "microsoft/DialoGPT-medium",
        IMAGE: "google/vit-base-patch16-224"
    }
};

console.log("✅ Configuration application chargée !");
