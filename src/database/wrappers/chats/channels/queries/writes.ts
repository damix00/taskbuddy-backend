import { v4 } from "uuid";
import { ChannelFields } from "../../../../models/chats/channels";
import { executeQuery } from "../../../../connection";

namespace writes {
    async function generateUUID(): Promise<string | null> {
        try {
            do {
                const uuid = v4();

                const result = await executeQuery(
                    `SELECT id FROM channels WHERE uuid = $1`,
                    [uuid]
                );

                if (result.length == 0) return uuid;
            } while (true);
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export type CreateChannelFields = {
        created_by_id: number;
        recipient_id: number;
        post_id: number;
        negotiated_price: number;
        negotiated_date: Date;
    };

    export async function createChannel(
        data: CreateChannelFields
    ): Promise<ChannelFields | null> {
        try {
            const uuid = await generateUUID();

            if (!uuid) return null;

            const q = `
                INSERT INTO channels (
                    uuid,
                    created_by_id,
                    recipient_id,
                    post_id,
                    negotiated_price,
                    negotiated_date
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                ) RETURNING *;
            `;

            const result = await executeQuery<ChannelFields>(q, [
                uuid,
                data.created_by_id,
                data.recipient_id,
                data.post_id,
                data.negotiated_price,
                data.negotiated_date,
            ]);

            if (result.length == 0) return null;

            return result[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    export async function updateChannel(data: ChannelFields): Promise<boolean> {
        try {
            const q = `
                UPDATE channels SET (
                    uuid = $1,
                    created_by_id = $2,
                    recipient_id = $3,
                    post_id = $4,
                    status = $5,
                    negotiated_price = $6,
                    negotiated_date = $7,
                    sharing_location = $8,
                    last_message_time = $9,
                    updated_at = NOW()
                ) WHERE id = $10;
            `;

            const result = await executeQuery<ChannelFields>(q, [
                data.uuid,
                data.created_by_id,
                data.recipient_id,
                data.post_id,
                data.status,
                data.negotiated_price,
                data.negotiated_date,
                data.sharing_location,
                data.last_message_time,
                data.id,
            ]);

            return result.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

export default writes;
