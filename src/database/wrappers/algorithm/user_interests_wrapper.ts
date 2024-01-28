import { executeQuery } from "../../connection";
import { UserInterestsFields } from "../../models/algorithm/user_interests";

export enum InterestValues {
    INTERACTION = 1, // An interaction is when a user spends significant time on a post
    BOOKMARK = 2, // A bookmark is when a user saves a post
    UNBOOKMARK = -2, // An unbookmark is when a user removes a post from their bookmarks
    LIKE = 3,
    UNLIKE = -3,
    MESSAGE = 4, // When a user creates a chat channel about a post
    COMPLETE = 7, // When a user completes a job
}

export class UserInterests {
    static async getUserInterests(
        userId: number,
        limit: number = 3
    ): Promise<UserInterestsFields[]> {
        try {
            const q = `
                SELECT *
                FROM user_interests
                WHERE user_id = $1
                ORDER BY weight DESC
                LIMIT $2
            `;

            const result = await executeQuery<UserInterestsFields>(q, [
                userId,
                limit,
            ]);

            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    static async incrementInterestValue(
        user_id: number,
        category_id: number,
        weight: number
    ): Promise<boolean> {
        try {
            const found = await executeQuery(
                `
                    SELECT *
                    FROM user_interests
                    WHERE user_id = $1 AND category_id = $2
                `,
                [user_id, category_id]
            );

            if (found.length === 0) {
                const q = `
                    INSERT INTO user_interests (user_id, category_id, weight)
                    VALUES ($1, $2, $3)
                `;

                await executeQuery(q, [user_id, category_id, weight]);

                return true;
            }

            const q = `
                UPDATE user_interests
                SET weight = weight + $3
                WHERE user_id = $1 AND category_id = $2
            `;

            await executeQuery(q, [user_id, category_id, weight]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}
