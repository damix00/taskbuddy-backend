import { v4 } from "uuid";
import { executeQuery } from "../../../connection";
import {
    CreateReviewFields,
    ReviewFields,
    ReviewWithRelations,
} from "../../../models/reviews/review";

namespace writes {
    async function generateReviewUUID(): Promise<String | null> {
        try {
            do {
                const uuid = v4();

                const q = `
                    SELECT uuid FROM reviews WHERE uuid = $1
                `;

                const r = await executeQuery<{ uuid: string }>(q, [uuid]);

                if (r.length === 0) return uuid;
            } while (true);
        } catch (e) {
            console.error(e);

            return null;
        }
    }

    export async function createReview(
        data: CreateReviewFields
    ): Promise<ReviewWithRelations | null> {
        try {
            const q = `
                INSERT INTO reviews (
                    uuid,
                    user_id,
                    rating_for_id,
                    post_id,
                    post_title,
                    rating,
                    title,
                    description
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8
                ) RETURNING *
            `;

            const result = await executeQuery<ReviewFields>(q, [
                await generateReviewUUID(),
                data.post.uuid,
                data.user.id,
                data.rating_for.id,
                data.post.id,
                data.post.title,
                data.rating,
                data.title,
                data.description,
            ]);

            if (result.length === 0) return null;

            return {
                ...result[0],
                user: data.user,
                user_profile: data.user_profile,
                rating_for: data.rating_for,
                post: data.post,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function updateReview(
        review_id: number,
        data: Partial<ReviewFields>
    ): Promise<boolean> {
        try {
            const q = `
                UPDATE reviews
                SET
                    rating = $1,
                    title = $2,
                    description = $3
                WHERE id = $4
            `;

            await executeQuery(q, [
                data.rating,
                data.title,
                data.description,
                review_id,
            ]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function deleteReview(review_id: number): Promise<boolean> {
        try {
            const q = `
                DELETE FROM reviews
                WHERE id = $1
            `;

            await executeQuery(q, [review_id]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
