import { executeQuery } from "../../../../connection";
import { NotificationTokenFields } from "../../../../models/users/notification_tokens";

namespace reads {
    /**
     * Get a FCM token by its id
     * @param id The id of the token
     * @returns The token or null if it doesn't exist
     */
    export async function getTokenById(
        id: number
    ): Promise<NotificationTokenFields | null> {
        try {
            const r = await executeQuery<NotificationTokenFields>(
                "SELECT * FROM notification_tokens WHERE id = $1",
                [id]
            );

            if (r.length === 0) return null;

            return r[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    /**
     * Get all the FCM tokens of a user
     * @param user_id The id of the user
     * @returns The tokens or an empty array if there are none or an error occurred
     */
    export async function getUserTokens(
        user_id: number
    ): Promise<NotificationTokenFields[]> {
        try {
            const r = await executeQuery<NotificationTokenFields>(
                "SELECT * FROM notification_tokens WHERE user_id = $1",
                [user_id]
            );

            return r;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    /**
     * Get the FCM token of a login session
     * @param login_id The id of the login
     * @returns The token or null if it doesn't exist
     */
    export async function getLoginToken(
        login_id: number
    ): Promise<NotificationTokenFields | null> {
        try {
            const r = await executeQuery<NotificationTokenFields>(
                "SELECT * FROM notification_tokens WHERE login_id = $1",
                [login_id]
            );

            if (r.length === 0) return null;

            return r[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

export default reads;
