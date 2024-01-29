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
}
