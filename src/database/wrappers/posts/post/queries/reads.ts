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
                post_tags.*,
                post_comments.*
            FROM posts
            LEFT JOIN users ON users.id = posts.user_id
            LEFT JOIN post_media ON post_media.post_id = posts.id
            LEFT JOIN post_interactions ON post_interactions.post_id = posts.id
            LEFT JOIN post_removals ON post_removals.post_id = posts.id
            LEFT JOIN post_location ON post_location.post_id = posts.id
            LEFT JOIN post_tags ON post_tags.post_id = posts.id
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
}

export default reads;
