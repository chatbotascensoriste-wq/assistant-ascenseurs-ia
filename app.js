// === APPLICATION PRINCIPALE CORRIGÉE ===
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
        // Charger depuis le localStorage ou utiliser les données par défaut
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
                url: "https://example.com/kone-manual.pdf",
                addedBy: "admin@ascenseurs.com",
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                name: "Schéma Thyssen 3300 Electrique",
                brand: "Thyssen",
                type: "schema", 
                url: "https://example.com/thyssen-schema.pdf",
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

// ... (les fonctions getHomeContent, getDocumentsContent, etc. restent similaires mais corrigées)

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
                    ${doc.url ? `<a href="${doc.url}" target="_blank" class="btn btn-sm btn-outline-primary mt-2">📄 Voir le document</a>` : ''}
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

// ... (autres fonctions corrigées)

function logout() {
    currentUser = null;
    window.currentUser = null;
    stopCamera();
    document.getElementById('appInterface').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

// Fonctions pour afficher/masquer les mots de passe
function togglePassword() {
    const passwordField = document.getElementById('password');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;
}

// Gestionnaire pour la case à cocher
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('showPassword').addEventListener('change', function() {
        const passwordField = document.getElementById('password');
        passwordField.type = this.checked ? 'text' : 'password';
    });
});
