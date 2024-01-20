import { ProfileFields } from "../../../database/models/users/profile";
import { UserFields } from "../../../database/models/users/user";
import { User } from "../../../database/wrappers/accounts/users";
import Review from "../../../database/wrappers/reviews";
import { signToken, toUserPayload } from "../../../verification/jwt";
import { getPostOnlyResponse } from "../posts/responses";

export function getUserResponse(user: UserFields, login_id: number) {
    return {
        user: {
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            phone_number: user.phone_number,
            last_login: user.last_login,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            created_at: user.created_at,
        },
        required_actions: {
            // verify_email: !user.email_verified,
            verify_email: false, // Disable email verification because it is not needed
            verify_phone_number: !user.phone_number_verified,
        },
        login_id,
        token: signToken(toUserPayload(user, login_id)),
    };
}

// Generate a response for a profile
export function getProfileResponse(profile: ProfileFields) {
    return {
        profile: {
            bio: profile.bio,
            profile_picture: profile.profile_picture,
            // Typescript is being weird here, so we have to cast to 'unknown' first and then to the correct type
            // For some reason, postgres returns numbers as strings
            rating_employer: parseFloat(
                profile.rating_employer as unknown as string
            ),
            rating_employee: parseFloat(
                profile.rating_employee as unknown as string
            ),
            rating_count_employer: parseInt(
                profile.rating_count_employer as unknown as string
            ),
            rating_count_employee: parseInt(
                profile.rating_count_employee as unknown as string
            ),
            cancelled_employer: parseInt(
                profile.cancelled_employer as unknown as string
            ),
            cancelled_employee: parseInt(
                profile.cancelled_employee as unknown as string
            ),
            completed_employer: parseInt(
                profile.completed_employer as unknown as string
            ),
            completed_employee: parseInt(
                profile.completed_employee as unknown as string
            ),
            followers: parseInt(profile.followers as unknown as string),
            following: parseInt(profile.following as unknown as string),
            posts: parseInt(profile.post_count as unknown as string),
            location_text: profile.location_text,
            location_lat: parseFloat(profile.location_lat as unknown as string),
            location_lon: parseFloat(profile.location_lon as unknown as string),
            is_private: profile.is_private,
        },
    };
}

export function getUserProfileResponse(
    user: UserFields,
    login_id: number,
    profile: ProfileFields
) {
    return {
        ...getUserResponse(user, login_id),
        ...getProfileResponse(profile),
    };
}

export function getPublicUserProfileResponse(
    user: UserFields,
    profile: ProfileFields,
    isFollowing: boolean,
    isMe: boolean
) {
    return {
        uuid: user.uuid,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_following: isFollowing,
        is_me: isMe,
        has_premium: user.has_premium,
        verified: user.verified,
        ...getProfileResponse(profile),
    };
}

export function getReviewResponse(review: Review, requested_by: User) {
    return {
        uuid: review.uuid,
        rating: review.rating,
        title: review.title,
        description: review.description,
        post_title: review.post_title,
        created_at: review.created_at,
        updated_at: review.updated_at,
        user: getPublicUserProfileResponse(
            review.user,
            review.user_profile,
            requested_by.id == review.user.id,
            review.following
        ),
        rating_for_uuid: review.rating_for.uuid,
    };
}
