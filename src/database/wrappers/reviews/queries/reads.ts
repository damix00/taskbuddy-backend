import { executeQuery } from "../../../connection";
import { ReviewFields } from "../../../models/reviews/review";

function fixTypes(result: ReviewFields): ReviewFields {
    result.id = parseInt(result.id as any);
    result.user_id = parseInt(result.user_id as any);
    result.post_id = parseInt(result.post_id as any);
    result.rating = parseInt(result.rating as any);

    return result;
}

namespace reads {
    export async function getReviewById(
        id: number
    ): Promise<ReviewFields | null> {
        try {
            const q = `
                SELECT *
                FROM reviews
                WHERE id = $1;
            `;

            const result = await executeQuery<ReviewFields>(q, [id]);

            if (result.length === 0) return null;

            return fixTypes(result[0]);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function getReviewByUUID(
        uuid: string
    ): Promise<ReviewFields | null> {
        try {
            const q = `
                SELECT *
                FROM reviews
                WHERE uuid = $1;
            `;

            const result = await executeQuery<ReviewFields>(q, [uuid]);

            if (result.length === 0) return null;

            return fixTypes(result[0]);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function getReviewsByPost(
        post_id: number
    ): Promise<ReviewFields[] | null> {
        try {
            const q = `
                SELECT *
                FROM reviews
                WHERE post_id = $1;
            `;

            const result = await executeQuery<ReviewFields>(q, [post_id]);

            if (result.length === 0) return null;

            return result.map(fixTypes);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

export default reads;
