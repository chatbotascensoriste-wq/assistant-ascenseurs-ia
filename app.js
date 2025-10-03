// === APPLICATION PRINCIPALE CORRIGÉE ===
class DatabaseManager {
    constructor() {
        this.users = [];
        this.diagnostics = [];
        this.init();
    }

    async init() {
        console.log("🔗 Initialisation base de données locale...");
        await this.loadFromLocalStorage();
    }

    async loadFromLocalStorage() {
        const storedUsers = localStorage.getItem('ascenseurs_users');
        const storedDiags = localStorage.getItem('ascenseurs_diagnostics');

        this.users = storedUsers ? JSON.parse(storedUsers) : this.getDefaultUsers();
        this.diagnostics = storedDiags ? JSON.parse(storedDiags) : [];
    }

    getDefaultUsers() {
        return [
            {
                id: 1,
                email: "admin@ascenseurs.com",
                password: "Admin2024!",
                name: "Administrateur Principal",
                role: "admin",
                dateCreation: new Date().toISOString()
            },
            {
                id: 2,
                email: "tech1@ascenseurs.com",
                password: "Tech123!",
                name: "Technicien Kone",
                role: "technicien",
                specialite: "Kone",
                dateCreation: new Date().toISOString()
            }
        ];
    }

    async saveToLocalStorage() {
        localStorage.setItem('ascenseurs_users', JSON.stringify(this.users));
        localStorage.setItem('ascenseurs_diagnostics', JSON.stringify(this.diagnostics));
    }

    async addDiagnostic(diagData) {
        const newDiag = {
            id: Date.now(),
            ...diagData,
            date: new Date().toISOString(),
            technicien: window.currentUser?.name || 'unknown',
            resolved: false
        };
        this.diagnostics.push(newDiag);
        await this.saveToLocalStorage();
        return newDiag;
    }
}

// === GESTIONNAIRE D'INTERFACE ===
class InterfaceManager {
    constructor() {
        this.currentSection = 'accueil';
    }

    showSection(section) {
        console.log(`🔄 Changement section: ${section}`);
        
        // Mise à jour navigation
        document.querySelectorAll('#mainNav .list-group-item').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`#mainNav [data-section="${section}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentSection = section;
        this.loadSectionContent(section);
    }

    async loadSectionContent(section) {
        const contentArea = document.getElementById('contentArea');
        
        // Afficher loader
        contentArea.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="mt-2">Chargement de la section...</p>
                </div>
            </div>
        `;

        try {
            let html = '';
            
            switch(section) {
                case 'accueil':
                    html = await this.getHomeContent();
                    break;
                case 'documents':
                    html = await this.getDocumentsContent();
                    break;
                case 'diagnostic':
                    html = await this.getDiagnosticContent();
                    break;
                case 'photo':
                    if(currentUser.role === 'technicien') {
                        html = this.getPhotoContent();
                    }
                    break;
                case 'admin':
                    if(currentUser.role === 'admin') {
                        html = await this.getAdminContent();
                    }
                    break;
            }
            
            contentArea.innerHTML = html;
            
            // Initialiser les composants spécifiques
            if (section === 'photo' && currentUser.role === 'technicien') {
                setTimeout(() => initCamera(), 100);
            }
            
        } catch (error) {
            console.error('❌ Erreur chargement section:', error);
            contentArea.innerHTML = `
                <div class="alert alert-danger">
                    <h5><i class="fas fa-exclamation-triangle"></i> Erreur de chargement</h5>
                    <p>Impossible de charger la section ${section}</p>
                </div>
            `;
        }
    }

    async getDocumentsContent() {
        if (!googleDriveService.isAuthenticated) {
            return `
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h4 class="mb-0"><i class="fas fa-folder"></i> Documents Techniques</h4>
                    </div>
                    <div class="card-body text-center">
                        <div class="alert alert-warning">
                            <h5><i class="fab fa-google-drive"></i> Connexion requise</h5>
                            <p>Veuillez vous connecter à Google Drive pour accéder aux documents techniques.</p>
                            <button class="btn btn-success" onclick="initGoogleDrive()">
                                <i class="fab fa-google"></i> Se connecter à Google Drive
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        try {
            const documents = await googleDriveService.listDocuments();
            
            let documentsHTML = '';
            if (documents.length > 0) {
                documentsHTML = documents.map(doc => `
                    <div class="document-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="mb-1">${doc.name}</h6>
                                <span class="badge bg-info">${doc.mimeType}</span>
                                <small class="text-muted d-block mt-1">
                                    Créé le: ${new Date(doc.createdTime).toLocaleDateString()}
                                </small>
                                ${doc.webViewLink ? `
                                    <a href="${doc.webViewLink}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">
                                        <i class="fas fa-external-link-alt"></i> Ouvrir dans Drive
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                documentsHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <p class="text-muted">Aucun document dans Google Drive</p>
                        <button class="btn btn-primary" onclick="showAddDocumentModal()">
                            <i class="fas fa-plus"></i> Ajouter le premier document
                        </button>
                    </div>
                `;
            }

            return `
                <div class="card">
                    <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                        <h4 class="mb-0"><i class="fas fa-folder"></i> Documents Techniques</h4>
                        <div>
                            <button class="btn btn-success btn-sm me-2" onclick="showAddDocumentModal()">
                                <i class="fas fa-plus"></i> Nouveau
                            </button>
                            <button class="btn btn-outline-primary btn-sm" onclick="refreshDocuments()">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <p>Documents stockés sur Google Drive - Accès sécurisé</p>
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle"></i> Synchronisé avec Google Drive
                            </div>
                        </div>
                        ${documentsHTML}
                    </div>
                </div>
            `;
        } catch (error) {
            return `
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h4 class="mb-0"><i class="fas fa-folder"></i> Documents Techniques</h4>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-danger">
                            <h5><i class="fas fa-exclamation-triangle"></i> Erreur de chargement</h5>
                            <p>Impossible de charger les documents depuis Google Drive.</p>
                            <button class="btn btn-warning" onclick="googleDriveService.handleAuthClick()">
                                <i class="fab fa-google"></i> Réauthentifier
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async getDiagnosticContent() {
        return `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4><i class="fas fa-stethoscope"></i> Diagnostic IA</h4>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">Description de la panne</label>
                        <textarea class="form-control" id="problemDesc" rows="4"
                                  placeholder="Décrivez le problème en détail..."></textarea>
                    </div>
                   
                    <div class="mb-3">
                        <label class="form-label">Marque concernée</label>
                        <select class="form-select" id="problemBrand">
                            <option value="Kone">Kone</option>
                            <option value="Thyssen">Thyssen</option>
                            <option value="Otis">Otis</option>
                            <option value="Schindler">Schindler</option>
                        </select>
                    </div>
                   
                    <button class="btn btn-warning w-100" onclick="analyserPanne()" id="analyzeBtn">
                        <i class="fas fa-robot"></i> Analyser avec l'IA
                    </button>
                   
                    <div id="resultatIA" class="mt-3"></div>
                </div>
            </div>
        `;
    }

    async getAdminContent() {
        const documents = await googleDriveService.listDocuments();
        
        return `
            <div class="card">
                <div class="card-header bg-danger text-white">
                    <h4><i class="fas fa-crown"></i> Espace Administrateur</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0"><i class="fab fa-google-drive"></i> Statistiques Drive</h5>
                                </div>
                                <div class="card-body">
                                    <p><strong>Documents stockés:</strong> ${documents.length}</p>
                                    <p><strong>Dossier:</strong> ${googleDriveService.APP_FOLDER_NAME}</p>
                                    <p><strong>Statut:</strong> <span class="text-success">Connecté</span></p>
                                    <hr>
                                    <button class="btn btn-outline-primary btn-sm" onclick="googleDriveService.ensureAppFolder()">
                                        <i class="fas fa-sync"></i> Vérifier le dossier
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getHomeContent() {
        return `
            <div class="card">
                <div class="card-header bg-success text-white">
                    <h4><i class="fas fa-home"></i> Tableau de Bord</h4>
                </div>
                <div class="card-body">
                    <div class="alert alert-info">
                        <h5>Bienvenue ${currentUser.name} !</h5>
                        <p>Google Drive connecté - IA active</p>
                    </div>
                   
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <i class="fab fa-google-drive fa-2x text-success"></i>
                                    <h5 class="mt-2" id="driveDocCount">...</h5>
                                    <p>Documents Drive</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// === INITIALISATION GLOBALE ===
const dbManager = new DatabaseManager();
const iaEngine = new IAEngine();
const interfaceManager = new InterfaceManager();
let currentUser = null;

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log("🚀 Application IA Ascenseurs démarrage...");
   
    // Initialisation Google Drive
    await googleDriveService.initGoogleDrive();
   
    // Configuration navigation
    document.getElementById('mainNav').addEventListener('click', (e) => {
        const target = e.target.closest('[data-section]');
        if (target) {
            const section = target.getAttribute('data-section');
            interfaceManager.showSection(section);
        }
    });

    // Événement de connexion
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleLogin();
    });

    console.log("✅ Application initialisée");
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const user = dbManager.users.find(u => u.email === email && u.password === password);
   
    if (user) {
        currentUser = user;
        window.currentUser = user;
        showAppInterface();
    } else {
        alert('❌ Email ou mot de passe incorrect');
    }
}

function showAppInterface() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appInterface').style.display = 'block';
   
    if (currentUser.role === 'admin') {
        document.getElementById('adminNavBtn').style.display = 'block';
        document.getElementById('userBadge').innerHTML = '<span class="admin-badge">👑 ADMIN</span>';
    } else {
        document.getElementById('photoNavBtn').style.display = 'block';
        document.getElementById('userBadge').innerHTML = '<span class="tech-badge">🔧 TECHNICIEN</span>';
    }
   
    document.getElementById('userName').textContent = currentUser.name;
    
    // Affichage section accueil
    interfaceManager.showSection('accueil');
}

// Fonctions globales
async function analyserPanne() {
    const problem = document.getElementById('problemDesc').value;
    const brand = document.getElementById('problemBrand').value;
    const resultatDiv = document.getElementById('resultatIA');
    const analyzeBtn = document.getElementById('analyzeBtn');

    if (!problem.trim()) {
        resultatDiv.innerHTML = '<div class="alert alert-warning">Veuillez décrire le problème</div>';
        return;
    }

    // Désactiver le bouton pendant l'analyse
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse en cours...';

    resultatDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> IA analyse le problème...
        </div>
    `;

    try {
        const solution = await iaEngine.analyzeProblem(problem, brand);
        
        // Recherche de documents pertinents dans Drive
        const relevantDocs = await googleDriveService.searchDocuments(problem, brand);
        
        let docsHTML = '';
        if (relevantDocs.length > 0) {
            docsHTML = `
                <div class="mt-3">
                    <h6>📚 Documents pertinents trouvés:</h6>
                    ${relevantDocs.map(doc => `
                        <div class="document-link">
                            <a href="${doc.webViewLink}" target="_blank">${doc.name}</a>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Sauvegarder le diagnostic
        await dbManager.addDiagnostic({
            problem: problem,
            brand: brand,
            solution: solution
        });

        resultatDiv.innerHTML = `
            <div class="alert alert-success">
                <h5><i class="fas fa-check-circle"></i> Diagnostic complet</h5>
                <div class="mt-2" style="white-space: pre-line">${solution}</div>
                ${docsHTML}
            </div>
        `;
    } catch (error) {
        resultatDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle"></i> Erreur d'analyse</h5>
                <p>L'IA rencontre des difficultés. Veuillez réessayer.</p>
            </div>
        `;
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-robot"></i> Analyser avec l\'IA';
    }
}

function logout() {
    currentUser = null;
    window.currentUser = null;
    document.getElementById('appInterface').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

// Initialisation Google Drive
async function initGoogleDrive() {
    await googleDriveService.handleAuthClick();
}

// Rafraîchissement documents
async function refreshDocuments() {
    await interfaceManager.loadSectionContent('documents');
}
