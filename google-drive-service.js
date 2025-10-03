class GoogleDriveService {
    constructor() {
        this.isAuthenticated = false;
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.driveFolderId = null;
        this.APP_FOLDER_NAME = 'Ascenseurs_IA_Documents';
    }

    async initGoogleDrive() {
        return new Promise((resolve) => {
            gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: APP_CONFIG.GOOGLE_API_KEY,
                    discoveryDocs: APP_CONFIG.DISCOVERY_DOCS,
                });
                this.gapiInited = true;
                this.updateDriveStatus();
                resolve();
            });
        });
    }

    async handleAuthClick() {
        console.log('🔐 Initialisation authentification Google...');
        
        if (!this.gapiInited || !this.gisInited) {
            console.log('❌ APIs Google non initialisées');
            return;
        }

        try {
            const token = await gapi.client.getToken();
            if (token) {
                this.isAuthenticated = true;
                await this.ensureAppFolder();
                this.updateDriveStatus();
                return;
            }
        } catch (error) {
            console.log('Token non trouvé, nouvelle authentification nécessaire');
        }

        // Nouvelle authentification
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
            scope: APP_CONFIG.SCOPES,
            callback: async (response) => {
                if (response.error) {
                    console.error('❌ Erreur authentification:', response);
                    return;
                }
                this.isAuthenticated = true;
                await this.ensureAppFolder();
                this.updateDriveStatus();
                $('#driveAuthModal').modal('hide');
            },
        });

        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }

    async ensureAppFolder() {
        try {
            console.log('📁 Recherche du dossier application...');
            const response = await gapi.client.drive.files.list({
                q: `name='${this.APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
                fields: 'files(id, name)',
            });

            if (response.result.files.length > 0) {
                this.driveFolderId = response.result.files[0].id;
                console.log(`✅ Dossier trouvé: ${this.driveFolderId}`);
            } else {
                // Création du dossier
                const fileMetadata = {
                    name: this.APP_FOLDER_NAME,
                    mimeType: 'application/vnd.google-apps.folder',
                };
                
                const createResponse = await gapi.client.drive.files.create({
                    resource: fileMetadata,
                    fields: 'id',
                });
                
                this.driveFolderId = createResponse.result.id;
                console.log(`📁 Nouveau dossier créé: ${this.driveFolderId}`);
            }
            
            return this.driveFolderId;
        } catch (error) {
            console.error('❌ Erreur création dossier:', error);
            throw error;
        }
    }

    async uploadDocument(fileName, content, mimeType = 'text/plain') {
        if (!this.isAuthenticated) {
            throw new Error('Utilisateur non authentifié');
        }

        const fileMetadata = {
            name: fileName,
            parents: [this.driveFolderId],
        };

        const media = {
            mimeType: mimeType,
            body: content,
        };

        try {
            const response = await gapi.client.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, name, webViewLink',
            });
            
            console.log('✅ Document uploadé:', response.result);
            return response.result;
        } catch (error) {
            console.error('❌ Erreur upload:', error);
            throw error;
        }
    }

    async listDocuments() {
        if (!this.isAuthenticated || !this.driveFolderId) {
            return [];
        }

        try {
            const response = await gapi.client.drive.files.list({
                q: `'${this.driveFolderId}' in parents and trashed=false`,
                fields: 'files(id, name, mimeType, webViewLink, createdTime)',
                orderBy: 'createdTime desc',
            });

            return response.result.files;
        } catch (error) {
            console.error('❌ Erreur liste documents:', error);
            return [];
        }
    }

    async searchDocuments(query, brand = null) {
        if (!this.isAuthenticated) {
            return [];
        }

        let searchQuery = `trashed=false and (name contains '${query}' or fullText contains '${query}')`;
        
        if (brand) {
            searchQuery += ` and (name contains '${brand}' or fullText contains '${brand}')`;
        }

        if (this.driveFolderId) {
            searchQuery += ` and '${this.driveFolderId}' in parents`;
        }

        try {
            const response = await gapi.client.drive.files.list({
                q: searchQuery,
                fields: 'files(id, name, mimeType, webViewLink)',
            });

            return response.result.files;
        } catch (error) {
            console.error('❌ Erreur recherche:', error);
            return [];
        }
    }

    updateDriveStatus() {
        const statusElement = document.getElementById('driveStatus');
        if (!statusElement) return;

        if (this.isAuthenticated) {
            statusElement.innerHTML = '<small class="text-success"><i class="fas fa-check-circle"></i> Drive connecté</small>';
        } else {
            statusElement.innerHTML = '<small class="text-warning"><i class="fas fa-exclamation-triangle"></i> Drive non connecté</small>';
            // Afficher modal après un délai
            setTimeout(() => {
                if (!this.isAuthenticated) {
                    $('#driveAuthModal').modal('show');
                }
            }, 2000);
        }
    }
}

// Instance globale
const googleDriveService = new GoogleDriveService();
