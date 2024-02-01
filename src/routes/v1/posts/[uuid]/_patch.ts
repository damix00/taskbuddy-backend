// GET /v1/posts/:uuid
// Returns a post by its UUID

import { Response } from "express";
import { ExtendedRequest } from "../../../../types/request";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";
import { getPostResponse } from "../responses";
import { randomNearbyLocation } from "../../../../utils/utils";

export default async (req: ExtendedRequest, res: Response) => {
    try {
        const { uuid } = req.params;

        const post = await PostReads.getPostByUUID(uuid, req.user!.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const user = await post.getUser();
        const profile = await user?.getProfile();

        if (!user || !profile) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.id != req.user!.id) {
            return res.status(403).json({
                message: "Forbidden",
            });
        }

        const title = req.body.title;
        const description = req.body.description;
        const lat = req.body.lat;
        const lon = req.body.lon;
        const locationText = req.body.location_text;
        const urgent = req.body.urgent;
        const reserved = req.body.reserved;

        if (!title || title.trim().length == 0) {
            return res.status(400).json({
                message: "Missing title",
            });
        }

        if (!description || description.trim().length == 0) {
            return res.status(400).json({
                message: "Missing description",
            });
        }

        if (urgent == undefined || reserved == undefined) {
            return res.status(400).json({
                message: "Missing boolean values",
            });
        }

        if (lat != null && lon != null && isNaN(lat) && isNaN(lon)) {
            return res.status(400).json({
                message: "Invalid lat/lon",
            });
        }

        if (locationText && locationText.trim().length == 0) {
            return res.status(400).json({
                message: "Invalid location text",
            });
        }

        const result = await post.updatePostData({
            title: title.trim(),
            description: description.trim(),
            urgent: urgent.toString() == "true",
            reserved: reserved.toString() == "true", // Flutter sends everything as string
        });

        const randomLoc =
            lat == "" ? null : randomNearbyLocation(lat, lon, 500);

        await post.updateLocation({
            lat: lat == "" ? null : lat,
            lon: lon == "" ? null : lon,
            approx_lat: randomLoc?.lat || 1000,
            approx_lon: randomLoc?.lon || 1000,
            location_name: locationText,
            remote: lat == null || lat == 1000,
        });

        if (!result) {
            return res.status(500).json({
                message: "Internal server error",
            });
        }

        res.status(200).json({
            message: "Post updated",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};
