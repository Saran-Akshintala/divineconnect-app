const admin = require('firebase-admin');
require('dotenv').config();

// Mock Firebase for development
const mockFirebase = {
  auth: () => ({
    verifyIdToken: async (token) => {
      // Mock token verification for development
      if (token === 'mock-token') {
        return {
          uid: 'mock-user-id',
          email: 'mock@example.com',
          phone_number: '+1234567890'
        };
      }
      throw new Error('Invalid token');
    }
  })
};

// Use mock Firebase in development or when Firebase is not configured
if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'demo-project') {
  module.exports = mockFirebase;
} else {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  }

  const auth = admin.auth();
  module.exports = { admin, auth };
}
