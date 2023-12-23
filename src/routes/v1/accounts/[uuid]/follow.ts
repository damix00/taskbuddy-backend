// PUT/DELETE /v1/accounts/:uuid/follow\
// Follow or unfollow a user

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { requireMethods } from "../../../../middleware/require_method";
import { UserReads } from "../../../../database/wrappers/accounts/users/wrapper";
import { FollowWrites } from "../../../../database/wrappers/accounts/follows/wrapper";

export default [
    authorize(true),
    requireMethods(["PUT", "DELETE"]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { uuid } = req.params;

            if (!uuid) {
                return res.status(400).json({
                    message: "Missing parameters",
                });
            }

            if (req.user!.uuid == uuid) {
                return res.status(400).json({
                    message: "You cannot follow yourself",
                });
            }

            const user = await UserReads.getUserByUUID(uuid);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            if (req.method == "PUT") {
                await FollowWrites.follow(req.user!.id, user.id);
            } else {
                await FollowWrites.unfollow(req.user!.id, user.id);
            }

            return res.status(200).json({
                message: "Success",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
