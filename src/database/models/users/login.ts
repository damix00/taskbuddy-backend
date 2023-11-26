export interface LoginFields {
    id: number;
    user_id: number;
    created_at: Date;
    ip_address: string;
    user_agent: string;
    is_online: boolean;
    last_updated_online: Date;
}

export interface LoginModel extends LoginFields {
    update(data: Partial<LoginFields>): Promise<boolean>;
    keepAlive(): Promise<boolean>;
    isOnline(): boolean;
}
