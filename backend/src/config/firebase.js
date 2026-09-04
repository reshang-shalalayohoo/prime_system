const admin = require('firebase-admin');

let firebaseApp = null;
let database = null;

/**
 * Initialize Firebase Admin SDK using environment variables.
 * Returns the Firebase Realtime Database instance.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 *   FIREBASE_DATABASE_URL
 */
function initFirebase() {
  if (firebaseApp) {
    return database;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    console.warn('⚠️  Firebase configuration incomplete — sensor connection monitoring disabled.');
    console.warn('   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL in .env');
    return null;
  }

  try {
    // Firebase private key comes with escaped newlines from env — unescape them
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedKey
      }),
      databaseURL
    });

    database = admin.database();
    console.log('✅ Firebase Admin SDK initialized');
    return database;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return null;
  }
}

/**
 * Get the Firebase Realtime Database reference.
 * Returns null if Firebase is not configured.
 */
function getFirebaseDb() {
  if (!database) {
    return initFirebase();
  }
  return database;
}

/**
 * Get a reference to the devices heartbeat path.
 */
function getDevicesRef() {
  const db = getFirebaseDb();
  if (!db) return null;
  return db.ref('devices');
}

module.exports = { initFirebase, getFirebaseDb, getDevicesRef };
