import { DataModel } from "../../data_model";
import { ProfileFields, ProfileModel } from "../../models/profile";
import { permaDelete } from "../users/writes";
import { getProfileById } from "./reads";
import { updateProfile } from "./writes";

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

    public getFields(): ProfileFields {
        return {
            id: this.id,
            user_id: this.user_id,
            created_at: this.created_at,
            updated_at: this.updated_at,
            profile_picture: this.profile_picture,
            bio: this.bio,
            rating_employer: this.rating_employer,
            rating_employee: this.rating_employee,
            rating_count_employer: this.rating_count_employer,
            rating_count_employee: this.rating_count_employee,
            cancelled_employer: this.cancelled_employer,
            cancelled_employee: this.cancelled_employee,
            completed_employer: this.completed_employer,
            completed_employee: this.completed_employee,
            followers: this.followers,
            following: this.following,
            posts: this.posts,
            location_text: this.location_text,
            location_lat: this.location_lat,
            location_lon: this.location_lon,
            is_private: this.is_private,
            deleted: this.deleted,
        };
    }

    // Updates the class instance with new data
    public override async refetch() {
        const result = await getProfileById(this.id);

        if (!result) throw new Error("Profile not found");

        super.setData(result);
    }

    public async deleteProfile(): Promise<boolean> {
        // TODO: Delete all posts, comments, and ratings associated with this profile
        return false;
    }

    public async update(data: Partial<ProfileModel>) {
        const newProfile = { ...this, ...data };
        super.setData(newProfile);

        const r = await updateProfile(this.getFields());

        this._refetch();

        return r;
    }
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
