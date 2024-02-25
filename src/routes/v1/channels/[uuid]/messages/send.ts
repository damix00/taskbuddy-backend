// POST /v1/channels/:uuid/messages/send
// Sends a message to a channel

import { Response, request } from "express";
import { authorize } from "../../../../../middleware/authorization";
import { requireMethod } from "../../../../../middleware/require_method";
import { ChannelRequest, withChannel } from "../middleware";
import { BlockReads } from "../../../../../database/wrappers/accounts/blocks/wrapper";
import { getMessageResponse } from "../../responses";
import { ChannelStatus } from "../../../../../database/models/chats/channels";
import { UploadedFile } from "express-fileupload";
import RemoteConfigData from "../../../../../firebase/remote_config";
import FirebaseStorage from "../../../../../firebase/storage/files";
import uniqueFilename from "unique-filename";
import os from "os";
import path from "path";
import fs from "fs";
import { AttachmentType } from "../../../../../database/models/chats/messages";
import { listParser } from "../../../../../middleware/parsers";
import setKillswitch from "../../../../../middleware/killswitch";
import { KillswitchTypes } from "../../../../../database/models/killswitch";

export default [
    requireMethod("POST"),
    setKillswitch([KillswitchTypes.DISABLE_CHAT]),
    authorize(true),
    withChannel,
    listParser(["attachment_types"]),
    async (req: ChannelRequest, res: Response) => {
        try {
            const { content } = req.body;

            const attachments: UploadedFile[] = [];

            // Check if the user is trying to send attachments
            if (req.files) {
                // Check if the user has exceeded the max number of attachments
                if (
                    Object.keys(req.files).length >
                    RemoteConfigData.maxAttachments
                ) {
                    res.status(400).json({
                        error: "Too many attachments",
                    });
                    return;
                }

                // Check if the user has exceeded the max attachment size
                for (const key of Object.keys(req.files)) {
                    const file = req.files[key] as UploadedFile;

                    // 30 MB
                    if (file.size > 30 * 1024 * 1024) {
                        res.status(400).json({
                            error: "Attachment too large",
                        });
                        return;
                    }

                    attachments.push(file);
                }
            }

            if (
                (!content || content.length == 0 || content.length > 2000) &&
                attachments.length == 0
            ) {
                res.status(400).json({
                    error: "Missing content",
                });
                return;
            }

            if (req.channel!.status == ChannelStatus.REJECTED) {
                res.status(403).json({
                    error: "Couldn't send message",
                });
                return;
            }

            const isChannelCreator = req.channel!.created_by_id == req.user!.id;
            const otherUser = isChannelCreator
                ? req.channel!.recipient
                : req.channel!.created_by;

            // Check if the user is blocked by the channel creator or vice versa
            if (await BlockReads.isEitherBlocked(req.user!.id, otherUser.id)) {
                res.status(403).json({
                    error: "Couldn't send message",
                });
                return;
            }

            const attachmentTypes = req.body.attachment_types || [];

            if (attachmentTypes.length != attachments.length) {
                res.status(500).json({
                    error: "Internal server error",
                });
                return;
            }

            for (const type of attachmentTypes) {
                if (
                    type != AttachmentType.IMAGE &&
                    type != AttachmentType.VIDEO &&
                    type != AttachmentType.DOCUMENT
                ) {
                    res.status(400).json({
                        error: "Invalid attachment type",
                    });
                    return;
                }
            }

            const files = await FirebaseStorage.uploadFiles(
                attachments,
                "attachments",
                req.channel!.uuid
            );

            if (req.files && attachments.length != files.length) {
                res.status(500).json({
                    error: "Internal server error",
                });
                return;
            }

            const messageAttachments: {
                attachment_url: string;
                attachment_type: AttachmentType;
            }[] = files.map((file, i) => ({
                attachment_url: file,
                attachment_type: attachmentTypes[i],
            }));

            // Send message
            const result = await req.channel!.sendMessage(
                {
                    sender_id: req.user!.id,
                    channel_id: req.channel!.id,
                    message: content,
                    system_message: false,
                    attachments: messageAttachments,
                },
                req.user!,
                req.profile!.profile_picture
            );

            if (!result) {
                res.status(500).json({
                    error: "Internal server error",
                });
                return;
            }

            // Send response
            res.status(200).json({
                message: getMessageResponse(
                    result,
                    req.user!,
                    req.channel!.uuid
                ),
            });

            // Send push notification
            await otherUser.sendNotification({
                title: `${req.user!.first_name} ${req.user!.last_name}`,
                body:
                    content.length > 50
                        ? content.slice(0, 50) + "..."
                        : content,
                imageUrl:
                    req.profile!.profile_picture?.length > 0
                        ? req.profile!.profile_picture
                        : undefined,
                data: {
                    type: "message",
                    channel_uuid: req.channel!.uuid,
                    message_uuid: result.uuid,
                },
            });

            otherUser.sendSocketEvent("chat", {
                message: getMessageResponse(
                    result,
                    otherUser,
                    req.channel!.uuid
                ),
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: "Internal server error",
            });
        }
    },
];
