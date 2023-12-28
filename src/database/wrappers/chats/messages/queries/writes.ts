import { v4 } from "uuid";
import { executeQuery } from "../../../../connection";
import {
    AttachmentType,
    MessageWithRelations,
    RequestMessageType,
} from "../../../../models/chats/messages";
import reads from "./reads";

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

    export type CreateMessageFields = {
        channel_id: number;
        sender_id?: number;
        system_message: boolean;
        message: string;
        attachments?: {
            attachment_type: AttachmentType;
            attachment_url: string;
        }[];
        request?: {
            request_type: RequestMessageType;
        };
    };

    export async function createMessage(
        data: CreateMessageFields
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
                    message
                ) VALUES (
                    $1, $2, $3, $4, $5
                ) RETURNING *
            `;

            const createMessageParams = [
                uuid,
                data.channel_id,
                data.sender_id,
                data.system_message,
                data.message,
            ];

            const result = await executeQuery<MessageWithRelations>(
                createMessageQuery,
                createMessageParams
            );

            if (result.length == 0) return null;

            const message = result[0];

            if (data.attachments) {
                for (const attachment of data.attachments) {
                    const createAttachmentQuery = `
                        INSERT INTO message_attachments (
                            message_id,
                            attachment_type,
                            attachment_url
                        ) VALUES (
                            $1, $2, $3
                        )
                    `;

                    const createAttachmentParams = [
                        message.id,
                        attachment.attachment_type,
                        attachment.attachment_url,
                    ];

                    await executeQuery(
                        createAttachmentQuery,
                        createAttachmentParams
                    );
                }
            }

            if (data.request) {
                const createRequestQuery = `
                    INSERT INTO request_messages (
                        message_id,
                        request_type
                    ) VALUES (
                        $1, $2
                    )
                `;

                const createRequestParams = [
                    message.id,
                    data.request.request_type,
                ];

                await executeQuery(createRequestQuery, createRequestParams);
            }

            const withRelations = await reads.getMessageById(message.id);

            if (!withRelations) return null;

            return withRelations;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function updateMessage(
        id: number,
        data: Partial<MessageWithRelations>
    ): Promise<boolean> {
        try {
            const updateMessageQuery = `
                UPDATE messages SET
                    channel_id = $1,
                    sender_id = $2,
                    system_message = $3,
                    message = $4,
                    seen = $5,
                    seen_at = $6,
                    edited = $7,
                    edited_at = $8,
                    deleted = $9
                WHERE id = $10
            `;

            const updateMessageParams = [
                data.channel_id,
                data.sender_id,
                data.system_message,
                data.message,
                data.seen,
                data.seen_at,
                data.edited,
                data.edited_at,
                data.deleted,
                id,
            ];

            await executeQuery(updateMessageQuery, updateMessageParams);

            // Update attachments

            if (data.attachments) {
                const deleteAttachmentsQuery = `
                    DELETE FROM message_attachments WHERE message_id = $1
                `;

                const deleteAttachmentsParams = [id];

                await executeQuery(
                    deleteAttachmentsQuery,
                    deleteAttachmentsParams
                );

                for (const attachment of data.attachments) {
                    const createAttachmentQuery = `
                        INSERT INTO message_attachments (
                            message_id,
                            attachment_type,
                            attachment_url
                        ) VALUES (
                            $1, $2, $3
                        )
                    `;

                    const createAttachmentParams = [
                        id,
                        attachment.attachment_type,
                        attachment.attachment_url,
                    ];

                    await executeQuery(
                        createAttachmentQuery,
                        createAttachmentParams
                    );
                }
            }

            // Update request
            if (data.request) {
                const deleteRequestQuery = `
                    DELETE FROM request_messages WHERE message_id = $1
                `;

                const deleteRequestParams = [id];

                await executeQuery(deleteRequestQuery, deleteRequestParams);

                const createRequestQuery = `
                    INSERT INTO request_messages (
                        message_id,
                        request_type
                    ) VALUES (
                        $1, $2
                    )
                `;

                const createRequestParams = [id, data.request.request_type];

                await executeQuery(createRequestQuery, createRequestParams);
            }

            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
