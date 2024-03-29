// GET /v1/search?query=string&type=user&offset=number
// Search for users or posts based on a query

import { Response } from "express";
import { authorize } from "../../../middleware/authorization";
import { requireMethod } from "../../../middleware/require_method";
import { ExtendedRequest } from "../../../types/request";
import { intParser } from "../../../middleware/parsers";
import { UserReads } from "../../../database/wrappers/accounts/users/wrapper";
import {
    getPublicUserProfileResponse,
    getUserProfileResponse,
} from "../accounts/responses";
import { Profile } from "../../../database/wrappers/accounts/profiles";
import { generateEmbedding } from "../../../classification/cohere";
import { PostReads } from "../../../database/wrappers/posts/post/wrapper";
import { getPostResponse, getPostResultResponse } from "../posts/responses";

export default [
    authorize(true),
    requireMethod("GET"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { query, type, offset } = req.query;

            if (!query || !type) {
                return res.status(400).json({
                    message: "Missing parameters",
                });
            }

            // If the type is neither user nor post, return an error
            if (type != "user" && type != "post") {
                return res.status(400).json({
                    message: "Invalid type",
                });
            }

            // If the offset is not a number, return an error
            if (isNaN(parseInt(offset as string))) {
                return res.status(400).json({
                    message: "Invalid offset",
                });
            }

            // If the type is user, search for users
            if (type == "user") {
                // Search for users
                const result = await UserReads.search(
                    query as string,
                    parseInt(offset as unknown as string),
                    req.user!.id
                );

                // If no users are found, return an error
                if (!result) {
                    return res.status(404).json({
                        message: "No users found",
                    });
                }

                // Return the users
                return res.status(200).json({
                    message: "Successfully retrieved users",
                    users: result.map((user) => {
                        return getPublicUserProfileResponse(
                            user.user,
                            user.profile as Profile,
                            user.following,
                            user.user.id == req.user!.id
                        );
                    }),
                });
            }

            if (type == "post") {
                let filteredTags: string | undefined = req.query.tags as string;
                let filteredTagsArray: number[] = [];
                let urgency = parseInt((req.query.urgency as string) || "0");
                let location = parseInt((req.query.location as string) || "0");

                try {
                    let tmp = JSON.parse(filteredTags as string);
                    if (Array.isArray(tmp)) {
                        filteredTags = tmp.join(",");
                    }
                } catch (e) {
                    filteredTagsArray = [];
                }

                // Generate the embedding for the query
                // A vector embedding is basically a vector of numbers that represents the query
                // This is used to find similar posts
                const vector = await generateEmbedding(query as string, true);

                // If the vector is null, return an error
                if (!vector) {
                    return res.status(500).json({
                        message: "Internal server error",
                    });
                }

                // Search for posts
                const results = await PostReads.searchPosts(
                    req.user!.id,
                    vector,
                    parseInt(offset as unknown as string),
                    {
                        filteredTags: filteredTagsArray,
                        urgency,
                        location,
                    }
                );

                // If no posts are found, return an error
                if (!results) {
                    return res.status(404).json({
                        message: "No posts found",
                    });
                }

                // Return the posts
                res.status(200).json({
                    message: "Successfully retrieved posts",
                    posts: results.map((post) => {
                        try {
                            return getPostResultResponse(post, req.user!);
                        } catch (e) {
                            return null;
                        }
                    }),
                });

                results.forEach(async (post) => {
                    await post.addImpression();
                });
            }
        } catch (e) {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
