export interface UserFields {
    id: number;
    uuid: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
    last_login: Date;
    is_admin: boolean;
    phone_number_verified: boolean;
    token_version: number;
    auth_provider: string;
    deleted: boolean;
    allow_login: boolean;
}

export interface UserModel extends UserFields {
    update: (data: Partial<UserModel>) => Promise<boolean>;
    addLogin: (ip: string, userAgent: string) => Promise<boolean>;
    delete: () => Promise<boolean>;
    verifyPhoneNumber: () => Promise<boolean>;
    changePassword: (newPassword: string) => Promise<boolean>;
    comparePassword: (password: string) => Promise<boolean>;
    refetch: () => Promise<void>;
};