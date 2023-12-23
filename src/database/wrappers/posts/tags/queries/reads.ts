import { executeQuery } from "../../../../connection";
import { PostTagModel } from "../../../../models/posts/post_tag";

namespace reads {
    export async function getTagById(id: number): Promise<PostTagModel | null> {
        try {
            const query = `
                SELECT *
                FROM post_tags
                INNER JOIN post_categories ON post_tags.category_id = post_categories.category_id
                WHERE tag_id = $1
            `;

            const result = await executeQuery<PostTagModel>(query, [id]);

            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.error(err);

            return null;
        }
    }

    export async function getTagsByCategory(
        category_id: number
    ): Promise<PostTagModel[]> {
        try {
            const query = `
                SELECT *
                FROM post_tags
                INNER JOIN post_categories ON post_tags.category_id = post_categories.category_id
                WHERE post_categories.category_id = $1
            `;

            const result = await executeQuery<PostTagModel>(query, [
                category_id,
            ]);

            return result;
        } catch (err) {
            console.error(err);

            return [];
        }
    }

    type TagCount = {
        tag_id: number;
        tag_name: string;
        tag_count: number;
    };

    export async function getTrendingTags(limit: number): Promise<TagCount[]> {
        try {
            const q = `
                SELECT
                    pt.tag_id,
                    t.tag_name,
                    COUNT(*) AS tag_count
                FROM
                    post_tag_relationship pt
                JOIN
                    post_tags t ON pt.tag_id = t.tag_id
                WHERE
                    pt.created_at >= NOW() - INTERVAL '24 hours'
                GROUP BY
                    pt.tag_id, t.tag_name
                ORDER BY
                    tag_count DESC
                LIMIT $1
            `;

            const result = await executeQuery<TagCount>(q, [limit]);

            return result;
        } catch (err) {
            console.error(err);

            return [];
        }
    }
}

export default reads;
