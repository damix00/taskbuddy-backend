import { executeQuery } from "../../../connection";
import { ProfileModel } from "../../../models/profile";

export namespace reads {
    /**
     * Get a user profile from the database with the given field and value
     * @param field - the field to search by
     * @param value - the value to search for
     * @returns {Promise<Profile | null>} the user if it exists, null if it does not
     * */
    async function getProfile(field: string, value: any) {
        try {
            const query = `SELECT * FROM profiles WHERE ${field} = $1`;
            const params = [value];
            const profiles = await executeQuery<ProfileModel>(query, params);

            return profiles.length > 0 ? profiles[0] : null;
        } catch (e) {
            console.error(
                `Error in function \`getProfile\` for field \`${field}\``
            );
            console.error(e);
            return null;
        }
    }

    /**
     * Get a user profile from the database with the given user id
     * @param id - the id of the user
     * @returns {Promise<Profile | null>} the profile if it exists, null if it does not
     * */

    export async function getProfileByUid(id: number) {
        return await getProfile("user_id", id);
    }

    /**
     * Get a user profile from the database with the given username
     * @param username - the username of the user
     * @returns {Promise<Profile | null>} the profile if it exists, null if it does not
     * */
    export async function getProfileByUsername(username: string) {
        return await getProfile("username", username);
    }

    /**
     * Get a user profile from the database with the id
     * @param id - profile id
     * @returns {Promise<Profile | null>} the profile if it exists, null if it does not
     * */
    export async function getProfileById(id: number) {
        return await getProfile("id", id);
    }
}
