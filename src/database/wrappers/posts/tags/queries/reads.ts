import { executeQuery } from "../../../../connection";
import { PostTagModel } from "../../../../models/posts/post_tag";

namespace reads {
    export async function getTagById(id: number): Promise<PostTagModel | null> {
        try {
            const query = `
                SELECT *
                FROM tags
                INNER JOIN post_categories ON tags.category_id = post_categories.category_id
                WHERE id = ?
            `;

            const result = await executeQuery<PostTagModel>(query, [id]);

            return result.length > 0 ? result[0] : null;
        } catch (err) {
            return null;
        }
    }
}

export default reads;
