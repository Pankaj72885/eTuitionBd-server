let admin;

const initializeFirebase = async () => {
  try {
    if (!admin) {
      admin = await import("firebase-admin");

      const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("Firebase Admin initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
};

const getFirebaseAdmin = async () => {
  if (!admin) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin;
};

export default {
  initializeFirebase,
  getFirebaseAdmin,
};
