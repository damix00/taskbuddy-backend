export enum ReportContentType {
    POST = 1,
    ACCOUNT = 2,
}

export interface UserReportFields {
    id: number;
    user_id: number;
    content_type: ReportContentType;
    content_id: number;
    reason: string;
    reviewed: boolean;
    verdict: boolean;
    reviewed_by: number;
    created_at: Date;
    updated_at: Date;
}
