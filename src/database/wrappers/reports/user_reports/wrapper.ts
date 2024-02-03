import { ReportContentType } from "../../../models/reports/user_reports";
import writes from "./queries/writes";

export class UserReportWrites {
    static async createReport(
        user_id: number,
        content_type: ReportContentType,
        content_id: number,
        reason: string
    ): Promise<boolean> {
        return await writes.createReport(
            user_id,
            content_type,
            content_id,
            reason
        );
    }

    static async deleteUserReports(user_id: number): Promise<boolean> {
        return await writes.deleteUserReports(user_id);
    }
}
