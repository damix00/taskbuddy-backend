import admin from "firebase-admin";
import path from "path";
import FirebaseStorage from "./storage/files";

// Initialize Firebase Admin SDK
export default function initFirebase() {
    admin.initializeApp({
        credential: admin.credential.cert(
            path.join(
                __dirname,
                "../",
                "../",
                "../",
                "secrets",
                "firebase_admin.json"
            )
        ),
        storageBucket: "taskbuddy-42fba.appspot.com",
    });

    FirebaseStorage.init();
}
