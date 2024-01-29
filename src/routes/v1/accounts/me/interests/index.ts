// GET /v1/accounts/me/interests
// Returns top 3 interests of the user

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { UserInterests } from "../../../../../database/wrappers/algorithm/user_interests_wrapper";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        try {
            const interests = await UserInterests.getUserInterests(
                req.user!.id,
                3
            );

            return res.status(200).json({
                interests: interests.map((interest) =>
                    parseInt(interest.category_id as any)
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
