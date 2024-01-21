import { executeQuery } from "../../../connection";
import {
    ReviewFields,
    ReviewWithRelations,
} from "../../../models/reviews/review";

async function getReviewByField(
    field: string,
    value: any
): Promise<ReviewWithRelations | null> {
    try {
        const q = `
            SELECT reviews.*,
                TO_JSON(user_data.*) AS user,
                TO_JSON(rating_for_data.*) AS rating_for,
                TO_JSON(profile_data.*) AS user_profile
            FROM reviews
            LEFT JOIN users AS user_data ON reviews.user_id = user_data.id
            LEFT JOIN users AS rating_for_data ON reviews.rating_for_id = rating_for_data.id
            LEFT JOIN profiles AS profile_data ON user_data.id = profile_data.user_id
            WHERE ${field} = $1
            GROUP BY reviews.id, user_data.id, rating_for_data.id, profile_data.id
            ORDER BY reviews.created_at DESC
            LIMIT 1
        `;

        const result = await executeQuery<ReviewWithRelations>(q, [value]);

        if (result.length === 0) return null;

        return result[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}

namespace reads {
    export async function getReviewById(
        id: number
    ): Promise<ReviewWithRelations | null> {
        return await getReviewByField("reviews.id", id);
    }

    export async function getReviewByUUID(
        uuid: string
    ): Promise<ReviewWithRelations | null> {
        return await getReviewByField("reviews.uuid", uuid);
    }

    export interface ReviewsForUser {
        written: ReviewWithRelations[];
        recieved: ReviewWithRelations[];
    }

    export async function getReviewsForUser(
        user_id: number,
        requested_by_id: number,
        offset: number = 0,
        type: number = 0
    ): Promise<ReviewsForUser | null> {
        try {
            // First, select reviews that the user (requested_by_id) has written for the user (user_id)
            const writtenQuery = `
                SELECT reviews.*,
                    TO_JSON(user_data.*) AS user,
                    TO_JSON(rating_for_data.*) AS rating_for,
                    TO_JSON(profile_data.*) AS user_profile,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $1 AND follows.following = reviews.user_id) AS following
                FROM reviews
                LEFT JOIN users AS user_data ON reviews.user_id = user_data.id
                LEFT JOIN users AS rating_for_data ON reviews.rating_for_id = rating_for_data.id
                LEFT JOIN profiles AS profile_data ON user_data.id = profile_data.user_id
                WHERE reviews.user_id = $1 AND reviews.rating_for_id = $2 ${
                    type
                        ? type == 1
                            ? "AND reviews.type = 1"
                            : "AND reviews.type = 0"
                        : ""
                }
                GROUP BY reviews.id, user_data.id, rating_for_data.id, profile_data.id
                ORDER BY reviews.created_at DESC
                OFFSET $3 LIMIT 20
            `;

            const writtenResult = await executeQuery<ReviewWithRelations>(
                writtenQuery,
                [requested_by_id, user_id, offset]
            );

            // Select reviews that the user (requested_by_id) has received

            const recievedQuery = `
                SELECT reviews.*,
                    TO_JSON(user_data.*) AS user,
                    TO_JSON(rating_for_data.*) AS rating_for,
                    TO_JSON(profile_data.*) AS user_profile,
                    EXISTS(SELECT 1 FROM follows WHERE follows.follower = $1 AND follows.following = reviews.user_id) AS following
                FROM reviews
                LEFT JOIN users AS user_data ON reviews.user_id = user_data.id
                LEFT JOIN users AS rating_for_data ON reviews.rating_for_id = rating_for_data.id
                LEFT JOIN profiles AS profile_data ON user_data.id = profile_data.user_id
                WHERE reviews.rating_for_id = $2 ${
                    type
                        ? type == 1
                            ? "AND reviews.type = 1"
                            : "AND reviews.type = 0"
                        : ""
                }
                GROUP BY reviews.id, user_data.id, rating_for_data.id, profile_data.id
                ORDER BY reviews.created_at DESC
                OFFSET $3 LIMIT 20
            `;

            const recievedResult = await executeQuery<ReviewWithRelations>(
                recievedQuery,
                [requested_by_id, user_id, offset]
            );

            return {
                written: writtenResult,
                recieved: recievedResult,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

export default reads;
