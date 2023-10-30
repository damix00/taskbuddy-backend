import fileUpload from "express-fileupload";
import { DataModel } from "../../data_model";
import { ProfileFields, ProfileModel } from "../../models/profile";
import { reads } from "./queries/reads";
import { writes } from "./queries/writes";
import uniqueFilename from "unique-filename";
import path from "path";
import FirebaseStorage from "../../../firebase/storage/files";
import os from "os";
import fs from "fs";

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
        const result = await reads.getProfileById(this.id);

        if (!result) throw new Error("Profile not found");

        super.setData(result);
    }

    public async deleteProfile(): Promise<boolean> {
        // TODO: Delete all posts, comments, and ratings associated with this profile
        return false;
    }

    // Updates the database with new data
    public async update(data: Partial<ProfileModel>) {
        // Create new object with updated fields
        const newProfile = { ...this, ...data };
        super.setData(newProfile); // Update the class instance

        const r = await writes.updateProfile(this.getFields()); // Update the database

        await this._refetch(); // Refetch the class instance if refetchOnUpdate is true

        return r;
    }

    // Private setter method
    private async setter(field: string, value: any): Promise<boolean> {
        const data = { ...this.getFields(), [field]: value }; // Create new object with updated field
        return await this.update(data); // Update the profile
    }

    public async setProfilePicture(profilePicture: string | null) {
        return await this.setter("profile_picture", profilePicture);
    }

    public async uploadProfilePicture(
        file: fileUpload.UploadedFile
    ): Promise<boolean> {
        // Update the file to firebase storage and get the URL
        const filename = uniqueFilename(os.tmpdir(), "pfp__");
        const ext = path.extname(file.name).toLowerCase().replace(".", "");
        const mvfilename = `${filename}.${ext}`;

        // Temporarily save the file to the server
        await file.mv(mvfilename);

        const upload = await FirebaseStorage.uploadFile(
            mvfilename,
            `image/${ext.toLowerCase()}`,
            ext
        );

        // Delete the file from the server
        fs.rmSync(mvfilename);

        // Check if the upload was successful
        if (!upload) {
            return false;
        }

        // Get the URL
        let pfp = upload[0].metadata.mediaLink;

        // Set the profile picture in the database
        return await this.setProfilePicture(pfp);
    }

    public async removeProfilePicture(): Promise<boolean> {
        try {
            // Delete the file from firebase storage
            await FirebaseStorage.deleteFile(this.profile_picture);

            // Set the profile picture to null
            return await this.setProfilePicture(null);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    public async setBio(bio: string) {
        return await this.setter("bio", bio);
    }

    public async setRatingEmployer(rating: number) {
        return await this.setter("rating_employer", rating);
    }

    public async setRatingEmployee(rating: number) {
        return await this.setter("rating_employee", rating);
    }

    public async setRatingCountEmployer(count: number) {
        return await this.setter("rating_count_employer", count);
    }

    public async setRatingCountEmployee(count: number) {
        return await this.setter("rating_count_employee", count);
    }

    public async setCancelledEmployer(count: number) {
        return await this.setter("cancelled_employer", count);
    }

    public async setCancelledEmployee(count: number) {
        return await this.setter("cancelled_employee", count);
    }

    public async setCompletedEmployer(count: number) {
        return await this.setter("completed_employer", count);
    }

    public async setCompletedEmployee(count: number) {
        return await this.setter("completed_employee", count);
    }

    public async setFollowers(count: number) {
        return await this.setter("followers", count);
    }

    public async setFollowing(count: number) {
        return await this.setter("following", count);
    }

    public async setPosts(count: number) {
        return await this.setter("posts", count);
    }

    public async setLocationText(locationText: string) {
        return await this.setter("location_text", locationText);
    }

    public async setLocationLat(locationLat: number) {
        return await this.setter("location_lat", locationLat);
    }

    public async setLocationLon(locationLon: number) {
        return await this.setter("location_lon", locationLon);
    }

    public async setIsPrivate(isPrivate: boolean) {
        return await this.setter("is_private", isPrivate);
    }

    public async setDeleted(deleted: boolean) {
        return await this.setter("deleted", deleted);
    }
}
