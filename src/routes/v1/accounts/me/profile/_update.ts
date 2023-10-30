// PATCH /v1/accounts/me/profile

// fields are:
// - first/last name
// - bio
// - profile picture
// - location
// - is private
// - remove profile picture

import { Response } from "express";
import { ExtendedRequest } from "../../../../../types/request";
import { getProfileResponse } from "../../../../../utils/responses";

export default async (req: ExtendedRequest, res: Response) => {
    try {
        const {
            first_name,
            last_name,
            bio,
            location_lat,
            location_lon,
            is_private,
            remove_profile_picture,
        } = req.body;

        const { profile_picture } = req.files || {};

        if (!req.profile || !req.user) return;

        const _firstName = first_name || req.user.first_name;
        const _lastName = last_name || req.user.last_name;

        await req.user.update({
            first_name: _firstName,
            last_name: _lastName,
        });

        const _bio = bio || req.profile.bio;
        const _locationLat = location_lat || req.profile.location_lat;
        const _locationLon = location_lon || req.profile.location_lon;
        const _isPrivate = is_private || req.profile.is_private;

        await req.profile.update({
            bio: _bio,
            location_lat: _locationLat,
            location_lon: _locationLon,
            is_private: _isPrivate,
        });

        if (profile_picture) {
            // Remove old profile picture
            await req.profile.removeProfilePicture();
            // Upload new profile picture
            await req.profile.uploadProfilePicture(profile_picture);
        } else if (
            remove_profile_picture &&
            req.profile.profile_picture.length > 0
        ) {
            await req.profile.removeProfilePicture();
        }

        return res.status(200).json({
            message: "Profile updated",
            ...getProfileResponse(req.profile),
        });
    } catch (e) {
        console.error(e);

        return res.status(500).json({
            error: {
                code: 500,
                message: "Internal server error",
            },
        });
    }
};
