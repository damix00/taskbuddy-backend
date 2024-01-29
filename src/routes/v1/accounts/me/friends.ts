// GET /v1/accounts/me/friends
// Return a list of friends (accounts that follow you and you follow them)

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { FollowReads } from "../../../../database/wrappers/accounts/follows/wrapper";
import { getPublicUserProfileResponse } from "../responses";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const offset = Number(req.query.offset) || 0;

            const friends = await FollowReads.getFriends(req.user!.id, offset);

            res.status(200).json({
                friends: friends.map((friend) =>
                    getPublicUserProfileResponse(
                        friend.user,
                        friend.profile,
                        true,
                        false
                    )
                ),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
