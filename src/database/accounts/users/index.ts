import { executeQuery } from "../../connection";
import { UserFields, UserModel } from "../../models/user";
import * as bcrypt from "../../../utils/bcrypt";
import { getUserById } from "./reads";
import { updateUser } from "./writes";

export class User implements UserModel {
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

    private setData(user: UserFields) {
        Object.assign(this, user);
    }

    constructor(user: UserFields) {
        Object.assign(this, user);
    }

    // Methods
    
    public async update(data: Partial<UserModel>): Promise<boolean> {
        const newUser = { ...this, ...data };
        const r = await updateUser(newUser);

        if (r) {
            this.setData(r);
        }

        return !!r;
    }

    public async addLogin(ip: string, userAgent: string): Promise<boolean> {
        try {
            await updateUser({ ...this, last_login: new Date() });
            this.last_login = new Date();
            await executeQuery('INSERT INTO logins (user_id, ip_address, user_agent) VALUES ($1, $2, $3)', [this.id, ip, userAgent]);
            return true;
        }
        catch (e) {
            console.error('Error in function `addLogin`');
            console.error(e);
            return false;
        }
    }

    public async delete(): Promise<boolean> {
        this.deleted = true;
        const result = await updateUser({ ...this, deleted: true });

        if (result) {
            this.setData(result);
        }

        return !!result;
    }

    public async verifyPhoneNumber(): Promise<boolean> {
        this.phone_number_verified = true;
        const result = await updateUser({ ...this, phone_number_verified: true });

        if (result) {
            this.setData(result);
        }

        return !!result;
    }

    public async changePassword(newPassword: string): Promise<boolean> {
        const hash = await bcrypt.hashPassword(newPassword);
        this.password_hash = hash;

        const result = await updateUser({ ...this, password_hash: hash });
        
        if (result) {
            this.setData(result);
        }

        return !!result;
    }
    
    public async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.comparePassword(password, this.password_hash);
    }

    public async refetch(): Promise<void> {
        const result = await getUserById(this.id);

        if (result) {
            this.setData(result);
            return;
        }

        throw new Error('User not found');
    }
}