// Read operations for the users table
// user_existence is a helper function that checks if a user exists in the database with the given field and value

// Returns the UserModel interface - does not have the functions implemented
// To use the functions create a new instance of the User class

import { executeQuery } from "../../../../connection";
import { ProfileModel } from "../../../../models/users/profile";
import { UserModel } from "../../../../models/users/user";

export namespace reads {
    /**
     * Get a user from the database with the given field and value
     * @param field - the field to search by
     * @param value - the value to search for
     * @returns {Promise<User | null>} the user if it exists, null if it does not
     * */
    async function getUser(
        field: string,
        value: any,
        requested_by_id?: number
    ): Promise<UserModel | null> {
        try {
            const query = `
                SELECT * FROM users WHERE ${field} = $1
                ${
                    requested_by_id
                        ? `AND (NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = $2 AND blocks.blocked = users.id) OR NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = users.id AND blocks.blocked = $2))`
                        : ""
                }
            `;
            const params = [value];
            if (requested_by_id) params.push(requested_by_id);
            const users = await executeQuery<UserModel>(query, params);

            return users.length > 0 ? users[0] : null;
        } catch (e) {
            console.error(
                `Error in function \`getUser\` for field \`${field}\``
            );
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
    export async function getUserByUUID(
        uuid: string,
        requested_by_id?: number
    ): Promise<UserModel | null> {
        return await getUser("uuid", uuid, requested_by_id);
    }

    /**
     * Get a user from the database with the given email
     * @param uuid
     * @returns {Promise<User | null>} the user if it exists, null if it does not
     * */
    export async function getUserByEmail(
        email: string
    ): Promise<UserModel | null> {
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

    /**
     * Search for users in the database with the given query
     * @param query - the query to search for
     * @param offset - the offset to start from
     * @returns {Promise<UserModel[]>} the users that match the query
     * */
    export async function searchUsers(
        query: string,
        offset: number,
        user_id: number
    ): Promise<
        { user: UserModel; following: false; profile: Partial<ProfileModel> }[]
    > {
        try {
            const params = [`%${query}%`, user_id, offset];
            const users = await executeQuery<any>(
                `
                SELECT
                    users.*,
                    profiles.profile_picture,
                    profiles.bio,
                    profiles.rating_employer,
                    profiles.rating_employee,
                    profiles.rating_count_employer,
                    profiles.rating_count_employee,
                    profiles.cancelled_employer,
                    profiles.cancelled_employee,
                    profiles.completed_employer,
                    profiles.completed_employee,
                    profiles.followers,
                    profiles.following,
                    profiles.post_count,
                    profiles.location_text,
                    profiles.location_lat,
                    profiles.location_lon,
                    profiles.is_private,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $2 AND follows.following = users.id) AS is_following
                FROM users AS users
                INNER JOIN profiles ON users.id = profiles.user_id
                WHERE users.username ILIKE $1 AND users.deleted = FALSE
                AND users.id != $2 AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = users.id AND blocks.blocked = $2) AND NOT EXISTS(SELECT 1 FROM blocks WHERE blocks.blocker = $2 AND blocks.blocked = users.id)
                ORDER BY users.username ASC
                LIMIT 10
                OFFSET $3
                `,
                params
            );

            return users.map((user) => ({
                user: user,
                following: user.is_following,
                profile: {
                    profile_picture: user.profile_picture,
                    bio: user.bio,
                    rating_employer: user.rating_employer,
                    rating_employee: user.rating_employee,
                    rating_count_employer: user.rating_count_employer,
                    rating_count_employee: user.rating_count_employee,
                    cancelled_employer: user.cancelled_employer,
                    cancelled_employee: user.cancelled_employee,
                    completed_employer: user.completed_employer,
                    completed_employee: user.completed_employee,
                    followers: user.followers,
                    following: user.following,
                    posts: user.posts,
                    location_text: user.location_text,
                    location_lat: user.location_lat,
                    location_lon: user.location_lon,
                    is_private: user.is_private,
                },
            }));
        } catch (e) {
            console.error(`Error in function \`searchUsers\``);
            console.error(e);
            return [];
        }
    }
}
