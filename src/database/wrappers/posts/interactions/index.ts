import { executeQuery } from "../../../connection";

export enum InteractionType {
    LIKE = 0,
    COMMENT = 1,
    SHARE = 2,
    BOOKMARK = 3,
}

class Interactions {
    public static async doesInteractionExist(
        user_id: number,
        post_id: number,
        interaction_type: number
    ): Promise<boolean> {
        try {
            const q = `
                SELECT EXISTS(
                    SELECT 1 FROM post_interaction_logs WHERE post_interaction_logs.user_id = $1 AND post_interaction_logs.post_id = $2 AND interaction_type = $3
                )
            `;

            const result = await executeQuery<{ exists: boolean }>(q, [
                user_id,
                post_id,
                interaction_type,
            ]);

            if (!result || !result[0]) {
                return false;
            }

            return result[0].exists;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async isLiked(
        user_id: number,
        post_id: number
    ): Promise<boolean> {
        try {
            return await this.doesInteractionExist(
                user_id,
                post_id,
                InteractionType.LIKE
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async isBookmarked(
        user_id: number,
        post_id: number
    ): Promise<boolean> {
        try {
            return await this.doesInteractionExist(
                user_id,
                post_id,
                InteractionType.BOOKMARK
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async addInteraction(
        user_id: number,
        post_id: number,
        interaction_type: number,
        ip: string = ""
    ): Promise<boolean> {
        try {
            const q = `
                INSERT INTO post_interaction_logs (user_id, post_id, interaction_type, interaction_ip)
                VALUES ($1, $2, $3, $4)
            `;

            await executeQuery(q, [user_id, post_id, interaction_type, ip]);

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async removeInteraction(
        user_id: number,
        post_id: number,
        interaction_type: number
    ): Promise<boolean> {
        try {
            const q = `
                DELETE FROM post_interaction_logs
                WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3
            `;

            await executeQuery(q, [user_id, post_id, interaction_type]);

            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async likePost(
        user_id: number,
        post_id: number,
        ip?: string
    ): Promise<boolean> {
        try {
            return await this.addInteraction(
                user_id,
                post_id,
                InteractionType.LIKE,
                ip
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async unlikePost(
        user_id: number,
        post_id: number
    ): Promise<boolean> {
        try {
            return await this.removeInteraction(
                user_id,
                post_id,
                InteractionType.LIKE
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async bookmarkPost(
        user_id: number,
        post_id: number,
        ip?: string
    ): Promise<boolean> {
        try {
            return await this.addInteraction(
                user_id,
                post_id,
                InteractionType.BOOKMARK,
                ip
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public static async unbookmarkPost(
        user_id: number,
        post_id: number
    ): Promise<boolean> {
        try {
            return await this.removeInteraction(
                user_id,
                post_id,
                InteractionType.BOOKMARK
            );
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export { Interactions };
