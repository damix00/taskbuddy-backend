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
    phone_number: string;
    phone_number_verified: boolean;
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

        return r;
    }
    
    // This will add a login to the database associated with the user
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

    public delete(): Promise<boolean> {
        return this.update({ deleted: true });
    }

    public async changePassword(newPassword: string): Promise<boolean> {
        const hash = await bcrypt.hashPassword(newPassword);
        this.password_hash = hash;

        return await this.update({ password_hash: hash });
    }
    
    public async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.comparePassword(password, this.password_hash);
    }

    public async refetch(): Promise<void> {
        const result = await getUserById(this.id);

        if (!result)
            throw new Error('User not found');

        this.setData(result);
    }

    public hasDisabledAccess(access: LimitedAccess): boolean {
        return this.limited_access.includes(access);
    }

    public async addDisabledAccess(access: LimitedAccess): Promise<boolean> {
        if (this.hasDisabledAccess(access)) {
            return false;
        }

        this.limited_access.push(access);
        
        return await this.update({ limited_access: this.limited_access });
    }

    public async removeDisabledAccess(access: LimitedAccess): Promise<boolean> {
        if (!this.hasDisabledAccess(access)) {
            return false;
        }

        this.limited_access = this.limited_access.filter(a => a !== access);

        return await this.update({ limited_access: this.limited_access });
    }

    public hasRole(role: Role): boolean {
        return this.role === role;
    }

    public isAdmin(): boolean {
        return this.role === 'admin';
    }

    public setRole(role: Role): Promise<boolean> {
        return this.update({ role });
    }

    public async setPremium(premium: boolean): Promise<boolean> {
        return await this.update({ has_premium: premium });
    }

    public async setPhoneNumber(phoneNumber: string): Promise<boolean> {
        return await this.update({ phone_number: phoneNumber });
    }

    public async setPhoneNumberVerified(verified: boolean): Promise<boolean> {
        return await this.update({ phone_number_verified: verified });
    }

    public async logOutOfAllDevices(): Promise<boolean> {
        return await this.update({ token_version: ++this.token_version });
    }
}