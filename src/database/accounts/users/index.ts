import { executeQuery } from "../../connection";
import { LimitedAccess, Role, UserFields, UserModel } from "../../models/user";
import * as bcrypt from "../../../utils/bcrypt";
import { getUserById } from "./reads";
import { updateUser } from "./writes";
import { DataModel } from "../../data_model";

export class User extends DataModel implements UserModel {
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
    verified: boolean;

    constructor(user: UserFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        Object.assign(this, user);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public async refetch(): Promise<void> {
        const result = await getUserById(this.id);

        if (!result) throw new Error("User not found");

        this.setData(result);
    }

    // Returns a user instance by their ID
    public static async createInstance(id: number): Promise<User | null> {
        const result = await getUserById(id);

        if (!result) return null;

        return new User(result);
    }

    // Updates the user's data
    public async update(data: Partial<UserModel>): Promise<boolean> {
        const newUser = { ...this, ...data };
        const r = await updateUser(newUser);

        this._refetch();

        return r;
    }

    // This will add a login to the database associated with the user
    public async addLogin(ip: string, userAgent: string): Promise<boolean> {
        // Update the last login timestamp
        await updateUser({ ...this, last_login: new Date() });
        this.last_login = new Date();

        this._refetch(); // Refetch user data

        // Insert a login record into the database
        await executeQuery(
            "INSERT INTO logins (user_id, ip_address, user_agent) VALUES ($1, $2, $3)",
            [this.id, ip, userAgent]
        );
        return true;
    }

    public deleteUser(): Promise<boolean> {
        return this.update({ deleted: true });
    }

    public async changePassword(newPassword: string): Promise<boolean> {
        const hash = await bcrypt.hashPassword(newPassword);
        this.password_hash = hash;

        // Increment token version to log out all devices
        return await this.update({
            password_hash: hash,
            token_version: ++this.token_version,
        });
    }

    public async comparePassword(password: string): Promise<boolean> {
        return await bcrypt.comparePassword(password, this.password_hash);
    }

    // Checks if the user has a certain limited access
    // For example if they cannot post, comment, etc.
    public hasDisabledAccess(access: LimitedAccess): boolean {
        return this.limited_access?.includes(access);
    }

    // Adds a limited access to the user
    public async addDisabledAccess(access: LimitedAccess): Promise<boolean> {
        if (this.hasDisabledAccess(access)) {
            return true; // Already added
        }

        this.limited_access.push(access);

        return await this.update({ limited_access: this.limited_access });
    }

    // Removes a limited access from the user
    public async removeDisabledAccess(access: LimitedAccess): Promise<boolean> {
        if (!this.hasDisabledAccess(access)) {
            return true; // Already removed
        }

        // Remove the access from the array
        this.limited_access = this.limited_access.filter((a) => a !== access);

        return await this.update({ limited_access: this.limited_access });
    }

    // Checks if the user has a certain role
    // For example admin, moderator, etc.
    public hasRole(role: Role): boolean {
        return this.role === role;
    }

    // Checks if the user is an admin
    public isAdmin(): boolean {
        return this.role === "admin";
    }

    // Sets the user's role
    public setRole(role: Role): Promise<boolean> {
        return this.update({ role });
    }

    // Sets if the user has premium
    public async setPremium(premium: boolean): Promise<boolean> {
        return await this.update({ has_premium: premium });
    }

    // Sets the user's phone number
    public async setPhoneNumber(phoneNumber: string): Promise<boolean> {
        return await this.update({ phone_number: phoneNumber });
    }

    // Sets the user's phone number verified status
    public async setPhoneNumberVerified(verified: boolean): Promise<boolean> {
        return await this.update({ phone_number_verified: verified });
    }

    // Logs the user out of all devices
    public async logOutOfAllDevices(): Promise<boolean> {
        return await this.update({ token_version: ++this.token_version });
    }

    // Sets the user's verified status
    // This is if they are a famous or notable person (for example MrBeast)
    public async setVerified(verified: boolean): Promise<boolean> {
        return await this.update({ verified });
    }
}
