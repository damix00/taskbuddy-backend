import { getMessaging } from "firebase-admin/messaging";

// This is a type definition for the notification payload
export type Notification = {
    data?: { [key: string]: string };
    title: string;
    body: string;
    imageUrl?: string;
};

// This is a type definition for the notification response
type NotificationResponse = {
    success: boolean;
    failedTokens?: string[];
};

// This function sends a notification to a list of FCM tokens
export async function sendNotification(
    notification: Notification,
    tokens: string[]
): Promise<NotificationResponse> {
    try {
        // Send the notification to each token
        const r = await getMessaging().sendEachForMulticast({
            data: notification.data,
            notification: {
                title: notification.title,
                body: notification.body,
                imageUrl: notification.imageUrl,
            },
            android: {
                priority: "high", // High priority notification (will wake up the device)
            },
            tokens,
        });

        // Check if any of the notifications failed
        const failedTokens: string[] = [];

        // If there are any failures, add the failed tokens to the list
        if (r.failureCount > 0) {
            r.responses.forEach((response, index) => {
                if (!response.success) {
                    failedTokens.push(tokens[index]);
                }
            });
        }

        // Return the response
        return {
            success: true,
            failedTokens,
        };
    } catch (err) {
        console.error(err);

        // Return a failed response
        return {
            success: false,
        };
    }
}
