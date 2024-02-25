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
import {
    PostReads,
    PostWrites,
} from "../../../database/wrappers/posts/post/wrapper";
import { TagReads } from "../../../database/wrappers/posts/tags/wrapper";
import {
    classifyCategory,
    generateEmbedding,
} from "../../../classification/cohere";
import fs from "fs";
import FirebaseStorage from "../../../firebase/storage/files";
import uniqueFilename from "unique-filename";
import os from "os";
import path from "path";
import { randomNearbyLocation } from "../../../utils/utils";
import { getPostResponse } from "./responses";
import { checkText } from "../../../classification/text_check";
import setKillswitch from "../../../middleware/killswitch";
import { KillswitchTypes } from "../../../database/models/killswitch";

export default [
    authorize(true),
    setKillswitch([KillswitchTypes.DISABLE_POSTING]),
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
                suggestion_radius === undefined ||
                !start_date ||
                !end_date ||
                !tags ||
                !media ||
                media.length < RemoteConfigData.minMedia ||
                media.length > RemoteConfigData.maxMedia
            ) {
                console.log("missing fields");
                console.log(req.body);
                return res
                    .status(400)
                    .json({ message: "Missing required fields" });
            }

            if (
                job_type != JobType.ONE_TIME &&
                job_type != JobType.PART_TIME &&
                job_type != JobType.FULL_TIME
            ) {
                console.log(`invalid job type ${job_type}`);
                return res.status(400).json({ message: "Invalid job type" });
            }

            if (
                isNaN(price) ||
                price < RemoteConfigData.minPrice ||
                price > RemoteConfigData.maxPrice
            ) {
                console.log(`invalid price ${price}`);
                return res.status(400).json({ message: "Invalid price" });
            }

            if (
                !is_remote &&
                (isNaN(suggestion_radius) ||
                    suggestion_radius < RemoteConfigData.minRadius ||
                    suggestion_radius > RemoteConfigData.maxRadius)
            ) {
                console.log("invalid radius");
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
                console.log("missing location");
                return res.status(400).json({ message: "Missing location" });
            }

            // Check if tags are valid
            if (!Array.isArray(tags)) {
                console.log("invalid tags: " + tags);
                return res.status(400).json({ message: "Invalid tags" });
            }

            // Check if tags exist
            for (const tag of tags) {
                if (
                    isNaN(parseInt(tag)) ||
                    (await TagReads.getTagById(parseInt(tag))) === null
                ) {
                    console.log("invalid tag: " + tag);
                    return res.status(400).json({ message: "Invalid tags" });
                }
            }

            if (title.length < 1 || title.length > 100) {
                return res.status(400).json({
                    message: "Title must be between 1 and 100 characters",
                });
            }

            if (description.length < 1 || description.length > 1024) {
                return res.status(400).json({
                    message:
                        "Description must be between 1 and 1000 characters",
                });
            }

            const ip = req.ip || req.socket.remoteAddress;

            const vector = await generateEmbedding(
                `${title}\n\n${description}`,
                false
            );

            const classifiedCategory = await classifyCategory(
                `${title}\n\n${description}`
            );

            // Upload media to firebase storage
            const urls = await FirebaseStorage.uploadFiles(
                media,
                "posts",
                req.user!.uuid
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
                classified_category: classifiedCategory?.category || 0,
                description,
                location: {
                    lat: is_remote ? null : location_lat || null,
                    lon: is_remote ? null : location_lon || null,
                    location_name: is_remote ? null : location_name,
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

            await req.profile!.setPosts(req.profile!.post_count + 1);

            res.status(200).json({
                message: "Post created",
                post: getPostResponse(
                    post,
                    req.user!,
                    req.profile!,
                    post.following,
                    post.user_id == req.user!.id,
                    post.liked,
                    post.bookmarked
                ),
            });

            // Use the OpenAI API to check for explicit content
            if (await checkText(`${title}\n\n${description}`)) {
                console.log(`Post ${post.id} contains explicit content.`);

                await post.shadowBan(); // Shadow ban the post if it contains explicit content
            }
        } catch (err) {
            console.error(err);

            return res.status(500).json({ message: "Internal server error" });
        }
    },
];
