import { v4 } from "uuid";
import { executeQuery } from "../../../../connection";
import {
    AttachmentType,
    CreateMessageFields,
    MessageAttachmentFields,
    MessageFields,
    MessageWithRelations,
    RequestMessageFields,
    RequestMessageStatus,
    RequestMessageType,
} from "../../../../models/chats/messages";
import reads from "./reads";
import { User } from "../../../accounts/users";

namespace writes {
    async function generateUUID(): Promise<string | null> {
        try {
            do {
                const uuid = v4();

                const result = await executeQuery(
                    `SELECT id FROM messages WHERE uuid = $1`,
                    [uuid]
                );

                if (result.length == 0) return uuid;
            } while (true);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function createMessage(
        data: CreateMessageFields,
        sender: User | null,
        profile_picture: string
    ): Promise<MessageWithRelations | null> {
        try {
            const uuid = await generateUUID();

            if (!uuid) return null;

            // Create a message entry
            const createMessageQuery = `
                INSERT INTO messages (
                    uuid,
                    channel_id,
                    sender_id,
                    system_message,
                    message,
                    created_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                ) RETURNING *
            `;

            const createMessageParams = [
                uuid,
                data.channel_id,
                sender?.id || null,
                data.system_message,
                data.message,
                new Date().toUTCString(),
            ];

            const result = await executeQuery<MessageFields>(
                createMessageQuery,
                createMessageParams
            );

            if (result.length == 0) return null;

            const message = result[0];

            let attachments: MessageAttachmentFields[] = [];

            if (data.attachments) {
                for (const attachment of data.attachments) {
                    const createAttachmentQuery = `
                        INSERT INTO message_attachments (
                            message_id,
                            attachment_type,
                            attachment_url
                        ) VALUES (
                            $1, $2, $3
                        ) RETURNING *
                    `;

                    const createAttachmentParams = [
                        message.id,
                        attachment.attachment_type,
                        attachment.attachment_url,
                    ];

                    const r = await executeQuery(
                        createAttachmentQuery,
                        createAttachmentParams
                    );

                    if (r.length > 0)
                        attachments.push(r[0] as MessageAttachmentFields);
                }
            }

            let request: RequestMessageFields | null = null;

            if (data.request) {
                const createRequestQuery = `
                    INSERT INTO request_messages (
                        message_id,
                        request_type,
                        data
                    ) VALUES (
                        $1, $2, $3
                    ) RETURNING *
                `;

                const createRequestParams = [
                    message.id,
                    data.request.request_type,
                    data.request?.request_data || null,
                ];

                const r = await executeQuery<RequestMessageFields>(
                    createRequestQuery,
                    createRequestParams
                );

                if (r.length > 0) request = r[0];
            }

            return {
                sender,
                attachments,
                request,
                ...message,
                profile_picture,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function updateMessage(data: MessageFields): Promise<boolean> {
        try {
            const q = `
            UPDATE messages
            SET
                uuid = $1,
                channel_id = $2,
                sender_id = $3,
                system_message = $4,
                message = $5,
                seen = $6,
                seen_at = $7,
                edited = $8,
                edited_at = $9,
                deleted = $10
            WHERE id = $11 RETURNING *
            `;

            const p = [
                data.uuid,
                data.channel_id,
                data.sender_id,
                data.system_message,
                data.message,
                data.seen,
                data.seen_at,
                data.edited,
                data.edited_at,
                data.deleted,
                data.id,
            ];

            const res = await executeQuery(q, p);

            return res.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function updateRequestMessage(data: {
        message_id: number;
        status: RequestMessageStatus;
        request_type: RequestMessageType;
        data?: string;
    }): Promise<boolean> {
        try {
            const q = `
            UPDATE request_messages
            SET
                status = $2,
                request_type = $3,
                data = $4,
                updated_at = NOW()
            WHERE message_id = $1
            RETURNING *
            `;

            const p = [
                data.message_id,
                data.status,
                data.request_type,
                data.data || null,
            ];

            const res = await executeQuery(q, p);

            return res.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function deleteMessage(id: number): Promise<boolean> {
        try {
            await executeQuery(
                `UPDATE messages
                SET
                    deleted = TRUE,
                    updated_at = NOW()
                WHERE id = $1`,
                [id]
            );

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    export async function markAsSeen(
        channel_id: number,
        user_id: number
    ): Promise<boolean> {
        try {
            await executeQuery(
                `UPDATE messages
                SET
                    seen = TRUE,
                    seen_at = NOW()
                WHERE channel_id = $1 AND sender_id != $2 AND seen = FALSE`,
                [channel_id, user_id]
            );

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
