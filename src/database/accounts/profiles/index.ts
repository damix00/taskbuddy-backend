import { DataModel } from "../../data_model";
import { ProfileFields, ProfileModel } from "../../models/profile";

export class Profile extends DataModel implements ProfileModel {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    profile_picture: string;
    bio: string;
    rating_employer: number;
    rating_employee: number;
    rating_count_employer: number;
    rating_count_employee: number;
    cancelled_employer: number;
    cancelled_employee: number;
    completed_employer: number;
    completed_employee: number;
    followers: number;
    following: number;
    posts: number;
    location_text: string;
    location_lat: number;
    location_lon: number;
    is_private: boolean;
    deleted: boolean;

    constructor(profile: ProfileFields, refetchOnUpdate: boolean = true) {
        super(refetchOnUpdate);

        Object.assign(this, profile);
        this.refetchOnUpdate = refetchOnUpdate;
    }

    deleteProfile: () => Promise<boolean>;
    update: (data: Partial<ProfileModel>) => Promise<boolean>;
    refetch: () => Promise<void>;
    setProfilePicture: (profilePicture: string) => Promise<boolean>;
    setBio: (bio: string) => Promise<boolean>;
    setRatingEmployer: (rating: number) => Promise<boolean>;
    setRatingEmployee: (rating: number) => Promise<boolean>;
    setRatingCountEmployer: (count: number) => Promise<boolean>;
    setRatingCountEmployee: (count: number) => Promise<boolean>;
    setCancelledEmployer: (count: number) => Promise<boolean>;
    setCancelledEmployee: (count: number) => Promise<boolean>;
    setCompletedEmployer: (count: number) => Promise<boolean>;
    setCompletedEmployee: (count: number) => Promise<boolean>;
    setFollowers: (count: number) => Promise<boolean>;
    setFollowing: (count: number) => Promise<boolean>;
    setPosts: (count: number) => Promise<boolean>;
    setLocationText: (locationText: string) => Promise<boolean>;
    setLocationLat: (locationLat: number) => Promise<boolean>;
    setLocationLon: (locationLon: number) => Promise<boolean>;
    setIsPrivate: (isPrivate: boolean) => Promise<boolean>;
    setDeleted: (deleted: boolean) => Promise<boolean>;
}
