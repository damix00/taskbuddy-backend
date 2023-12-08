import { executeQuery } from "../../../../connection";
import { PostTagModel } from "../../../../models/posts/post_tag";

namespace writes {
    export async function createTag(
        category_id: number,
        translations: { [key: string]: string }
    ): Promise<PostTagModel | null> {
        try {
            const query = `
                INSERT INTO post_tags (category_id, translations)
                VALUES ($1, $2) RETURNING *
            `;

            const result = await executeQuery<PostTagModel>(query, [
                category_id,
                JSON.stringify(translations),
            ]);

            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    export async function updateTag(
        id: number,
        category_id: number,
        translations: { [key: string]: string }
    ): Promise<boolean> {
        try {
            const query = `
                UPDATE post_tags
                SET category_id = $1, translations = $2, updated_at = NOW()
                WHERE tag_id = $3 RETURINNG *
            `;

            const result = await executeQuery(query, [
                category_id,
                JSON.stringify(translations),
                id,
            ]);

            return result.length > 0;
        } catch (err) {
            return false;
        }
    }

    export async function deleteTag(id: number): Promise<boolean> {
        try {
            const query = `
                DELETE FROM post_tags
                WHERE tag_id = $1
            `;

            await executeQuery(query, [id]);

            return true;
        } catch (err) {
            return false;
        }
    }
}

export default writes;
