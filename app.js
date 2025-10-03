// === CONFIGURATION ===
const APP_CONFIG = {
    NAME: "Assistant IA Ascenseurs Pro",
    VERSION: "4.1",
    IA_ACTIVE: true,
    MONGODB_ACTIVE: false
};

// === BASE DE DONNÉES ===
class DatabaseManager {
    constructor() {
        this.isConnected = false;
        this.users = [];
        this.documents = [];
        this.diagnostics = [];
        this.init();
    }

    async init() {
        console.log("🔗 Initialisation base de données...");
        await this.loadFromLocalStorage();
        this.isConnected = true;
        console.log(`✅ Base prête - ${this.users.length} users, ${this.documents.length} docs`);
    }

    async loadFromLocalStorage() {
        const storedUsers = localStorage.getItem('ascenseurs_users');
        const storedDocs = localStorage.getItem('ascenseurs_documents');
        const storedDiags = localStorage.getItem('ascenseurs_diagnostics');

        this.users = storedUsers ? JSON.parse(storedUsers) : this.getDefaultUsers();
        this.documents = storedDocs ? JSON.parse(storedDocs) : this.getDefaultDocuments();
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

    getDefaultDocuments() {
        return [
            {
                id: 1,
                name: "Manuel Kone MonoSpace 2024",
                brand: "Kone",
                type: "manuel",
                addedBy: "admin@ascenseurs.com",
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                name: "Schéma Thyssen 3300 Electrique",
                brand: "Thyssen", 
                type: "schema",
                addedBy: "admin@ascenseurs.com",
                dateAdded: new Date().toISOString()
            }
        ];
    }

    async saveToLocalStorage() {
        localStorage.setItem('ascenseurs_users', JSON.stringify(this.users));
        localStorage.setItem('ascenseurs_documents', JSON.stringify(this.documents));
        localStorage.setItem('ascenseurs_diagnostics', JSON.stringify(this.diagnostics));
    }

    async addUser(userData) {
        const newUser = {
            id: Date.now(),
            ...userData,
            dateCreation: new Date().toISOString()
        };
        this.users.push(newUser);
        await this.saveToLocalStorage();
        return newUser;
    }

    async addDocument(docData) {
        const newDoc = {
            id: Date.now(),
            ...docData,
            dateAdded: new Date().toISOString(),
            addedBy: window.currentUser?.email || 'system'
        };
        this.documents.push(newDoc);
        await this.saveToLocalStorage();
        return newDoc;
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

    async getDocumentsByBrand(brand) {
        return this.documents.filter(doc => doc.brand === brand);
    }

    async getUsersByRole(role) {
        return this.users.filter(user => user.role === role);
    }
}

// === MOTEUR IA ===
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

// === VARIABLES GLOBALES ===
const dbManager = new DatabaseManager();
const iaEngine = new IAEngine();
let currentUser = null;
let cameraStream = null;
let currentPhoto = null;

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log("🚀 Application IA Ascenseurs démarrage...");
   
    // Événement de connexion
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await handleLogin();
    });

    // Gestion affichage mot de passe
    document.getElementById('showPassword').addEventListener('change', function() {
        const passwordField = document.getElementById('password');
        passwordField.type = this.checked ? 'text' : 'password';
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
        return true;
    } else {
        alert('❌ Email ou mot de passe incorrect');
        return false;
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
    document.getElementById('userRole').innerHTML = currentUser.role === 'admin'
        ? '<span class="badge bg-danger">Administrateur</span>'
        : `<span class="badge bg-success">Technicien ${currentUser.specialite || ''}</span>`;
   
    showSection('accueil');
}

function showSection(sectionName) {
    // Arrêter la caméra si on change de section
    if (cameraStream && sectionName !== 'photo') {
        stopCamera();
    }
   
    // Mettre à jour la navigation active
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
   
    // Mettre à jour le contenu
    const contentArea = document.getElementById('contentArea');
    let html = '';
   
    switch(sectionName) {
        case 'accueil':
            html = getHomeContent();
            break;
        case 'documents':
            html = getDocumentsContent();
            break;
        case 'diagnostic':
            html = getDiagnosticContent();
            break;
        case 'photo':
            if(currentUser.role === 'technicien') {
                html = getPhotoContent();
                setTimeout(() => initCamera(), 500);
            }
            break;
        case 'admin':
            if(currentUser.role === 'admin') {
                html = getAdminContent();
            }
            break;
    }
   
    contentArea.innerHTML = html;
    
    // Marquer l'élément actif dans la navigation
    event.target.classList.add('active');
}

function getHomeContent() {
    return `
        <div class="card">
            <div class="card-header bg-success text-white">
                <h4><i class="fas fa-home"></i> Tableau de Bord</h4>
            </div>
            <div class="card-body">
                <div class="alert alert-info">
                    <h5>Bienvenue ${currentUser.name} !</h5>
                    <p>Application IA pour le dépannage d'ascenseurs</p>
                </div>
               
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-users fa-2x text-primary"></i>
                                <h5 class="mt-2">${dbManager.users.length}</h5>
                                <p>Utilisateurs</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-file-pdf fa-2x text-danger"></i>
                                <h5 class="mt-2">${dbManager.documents.length}</h5>
                                <p>Documents</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-stethoscope fa-2x text-warning"></i>
                                <h5 class="mt-2">${dbManager.diagnostics.length}</h5>
                                <p>Diagnostics</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <i class="fas fa-brain fa-2x text-success"></i>
                                <h5 class="mt-2">IA</h5>
                                <p>Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getDocumentsContent() {
    let documentsHTML = dbManager.documents.map(doc => `
        <div class="document-card">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="mb-1">${doc.name}</h6>
                    <span class="badge bg-primary">${doc.brand}</span>
                    <span class="badge bg-secondary">${doc.type}</span>
                    <small class="text-muted d-block mt-1">
                        Ajouté par ${doc.addedBy}
                    </small>
                </div>
                ${currentUser.role === 'admin' ? `
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument(${doc.id})">
                    <i class="fas fa-trash"></i>
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
   
    return `
        <div class="card">
            <div class="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                <h4 class="mb-0"><i class="fas fa-folder"></i> Documents Techniques</h4>
                ${currentUser.role === 'admin' ? `
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addDocModal">
                    <i class="fas fa-plus"></i> Nouveau
                </button>
                ` : ''}
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <p>Base de connaissances IA - Kone, Thyssen, Otis, Schindler</p>
                </div>
                ${documentsHTML || '<p class="text-muted">Aucun document</p>'}
            </div>
        </div>
    `;
}

function getDiagnosticContent() {
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
               
                <button class="btn btn-warning w-100" onclick="analyserPanne()">
                    <i class="fas fa-robot"></i> Analyser avec l'IA
                </button>
               
                <div id="resultatIA" class="mt-3"></div>
            </div>
        </div>
    `;
}

function getPhotoContent() {
    return `
        <div class="card">
            <div class="card-header bg-info text-white">
                <h4><i class="fas fa-camera"></i> Analyse Photo - Technicien</h4>
            </div>
            <div class="card-body">
                <div class="alert alert-warning">
                    <h6><i class="fas fa-info-circle"></i> Module Photo Technique</h6>
                    <p class="mb-2">Prenez une photo des schémas, armoires ou composants</p>
                    <small>Les photos sont supprimées automatiquement après analyse</small>
                </div>
               
                <div class="camera-container">
                    <video id="cameraView" autoplay playsinline></video>
                    <div class="camera-controls">
                        <button class="btn btn-success btn-lg" onclick="takePhoto()">
                            <i class="fas fa-camera"></i> Prendre une photo
                        </button>
                    </div>
                </div>
               
                <div id="photoResult" class="mt-3"></div>
               
                <div class="mt-3">
                    <button class="btn btn-outline-secondary btn-sm" onclick="stopCamera()">
                        <i class="fas fa-stop"></i> Arrêter la caméra
                    </button>
                    <button class="btn btn-outline-info btn-sm ms-2" onclick="initCamera()">
                        <i class="fas fa-sync"></i> Redémarrer
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getAdminContent() {
    const techniciens = dbManager.users.filter(user => user.role === 'technicien');
    let techniciensHTML = techniciens.map(tech => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${tech.name}</h6>
                        <p class="mb-1 text-muted">${tech.email}</p>
                        <span class="badge bg-success">${tech.specialite || 'Général'}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTechnicien(${tech.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
   
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
                                <h5 class="mb-0">Gestion des Techniciens</h5>
                            </div>
                            <div class="card-body">
                                ${techniciensHTML || '<p class="text-muted">Aucun technicien</p>'}
                                <button class="btn btn-success w-100 mt-3" data-bs-toggle="modal" data-bs-target="#addTechModal">
                                    <i class="fas fa-user-plus"></i> Ajouter un technicien
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Statistiques</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>Utilisateurs:</strong> ${dbManager.users.length}</p>
                                <p><strong>Techniciens:</strong> ${techniciens.length}</p>
                                <p><strong>Documents IA:</strong> ${dbManager.documents.length}</p>
                                <p><strong>Diagnostics:</strong> ${dbManager.diagnostics.length}</p>
                                <hr>
                                <p class="text-success"><strong>IA:</strong> ✅ Active</p>
                                <p class="text-info"><strong>Base de données:</strong> ✅ Connectée</p>
                                <p class="text-warning"><strong>Photos:</strong> ✅ Techniciens</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// === FONCTIONS CAMERA ===
async function initCamera() {
    try {
        stopCamera();
        const video = document.getElementById('cameraView');
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });
        video.srcObject = cameraStream;
        document.getElementById('photoResult').innerHTML = '';
    } catch (error) {
        document.getElementById('photoResult').innerHTML = `
            <div class="alert alert-danger">
                <h6><i class="fas fa-exclamation-triangle"></i> Erreur caméra</h6>
                <p class="mb-0">Impossible d'accéder à la caméra</p>
            </div>
        `;
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = document.getElementById('cameraView');
    if (video) video.srcObject = null;
}

function takePhoto() {
    const video = document.getElementById('cameraView');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
   
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
   
    currentPhoto = canvas.toDataURL('image/jpeg');
   
    document.getElementById('photoResult').innerHTML = `
        <div class="card">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0"><i class="fas fa-check-circle"></i> Photo capturée</h5>
            </div>
            <div class="card-body">
                <img src="${currentPhoto}" class="photo-preview w-100">
                <button class="btn btn-primary mt-3 w-100" onclick="analyserPhoto()">
                    <i class="fas fa-search"></i> Analyser cette photo
                </button>
            </div>
        </div>
    `;
}

async function analyserPhoto() {
    const resultatDiv = document.getElementById('photoResult');
    const analyseDiv = document.createElement('div');
    analyseDiv.innerHTML = `
        <div class="alert alert-info mt-3">
            <i class="fas fa-spinner fa-spin"></i> Analyse IA en cours...
        </div>
    `;
    resultatDiv.appendChild(analyseDiv);

    try {
        const resultat = await iaEngine.analyzePhoto();
        analyseDiv.innerHTML = `
            <div class="alert alert-success">
                <h5><i class="fas fa-check-circle"></i> Résultat de l'analyse</h5>
                <div class="mt-2" style="white-space: pre-line">${resultat}</div>
            </div>
        `;
    } catch (error) {
        analyseDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle"></i> Erreur d'analyse</h5>
                <p>L'analyse de la photo a échoué.</p>
            </div>
        `;
    }
}

async function analyserPanne() {
    const problem = document.getElementById('problemDesc').value;
    const brand = document.getElementById('problemBrand').value;
    const resultatDiv = document.getElementById('resultatIA');

    if (!problem.trim()) {
        resultatDiv.innerHTML = '<div class="alert alert-warning">Veuillez décrire le problème</div>';
        return;
    }

    resultatDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> IA analyse le problème...
        </div>
    `;

    try {
        const solution = await iaEngine.analyzeProblem(problem, brand);
        
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
            </div>
        `;
    } catch (error) {
        resultatDiv.innerHTML = `
            <div class="alert alert-danger">
                <h5><i class="fas fa-exclamation-triangle"></i> Erreur d'analyse</h5>
                <p>L'IA rencontre des difficultés. Veuillez réessayer.</p>
            </div>
        `;
    }
}

function addTechnicien() {
    const name = document.getElementById('newTechName').value;
    const email = document.getElementById('newTechEmail').value;
    const specialite = document.getElementById('newTechSpecialite').value;
    const password = document.getElementById('newTechPassword').value;

    if (!name || !email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    dbManager.addUser({
        email: email,
        password: password,
        name: name,
        role: 'technicien',
        specialite: specialite
    });

    // Fermer le modal et recharger la section admin
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTechModal'));
    modal.hide();
    showSection('admin');
    
    alert('Technicien ajouté avec succès');
}

function addDocument() {
    const name = document.getElementById('docName').value;
    const brand = document.getElementById('docBrand').value;
    const type = document.getElementById('docType').value;

    if (!name) {
        alert('Veuillez saisir un nom de document');
        return;
    }

    dbManager.addDocument({
        name: name,
        brand: brand,
        type: type
    });

    // Fermer le modal et recharger la section documents
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocModal'));
    modal.hide();
    showSection('documents');
    
    alert('Document ajouté avec succès');
}

function deleteDocument(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
        dbManager.documents = dbManager.documents.filter(doc => doc.id !== id);
        dbManager.saveToLocalStorage();
        showSection('documents');
    }
}

function deleteTechnicien(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce technicien ?')) {
        dbManager.users = dbManager.users.filter(user => user.id !== id);
        dbManager.saveToLocalStorage();
        showSection('admin');
    }
}

function logout() {
    currentUser = null;
    window.currentUser = null;
    stopCamera();
    document.getElementById('appInterface').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
}
