import { getDbCollectionByItemType } from "@/app/server-db-services/mongo-db-controller";
import { MessageTypes, PseudoSyncId, PseudoSyncIds, ShowerMusicObjectType } from "@/app/settings";
import { ApiNotImplementedError, SecurityCheckError } from "@/app/shared-api/other/errors";
import { MashingType, MashObject, MashOutcome, MatchOutcomeMashApiParams } from "@/app/shared-api/other/media-mash";
import { MashMath } from "@/app/shared-api/other/track-mash";
import { SendServerRequestToSessionServerForPseudoSyncId } from "@/app/web-socket-utils";
import assert from "assert";
import { Collection } from "mongodb";

export default async function postMashingOutcome(
    {
        mashingItemAId,
        mashingItemBId,
        outcomePerspectiveA,
        mashingType }: MatchOutcomeMashApiParams): Promise<void>
{

    let outcomePerspectiveB = MashOutcome.Undefined;
    switch (outcomePerspectiveA)
    {
        case MashOutcome.Win:
            outcomePerspectiveB = MashOutcome.Loss;
            break;
        case MashOutcome.Loss:
            outcomePerspectiveB = MashOutcome.Win;
            break;
        case MashOutcome.Draw:
            outcomePerspectiveB = MashOutcome.Draw;
            break;
        case MashOutcome.Undefined:
        default:
            assert(false, `Invalid mash outcome ${outcomePerspectiveA}`);
    }

    const itemCollection: Collection<MashObject> = await getDbCollectionByItemType<MashObject>(mashingType);

    assert(mashingItemAId, `Mashing item A's id is invalid!`);
    assert(mashingItemBId, `Mashing item B's id is invalid!`);

    if (mashingItemAId === mashingItemBId)
    {
        throw new SecurityCheckError(`Mashing against self is not allowed! Caused by ${mashingItemAId}`);
    }

    const mashingIds = [ mashingItemAId, mashingItemBId ];

    const mashingItems = await itemCollection.find(
        {
            'id': { $in: mashingIds },
            'type': mashingType,
        },
        {
            projection: {
                'id': 1,
                'name': 1,
                'type': 1,
                'mashData': 1,
            }
        }
    ).limit(mashingIds.length).toArray();

    const itemA = mashingItems.find((v) => v.id === mashingItemAId);
    const itemB = mashingItems.find((v) => v.id === mashingItemBId);

    assert(itemA, `Mashing item A invalid!`);
    assert(itemB, `Mashing item B invalid!`);

    const itemANewRating = MashMath.calculateNewRating({ myObject: itemA, outcome: outcomePerspectiveA, opponent: itemB });
    const itemBNewRating = MashMath.calculateNewRating({ myObject: itemB, outcome: outcomePerspectiveB, opponent: itemA });

    // Notice that there is a race condition of updating the ratings.
    // Consider the following:
    // We "capture" the original ratings in the "find" earlier, and while we calculate the new ratings, someone else updates mash match results in the DB.
    // We will now actually *override* their results and cause an inconsistancy.
    // This can be fixed using the 'mashData.matchesTotal' and making sure it has not changed during the calculation, and looping until it stays constant
    //  throughout this function.
    // However, I don't care.

    const itemAUpdateOp = itemCollection.updateOne(
        {
            id: itemA.id,
            type: mashingType
        },
        {
            $set: {
                'mashData.eloRating': itemANewRating,
            },
            $inc: {
                'mashData.matchesTotal': 1,
                'mashData.matchesWon': outcomePerspectiveA === MashOutcome.Win ? 1 : 0,
                'mashData.matchesLost': outcomePerspectiveA === MashOutcome.Loss ? 1 : 0,
            },
        });

    const itemBUpdateOp = itemCollection.updateOne(
        {
            id: itemB.id,
            type: mashingType
        },
        {
            $set: {
                'mashData.eloRating': itemBNewRating,
            },
            $inc: {
                'mashData.matchesTotal': 1,
                'mashData.matchesWon': outcomePerspectiveB === MashOutcome.Win ? 1 : 0,
                'mashData.matchesLost': outcomePerspectiveB === MashOutcome.Loss ? 1 : 0,
            },
        });

    const itemAUpdateResult = await itemAUpdateOp;
    const itemBUpdateResult = await itemBUpdateOp;

    assert(itemAUpdateResult.matchedCount === 1 && itemAUpdateResult.modifiedCount === 1);
    assert(itemBUpdateResult.matchedCount === 1 && itemBUpdateResult.modifiedCount === 1);

    SendServerRequestToSessionServerUpdateMashScoreboardData(mashingType);
}

export function SendServerRequestToSessionServerUpdateMashScoreboardData(mashingType: MashingType)
{
    switch (mashingType)
    {
        case ShowerMusicObjectType.Track:
            SendServerRequestToSessionServerForPseudoSyncId(MessageTypes.MASH_TRACK_SCOREBOARD_UPDATE, PseudoSyncIds.MashTrackScoreboard);
            break;
        case ShowerMusicObjectType.Album:
        case ShowerMusicObjectType.Artist:
        case ShowerMusicObjectType.Station:
        case ShowerMusicObjectType.StationsCategory:
        case ShowerMusicObjectType.Playlist:
            throw new ApiNotImplementedError(`Mash scoreboard not implemented for this type (${mashingType}) !`);
    }
}
