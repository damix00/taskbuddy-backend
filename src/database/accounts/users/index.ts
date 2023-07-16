import { executeQuery } from "../../connection";
import { LimitedAccess, Role, UserFields, UserModel } from "../../models/user";
import * as bcrypt from "../../../utils/bcrypt";
import { getUserById } from "./reads";
import { updateUser } from "./writes";

export class User implements UserModel {
    id: number;
    uuid: string;
    username: string;
    email: string;
    email_verified: boolean;
    first_name: string;
    last_name: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
    last_login: Date;
    role: Role;
    token_version: number;
    auth_provider: string;
    deleted: boolean;
    has_premium: boolean;
    limited_access: LimitedAccess[];

    refetchOnUpdate: boolean = true;

    private setData(user: UserFields) {
        Object.assign(this, user);
    }

    // Called on every update function
    // If refetchOnUpdate is true, refetches the user from the database
    private async _refetch(): Promise<void> {
        if (this.refetchOnUpdate) {
            this.refetch();
        }
    }

    constructor(user: UserFields, refetchOnUpdate: boolean = true) {
        Object.assign(this, user);
        this.refetchOnUpdate = refetchOnUpdate;
    }
    
    public async update(data: Partial<UserModel>): Promise<boolean> {
        const newUser = { ...this, ...data };
        const r = await updateUser(newUser);

        this._refetch();

        return !!r;
    }

    public async addLogin(ip: string, userAgent: string): Promise<boolean> {
        try {
            await updateUser({ ...this, last_login: new Date() });
            this.last_login = new Date();

            this._refetch();

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

        this._refetch();

        return !!result;
    }

    public async changePassword(newPassword: string): Promise<boolean> {
        const hash = await bcrypt.hashPassword(newPassword);
        this.password_hash = hash;

        const result = await updateUser({ ...this, password_hash: hash });

        this._refetch();

        return !!result;
    }
    
    public async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.comparePassword(password, this.password_hash);
    }

    public async refetch(): Promise<void> {
        const result = await getUserById(this.id);

        throw new Error('User not found');
    }

    public hasDisabledAccess(access: LimitedAccess): boolean {
        return this.limited_access.includes(access);
    }

    public async addDisabledAccess(access: LimitedAccess): Promise<boolean> {
        if (this.hasDisabledAccess(access)) {
            return false;
        }

        this.limited_access.push(access);
        const result = await updateUser({ ...this, limited_access: this.limited_access });

        this._refetch();

        return !!result;
    }

    public async removeDisabledAccess(access: LimitedAccess): Promise<boolean> {
        if (!this.hasDisabledAccess(access)) {
            return false;
        }

        this.limited_access = this.limited_access.filter(a => a !== access);
        const result = await updateUser({ ...this, limited_access: this.limited_access });

        this._refetch();

        return !!result;
    }
}