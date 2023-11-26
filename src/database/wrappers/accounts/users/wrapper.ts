import { UserFields, UserModel } from "../../../models/users/user";
import { User } from "./index";
import { reads } from "./queries/reads";
import { writes } from "./queries/writes";
import * as existence from "./queries/user_existence";

function toUser(user: UserModel | UserFields | null): User | null {
    if (!user) return null;

    return new User(user);
}

export class UserReads {
    static async getUserById(id: number): Promise<User | null> {
        return toUser(await reads.getUserById(id));
    }

    static async getUserByUUID(uuid: string): Promise<User | null> {
        return toUser(await reads.getUserByUUID(uuid));
    }

    static async getUserByEmail(email: string): Promise<User | null> {
        return toUser(await reads.getUserByEmail(email));
    }

    static async getUserByUsername(username: string): Promise<User | null> {
        return toUser(await reads.getUserByUsername(username));
    }

    static async getUserByPhoneNumber(
        phoneNumber: string
    ): Promise<User | null> {
        return toUser(await reads.getUserByPhoneNumber(phoneNumber));
    }

    static async doesUUIDExist(uuid: string): Promise<boolean> {
        return await existence.doesUUIDExist(uuid);
    }

    static async doesEmailExist(email: string): Promise<boolean> {
        return await existence.doesEmailExist(email);
    }

    static async doesUsernameExist(username: string): Promise<boolean> {
        return await existence.doesUsernameExist(username);
    }

    static async doesPhoneNumberExist(phoneNumber: string): Promise<boolean> {
        return await existence.doesPhoneNumberExist(phoneNumber);
    }
}

export class UserWrites {
    static async addUser(user: writes.PartialUser): Promise<User | null> {
        return toUser(await writes.addUser(user));
    }

    static async updateUser(user: UserModel): Promise<boolean> {
        return await writes.updateUser(user);
    }

    static async permaDelete(id: number): Promise<boolean> {
        return await writes.permaDelete(id);
    }
}
