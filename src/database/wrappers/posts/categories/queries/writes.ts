import { executeQuery } from "../../../../connection";

namespace writes {
    export async function createCategory(
        translations: [string, string][]
    ): Promise<boolean> {
        try {
            const query = `
                INSERT INTO post_categories (translations)
                VALUES (?) RETURNING *
            `;

            const result = await executeQuery(query, [
                JSON.stringify(translations),
            ]);

            return result.length > 0;
        } catch (err) {
            return false;
        }
    }

    export async function updateCategory(
        id: number,
        translations: { [key: string]: string }
    ): Promise<boolean> {
        try {
            const query = `
                UPDATE post_categories
                SET translations = ?
                WHERE category_id = ?
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
                WHERE category_id = ?
            `;

            await executeQuery(query, [id]);

            return true;
        } catch (err) {
            return false;
        }
    }
}

export default writes;
