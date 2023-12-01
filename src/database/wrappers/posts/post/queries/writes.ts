import { executeQuery } from "../../../../connection";
import { JobType, PostWithRelations } from "../../../../models/posts/post";

namespace writes {
    // Creates a new post
    export async function createPost(data: {
        user_id: number;
        title: string;
        description: string;
        job_type: JobType;
        price: number;
        start_date: Date;
        end_date: Date;
        media: {
            media_url: string;
            media_type: string;
        }[];
        location: {
            lat: number;
            lon: number;
            location_name: string;
            suggestion_radius: number;
            remote: boolean;
        };
        tags: number[]; // Tag IDs
    }): Promise<PostWithRelations | null> {
        try {
            // Start a transaction
            await executeQuery("BEGIN");
        } catch (e) {
            console.error(e);

            return null;
        }
    }
}

export default writes;
