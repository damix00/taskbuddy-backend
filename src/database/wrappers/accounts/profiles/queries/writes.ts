import { executeQuery } from "../../../../connection";
import { ProfileFields, ProfileModel } from "../../../../models/users/profile";

export namespace writes {
    export type PartialProfile = {
        user_id: number;
        profile_picture?: string | null;
        bio: string;
        location_text: string;
        location_lat?: number | null;
        location_lon?: number | null;
        is_private: boolean;
    };

    /**
     * Adds a profile to the database
     * @param profile
     * @returns {Promise<boolean>} true if the profile was added, false if it was not
     */
    export async function addProfile(
        profile: PartialProfile
    ): Promise<ProfileModel | null> {
        try {
            const query = `INSERT INTO profiles (
                    user_id,
                    profile_picture,
                    bio,
                    location_text,
                    location_lat,
                    location_lon,
                    is_private
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7
                ) RETURNING *`;
            const params = [
                profile.user_id,
                profile.profile_picture,
                profile.bio,
                profile.location_text,
                profile.location_lat,
                profile.location_lon,
                profile.is_private,
            ];
            const result = await executeQuery<ProfileModel>(query, params);

            return result.length > 0 ? result[0] : null;
        } catch (e) {
            console.error("Error in function `addProfile`");
            console.error(e);
            return null;
        }
    }

    /**
     * Updates a profile in the database
     * @param profile - the profile to update
     * @returns {Promise<boolean>} true if the profile was updated, false if it was not
     * */
    export async function updateProfile(
        profile: ProfileModel | ProfileFields
    ): Promise<boolean> {
        try {
            const query = `UPDATE profiles SET
                    profile_picture = $1,
                    bio = $2,
                    rating_employer = $3,
                    rating_employee = $4,
                    rating_count_employer = $5,
                    rating_count_employee = $6,
                    cancelled_employer = $7,
                    cancelled_employee = $8,
                    completed_employer = $9,
                    completed_employee = $10,
                    followers = $11,
                    following = $12,
                    post_count = $13,
                    location_text = $14,
                    location_lat = $15,
                    location_lon = $16,
                    is_private = $17,
                    deleted = $18,
                    updated_at = NOW()
                WHERE id = $19 RETURNING *`;
            const params = [
                profile.profile_picture,
                profile.bio,
                profile.rating_employer,
                profile.rating_employee,
                profile.rating_count_employer,
                profile.rating_count_employee,
                profile.cancelled_employer,
                profile.cancelled_employee,
                profile.completed_employer,
                profile.completed_employee,
                profile.followers,
                profile.following,
                profile.post_count,
                profile.location_text,
                profile.location_lat || null,
                profile.location_lon || null,
                profile.is_private,
                profile.deleted,
                profile.id,
            ];
            const result = await executeQuery<ProfileModel>(query, params);

            return result.length > 0;
        } catch (e) {
            console.error("Error in function `updateProfile`");
            console.error(e);
            return false;
        }
    }
}
