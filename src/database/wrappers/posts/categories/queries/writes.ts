import { executeQuery } from "../../../../connection";
import { PostCategoryModel } from "../../../../models/posts/post_category";

namespace writes {
    export async function createCategory(translations: {
        [key: string]: string;
    }): Promise<PostCategoryModel | null> {
        try {
            const query = `INSERT INTO post_categories (translations) VALUES ($1) RETURNING *`;

            const result = await executeQuery<PostCategoryModel>(query, [
                JSON.stringify(translations),
            ]);

            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    export async function updateCategory(
        id: number,
        translations: { [key: string]: string }
    ): Promise<boolean> {
        try {
            const query = `
                UPDATE post_categories
                SET translations = $1
                WHERE category_id = $2
                RETURNING *
            `;

            const result = await executeQuery(query, [
                JSON.stringify(translations),
                id,
            ]);

            return result.length > 0;
        } catch (err) {
            return false;
        }
    }

    export async function deleteCategory(id: number): Promise<boolean> {
        try {
            const query = `
                DELETE FROM post_categories
                WHERE category_id = $1
            `;

            await executeQuery(query, [id]);

            return true;
        } catch (err) {
            return false;
        }
    }
}

export default writes;
