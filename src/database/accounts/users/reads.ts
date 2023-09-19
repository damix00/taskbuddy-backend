// Read operations for the users table
// user_existence is a helper function that checks if a user exists in the database with the given field and value

// Returns the UserModel interface - does not have the functions implemented
// To use the functions create a new instance of the User class

import { executeQuery } from "../../connection";
import { UserModel } from "../../models/user";

/**
 * Get a user from the database with the given field and value
 * @param field - the field to search by
 * @param value - the value to search for
 * @returns {Promise<User | null>} the user if it exists, null if it does not
 * */
async function getUser(field: string, value: any): Promise<UserModel | null> {
    try {
        const query = `SELECT * FROM users WHERE ${field} = $1`;
        const params = [value];
        const users = await executeQuery<UserModel>(query, params);

        return users.length > 0 ? users[0] : null;
    } catch (e) {
        console.error(`Error in function \`getUser\` for field \`${field}\``);
        console.error(e);
        return null;
    }
}

/**
 * Get a user from the database with the given ID
 * @param id
 * @returns {Promise<User | null>} the user if it exists, null if it does not
 * */
export async function getUserById(id: number): Promise<UserModel | null> {
    return await getUser("id", id);
}

/**
 * Get a user from the database with the given UUID
 * @param uuid
 * @returns {Promise<User | null>} the user if it exists, null if it does not
 * */
export async function getUserByUUID(uuid: string): Promise<UserModel | null> {
    return await getUser("uuid", uuid);
}

/**
 * Get a user from the database with the given email
 * @param uuid
 * @returns {Promise<User | null>} the user if it exists, null if it does not
 * */
export async function getUserByEmail(email: string): Promise<UserModel | null> {
    return await getUser("email", email);
}

/**
 * Get a user from the database with the given username
 * @param uuid
 * @returns {Promise<User | null>} the user if it exists, null if it does not
 * */
export async function getUserByUsername(
    username: string
): Promise<UserModel | null> {
    return await getUser("username", username);
}

/**
 * Get a user from the database with the given phone number
 * @param uuid
 * @returns {Promise<User | null>} the user if it exists, null if it does not
 * */
export async function getUserByPhoneNumber(
    phoneNumber: string
): Promise<UserModel | null> {
    return await getUser("phone_number", phoneNumber);
}
