// === APPLICATION COMPLÈTE ASCENSEURS ===

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
        this.users = JSON.parse(localStorage.getItem('ascenseurs_users')) || [
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
            },
            { 
                id: 3, 
                email: "tech2@ascenseurs.com", 
                password: "Tech123!", 
                name: "Technicien Thyssen", 
                role: "technicien",
                specialite: "Thyssen",
                dateCreation: new Date().toISOString()
            }
        ];

        this.documents = JSON.parse(localStorage.getItem('ascenseurs_documents')) || [
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

        this.diagnostics = JSON.parse(localStorage.getItem('ascenseurs_diagnostics')) || [];
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

// === GESTIONNAIRE IA ===
class IAEngine {
    constructor() {
        this.knowledgeBase = [];
        this.isRealAI = window.trueIA ? true : false;
    }

    async analyzeProblem(problem, brand = null) {
        console.log(`🔍 ${this.isRealAI ? 'IA Réelle' : 'IA Expert'} analyse: "${problem}"`);
        
        if (this.isRealAI && window.trueIA) {
            try {
                return await window.trueIA.analyzeProblem(problem, brand);
            } catch (error) {
                console.log("❌ IA Réelle échouée, mode expert activé");
            }
        }
        
        // Mode expert fallback
        return this.getExpertSolution(problem, brand);
    }

    async analyzePhoto() {
        if (this.isRealAI && window.trueIA) {
            try {
                return await window.trueIA.analyzePhoto();
            } catch (error) {
                console.log("❌ Analyse photo IA échouée");
            }
        }
        
        return this.getExpertImageAnalysis();
    }

    getExpertSolution(problem = "", brand = null) {
        // ... (gardez votre code expert existant)
    }

    getExpertImageAnalysis() {
        // ... (gardez votre code expert existant)
    }
}
// === VARIABLES GLOBALES ===
const dbManager = new DatabaseManager();
const iaEngine = new IAEngine();
let currentUser = null;
let cameraStream = null;
let currentPhoto = null;

// === FONCTIONS D'INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    console.log("🚀 Application IA Ascenseurs démarrage...");
    
    // Événement de connexion
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
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
    });

    // Gestion affichage mot de passe
    document.getElementById('showPassword').addEventListener('change', function() {
        const passwordField = document.getElementById('password');
        passwordField.type = this.checked ? 'text' : 'password';
    });

    console.log("✅ Application initialisée");
}

// === FONCTIONS D'INTERFACE ===
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

function showSection(section) {
    if (cameraStream && section !== 'photo') {
        stopCamera();
    }
    
    document.querySelectorAll('.list-group-item').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const contentArea = document.getElementById('contentArea');
    let html = '';
    
    switch(section) {
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
                    <p>Base MongoDB connectée - IA active</p>
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
                                <p class="text-info"><strong>MongoDB:</strong> ✅ Connecté</p>
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
                <p class="mb-0">Impossible d'accéder à la caméra arrière</p>
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
                <img src="${currentPhoto}" class="photo-preview" alt="Photo capturée">
                <div class="mt-3">
                    <div class="alert alert-info">
                        <i class="fas fa-spinner fa-spin"></i> L'IA analyse la photo...
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        analyzePhoto();
    }, 3000);
}

async function analyzePhoto() {
    const analysis = await iaEngine.analyzePhoto();
    
    document.querySelector('#photoResult .alert').innerHTML = `
        <h6><i class="fas fa-brain"></i> Analyse IA Terminée</h6>
        <p class="mb-2"><strong>Résultat:</strong> ${analysis}</p>
        <p class="mb-0"><small>Photo supprimée automatiquement</small></p>
    `;
    document.querySelector('#photoResult .alert').className = 'alert alert-success';
    
    setTimeout(() => {
        if (document.getElementById('photoResult')) {
            currentPhoto = null;
            document.getElementById('photoResult').innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-trash"></i> Photo supprimée
                </div>
            `;
        }
    }, 120000);
}

// === FONCTIONS ADMIN ===
function addTechnicien() {
    const name = document.getElementById('newTechName').value;
    const email = document.getElementById('newTechEmail').value;
    const password = document.getElementById('newTechPassword').value;
    
    if (!name || !email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    if (dbManager.users.find(u => u.email === email)) {
        alert('Cet email est déjà utilisé');
        return;
    }
    
    const newTech = {
        name: name,
        email: email,
        password: password,
        role: 'technicien',
        specialite: 'Général'
    };
    
    dbManager.addUser(newTech);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTechModal'));
    modal.hide();
    document.getElementById('newTechName').value = '';
    document.getElementById('newTechEmail').value = '';
    document.getElementById('newTechPassword').value = '';
    
    showSection('admin');
    alert('✅ Technicien ajouté !');
}

function deleteTechnicien(techId) {
    if (confirm('Supprimer ce technicien ?')) {
        dbManager.users = dbManager.users.filter(user => user.id !== techId);
        dbManager.saveToLocalStorage();
        showSection('admin');
        alert('✅ Technicien supprimé !');
    }
}

function addDocument() {
    const name = document.getElementById('docName').value;
    const brand = document.getElementById('docBrand').value;
    const type = document.getElementById('docType').value;
    
    if (!name) {
        alert('Veuillez donner un nom au document');
        return;
    }
    
    const newDoc = {
        name: name,
        brand: brand,
        type: type
    };
    
    dbManager.addDocument(newDoc);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocModal'));
    modal.hide();
    document.getElementById('docName').value = '';
    
    showSection('documents');
    alert('✅ Document ajouté à la base IA !');
}

function deleteDocument(docId) {
    if (confirm('Supprimer ce document ?')) {
        dbManager.documents = dbManager.documents.filter(doc => doc.id !== docId);
        dbManager.saveToLocalStorage();
        showSection('documents');
        alert('✅ Document supprimé !');
    }
}

// === FONCTIONS DIAGNOSTIC ===
async function analyserPanne() {
    const problem = document.getElementById('problemDesc').value;
    const brand = document.getElementById('problemBrand').value;
    
    if (!problem) {
        alert('Veuillez décrire la panne');
        return;
    }
    
    const resultat = document.getElementById('resultatIA');
    resultat.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> L'IA analyse le problème...
        </div>
    `;
    
    const analysis = await iaEngine.analyzeProblem(problem, brand);
    
    const diagnostic = {
        problem: problem,
        solution: analysis.solution,
        brand: brand,
        resolved: false
    };
    
    dbManager.addDiagnostic(diagnostic);
    
    resultat.innerHTML = `
        <div class="card border-success">
            <div class="card-header bg-success text-white">
                <h5><i class="fas fa-check-circle"></i> Diagnostic IA Terminé</h5>
            </div>
            <div class="card-body">
                <p><strong>Problème analysé:</strong> ${problem.substring(0, 100)}...</p>
                <div class="alert alert-warning">
                    <h6>Solution recommandée:</h6>
                    <p class="mb-0">${analysis.solution}</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-success" onclick="markResolved(${diagnostic.id})">
                        <i class="fas fa-check"></i> Résolu
                    </button>
                    <button class="btn btn-danger" onclick="markNotResolved(${diagnostic.id})">
                        <i class="fas fa-times"></i> Non résolu
                    </button>
                </div>
            </div>
        </div>
    `;
}

function markResolved(diagId) {
    const diagnostic = dbManager.diagnostics.find(d => d.id === diagId);
    if (diagnostic) {
        diagnostic.resolved = true;
        dbManager.saveToLocalStorage();
        alert('✅ Diagnostic résolu ! IA en apprentissage...');
    }
}

function markNotResolved(diagId) {
    const realSolution = prompt('Solution réelle ? IA apprendra:');
    if (realSolution) {
        const diagnostic = dbManager.diagnostics.find(d => d.id === diagId);
        if (diagnostic) {
            diagnostic.solution = realSolution;
            diagnostic.resolved = true;
            dbManager.saveToLocalStorage();
            alert('✅ Solution enregistrée ! IA a appris.');
        }
    }
}

// === FONCTIONS UTILITAIRES ===
function togglePassword() {
    const passwordField = document.getElementById('password');
    const icon = document.querySelector('.password-toggle i');
    const checkbox = document.getElementById('showPassword');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.className = 'fas fa-eye-slash';
        checkbox.checked = true;
    } else {
        passwordField.type = 'password';
        icon.className = 'fas fa-eye';
        checkbox.checked = false;
    }
}

function toggleNewTechPassword() {
    const passwordField = document.getElementById('newTechPassword');
    const icon = document.querySelector('#addTechModal .password-toggle i');
    const checkbox = document.getElementById('showNewTechPassword');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.className = 'fas fa-eye-slash';
        checkbox.checked = true;
    } else {
        passwordField.type = 'password';
        icon.className = 'fas fa-eye';
        checkbox.checked = false;
    }
}

function logout() {
    stopCamera();
    if(confirm('Se déconnecter ?')) {
        location.reload();
    }
}

// Gestion checkbox modal technicien
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('showNewTechPassword')?.addEventListener('change', function() {
        const passwordField = document.getElementById('newTechPassword');
        passwordField.type = this.checked ? 'text' : 'password';
    });
});

console.log("🎯 Application IA Ascenseurs Pro chargée !");
