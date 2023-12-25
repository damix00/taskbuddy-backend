import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { UserReads } from "../../../../database/wrappers/accounts/users/wrapper";
import { getPublicUserProfileResponse } from "../responses";

export default [
    authorize(true),
    requireMethod("GET"),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { uuid } = req.params;

            if (!uuid) {
                return res.status(400).json({
                    message: "Missing uuid",
                });
            }

            const account = await UserReads.getUserByUUID(uuid, req.user!.id);

            if (!account) {
                return res.status(404).json({
                    message: "Account not found",
                });
            }

            const profile = await account.getProfile();

            if (!profile) {
                return res.status(404).json({
                    message: "Profile not found",
                });
            }

            const following = await req.user!.isFollowing(account.id);

            return res.status(200).json({
                message: "Success",
                user: getPublicUserProfileResponse(
                    account,
                    profile,
                    following,
                    req.user!.id == account.id
                ),
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
