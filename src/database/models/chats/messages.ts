export interface MessageFields {
    id: number;
    uuid: string;
    channel_id: number;
    sender: number;
    system_message: boolean;
    message: string;
    seen: boolean;
    seen_at: Date;
    created_at: Date;
    updated_at: Date;
    deleted: boolean;
}

export interface MessageModel extends MessageFields {
    update: (fields: Partial<MessageFields>) => Promise<boolean>;
    setSeen: (seen: boolean) => Promise<boolean>;
    setSeenAt: (date: Date) => Promise<boolean>;
    deleteMessage: () => Promise<boolean>;
}
