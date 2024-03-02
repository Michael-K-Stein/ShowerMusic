import { filterTargetOrUserId } from '@/app/api/commands/any/common';
import { ApiSuccess, catchHandler } from '@/app/api/common';
import { DbObjects } from '@/app/server-db-services/db-objects';
import { getUserId } from '@/app/server-db-services/user-utils';
import { ArbitraryTargetAndDataApiRequestBodyWithComplexItem, ComplexItem, ComplexItemType, RemovalId, ShowerMusicObjectType } from '@/app/shared-api/other/common';
import { InvalidParameterCombinationError, InvalidSourceTypeError, InvalidTargetIdError, InvalidTargetTypeError } from '@/app/shared-api/other/errors';
import { PlaylistTrack } from '@/app/shared-api/other/playlist';
import { NextRequest } from "next/server";

export async function POST(req: NextRequest)
{
    try
    {
        const userId = await getUserId();
        const commandData: ArbitraryTargetAndDataApiRequestBodyWithComplexItem = await req.json();

        const mediaToRemove: ComplexItem = commandData.item;
        const typeOfMediaToRemove: ComplexItemType = commandData.itemType;
        let fromTargetId = commandData.targetId;
        const targetType: ShowerMusicObjectType = commandData.targetType;

        // Check valid parameter combinations
        const validCombintations: [ ShowerMusicObjectType, ComplexItemType ][] = [
            [ ShowerMusicObjectType.Playlist, ComplexItemType.RemovalId ],
            [ ShowerMusicObjectType.Station, ComplexItemType.RemovalId ],
            [ ShowerMusicObjectType.User, ComplexItemType.RemovalId ],
        ];
        const isValidType = validCombintations.reduce((typePassedCheck: boolean, validItem) =>
        {
            const [ validTargetType, validItemType ] = validItem;
            if (targetType === validTargetType && typeOfMediaToRemove !== validItemType)
            {
                throw new InvalidParameterCombinationError(`Item must be of type '${validItemType}' (not '${typeOfMediaToRemove}') for removal operation on ${validTargetType} !`);
            }
            return typePassedCheck || (targetType === validTargetType);
        }, false);
        if (!isValidType)
        {
            throw new InvalidTargetTypeError();
        }
        // We can now assume that the parameter types are valid

        switch (targetType)
        {
            case ShowerMusicObjectType.Playlist:
                {
                    if (!fromTargetId) { throw new InvalidTargetIdError(); }
                    await DbObjects.Playlists.removeTrack(fromTargetId, mediaToRemove as RemovalId);
                    break;
                }
            case ShowerMusicObjectType.Station:
                {
                    if (!fromTargetId) { throw new InvalidTargetIdError(); }
                    await DbObjects.Stations.removeTrack(fromTargetId, mediaToRemove as RemovalId);
                    break;
                }
            case ShowerMusicObjectType.User:
                {
                    // Technically, the item need not be a track, since we only care about the queueId
                    await DbObjects.Users.Queue.removeItem(await filterTargetOrUserId(fromTargetId, userId), mediaToRemove as RemovalId);
                    break;
                }
            default:
                {
                    throw new InvalidTargetTypeError();
                }
        }

        return ApiSuccess();
    }
    catch (e)
    {
        return catchHandler(e);
    }
}
