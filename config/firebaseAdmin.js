import admin from "firebase-admin";

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      };

      if (!serviceAccount.private_key) {
        console.warn(
          "Firebase private key is missing. Firebase Admin may not work correctly."
        );
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("Firebase Admin initialized successfully");
    }
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
};

const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin;
};

export { getFirebaseAdmin, initializeFirebase };
