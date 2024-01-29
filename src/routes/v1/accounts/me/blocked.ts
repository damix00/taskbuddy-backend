// GET /v1/accounts/me/blocked
// Get a list of blocked users

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { BlockReads } from "../../../../database/wrappers/accounts/blocks/wrapper";
import { getPublicUserProfileResponse } from "../responses";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const limit = 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const blocked = await BlockReads.getBlocks(
                req.user!.id,
                offset,
                limit
            );

            res.status(200).json({
                accounts: blocked.map((block) =>
                    getPublicUserProfileResponse(
                        block.user,
                        block.profile,
                        false,
                        false
                    )
                ),
                limit,
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
