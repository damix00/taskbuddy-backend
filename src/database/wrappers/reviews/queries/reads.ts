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
                TO_JSON(user.*) AS user,
                TO_JSON(rating_for.*) AS rating_for,
                TO_JSON(post.*) AS post
            FROM reviews
            LEFT JOIN users AS user ON reviews.user_id = user.id
            LEFT JOIN users AS rating_for ON reviews.rating_for_id = rating_for.id
            LEFT JOIN posts AS post ON reviews.post_id = post.id
            WHERE ${field} = $1
            GROUP BY reviews.id, user.id, rating_for.id, post.id
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
        offset: number = 0
    ): Promise<ReviewsForUser | null> {
        try {
            // First, select reviews that the user (requested_by_id) has written for the user (user_id)
            const writtenQuery = `
                SELECT reviews.*,
                    TO_JSON(user.*) AS user,
                    TO_JSON(rating_for.*) AS rating_for,
                    TO_JSON(post.*) AS post
                FROM reviews
                LEFT JOIN users AS user ON reviews.user_id = user.id
                LEFT JOIN users AS rating_for ON reviews.rating_for_id = rating_for.id
                LEFT JOIN posts AS post ON reviews.post_id = post.id
                WHERE reviews.user_id = $1 AND reviews.rating_for_id = $2
                GROUP BY reviews.id, user.id, rating_for.id, post.id
                ORDER BY reviews.created_at DESC
                OFFSET $3 LIMIT 20
            `;

            const writtenResult = await executeQuery<ReviewWithRelations>(
                writtenQuery,
                [requested_by_id, user_id, offset]
            );

            // Select reviews that the user (requested_by_id) has received

            const received = `
                SELECT reviews.*,
                    TO_JSON(user.*) AS user,
                    TO_JSON(rating_for.*) AS rating_for,
                    TO_JSON(post.*) AS post
                FROM reviews
                LEFT JOIN users AS user ON reviews.user_id = user.id
                LEFT JOIN users AS rating_for ON reviews.rating_for_id = rating_for.id
                LEFT JOIN posts AS post ON reviews.post_id = post.id
                WHERE reviews.user_id = $1 AND reviews.rating_for_id = $2
                GROUP BY reviews.id, user.id, rating_for.id, post.id
                ORDER BY reviews.created_at DESC
                OFFSET $3 LIMIT 20
            `;

            const recipientResult = await executeQuery<ReviewWithRelations>(
                received,
                [user_id, requested_by_id, offset]
            );

            return {
                written: writtenResult,
                recieved: recipientResult,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

export default reads;
