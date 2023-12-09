export interface FollowsFields {
    id: number;
    follower: number;
    following: number;
    created_at: Date;
}

export interface FollowsModel extends FollowsFields {
    update: (data: Partial<FollowsModel>) => Promise<boolean>;
    refetch: () => Promise<void>;
    unfollow: () => Promise<boolean>;
    isMutual: () => Promise<boolean>;
}
