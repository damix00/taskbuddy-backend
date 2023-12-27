export interface NotificationTokenFields {
    id: number;
    user_id: number;
    login_id: number;
    token: string;
    created_at: Date;
    updated_at: Date;
}

export interface NotificationTokenModel extends NotificationTokenFields {
    update(data: Partial<NotificationTokenFields>): Promise<boolean>;
    deleteToken(): Promise<boolean>;
    updateToken(token: string): Promise<boolean>;
}
