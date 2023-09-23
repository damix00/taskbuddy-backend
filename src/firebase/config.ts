import admin from "firebase-admin";
import fs from "fs";
import path from "path";

admin.initializeApp({
    credential: admin.credential.cert(
        path.join(__dirname, "../", "../", "secrets", "serviceAccountKey.json")
    ),
});
