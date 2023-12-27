export enum ChannelStatus {
    PENDING = 0,
    ACCEPTED = 1,
    REJECTED = 2,
    COMPLETED = 3,
    CANCELLED = 4,
}

export interface ChannelFields {
    id: number;
    uuid: string;
    created_by: number;
    recepient: number;
    post_id: number;
    status: ChannelStatus;
    negotiated_price: number;
    negotiated_date: Date;
    sharing_location: boolean;
    last_message_time: Date;
    created_at: Date;
    updated_at: Date;
}

export interface ChannelModel extends ChannelFields {
    update: (fields: Partial<ChannelFields>) => Promise<boolean>;
    setStatus: (status: ChannelStatus) => Promise<boolean>;
    setNegotiatedPrice: (price: number) => Promise<boolean>;
    setNegotiatedDate: (date: Date) => Promise<boolean>;
    setSharingLocation: (sharing: boolean) => Promise<boolean>;
    setLastMessageTime: (date: Date) => Promise<boolean>;
}
