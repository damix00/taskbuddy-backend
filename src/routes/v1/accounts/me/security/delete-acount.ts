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
import { JobCompletionWrites } from "../../../../../database/wrappers/posts/completions/wrapper";
import { UserInterests } from "../../../../../database/wrappers/algorithm/user_interests_wrapper";
import { UserReportWrites } from "../../../../../database/wrappers/reports/user_reports/wrapper";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const result = await req.user?.softDelete(); // Soft-delete the user

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

            // Delete interests
            await UserInterests.deleteUserInterests(req.user!.id);

            // Delete reports
            await UserReportWrites.deleteUserReports(req.user!.id);

            // Delete channel completions
            await JobCompletionWrites.deleteUsersCompletions(req.user!.id);

            // Delete channels and messages
            await ChannelWrites.deleteByUserId(req.user!.id);

            // Delete all posts
            await PostWrites.deletePostsByUser(req.user!.id);

            // Delete all logins
            await LoginWrites.deleteAll(req.user!.id);

            // Permanent delete the user
            await req.user?.deleteUser();
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
