import { executeQuery } from "../../../../connection";

namespace writes {
    export async function follow(
        follower: number,
        following: number
    ): Promise<boolean> {
        try {
            const q = `
                INSERT INTO follows (follower, following)
                VALUES ($1, $2);
            `;

            await executeQuery(q, [follower, following]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function unfollow(
        follower: number,
        following: number
    ): Promise<boolean> {
        try {
            const q = `
                DELETE FROM follows
                WHERE follower = $1 AND following = $2;
            `;

            await executeQuery(q, [follower, following]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function updateFollow(follow: {
        id: number;
        follower: number;
        following: number;
    }): Promise<boolean> {
        try {
            const q = `
                UPDATE follows
                SET follower = $1, following = $2
                WHERE id = $3;
            `;

            await executeQuery(q, [
                follow.follower,
                follow.following,
                follow.id,
            ]);

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
