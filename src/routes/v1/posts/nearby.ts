// GET /v1/posts/nearby
// Fetches nearby posts

import { Response } from "express";
import { ExtendedRequest } from "../../../types/request";
import { authorize } from "../../../middleware/authorization";
import { PostReads } from "../../../database/wrappers/posts/post/wrapper";
import { getPostResultResponse } from "./responses";
import { geoDistance } from "../../../utils/utils";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            // Get query parameters
            const { lat, lon, offset } = req.query;

            // Check if query parameters are valid
            if (
                isNaN(parseFloat(lat as string)) ||
                isNaN(parseFloat(lon as string)) ||
                isNaN(parseInt(offset as string))
            ) {
                console.log({ lat, lon, offset });

                return res.status(400).json({
                    error: "Invalid parameters",
                });
            }

            const latitude = parseFloat(lat as string);
            const longitude = parseFloat(lon as string);

            // Check if latitude and longitude are valid
            if (latitude < -90 || latitude > 90) {
                console.log({ longitude });

                return res.status(400).json({
                    error: "Invalid latitude",
                });
            }

            if (longitude < -180 || longitude > 180) {
                console.log({ longitude });

                return res.status(400).json({
                    error: "Invalid longitude",
                });
            }

            // Get offset
            const offsetInt = parseInt(offset as string);

            // Check if offset is valid
            if (offsetInt < 0) {
                console.log({ offsetInt });
                return res.status(400).json({
                    error: "Invalid offset",
                });
            }

            // Get nearby posts
            const posts = await PostReads.getNearbyPosts(
                req.user!.id,
                latitude,
                longitude,
                offsetInt
            );

            // Check if posts exist
            if (!posts) {
                return res.status(404).json({
                    error: "No posts found",
                });
            }

            // Return posts
            res.status(200).json({
                posts: posts.map((post) =>
                    getPostResultResponse(post, req.user!)
                ),
            });

            posts.forEach(async (post) => {
                await post.addImpression();
            });
        } catch (err) {
            return res.status(500).json({
                error: "Internal server error",
            });
        }
    },
];
