import { Profile } from "../../../database/wrappers/accounts/profiles";
import { User } from "../../../database/wrappers/accounts/users";
import Post from "../../../database/wrappers/posts/post";
import { getProfileResponse } from "../accounts/responses";

export function getPostResponse(
    post: Post,
    user: User,
    profile: Profile,
    isFollowing: boolean,
    isMe: boolean
) {
    return {
        uuid: post.uuid,
        title: post.title,
        description: post.description,
        display_location: {
            lat: post.approx_lat,
            lon: post.approx_lon,
            location_name: post.location_name,
        },
        // If the user is the owner of the post, send the true location
        true_location: {
            lat: isMe ? post.lat : null,
            lon: isMe ? post.lon : null,
        },
        job_type: post.job_type,
        is_remote: post.remote,
        price: post.price,
        start_date: post.start_date,
        end_date: post.end_date,
        tags: post.tags.map((tag) => tag.tag_id),
        media: post.media.map((media) => ({
            media: media.media,
            media_type: media.media_type,
        })),
        is_urgent: post.urgent,
        status: post.status,
        created_at: post.created_at,
        updated_at: post.updated_at,
        analytics: {
            likes: post.likes,
            impressions: post.impressions,
            shares: post.shares,
            bookmarks: post.bookmarks,
            comments: post.comments,
        },
        user: {
            uuid: user.uuid,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            is_following: isFollowing,
            is_me: isMe,
            has_premium: user.has_premium,
            verified: user.verified,
            profile: getProfileResponse(profile),
        },
    };
}
