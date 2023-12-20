export interface ReviewFields {
    id: number;
    uuid: string;
    user_id: number;
    post_id: number;
    rating: number;
    review_title: string;
    review_description: string;
    flagged: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ReviewModel extends ReviewFields {
    update(data: Partial<ReviewFields>): Promise<boolean>;
    flag(): Promise<boolean>;
    unflag(): Promise<boolean>;
    deleteReview(): Promise<boolean>;
}
