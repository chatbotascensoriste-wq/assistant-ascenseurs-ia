// === CONFIGURATION APPLICATION IA ASCENSEURS ===
// Fichier de configuration pour la base de données et l'IA

const APP_CONFIG = {
    // Configuration de l'application
    APP_NAME: "Assistant IA Ascenseurs Pro",
    VERSION: "2.1",
    AUTHOR: "Votre Entreprise",
    
    // Configuration Base de Données MongoDB
    MONGODB_CONFIG: {
        URI: "À_REMPLACER_AVEC_VOTRE_URI_MONGODB", // Vous obtiendrez ça sur MongoDB Atlas
        DATABASE_NAME: "ascenseurs_ia",
        COLLECTIONS: {
            USERS: "utilisateurs",
            DOCUMENTS: "documents",
            DIAGNOSTICS: "diagnostics",
            PANNES: "pannes_apprises"
        }
    },
    
    // Configuration IA - Hugging Face (Gratuit)
    AI_CONFIG: {
        PROVIDER: "Hugging Face",
        MODELS: {
            TEXT_ANALYSIS: "distilbert-base-uncased",
            DOCUMENT_AI: "microsoft/layoutlm-base-uncased",
            SIMILARITY: "sentence-transformers/all-MiniLM-L6-v2"
        },
        API_KEY: "VOTRE_CLE_API_HUGGING_FACE" // Optionnel pour débuter
    },
    
    // Marques supportées
    BRANDS: ["Kone", "Thyssen", "Otis", "Schindler", "Sodimas", "Autre"],
    
    // Types de documents
    DOC_TYPES: [
        "manuel_technique",
        "schema_electrique", 
        "guide_depannage",
        "notice_installation",
        "plan_mecanique"
    ]
};

// === FONCTIONS DE GESTION DES DONNÉES ===

class DataManager {
    constructor() {
        this.isOnline = false;
        this.init();
    }
    
    async init() {
        // Tester la connexion à la base de données
        try {
            await this.testConnection();
            this.isOnline = true;
            console.log("✅ Connecté à la base de données");
        } catch (error) {
            console.log("⚠️ Mode hors ligne activé");
            this.loadLocalData();
        }
    }
    
    async testConnection() {
        // Simulation de test de connexion
        return new Promise((resolve) => {
            setTimeout(() => resolve(true), 1000);
        });
    }
    
    loadLocalData() {
        // Charger les données depuis le stockage local
        const localData = {
            users: JSON.parse(localStorage.getItem('ascenseurs_users')) || [],
            documents: JSON.parse(localStorage.getItem('ascenseurs_documents')) || [],
            diagnostics: JSON.parse(localStorage.getItem('ascenseurs_diagnostics')) || []
        };
        return localData;
    }
    
    saveLocalData(key, data) {
        // Sauvegarder localement
        localStorage.setItem(`ascenseurs_${key}`, JSON.stringify(data));
    }
    
    // Gestion des documents
    async addDocument(documentData) {
        const doc = {
            id: Date.now(),
            ...documentData,
            date_upload: new Date().toISOString(),
            uploaded_by: currentUser?.email || 'unknown'
        };
        
        // Sauvegarde locale
        const currentDocs = this.loadLocalData().documents;
        currentDocs.push(doc);
        this.saveLocalData('documents', currentDocs);
        
        return doc;
    }
    
    async getDocuments(brand = null) {
        const data = this.loadLocalData();
        if (brand) {
            return data.documents.filter(doc => doc.brand === brand);
        }
        return data.documents;
    }
    
    // Gestion des diagnostics
    async addDiagnostic(diagnosticData) {
        const diag = {
            id: Date.now(),
            ...diagnosticData,
            date: new Date().toISOString(),
            technicien: currentUser?.email || 'unknown',
            resolved: false
        };
        
        const currentDiags = this.loadLocalData().diagnostics;
        currentDiags.push(diag);
        this.saveLocalData('diagnostics', currentDiags);
        
        return diag;
    }
}

// === MOTEUR IA SIMPLIFIÉ ===

class SimpleAI {
    constructor() {
        this.knowledgeBase = [];
        this.learnedPatterns = [];
    }
    
    // Analyser un problème
    analyzeProblem(problemDescription) {
        const keywords = this.extractKeywords(problemDescription.toLowerCase());
        
        // Recherche dans la base de connaissances
        const solutions = this.findSimilarProblems(keywords);
        
        if (solutions.length > 0) {
            return {
                type: "SOLUTION_KNOWN",
                confidence: 0.85,
                solution: solutions[0].solution,
                reference: solutions[0].reference,
                steps: solutions[0].steps || []
            };
        } else {
            return {
                type: "NEW_PROBLEM",
                confidence: 0.3,
                message: "Nouveau type de problème détecté. L'IA va apprendre de cette intervention.",
                suggested_actions: [
                    "Vérifier les connexions électriques",
                    "Contrôler les capteurs de sécurité",
                    "Consulter le manuel de dépannage"
                ]
            };
        }
    }
    
    extractKeywords(text) {
        const commonWords = ['le', 'la', 'les', 'de', 'des', 'un', 'une', 'est', 'dans', 'avec'];
        const words = text.split(' ').filter(word => 
            word.length > 3 && !commonWords.includes(word)
        );
        return [...new Set(words)]; // Éviter les doublons
    }
    
    findSimilarProblems(keywords) {
        // Simulation de recherche - À remplacer par une vraie IA
        return this.knowledgeBase.filter(item => 
            keywords.some(keyword => 
                item.problem.toLowerCase().includes(keyword) ||
                item.solution.toLowerCase().includes(keyword)
            )
        );
    }
    
    // Apprentissage
    learnFromSolution(problem, solution, success) {
        const newPattern = {
            problem: problem.toLowerCase(),
            solution: solution,
            success_rate: success ? 1 : 0,
            learned_date: new Date().toISOString(),
            occurrences: 1
        };
        
        this.knowledgeBase.push(newPattern);
        console.log("🧠 IA: Nouvelle connaissance apprise:", newPattern);
    }
}

// === INITIALISATION GLOBALE ===
const dataManager = new DataManager();
const simpleAI = new SimpleAI();
let currentUser = null;

// Exporter pour utilisation globale
window.APP_CONFIG = APP_CONFIG;
window.dataManager = dataManager;
window.simpleAI = simpleAI;
window.currentUser = currentUser;
