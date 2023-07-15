// Write operations for the users table
// Return the UserModel interface - does not have the functions implemented
// To use the functions create a new instance of the User class

import { executeQuery } from "../../connection";
import { UserModel } from "../../models/user";

type PartialUser = {
    uuid: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    auth_provider?: string;
}

/**
 * Adds a user to the database
 * @param user
 * @returns {Promise<boolean>} true if the user was added, false if it was not
*/
export async function addUser(user: PartialUser): Promise<UserModel | null> {
    try {
        const query = 'INSERT INTO users (uuid, email, phone_number, first_name, last_name, password_hash, auth_provider) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
        const params = [user.uuid, user.email, user.phone_number, user.first_name, user.last_name, user.password_hash, user.auth_provider || 'swoop'];
        const result = await executeQuery<UserModel>(query, params);

        return result.length > 0 ? result[0] : null;
    }
    catch (e) {
        console.error('Error in function `addUser`');
        console.error(e);
        return null;
    }
}

/**
 * Updates a user in the database
 * @param user - the user to update
 * @returns {Promise<boolean>} true if the user was updated, false if it was not
 * TODO: finish this
 * */

export async function updateUser(user: UserModel): Promise<UserModel | null> {
    try {
        const query = 'UPDATE users SET email = $1, phone_number = $2, first_name = $3, last_name = $4, password_hash = $5, updated_at = $6 WHERE id = $7';
        const params = [user.email, user.phone_number, user.first_name, user.last_name, user.password_hash, user.updated_at, user.id];
        const result = await executeQuery<UserModel>(query, params);

        return result.length > 0 ? result[0] : null;
    }
    catch (e) {
        console.error('Error in function `updateUser`');
        console.error(e);
        return null;
    }
}