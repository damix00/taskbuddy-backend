import { executeQuery } from "../../../../connection";
import { NotificationTokenFields } from "../../../../models/users/notification_tokens";
import reads from "./reads";

namespace writes {
    /**
     * Set the FCM token of a login session (or create it if it doesn't exist)
     * @param user_id ID of the user
     * @param login_id ID of the login session
     * @param token The FCM token
     * @returns Whether the operation was successful
     */
    export async function setLoginToken(
        user_id: number,
        login_id: number,
        token: string
    ): Promise<boolean> {
        try {
            if (await reads.getLoginToken(login_id)) {
                const r = await executeQuery<NotificationTokenFields>(
                    "UPDATE notification_tokens SET token = $1 WHERE login_id = $2 RETURNING *",
                    [token, login_id]
                );

                return r.length > 0;
            }

            const r = await executeQuery<NotificationTokenFields>(
                "INSERT INTO notification_tokens (user_id, login_id, token) VALUES ($1, $2, $3) RETURNING *",
                [user_id, login_id, token]
            );

            return r.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    /**
     * Delete a FCM token
     * @param token The token to delete
     * @returns Whether the operation was successful
     */
    export async function deleteToken(token: string): Promise<boolean> {
        try {
            await executeQuery<NotificationTokenFields>(
                "DELETE FROM notification_tokens WHERE token = $1",
                [token]
            );

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
