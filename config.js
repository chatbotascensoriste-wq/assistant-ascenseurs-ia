// === CONFIGURATION GOOGLE DRIVE API ===
const APP_CONFIG = {
    NAME: "Assistant IA Ascenseurs Pro",
    VERSION: "5.0",
    IA_ACTIVE: true,
    GOOGLE_DRIVE_ACTIVE: true,
    
    // Configuration Google Drive API (À remplacer avec vos identifiants)
    GOOGLE_API_KEY: 'YOUR_GOOGLE_API_KEY',
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/drive.file',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
};

console.log("✅ Configuration Google Drive chargée !");

// Instructions pour obtenir les identifiants Google API :
// 1. Allez sur Google Cloud Console : https://console.cloud.google.com/
// 2. Créez un nouveau projet ou sélectionnez-en un existant
// 3. Activez l'API Google Drive
// 4. Créez des identifiants OAuth 2.0 pour une application Web
// 5. Ajoutez votre domaine dans les URI de redirection autorisés
// 6. Remplacez les valeurs ci-dessus avec vos identifiants
