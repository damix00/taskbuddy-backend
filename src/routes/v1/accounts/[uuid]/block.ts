// PUT/DELETE /v1/accounts/:uuid/block
// Block or unblock a user

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { requireMethods } from "../../../../middleware/require_method";
import { UserReads } from "../../../../database/wrappers/accounts/users/wrapper";
import {
    BlockReads,
    BlockWrites,
} from "../../../../database/wrappers/accounts/blocks/wrapper";
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
                    message: "You cannot block yourself",
                });
            }

            const user = await UserReads.getUserByUUID(uuid);

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const profile = await user?.getProfile();

            if (!profile) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            if (req.method == "PUT") {
                if (await BlockReads.isBlocked(req.user!.id, user.id)) {
                    return res.status(400).json({
                        message: "This user is already blocked",
                    });
                }

                await BlockWrites.block(req.user!.id, user.id);

                // Unfollow
                await FollowWrites.unfollow(req.user!.id, user.id);
                await FollowWrites.unfollow(user.id, req.user!.id);

                // Update follower/following count
                await req.profile!.setFollowing(req.profile!.following - 1);
                await profile.setFollowers(profile.followers - 1);

                await profile.setFollowing(profile.following - 1);
                await req.profile!.setFollowers(req.profile!.followers - 1);
            } else {
                if (!(await BlockReads.isBlocked(req.user!.id, user.id))) {
                    return res.status(400).json({
                        message: "This user is not blocked",
                    });
                }

                await BlockWrites.unblock(req.user!.id, user.id);
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
