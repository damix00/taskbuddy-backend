import NotificationToken from ".";
import { NotificationTokenFields } from "../../../models/users/notification_tokens";
import reads from "./queries/reads";
import writes from "./queries/writes";

function toToken(
    token: NotificationTokenFields | null
): NotificationToken | null {
    if (!token) return null;

    token.id = parseInt(token.id.toString());
    token.user_id = parseInt(token.user_id.toString());
    token.login_id = parseInt(token.login_id.toString());

    return new NotificationToken(token);
}

export class NotificationReads {
    /**
     * Get a FCM token by its id
     * @param id ID of the token
     * @returns The token or null if it doesn't exist
     */
    static async getTokenById(id: number): Promise<NotificationToken | null> {
        return toToken(await reads.getTokenById(id));
    }

    /**
     * Get all the FCM tokens of a user
     * @param user_id ID of the user
     * @returns The tokens or an empty array if there are none or an error occurred
     */
    static async getUserTokens(user_id: number): Promise<NotificationToken[]> {
        return (await reads.getUserTokens(user_id)).map((t) => toToken(t)!);
    }

    /**
     * Get the FCM token of a login session
     * @param login_id ID of the login
     * @returns The token or null if it doesn't exist
     */
    static async getLoginToken(
        login_id: number
    ): Promise<NotificationToken | null> {
        return toToken(await reads.getLoginToken(login_id));
    }
}

export class NotificationWrites {
    /**
     * Set the FCM token of a login session (or create it if it doesn't exist)
     * @param user_id ID of the user
     * @param login_id ID of the login session
     * @param token The FCM token
     * @returns Whether the operation was successful
     */
    static async setLoginToken(
        user_id: number,
        login_id: number,
        token: string
    ): Promise<boolean> {
        return await writes.setLoginToken(user_id, login_id, token);
    }

    /**
     * Update a FCM token
     * @param token The token to update
     * @param data The new data
     * @returns Whether the operation was successful
     */
    static async deleteToken(token: string): Promise<boolean> {
        return await writes.deleteToken(token);
    }
}
