const admin = require("firebase-admin");

// Use environment variables in production, fall back to JSON file in development
let credential;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  // Production: Use environment variables
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace escaped newlines
  });
} else {
  // Development: Use serviceAccountKey.json file
  const serviceAccount = require("../../serviceAccountKey.json");
  credential = admin.credential.cert(serviceAccount);
}

admin.initializeApp({
  credential: credential,
});

module.exports = admin;