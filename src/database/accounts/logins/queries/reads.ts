import { executeQuery } from "../../../connection";
import { LoginModel } from "../../../models/login";

export namespace reads {
    /**
     * Get a user login instance from the database with the given field and value
     * @param field - the field to search by
     * @param value - the value to search for
     * @returns {Promise<LoginModel | null>} the user if it exists, null if it does not
     * */
    async function getLogin(field: string, value: any) {
        try {
            const query = `SELECT * FROM logins WHERE ${field} = $1`;
            const params = [value];
            const logins = await executeQuery<LoginModel>(query, params);

            return logins.length > 0 ? logins[0] : null;
        } catch (e) {
            console.error(
                `Error in function \`getLogins\` for field \`${field}\``
            );
            console.error(e);
            return null;
        }
    }

    /**
     * Get all user login instances from the database with the given field and value
     */
    async function getLogins(field: string, value: any) {
        try {
            const query = `SELECT * FROM logins WHERE ${field} = $1`;
            const params = [value];
            const logins = await executeQuery<LoginModel>(query, params);

            return logins;
        } catch (e) {
            console.error(
                `Error in function \`getLogins\` for field \`${field}\``
            );
            console.error(e);
            return null;
        }
    }

    /**
     * Get a user login instance from the database with the given ID
     * @param id - the ID to search by
     * @returns {Promise<LoginModel | null>} the user if it exists, null if it does not
     * */
    export async function getLoginById(id: number) {
        return getLogin("id", id);
    }

    /**
     * Get all user login instances from the database with the given user ID
     * @param user_id - the user ID to search by
     * @returns {Promise<LoginModel[] | null>} the user if it exists, null if it does not
     */

    export async function getLoginsByUserId(user_id: number) {
        return getLogins("user_id", user_id);
    }
}
