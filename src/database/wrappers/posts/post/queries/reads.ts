import { v4 } from "uuid";
import { executeQuery } from "../../../../connection";
import { PostWithRelations } from "../../../../models/posts/post";

async function getPostByField(
    field: string,
    value: string
): Promise<PostWithRelations | null> {
    try {
        const q = `
            SELECT
                posts.*,
                users.*,
                post_media.*,
                post_interactions.*,
                post_removals.*,
                post_location.*,
                post_tag_relationship.*,
                post_comments.*
            FROM posts
            LEFT JOIN users ON users.id = posts.user_id
            LEFT JOIN post_media ON post_media.post_id = posts.id
            LEFT JOIN post_interactions ON post_interactions.id = posts.interactions_id
            LEFT JOIN post_removals ON post_removals.id = posts.removals_id
            LEFT JOIN post_location ON post_location.id = posts.post_location_id
            LEFT JOIN post_tag_relationship ON post_tag_relationship.post_id = posts.id
            LEFT JOIN post_comments ON post_comments.post_id = posts.id
            WHERE ${field} = $1
        `;

        const r = await executeQuery<PostWithRelations>(q, [value]);

        return r.length > 0 ? r[0] : null;
    } catch (e) {
        console.error(e);

        return null;
    }
}

namespace reads {
    export async function getPostById(
        id: number
    ): Promise<PostWithRelations | null> {
        return await getPostByField("posts.id", id.toString());
    }

    export async function getPostByUUID(
        uuid: string
    ): Promise<PostWithRelations | null> {
        return await getPostByField("posts.uuid", uuid);
    }

    export async function generatePostUUID(): Promise<String | null> {
        try {
            do {
                const uuid = v4();

                const q = `
                    SELECT uuid FROM posts WHERE uuid = $1
                `;

                const r = await executeQuery<{ uuid: string }>(q, [uuid]);

                if (r.length === 0) return uuid;
            } while (true);
        } catch (e) {
            console.error(e);

            return null;
        }
    }
}

export default reads;
