import { NextFunction, Response } from "express";
import Review from "../../../../database/wrappers/reviews";
import { ReviewReads } from "../../../../database/wrappers/reviews/wrapper";
import { ExtendedRequest } from "../../../../types/request";

export interface ReviewRequest extends ExtendedRequest {
    review: Review;
}

export async function withReview(
    req: ReviewRequest,
    res: Response,
    next: NextFunction
) {
    const review = await ReviewReads.getReviewByUUID(req.params.uuid);

    if (!review) {
        return res.status(404).json({
            error: "Review not found",
        });
    }

    req.review = review;

    next();
}
