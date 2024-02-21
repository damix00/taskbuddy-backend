import { getStorage } from "firebase-admin/storage";
import { randomString } from "../../utils/utils";
import { Bucket } from "@google-cloud/storage";
import { UploadedFile } from "express-fileupload";
import uniqueFilename from "unique-filename";
import os from "os";
import path from "path";
import fs from "fs";

// This class is used to interact with Firebase Storage
export default class FirebaseStorage {
    // The bucket instance for Firebase Storage, used to interact with the storage
    static bucket: Bucket;

    static init() {
        this.bucket = getStorage().bucket(); // Get the default bucket
    }

    static async doesFileExist(filename: string) {
        const file = this.bucket.file(filename); // Get the file
        const exists = await file.exists(); // Check if the file exists

        return exists[0]; // Return the result
    }

    static async generateUniqueFile(ext: string): Promise<string> {
        let name = randomString(120) + "." + ext; // Generate a random name

        while (await this.doesFileExist(name)) {
            // While the file exists, generate a new name until it's unique
            name = randomString(120) + "." + ext;
        }

        return name;
    }

    static async uploadFile(path: string, mimetype: string, extension: string) {
        const name = await this.generateUniqueFile(extension); // Generate a unique name for the file

        // Upload the file to the storage
        return await this.bucket.upload(path, {
            destination: `uploads/${name}`,
            metadata: {
                contentType: mimetype,
                cacheControl: "public, max-age=31536000", // Cache the file for 1 year
            },
        });
    }

    static async deleteFile(path: string) {
        // Create a URL object from the path
        const url = new URL(path);
        url.search = ""; // Remove the search parameters

        // Split the URL by the slashes
        const p = url.toString().split("/");

        // Get the file from the storage by the last part of the URL (the ID of the file)
        const file = this.bucket.file(decodeURIComponent(p[p.length - 1]));

        // Delete the file
        return await file.delete();
    }

    static async uploadFiles(
        files: UploadedFile[],
        folder: string,
        prefix: string = ""
    ): Promise<string[]> {
        // Upload media to firebase storage
        const urls = await Promise.all(
            files.map(async (file, i) => {
                const filename = uniqueFilename(os.tmpdir(), prefix);

                const ext = path
                    .extname(file.name)
                    .toLowerCase()
                    .replace(".", "");
                const mvfilename = `${filename}.${ext}`;

                // Temporarily save the file to the server
                await file.mv(mvfilename);

                const upload = await FirebaseStorage.uploadFile(
                    mvfilename,
                    file.mimetype,
                    ext
                );

                // Delete the file from the server
                fs.rmSync(mvfilename);

                // Check if the upload was successful
                if (!upload) {
                    return [];
                }

                // Get the URL
                let media = upload[0].metadata.mediaLink;

                return {
                    url: media,
                    index: i,
                };
            })
        );

        // Sort the URLs by index
        // @ts-ignore
        urls.sort((a, b) => a.index - b.index);

        // @ts-ignore
        return urls.map((u) => u.url);
    }
}
