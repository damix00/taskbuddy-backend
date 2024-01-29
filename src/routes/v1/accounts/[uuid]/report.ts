// /v1/accounts/:uuid/report
// Report a user

import { Response } from "express";
import { authorize } from "../../../../middleware/authorization";
import { ExtendedRequest } from "../../../../types/request";
import { UserReads } from "../../../../database/wrappers/accounts/users/wrapper";
import { UserReportWrites } from "../../../../database/wrappers/reports/user_reports/wrapper";
import { ReportContentType } from "../../../../database/models/reports/user_reports";
import { requireMethod } from "../../../../middleware/require_method";

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

        const user = await UserReads.getUserByUUID(req.params.uuid);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        if (user.id === req.user!.id) {
            return res.status(400).json({
                error: "You cannot report yourself",
            });
        }

        const report = await UserReportWrites.createReport(
            req.user!.id,
            ReportContentType.ACCOUNT,
            user.id,
            reason
        );

        if (!report) {
            return res.status(500).json({
                error: "Failed to create report",
            });
        }

        return res.status(200).json({
            message: "Reported user",
        });
    },
];
