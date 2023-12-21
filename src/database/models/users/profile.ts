import fileUpload from "express-fileupload";

export interface ProfileFields {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    profile_picture?: string | null;
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
    post_count: number;
    location_text: string;
    location_lat: number;
    location_lon: number;
    is_private: boolean;
    deleted: boolean;
}

export interface ProfileModel extends ProfileFields {
    deleteProfile: () => Promise<boolean>;
    update: (data: Partial<ProfileModel>) => Promise<boolean>;
    refetch: () => Promise<void>;
    uploadProfilePicture: (file: fileUpload.UploadedFile) => Promise<boolean>;
    removeProfilePicture: () => Promise<boolean>;
    setProfilePicture: (profilePicture: string | null) => Promise<boolean>;
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
