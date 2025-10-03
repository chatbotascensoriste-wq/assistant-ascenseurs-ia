// === MOTEUR IA CORRIGÉ ===
class IAEngine {
    constructor() {
        this.isAnalyzing = false;
        this.analysisCount = 0;
    }

    async analyzeProblem(problem, brand = null) {
        if (this.isAnalyzing) {
            return "⚠️ L'IA est déjà en train d'analyser un problème...";
        }

        this.isAnalyzing = true;
        this.analysisCount++;
        
        console.log(`🔍 IA analyse: "${problem}" pour ${brand}`);
        
        // Simulation du temps d'analyse
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const solution = this.getExpertSolution(problem, brand);
        this.isAnalyzing = false;
        
        return solution;
    }

    getExpertSolution(problem = "", brand = null) {
        const problems = {
            "bloque": `🚨 **Ascenseur bloqué** - ${brand || 'Marque'} 
• Vérifier l'alimentation secteur
• Contrôler les limites de fin de course
• Inspecter le frein de sécurité
• Vérifier les capteurs de porte`,

            "porte": `🚪 **Problème de porte** - ${brand || 'Marque'}
• Nettoyer les rails de guidage
• Ajuster les capteurs de sécurité  
• Vérifier le moteur d'entraînement
• Contrôler la temporisation`,

            "bruit": `🔊 **Bruits anormaux** - ${brand || 'Marque'}
• Serrer les fixations mécaniques
• Lubrifier les guides
• Vérifier les poulies et câbles
• Contrôler le groupe hydraulique`,

            "alarme": `🚨 **Alarme active** - ${brand || 'Marque'}
• Vérifier le bouton d'alarme
• Contrôler les capteurs de sécurité
• Tester la batterie de secours
• Inspecter le tableau de commande`
        };

        const problemLower = problem.toLowerCase();
        let foundSolution = null;

        for (const [key, solution] of Object.entries(problems)) {
            if (problemLower.includes(key)) {
                foundSolution = solution;
                break;
            }
        }

        if (!foundSolution) {
            foundSolution = `🔧 **Diagnostic général** - ${brand || 'Marque'}
• Vérifier l'alimentation électrique
• Contrôler le tableau de commande
• Inspecter les capteurs de sécurité
• Tester les fonctions de base
• Consulter le manuel technique spécifique`;
        }

        // Ajouter des documents pertinents
        const documents = this.getRelevantDocuments(problem, brand);
        if (documents) {
            foundSolution += `\n\n📚 **Documents recommandés:**\n${documents}`;
        }

        return foundSolution;
    }

    getRelevantDocuments(problem, brand) {
        const docs = [];
        
        if (problem.includes('electri') || problem.includes('courant')) {
            docs.push("• Schéma électrique principal");
        }
        
        if (problem.includes('program') || problem.includes('controle')) {
            docs.push("• Manuel de programmation");
        }
        
        if (brand) {
            docs.push(`• Manuel technique ${brand}`);
        }
        
        return docs.length > 0 ? docs.join('\n') : "• Manuel d'entretien général";
    }

    async analyzePhoto() {
        if (this.isAnalyzing) {
            return "⚠️ Analyse d'image déjà en cours...";
        }

        this.isAnalyzing = true;
        console.log("📸 Analyse photo en cours...");
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const analyses = [
            "🔍 **Analyse photo terminée**\n• Composants électriques détectés\n• Câblage apparemment correct\n• Vérifier les connexions marquées en rouge",
            "🔍 **Analyse schéma**\n• Schéma technique identifié\n• Points de test recommandés\n• Vérifier les relais K5 et K6",
            "🔍 **Analyse mécanique**\n• Usure normale détectée\n• Vérifier la tension des câbles\n• Contrôler l'alignement des guides"
        ];
        
        this.isAnalyzing = false;
        return analyses[Math.floor(Math.random() * analyses.length)];
    }
}
