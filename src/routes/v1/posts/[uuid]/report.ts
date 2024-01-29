// POST /v1/posts/:uuid/report
// Report a post

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { requireMethod } from "../../../../middleware/require_method";
import { ExtendedRequest } from "../../../../types/request";
import { PostReads } from "../../../../database/wrappers/posts/post/wrapper";
import { UserReportWrites } from "../../../../database/wrappers/reports/user_reports/wrapper";
import { ReportContentType } from "../../../../database/models/reports/user_reports";

export default [
    requireMethod("POST"),
    authorize(true),
    async (req: ExtendedRequest, res: Response) => {
        const { reason } = req.body;

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

        const post = await PostReads.getPostByUUID(req.params.uuid);

        if (!post) {
            return res.status(404).json({
                error: "Post not found",
            });
        }

        const report = await UserReportWrites.createReport(
            req.user!.id,
            ReportContentType.POST,
            post.id,
            reason
        );

        if (!report) {
            return res.status(500).json({
                error: "Failed to create report",
            });
        }

        return res.status(200).json({
            message: "Reported post",
        });
    },
];
