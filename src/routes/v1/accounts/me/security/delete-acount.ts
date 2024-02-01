// POST /v1/accounts/me/security/delete-account
// Delete the current user's account

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../../types/request";
import { PostWrites } from "../../../../../database/wrappers/posts/post/wrapper";
import { LoginWrites } from "../../../../../database/wrappers/accounts/logins/wrapper";
import { ReviewWrites } from "../../../../../database/wrappers/reviews/wrapper";
import { ChannelWrites } from "../../../../../database/wrappers/chats/channels/wrapper";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const result = await req.user?.deleteUser(); // Soft-delete the user

            if (!result) {
                return res.status(500).json({
                    message: "Internal server error",
                });
            }

            res.status(200).json({
                message: "Delete account",
            });

            // Delete reviews
            await ReviewWrites.deleteUserReviews(req.user!.id);

            // Delete channels and messages
            await ChannelWrites.deleteByUserId(req.user!.id);

            // Delete all posts
            await PostWrites.deletePostsByUser(req.user!.id);

            // Delete all logins
            await LoginWrites.deleteAll(req.user!.id);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
