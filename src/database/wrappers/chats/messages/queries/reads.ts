import { executeQuery } from "../../../../connection";
import { MessageWithRelations } from "../../../../models/chats/messages";

namespace reads {
    export async function getMessagesFromChannel(
        channel_id: number,
        offset: number = 0
    ): Promise<MessageWithRelations[]> {
        try {
            const q = `
                SELECT
                    messages.*,
                    TO_JSON(users.*) AS sender,
                    TO_JSON(request_messages.*) AS request_message,
                    COALESCE(json_agg(DISTINCT message_attachments) FILTER (WHERE message_attachments.id IS NOT NULL), '[]') AS attachments
                FROM messages
                LEFT JOIN users ON messages.sender_id = users.id
                LEFT JOIN request_messages ON messages.id = request_messages.message_id
                LEFT JOIN message_attachments ON messages.id = message_attachments.message_id
                WHERE messages.channel_id = $1
                GROUP BY messages.id, users.id, request_messages.id
                ORDER BY messages.created_at DESC
                OFFSET $2 LIMIT 25
            `;

            const p = [channel_id, offset];

            const result = await executeQuery<MessageWithRelations>(q, p);

            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function getMessageByField(
        field_name: string,
        value: any
    ): Promise<MessageWithRelations | null> {
        try {
            const q = `
                SELECT
                    messages.*,
                    TO_JSON(users.*) AS sender,
                    TO_JSON(request_messages.*) AS request_message,
                    COALESCE(json_agg(DISTINCT message_attachments) FILTER (WHERE message_attachments.id IS NOT NULL), '[]') AS attachments
                FROM messages
                LEFT JOIN users ON messages.sender_id = users.id
                LEFT JOIN request_messages ON messages.id = request_messages.message_id
                LEFT JOIN message_attachments ON messages.id = message_attachments.message_id
                WHERE ${field_name} = $1
                GROUP BY messages.id, users.id, request_messages.id
                ORDER BY messages.created_at DESC
            `;

            const p = [value];

            const result = await executeQuery<MessageWithRelations>(q, p);

            if (result.length == 0) return null;

            return result[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function getMessageById(
        id: number
    ): Promise<MessageWithRelations | null> {
        return (await getMessageByField(
            "messages.id",
            id
        )) as MessageWithRelations | null;
    }

    export async function getMessageByUUID(
        uuid: string
    ): Promise<MessageWithRelations | null> {
        return (await getMessageByField(
            "messages.uuid",
            uuid
        )) as MessageWithRelations | null;
    }
}

export default reads;
