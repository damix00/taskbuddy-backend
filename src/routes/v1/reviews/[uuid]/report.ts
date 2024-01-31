// POST /v1/reviews/:uuid/report
// Report a review

import { Response } from "express";
import { requireMethod } from "../../../../middleware/require_method";
import { ReviewRequest, withReview } from "./middleware";
import { UserReportWrites } from "../../../../database/wrappers/reports/user_reports/wrapper";
import { ReportContentType } from "../../../../database/models/reports/user_reports";
import { authorize } from "../../../../middleware/authorization";

export default [
    requireMethod("POST"),
    authorize(false),
    withReview,
    async (req: ReviewRequest, res: Response) => {
        try {
            const reason = req.body.reason;

            if (!reason) {
                return res.status(400).json({
                    error: "Please fill out all fields",
                });
            }

            if (reason.length == 0) {
                return res.status(400).json({
                    error: "Reason must be at least 1 character",
                });
            }

            if (reason.length > 512) {
                return res.status(400).json({
                    error: "Reason must be less than 512 characters",
                });
            }

            const report = await UserReportWrites.createReport(
                req.user!.id,
                ReportContentType.REVIEW,
                req.review.id,
                reason
            );

            if (!report) {
                return res.status(500).json({
                    error: "Failed to create report",
                });
            }

            return res.status(200).json({
                message: "Reported review",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    },
];
