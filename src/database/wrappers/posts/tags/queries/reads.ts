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
}

export default reads;
