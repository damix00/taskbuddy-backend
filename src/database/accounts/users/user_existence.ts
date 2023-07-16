// user_existence.ts - check if a given field/value exists in the database for users

import { executeQuery } from "../../connection";
import { UserModel } from "../../models/user";

/**
 * Returns if a user exists in the database with the given field and value
 * @param field - the field to search by
 * @param value - the value to search for
 * @returns {Promise<boolean>} true if the user exists, false if it does not
 * */
async function doesFieldExist(field: string, value: string): Promise<boolean> {
    try {
        const query = `SELECT id FROM users WHERE ${field} = $1`;
        const params = [value];
        const users = await executeQuery<UserModel>(query, params);

        return users.length > 0;
    }
    catch (e) {
        console.error(`Error in function \`doesFieldExist\` for field \`${field}\``);
        console.error(e);
        return false;
    }
}

/**
 * Check if a UUID exists in the database
 * @param uuid
 * @returns {Promise<boolean>} true if the UUID exists, false if it does not
 */
export async function doesUUIDExist(uuid: string): Promise<boolean> {
    return await doesFieldExist("uuid", uuid);
}

/**
 * Check if an email exists in the database
 * @param email
 * @returns {Promise<boolean>} true if the email exists, false if it does not
 * */
export async function doesEmailExist(email: string): Promise<boolean> {
    return await doesFieldExist("email", email);
}

/**
 * Check if a username exists in the database
 * @param username
 * @returns {Promise<boolean>} true if the username exists, false if it does not
 * */
export async function doesUsernameExist(username: string): Promise<boolean> {
    return await doesFieldExist("username", username);
}