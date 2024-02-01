// Wrapper classes for queries
// Meant to be used outside of the main class, due to node.js circular dependencies

import { Login } from ".";
import { LoginFields, LoginModel } from "../../../models/users/login";
import { reads } from "./queries/reads";
import { writes } from "./queries/writes";

function toLogin(login: LoginModel | LoginFields | null): Login | null {
    if (!login) return null;

    return new Login(login);
}

export class LoginReads {
    static async getLoginById(id: number): Promise<Login | null> {
        return toLogin(await reads.getLoginById(id));
    }

    static async getLoginsByUserId(user_id: number): Promise<Login[]> {
        const logins = await reads.getLoginsByUserId(user_id);

        if (!logins) return [];

        return logins.map((login) => new Login(login));
    }
}

export class LoginWrites {
    static async addLogin(login: writes.PartialLogin): Promise<Login | null> {
        return toLogin(await writes.addLogin(login));
    }

    static async updateLogin(login: LoginModel): Promise<boolean> {
        return await writes.updateLogin(login);
    }

    static async logout(login_id: number): Promise<boolean> {
        return await writes.logout(login_id);
    }

    static async deleteAll(user_id: number): Promise<boolean> {
        return await writes.deleteAll(user_id);
    }
}
