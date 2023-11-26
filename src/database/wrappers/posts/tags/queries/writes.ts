import { executeQuery } from "../../../../connection";

namespace writes {
    export async function createTag(
        category_id: number,
        translations: [string, string][]
    ): Promise<boolean> {
        try {
            const query = `
                INSERT INTO tags (category_id, translations)
                VALUES (?, ?) RETURNING *
            `;

            const result = await executeQuery(query, [
                category_id,
                JSON.stringify(translations),
            ]);

            return result.length > 0;
        } catch (err) {
            return false;
        }
    }

    export async function updateTag(
        id: number,
        category_id: number,
        translations: { [key: string]: string }
    ): Promise<boolean> {
        try {
            const query = `
                UPDATE tags
                SET category_id = ?, translations = ?, updated_at = NOW()
                WHERE id = ? RETURINNG *
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
                DELETE FROM tags
                WHERE id = ?
            `;

            await executeQuery(query, [id]);

            return true;
        } catch (err) {
            return false;
        }
    }
}

export default writes;
