import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket: "softecai.appspot.com",
    });
  } catch (error) {
    console.warn("Firebase admin initialization failed (this is expected during Vercel build if env vars are missing).", error);
  }
}

const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;
const adminStorage = admin.apps.length ? admin.storage() : null as unknown as admin.storage.Storage;

export { admin, adminDb, adminAuth, adminStorage };
