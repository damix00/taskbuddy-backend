import { getStorage } from "firebase-admin/storage";
import { randomString } from "../../utils/utils";
import { Bucket } from "@google-cloud/storage";

export default class FirebaseStorage {
    static bucket: Bucket;

    static init() {
        this.bucket = getStorage().bucket();
    }

    static async doesFileExist(filename: string) {
        const file = this.bucket.file(filename);
        const exists = await file.exists();

        return exists[0];
    }

    static async generateUniqueFile(ext: string): Promise<string> {
        let name = randomString(120) + "." + ext;

        while (await this.doesFileExist(name)) {
            name = randomString(120) + "." + ext;
        }

        return name;
    }

    static async uploadFile(path: string, mimetype: string, extension: string) {
        const name = await this.generateUniqueFile(extension);

        return await this.bucket.upload(path, {
            destination: `uploads/${name}`,
            metadata: {
                contentType: mimetype,
                cacheControl: "public, max-age=31536000",
            },
        });
    }

    static async deleteFile(path: string) {
        const url = new URL(path);
        url.search = "";

        const p = url.toString().split("/");

        const file = this.bucket.file(decodeURIComponent(p[p.length - 1]));

        return await file.delete();
    }
}
