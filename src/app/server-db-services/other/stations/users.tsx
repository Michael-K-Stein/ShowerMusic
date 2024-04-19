import databaseController from "@/app/server-db-services/mongo-db-controller";
import { aesDecrypt, aesEncrypt, EncryptedData } from "@/app/server-db-services/other/security";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { MessageTypes } from "@/app/settings";
import { MaliciousActivityError, SecurityCheckError } from "@/app/shared-api/other/errors";
import { StationId } from "@/app/shared-api/other/stations";
import { SendServerRequestToSessionServerForStationListeners } from "@/app/web-socket-utils";

export interface StationInvitationMetadata
{
    url: string;
    // Possibly add an expiration date?
    // Or maybe user-specific invitation?
};

interface StationInviteData extends StationInvitationMetadata
{
    stationId: StationId;
}
async function encryptStationInviteData(stationId: StationId, invitationMetaData: StationInvitationMetadata)
{
    if ('stationId' in invitationMetaData) { throw new MaliciousActivityError(`Attempted data injection attack in station invite generation!`); }

    const inviteLinkData: StationInviteData = {
        stationId,
        ...invitationMetaData,
    };
    const encryptedInviteData: EncryptedData<StationInviteData> = await aesEncrypt(inviteLinkData);
    const encodedEncryptedInviteData = Buffer.from(JSON.stringify(encryptedInviteData)).toString('base64url');
    return encodedEncryptedInviteData;
}

async function decryptStationInviteData(encodedEncryptedInviteData: string): Promise<StationInviteData>
{
    const encryptedInviteData = JSON.parse(Buffer.from(encodedEncryptedInviteData, 'base64url').toString()) as EncryptedData<StationInviteData>;
    const decryptedInviteData = await aesDecrypt(encryptedInviteData);
    return decryptedInviteData;
}

async function buildStationInviteUrlFromParts(stationId: StationId, encryptedInviteData: string)
{
    return `http://localhost:3000/api/stations/${stationId}/users/join?c=${encryptedInviteData}`;
}

async function parseStationInvite(stationId: StationId, encodedEncryptedInviteData: string)
{
    const inviteData = await decryptStationInviteData(encodedEncryptedInviteData);
    if (stationId != inviteData.stationId)
    {
        throw new SecurityCheckError(`Station invite link has been tampered with!`);
    }
    return inviteData;
}

async function addUserToStationMembers(stationId: StationId, userId: SSUserId)
{
    await databaseController.stations.updateOne(
        {
            'id': stationId,
            'members': { $exists: 1, }, // Make sure this opperation only acts on private-station-like objects.
            // Indeed, this might change a public station, however this would have no effect until the station
            //  becomes private.
            // Since the only case where "members" is not a valid field is when anyone has access to the station,
            //  this is fine :)
        }, {
        $addToSet: { 'members': userId, },
    });

    SendServerRequestToSessionServerForStationListeners(MessageTypes.PLAYLIST_UPDATE, [ stationId ]);
}

export async function generateStationInvite(stationId: StationId, invitationMetaData: StationInvitationMetadata)
{
    const inviteData = await encryptStationInviteData(stationId, invitationMetaData);
    const inviteLink = await buildStationInviteUrlFromParts(stationId, inviteData);
    return inviteLink;
}

export async function joinStationFromInvite(stationId: StationId, userId: SSUserId, cipheredInvitationData: string): Promise<StationInvitationMetadata>
{
    const inviteData = await parseStationInvite(stationId, cipheredInvitationData);
    await addUserToStationMembers(stationId, userId);
    return inviteData;
}

export async function promoteStationMember(stationId: StationId, userToPromote: SSUserId)
{
    await databaseController.stations.updateOne(
        {
            'id': stationId,
            'members': { $in: [ userToPromote ] },
        }, {
        $addToSet: {
            'admins': userToPromote,
        },
        $pull: {
            'members': userToPromote,
        }
    });

    SendServerRequestToSessionServerForStationListeners(MessageTypes.PLAYLIST_UPDATE, [ stationId ]);
}
