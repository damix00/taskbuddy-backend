// PATCH /v1/accounts/me/profile

// fields are:
// - first/last name
// - username
// - bio
// - profile picture
// - location
// - is private
// - remove profile picture

import { Response } from "express";
import { ExtendedRequest } from "../../../../../types/request";
import { getUserProfileResponse } from "../../responses";
import * as validation from "../../../../../verification/validation";

export default async (req: ExtendedRequest, res: Response) => {
    try {
        const {
            first_name,
            last_name,
            bio,
            location_lat,
            location_lon,
            location_text,
            is_private,
            remove_profile_picture,
            username,
        } = req.body;

        const { profile_picture } = req.files || {};

        if (!req.profile || !req.user) return;

        const _firstName = first_name || req.user.first_name;
        const _lastName = last_name || req.user.last_name;
        const _username = username || req.user.username;

        // Validate first and last name
        if (
            !validation.validateName(_firstName) ||
            !validation.validateName(_lastName)
        ) {
            return res.status(400).json({
                message: "Invalid first or last name",
            });
        }

        // Validate username
        if (!validation.validateUsername(_username)) {
            return res.status(400).json({
                message: "Invalid username",
            });
        }

        await req.user.update({
            first_name: _firstName,
            last_name: _lastName,
            username: _username,
        });

        // Validate bio
        if (typeof bio !== "string" && bio.length > 150) {
            return res.status(400).json({
                message: "Bio must be less than 150 characters",
            });
        }

        const lat = location_lat ? parseFloat(location_lat) : null;
        const lon = location_lon ? parseFloat(location_lon) : null;

        // Validate location
        if (lat && lon && (lat < -90 || lat > 90 || lon < -180 || lon > 180)) {
            return res.status(400).json({
                message: "Invalid location",
            });
        }

        // Validate location text
        if (typeof location_text !== "string") {
            return res.status(400).json({
                message: "Invalid location text",
            });
        }

        const _isPrivate = is_private === true || is_private === "true";

        const success = await req.profile.update({
            bio: bio,
            location_lat: location_lat,
            location_lon: location_lon,
            location_text: location_text,
            is_private: _isPrivate,
        });

        if (!success) {
            return res.status(500).json({
                message: "Internal server error",
            });
        }

        const _removeProfilePicture =
            remove_profile_picture === true ||
            remove_profile_picture === "true";

        if (profile_picture) {
            try {
                if (req.profile.profile_picture.length > 0)
                    await req.profile.removeProfilePicture();
            } catch (e) {}
            // Upload new profile picture
            await req.profile.uploadProfilePicture(profile_picture);
        } else if (_removeProfilePicture) {
            await req.profile.removeProfilePicture();
        }

        return res.status(200).json({
            message: "Profile updated",
            ...getUserProfileResponse(req.user!, req.login_id, req.profile),
        });
    } catch (e) {
        console.error(e);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
