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

export default [
    authorize(true),
    requireMethod("GET"),
    intParser(["offset"]),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const { query, type, offset } = req.query;

            if (!query || !type) {
                return res.status(400).json({
                    message: "Missing parameters",
                });
            }

            if (type != "user" && type != "post") {
                return res.status(400).json({
                    message: "Invalid type",
                });
            }

            if (type == "user") {
                const result = await UserReads.search(
                    query as string,
                    offset as unknown as number,
                    req.user!.id
                );

                if (!result) {
                    return res.status(404).json({
                        message: "No users found",
                    });
                }

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
        } catch (e) {
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
