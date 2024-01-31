import { executeQuery } from "../../../../connection";
import { LoginModel } from "../../../../models/users/login";

export namespace writes {
    export type PartialLogin = {
        user_id: number;
        ip_address: string;
        user_agent: string;
    };

    export async function addLogin(
        login: PartialLogin
    ): Promise<LoginModel | null> {
        try {
            const query = `
                INSERT INTO logins (user_id, ip_address, user_agent, is_online, last_updated_online)
                VALUES ($1, $2, $3, false, NOW())
                RETURNING *
            `;
            const params = [login.user_id, login.ip_address, login.user_agent];
            const logins = await executeQuery<LoginModel>(query, params);

            return logins.length > 0 ? logins[0] : null;
        } catch (e) {
            console.error("Error in function `addLogin`");
            console.error(e);
            return null;
        }
    }

    export async function updateLogin(login: LoginModel): Promise<boolean> {
        try {
            const query = `
                UPDATE logins
                SET
                    user_id = $1,
                    ip_address = $2,
                    user_agent = $3,
                    is_online = $4,
                    last_updated_online = $5
                WHERE id = $6
                RETURNINT *
            `;
            const params = [
                login.user_id,
                login.ip_address,
                login.user_agent,
                login.is_online,
                login.last_updated_online,
                login.id,
            ];

            const result = await executeQuery<LoginModel>(query, params);

            return result.length > 0;
        } catch (e) {
            console.error("Error in function `updateLogin`");
            console.error(e);
            return false;
        }
    }

    export async function logout(login_id: number): Promise<boolean> {
        try {
            const query = `
            DELETE FROM logins
            WHERE id = $1
            `;
            const params = [login_id];

            await executeQuery(query, params);

            return true;
        } catch (e) {
            console.error("Error in function `logout`");
            console.error(e);
            return false;
        }
    }
}
