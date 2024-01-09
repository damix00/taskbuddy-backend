import {
    LimitedAccess,
    Role,
    UserFields,
    UserModel,
} from "../../../models/users/user";
import * as bcrypt from "../../../../utils/bcrypt";
import { reads } from "./queries/reads";
import { writes } from "./queries/writes";
import { DataModel } from "../../../data_model";
import { Login } from "../logins";
import { LoginWrites } from "../logins/wrapper";
import { ProfileReads } from "../profiles/wrapper";
import { Profile } from "../profiles";
import { FollowReads } from "../follows/wrapper";
import * as fcm from "../../../../firebase/notifications";
import { NotificationReads } from "../notifications/wraper";
import { emitToUser } from "../../../../socket/socket_server";

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

        // Set the user's data
        Object.assign(this, user);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    public override async refetch(): Promise<void> {
        const result = await reads.getUserById(this.id);

        if (!result) throw new Error("User not found");

        super.setData(result);
    }

    // Returns a user instance by their ID
    public static async createInstance(id: number): Promise<User | null> {
        const result = await reads.getUserById(id);

        if (!result) return null;

        return new User(result, false);
    }

    // Updates the user's data
    public async update(data: Partial<UserModel>): Promise<boolean> {
        const newUser = { ...this, ...data };
        const r = await writes.updateUser(newUser);

        await this._refetch();

        return r;
    }

    // This will add a login to the database associated with the user
    public async addLogin(
        ip: string,
        userAgent: string
    ): Promise<Login | null> {
        // Update the last login timestamp
        this.last_login = new Date();

        // Update the user in the database
        await writes.updateUser(this);

        this._refetch(); // Refetch user data

        return await LoginWrites.addLogin({
            user_id: this.id,
            ip_address: ip,
            user_agent: userAgent,
        });
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

    // Checks if the user is following another user
    public async isFollowing(user_id: number): Promise<boolean> {
        return FollowReads.isFollowing(this.id, user_id);
    }

    // Returns the user's profile
    public async getProfile(): Promise<Profile | null> {
        return await ProfileReads.getProfileByUid(this.id);
    }

    /**
     * Send a notification to the user's devices
     */
    public async sendNotification(
        notification: fcm.Notification
    ): Promise<boolean> {
        const tokens = await NotificationReads.getUserTokens(this.id);

        if (!tokens || tokens.length == 0) {
            console.error(`No tokens found for user ${this.username}`);
            return false;
        }

        const res = await fcm.sendNotification(
            notification,
            tokens.map((t) => t.token)
        );

        return res.success;
    }

    public sendSocketEvent(event: string, ...args: any[]) {
        emitToUser(this.uuid, event, ...args);
    }
}
