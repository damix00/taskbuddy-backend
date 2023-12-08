import admin from "firebase-admin";
import path from "path";
import FirebaseStorage from "./storage/files";
import RemoteConfigData from "./remote_config";

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

    // Set an interval to fetch remote config every minute
    setInterval(async () => {
        try {
            await RemoteConfigData.fetch();
        } catch (e) {
            console.error(e);
        }
    }, 60 * 1000);
}
