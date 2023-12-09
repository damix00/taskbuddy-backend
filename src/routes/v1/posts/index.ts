// POST /v1/posts - Create a new post

import { Response } from "express";
import { ExtendedRequest } from "../../../types/request";
import { authorize } from "../../../middleware/authorization";
import { requireMethod } from "../../../middleware/require_method";
import { UploadedFile } from "express-fileupload";
import { JobType, PostStatus } from "../../../database/models/posts/post";
import RemoteConfigData from "../../../firebase/remote_config";
import {
    boolParser,
    floatParser,
    intParser,
    listParser,
} from "../../../middleware/parsers";
import { PostWrites } from "../../../database/wrappers/posts/post/wrapper";
import { TagReads } from "../../../database/wrappers/posts/tags/wrapper";
import { generateEmbedding } from "../../../classification/cohere";
import fs from "fs";
import FirebaseStorage from "../../../firebase/storage/files";
import uniqueFilename from "unique-filename";
import os from "os";
import path from "path";
import { randomNearbyLocation } from "../../../utils/utils";
import { getPostResponse } from "./responses";

export default [
    authorize(false),
    intParser(["job_type"]),
    floatParser(["location_lat", "location_lon", "price", "suggestion_radius"]),
    boolParser(["is_remote", "is_urgent"]),
    listParser(["tags"]),
    requireMethod("POST"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const {
                job_type,
                title,
                description,
                location_lat,
                location_lon,
                location_name,
                is_remote,
                is_urgent,
                price,
                suggestion_radius,
                start_date,
                end_date,
                tags,
            } = req.body;

            const media: UploadedFile[] = [];

            for (const key in req.files) {
                media.push(req.files[key] as UploadedFile);
            }

            if (
                job_type === undefined ||
                !title ||
                !description ||
                is_remote === undefined ||
                is_urgent === undefined ||
                !price ||
                !suggestion_radius ||
                !start_date ||
                !end_date ||
                !tags ||
                !media ||
                media.length < RemoteConfigData.minMedia ||
                media.length > RemoteConfigData.maxMedia
            ) {
                return res
                    .status(400)
                    .json({ message: "Missing required fields" });
            }

            if (
                job_type != JobType.ONE_TIME &&
                job_type != JobType.PART_TIME &&
                job_type != JobType.FULL_TIME
            ) {
                return res.status(400).json({ message: "Invalid job type" });
            }

            if (
                isNaN(price) ||
                price < RemoteConfigData.minPrice ||
                price > RemoteConfigData.maxPrice
            ) {
                return res.status(400).json({ message: "Invalid price" });
            }

            if (
                isNaN(suggestion_radius) ||
                suggestion_radius < RemoteConfigData.minRadius ||
                suggestion_radius > RemoteConfigData.maxRadius
            ) {
                return res.status(400).json({ message: "Invalid radius" });
            }

            // If the job is remote, we don't need location
            // If the job is not remote, we need location and we need to check if it's valid
            if (
                !is_remote &&
                (!location_lat ||
                    !location_lon ||
                    isNaN(location_lat) ||
                    isNaN(location_lon) ||
                    !location_name)
            ) {
                return res.status(400).json({ message: "Missing location" });
            }

            // Check if tags are valid
            if (!Array.isArray(tags)) {
                return res.status(400).json({ message: "Invalid tags" });
            }

            // Check if tags exist
            for (const tag of tags) {
                if (
                    isNaN(parseInt(tag)) ||
                    (await TagReads.getTagById(parseInt(tag))) === null
                ) {
                    return res.status(400).json({ message: "Invalid tags" });
                }
            }

            const ip = req.ip || req.socket.remoteAddress;

            // Upload media to firebase storage
            const urls = await Promise.all(
                media.map(async (file) => {
                    const filename = uniqueFilename(
                        os.tmpdir(),
                        "post_media__"
                    );
                    const ext = path
                        .extname(file.name)
                        .toLowerCase()
                        .replace(".", "");
                    const mvfilename = `${filename}.${ext}`;

                    // Temporarily save the file to the server
                    await file.mv(mvfilename);

                    const upload = await FirebaseStorage.uploadFile(
                        mvfilename,
                        `image/${ext.toLowerCase()}`,
                        ext
                    );

                    // Delete the file from the server
                    fs.rmSync(mvfilename);

                    // Check if the upload was successful
                    if (!upload) {
                        return res
                            .status(500)
                            .json({ message: "Internal server error" });
                    }

                    // Get the URL
                    let media = upload[0].metadata.mediaLink;

                    return media;
                })
            );

            const vector = await generateEmbedding(
                `${title}\n\n${description}`,
                false
            );

            let loc = null;

            if (!is_remote) {
                loc = randomNearbyLocation(location_lat, location_lon, 500);
            }

            const post = await PostWrites.createPost({
                user_id: req.user!.id,
                job_type,
                title,
                title_vector: `[${vector}]`,
                description,
                location: {
                    lat: location_lat,
                    lon: location_lon,
                    location_name,
                    suggestion_radius,
                    remote: is_remote,
                    // Generate approximate location for privacy reasons
                    approx_lat: is_remote ? null : loc?.lat,
                    approx_lon: is_remote ? null : loc?.lon,
                },
                urgent: is_urgent,
                price,
                start_date,
                end_date,
                tags,
                status: PostStatus.OPEN,
                media: urls.map((url) => ({
                    media: url,
                    media_type: "image",
                })),
            });

            if (!post) {
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }

            return res.status(200).json({
                message: "Post created",
                post: getPostResponse(
                    post,
                    req.user!,
                    req.profile!,
                    false,
                    true
                ),
            });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
    },
];
