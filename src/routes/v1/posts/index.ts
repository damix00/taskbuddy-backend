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
} from "../../../middleware/parsers";
import { PostWrites } from "../../../database/wrappers/posts/post/wrapper";
import { TagReads } from "../../../database/wrappers/posts/tags/wrapper";

export default [
    authorize(false),
    intParser(["job_type"]),
    floatParser(["location_lat", "location_lon", "price", "suggestion_radius"]),
    boolParser(),
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
                console.log(key);
                media.push(req.files[key] as UploadedFile);
            }

            console.log(req.body);

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
                    console.log(await TagReads.getTagById(parseInt(tag)));
                    return res.status(400).json({ message: "Invalid tags" });
                }
            }

            const ip = req.ip || req.socket.remoteAddress;

            const post = await PostWrites.createPost({
                user_id: req.user!.id,
                job_type,
                title,
                title_vector: [],
                description,
                location: {
                    lat: location_lat,
                    lon: location_lon,
                    location_name,
                    suggestion_radius,
                    remote: is_remote,
                },
                urgent: is_urgent,
                price,
                start_date,
                end_date,
                tags,
                status: PostStatus.OPEN,
                media: [],
            });

            if (!post) {
                return res
                    .status(500)
                    .json({ message: "Internal server error" });
            }

            return res.status(200).json({ message: "Post created" });
        } catch (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
    },
];
