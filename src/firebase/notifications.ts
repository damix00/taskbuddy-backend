import { getMessaging } from "firebase-admin/messaging";

export type Notification = {
    data?: { [key: string]: string };
    title: string;
    body: string;
    imageUrl?: string;
};

type NotificationResponse = {
    success: boolean;
    failedTokens?: string[];
};

export async function sendNotification(
    notification: Notification,
    tokens: string[]
): Promise<NotificationResponse> {
    try {
        const r = await getMessaging().sendMulticast({
            data: notification.data,
            notification: {
                title: notification.title,
                body: notification.body,
                imageUrl: notification.imageUrl,
            },
            tokens,
        });

        const failedTokens: string[] = [];

        if (r.failureCount > 0) {
            r.responses.forEach((response, index) => {
                if (!response.success) {
                    failedTokens.push(tokens[index]);
                }
            });
        }

        return {
            success: true,
            failedTokens,
        };
    } catch (err) {
        console.error(err);

        return {
            success: false,
        };
    }
}
