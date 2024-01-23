import { executeQuery } from "../../connection";
import { ScrollSessionFields } from "../../models/algorithm/scroll_sessions";

export class UserSessionsWrapper {
    static async getSession(id: number): Promise<ScrollSessionFields | null> {
        try {
            const q = `
                SELECT *
                FROM scroll_sessions
                WHERE id = $1
            `;

            const result = await executeQuery<ScrollSessionFields>(q, [id]);

            if (result.length === 0) {
                return null;
            }

            return result[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async addSession(
        user_id: number,
        ip_address: string,
        lat: number,
        lon: number,
        filters: string = "{}"
    ): Promise<ScrollSessionFields | null> {
        console.log(filters);

        try {
            const q = `
                INSERT INTO scroll_sessions (user_id, ip_address, lat, lon, filters)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const result = await executeQuery<ScrollSessionFields>(q, [
                user_id,
                ip_address,
                lat,
                lon,
                filters,
            ]);

            if (result.length === 0) {
                return null;
            }

            return result[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async addSessionPosts(
        scroll_session_id: number,
        post_ids: number[]
    ): Promise<boolean> {
        try {
            // Escape the post_ids
            const q = `
                INSERT INTO session_posts (scroll_session_id, post_id)
                VALUES ${post_ids.map((_, i) => `($1, $${i + 2})`).join(", ")}
            `;

            await executeQuery(q, [scroll_session_id, ...post_ids]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getSessionPosts(
        scroll_session_id: number
    ): Promise<number[] | null> {
        try {
            const q = `
                SELECT post_id
                FROM session_posts
                WHERE scroll_session_id = $1
            `;

            const result = await executeQuery<{ post_id: number }>(q, [
                scroll_session_id,
            ]);

            if (result.length === 0) {
                return null;
            }

            return result.map((r) => r.post_id);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}
