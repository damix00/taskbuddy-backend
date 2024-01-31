// PATCH/DELETE /v1/reviews/:uuid
// Edit/Delete a review

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethods } from "../../../../middleware/require_method";
import { ReviewRequest, withReview } from "./middleware";
import { ReviewType } from "../../../../database/models/reviews/review";

export default [
    requireMethods(["PATCH", "DELETE"]),
    authorize(true),
    withReview,
    async (req: ReviewRequest, res: Response) => {
        try {
            if (req.review.user_id != req.user!.id) {
                return res.status(403).json({
                    error: "You do not have permission to edit this review",
                });
            }

            if (req.method == "PATCH") {
                const rating = req.body.rating;
                const title = req.body.title?.trim();
                const description = req.body.description?.trim();

                if (!title || !rating) {
                    return res.status(400).json({
                        error: "Please fill out all fields",
                    });
                }

                if (title.length == 0 || title.length > 64) {
                    return res.status(400).json({
                        error: "Title must be between 1 and 64 characters",
                    });
                }

                if (description?.length > 512) {
                    return res.status(400).json({
                        error: "Description must be between 1 and 512 characters",
                    });
                }

                const parsed = parseInt(rating);

                if (isNaN(parsed) || parsed < 1 || parsed > 5) {
                    return res.status(400).json({
                        error: "Rating must be between 1 and 5",
                    });
                }

                const previous = req.review.rating;

                const review = await req.review.update({
                    rating: parsed,
                    title,
                    description,
                });

                if (!review) {
                    return res.status(500).json({
                        error: "Failed to update review",
                    });
                }

                const profile = await req.review.rating_for.getProfile();

                if (req.review.type == ReviewType.EMPLOYEE && profile) {
                    const sum = profile.rating_sum_employer - previous + rating;
                    await profile.update({
                        rating_sum_employer: sum,
                        rating_count_employer:
                            profile.rating_count_employer + 1,
                        rating_employer:
                            sum / (profile.rating_count_employer + 1),
                    });
                } else if (req.review.type == ReviewType.EMPLOYER && profile) {
                    const sum = profile.rating_sum_employee - previous + rating;
                    await profile.update({
                        rating_sum_employee: sum,
                        rating_count_employee:
                            profile.rating_count_employee + 1,
                        rating_employee:
                            sum / (profile.rating_count_employee + 1),
                    });
                }

                return res.status(200).json({
                    message: "Updated review",
                });
            }

            if (req.method == "DELETE") {
                const deleted = await req.review.deleteReview();

                if (!deleted) {
                    return res.status(500).json({
                        error: "Failed to delete review",
                    });
                }

                const profile = await req.review.rating_for.getProfile();

                if (req.review.type == ReviewType.EMPLOYEE && profile) {
                    const sum = profile.rating_sum_employer - req.review.rating;
                    await profile.update({
                        rating_sum_employer: sum,
                        rating_count_employer:
                            profile.rating_count_employer - 1,
                        rating_employer:
                            sum / (profile.rating_count_employer - 1),
                    });
                } else if (req.review.type == ReviewType.EMPLOYER && profile) {
                    const sum = profile.rating_sum_employee - req.review.rating;

                    await profile.update({
                        rating_sum_employee: sum,
                        rating_count_employee:
                            profile.rating_count_employee - 1,
                        rating_employee:
                            sum / (profile.rating_count_employee - 1),
                    });
                }

                return res.status(200).json({
                    message: "Deleted review",
                });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
