export interface BlocksFields {
    id: number;
    blocker: number;
    blocked: number;
    created_at: Date;
}

export interface BlocksModel extends BlocksFields {
    update: (data: Partial<BlocksModel>) => Promise<boolean>;
    refetch: () => Promise<void>;
    unblock: () => Promise<boolean>;
}
