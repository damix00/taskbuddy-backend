import { Profile } from "../../wrappers/accounts/profiles";
import { User } from "../../wrappers/accounts/users";
import Post from "../../wrappers/posts/post";

export interface ReviewFields {
    id: number;
    uuid: string;
    user_id: number;
    rating_for_id: number;
    post_id: number;
    post_title: string;
    rating: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateReviewFields {
    user: User;
    user_profile: Profile;
    rating_for: User;
    post: Post;
    rating: number;
    title: string;
    description?: string;
}

export interface ReviewWithRelations extends ReviewFields {
    user: User;
    user_profile: Profile;
    rating_for: User;
    post?: Post;
}

export interface ReviewModel extends ReviewWithRelations {
    update(data: Partial<ReviewFields>): Promise<boolean>;
    deleteReview(): Promise<boolean>;
}
