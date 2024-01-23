import { executeQuery } from "../../connection";
import { UserInterestsFields } from "../../models/algorithm/user_interests";

export class UserInterests {
    static async getUserInterests(
        userId: number
    ): Promise<UserInterestsFields[]> {
        try {
            const q = `
                SELECT *
                FROM user_interests
                WHERE user_id = $1
            `;

            const result = await executeQuery<UserInterestsFields>(q, [userId]);

            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    static async setInterestValue(
        user_id: number,
        category_id: number,
        weight: number
    ): Promise<boolean> {
        try {
            const q = `
                INSERT INTO user_interests (user_id, category_id, weight)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, category_id)
                DO UPDATE SET weight = $3
            `;

            await executeQuery(q, [user_id, category_id, weight]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}
