// GET /v1/accounts/me/reviews?offset=number
// Return all reviews for the current user

import { Response } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../../types/request";
import { ReviewReads } from "../../../../../database/wrappers/reviews/wrapper";
import { getReviewResponse } from "../../responses";

export default [
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        const offset = parseInt(req.query.offset || (0 as any));

        const reviews = await ReviewReads.getReviewsForUser(
            req.user!.id,
            offset
        );

        if (!reviews) {
            return res.status(500).json({
                error: "Failed to get reviews",
            });
        }

        return res.status(200).json({
            reviews: reviews!.recieved.map((r) =>
                getReviewResponse(r, req.user!)
            ),
        });
    },
];
