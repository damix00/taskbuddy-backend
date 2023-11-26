import { executeQuery } from "../../../../connection";
import { PostCategoryModel } from "../../../../models/posts/post_category";

namespace reads {
    export async function getCategoryById(
        id: number
    ): Promise<PostCategoryModel | null> {
        try {
            const query = `
                SELECT *
                FROM post_categories
                WHERE category_id = ?
            `;

            const result = await executeQuery<PostCategoryModel>(query, [id]);

            return result.length > 0 ? result[0] : null;
        } catch (err) {
            return null;
        }
    }
}

export default reads;
