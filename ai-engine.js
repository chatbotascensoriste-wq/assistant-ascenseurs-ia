// === MOTEUR IA AVANCÉ POUR DÉPANNAGE ASCENSEURS ===

class AdvancedAIEngine {
    constructor() {
        this.modelLoaded = false;
        this.knowledgeBase = [];
        this.performanceStats = {
            totalDiagnostics: 0,
            successfulDiagnostics: 0,
            learningRate: 0,
            accuracy: 0
        };
        
        this.init();
    }
    
    async init() {
        console.log("🚀 Initialisation du moteur IA...");
        await this.loadKnowledgeBase();
        this.updatePerformanceStats();
    }
    
    // Charger la base de connaissances
    async loadKnowledgeBase() {
        try {
            // Exemples de connaissances de base pour l'IA
            this.knowledgeBase = [
                {
                    problem: "ascenseur bloqué entre deux étages",
                    solution: "Vérifier le système de sécurité et le limiteur de vitesse",
                    brand: "general",
                    confidence: 0.9,
                    steps: [
                        "Couper l'alimentation générale",
                        "Vérifier les capteurs de position",
                        "Contrôler le câblage du limiteur de vitesse",
                        "Redémarrer le système"
                    ]
                },
                {
                    problem: "portes qui ne se ferment pas",
                    solution: "Nettoyer et ajuster les capteurs de porte",
                    brand: "Kone",
                    confidence: 0.85,
                    steps: [
                        "Nettoyer les cellules photoélectriques",
                        "Vérifier l'alignement des portes",
                        "Contrôler les fins de course",
                        "Ajuster la temporisation de fermeture"
                    ]
                },
                {
                    problem: "bruits anormaux en fonctionnement",
                    solution: "Vérifier les roulements et guidages",
                    brand: "Thyssen",
                    confidence: 0.8,
                    steps: [
                        "Inspecter les roulements du moteur",
                        "Vérifier l'état des guides",
                        "Contrôler la tension des câbles",
                        "Lubrifier les parties mécaniques"
                    ]
                }
            ];
            
            console.log("✅ Base de connaissances chargée:", this.knowledgeBase.length, "connaissances");
        } catch (error) {
            console.error("❌ Erreur chargement base connaissances:", error);
        }
    }
    
    // Analyser un problème avec l'IA
    async analyzeProblem(problemDescription, brand = null) {
        this.performanceStats.totalDiagnostics++;
        
        console.log(`🔍 IA analyse: "${problemDescription}"${brand ? ` (Marque: ${brand})` : ''}`);
        
        // Simulation du traitement par l'IA
        const analysisResult = await this.simulateAIAnalysis(problemDescription, brand);
        
        return analysisResult;
    }
    
    async simulateAIAnalysis(problem, brand) {
        // Simulation du temps d'analyse de l'IA
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const problemLower = problem.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;
        
        // Recherche de correspondances dans la base de connaissances
        this.knowledgeBase.forEach(knowledge => {
            if (brand && knowledge.brand !== 'general' && knowledge.brand !== brand) {
                return; // Ignorer si marque spécifique ne correspond pas
            }
            
            const score = this.calculateMatchScore(problemLower, knowledge.problem);
            if (score > highestScore && score > 0.3) {
                highestScore = score;
                bestMatch = { ...knowledge, matchScore: score };
            }
        });
        
        if (bestMatch) {
            this.performanceStats.successfulDiagnostics++;
            this.updatePerformanceStats();
            
            return {
                success: true,
                type: "KNOWN_PROBLEM",
                confidence: bestMatch.matchScore,
                solution: bestMatch.solution,
                recommendedSteps: bestMatch.steps,
                brand: bestMatch.brand,
                similarProblems: this.findSimilarProblems(problemLower),
                message: `🧠 IA: Problème reconnu avec ${Math.round(bestMatch.matchScore * 100)}% de confiance`
            };
        } else {
            return {
                success: false,
                type: "NEW_PROBLEM",
                confidence: 0.25,
                recommendedSteps: [
                    "Documenter précisément le problème",
                    "Prendre des photos du panneau de contrôle",
                    "Vérifier les logs d'erreurs",
                    "Contacter le support technique"
                ],
                message: "🧠 IA: Nouveau type de problème détecté - L'IA va apprendre de votre intervention",
                learningOpportunity: true
            };
        }
    }
    
    // Calculer le score de correspondance
    calculateMatchScore(problem, knowledge) {
        const problemWords = new Set(problem.split(' ').filter(w => w.length > 3));
        const knowledgeWords = new Set(knowledge.split(' ').filter(w => w.length > 3));
        
        let matches = 0;
        problemWords.forEach(word => {
            if (knowledgeWords.has(word)) matches++;
        });
        
        const totalUniqueWords = new Set([...problemWords, ...knowledgeWords]).size;
        return matches / totalUniqueWords;
    }
    
    // Trouver des problèmes similaires
    findSimilarProblems(problem) {
        return this.knowledgeBase
            .map(k => ({
                problem: k.problem,
                solution: k.solution,
                score: this.calculateMatchScore(problem, k.problem)
            }))
            .filter(k => k.score > 0.2)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }
    
    // Apprentissage de l'IA
    async learnFromExperience(problem, solution, success, brand = null) {
        const newKnowledge = {
            problem: problem.toLowerCase(),
            solution: solution,
            brand: brand || 'general',
            confidence: success ? 0.9 : 0.6,
            steps: solution.split('. ').filter(step => step.length > 10),
            learnedDate: new Date().toISOString(),
            success: success
        };
        
        this.knowledgeBase.push(newKnowledge);
        console.log("🧠 IA: Nouvelle connaissance apprise:", newKnowledge);
        
        // Mettre à jour les statistiques
        this.updatePerformanceStats();
        
        // Sauvegarder l'apprentissage
        this.saveLearning(newKnowledge);
        
        return newKnowledge;
    }
    
    saveLearning(knowledge) {
        try {
            const currentLearnings = JSON.parse(localStorage.getItem('ia_learnings')) || [];
            currentLearnings.push(knowledge);
            localStorage.setItem('ia_learnings', JSON.stringify(currentLearnings));
        } catch (error) {
            console.error("Erreur sauvegarde apprentissage:", error);
        }
    }
    
    // Mettre à jour les statistiques de performance
    updatePerformanceStats() {
        this.performanceStats.learningRate = this.knowledgeBase.length;
        this.performanceStats.accuracy = this.performanceStats.totalDiagnostics > 0 
            ? this.performanceStats.successfulDiagnostics / this.performanceStats.totalDiagnostics 
            : 0;
    }
    
    // Obtenir les statistiques de l'IA
    getStats() {
        return {
            ...this.performanceStats,
            knowledgeBaseSize: this.knowledgeBase.length,
            accuracyPercentage: Math.round(this.performanceStats.accuracy * 100)
        };
    }
    
    // Recherche dans les documents
    async searchInDocuments(query, brand = null) {
        // Simulation de recherche sémantique
        const results = this.knowledgeBase.filter(doc => {
            const searchText = `${doc.problem} ${doc.solution}`.toLowerCase();
            return searchText.includes(query.toLowerCase()) && 
                   (!brand || doc.brand === brand || doc.brand === 'general');
        });
        
        return results;
    }
}

// === INTÉGRATION AVEC HUGGING FACE (Optionnel - pour l'évolution) ===

class HuggingFaceIntegration {
    constructor() {
        this.available = false;
        this.testConnection();
    }
    
    async testConnection() {
        try {
            // Test simple de connexion à l'API Hugging Face
            const response = await fetch('https://huggingface.co/api/models');
            this.available = response.ok;
            console.log(this.available ? "✅ Hugging Face disponible" : "❌ Hugging Face non disponible");
        } catch (error) {
            console.log("❌ Hugging Face non accessible - Mode local activé");
            this.available = false;
        }
    }
    
    async analyzeWithAI(text) {
        if (!this.available) {
            return this.localAnalysis(text);
        }
        
        // Ici, vous pourriez intégrer l'API Hugging Face
        // Pour l'instant, nous utilisons l'analyse locale
        return this.localAnalysis(text);
    }
    
    localAnalysis(text) {
        // Analyse sémantique simple
        return {
            entities: this.extractEntities(text),
            urgency: this.detectUrgency(text),
            suggested_category: this.categorizeProblem(text)
        };
    }
    
    extractEntities(text) {
        const entities = [];
        const words = text.toLowerCase().split(' ');
        
        // Détection simple d'entités
        if (words.some(w => ['bloqué', 'arrêté', 'immobile'].includes(w))) entities.push('BLOCAGE');
        if (words.some(w => ['bruit', 'grincement', 'vibration'].includes(w))) entities.push('BRUIT');
        if (words.some(w => ['porte', 'ouverture', 'fermeture'].includes(w))) entities.push('PORTE');
        if (words.some(w => ['étage', 'niveau', 'palier'].includes(w))) entities.push('POSITION');
        
        return entities;
    }
    
    detectUrgency(text) {
        const urgentWords = ['bloqué', 'urgence', 'danger', 'arrêt', 'immobile'];
        return urgentWords.some(word => text.toLowerCase().includes(word)) ? 'HIGH' : 'MEDIUM';
    }
    
    categorizeProblem(text) {
        if (text.includes('porte')) return 'SYSTÈME_PORTES';
        if (text.includes('bloqué')) return 'BLOCAGE_ASCENSEUR';
        if (text.includes('bruit')) return 'PROBLÈME_MÉCANIQUE';
        if (text.includes('électrique')) return 'PANNE_ÉLECTRIQUE';
        return 'AUTRE';
    }
}

// === INITIALISATION ===
const aiEngine = new AdvancedAIEngine();
const hfIntegration = new HuggingFaceIntegration();

// Exporter pour utilisation globale
window.aiEngine = aiEngine;
window.hfIntegration = hfIntegration;

console.log("🚀 Moteur IA ascenseurs initialisé!");
