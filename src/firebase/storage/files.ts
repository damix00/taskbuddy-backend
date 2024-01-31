import { getStorage } from "firebase-admin/storage";
import { randomString } from "../../utils/utils";
import { Bucket } from "@google-cloud/storage";
import { UploadedFile } from "express-fileupload";
import uniqueFilename from "unique-filename";
import os from "os";
import path from "path";
import fs from "fs";

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
                    `${folder}/${ext.toLowerCase()}`,
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
