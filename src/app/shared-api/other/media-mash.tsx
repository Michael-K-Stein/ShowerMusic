import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicObject, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicNamedResolveableItem } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";

export type MashRating = number;

export enum MashOutcome
{
    Undefined = 0,
    Win,
    Loss,
    Draw,
}
export type EloScoreResultWin = 1;
export type EloScoreResultLose = 0;
export type EloScoreResultDraw = 0.5;
export type EloScoreResult = EloScoreResultWin | EloScoreResultLose | EloScoreResultDraw;
export type MashingType = ShowerMusicPlayableMediaType;

export interface MashData
{
    eloRating: MashRating;
    matchesWon: number;
    matchesLost: number;
    matchesTotal: number;
};

export type MashObjectId = MediaId;

export interface MashObject<T extends MashingType = MashingType> extends ShowerMusicNamedResolveableItem
{
    id: MashObjectId;
    type: T;
    name: string;
    mashData: MashData;
}

export type ExtendedMashObject<T extends MashingType = MashingType> = MashObject<T> & ShowerMusicPlayableMediaDict;

export interface MashApiParams
{
    mashingType: MashingType;
}

interface GetItemMashApiParams_WithOpponent extends MashApiParams
{
    opponentRating: MashRating;
    deviationFactor: number;
    opponentId: MashObjectId;
}

interface GetItemMashApiParams_TwoItems extends MashApiParams
{
    opponentRating: undefined;
    deviationFactor: undefined;
    opponentId: undefined;
}

export type GetItemMashApiParams = GetItemMashApiParams_WithOpponent | GetItemMashApiParams_TwoItems;

export interface MatchOutcomeMashApiParams extends MashApiParams
{
    mashingItemAId: MashObjectId;
    mashingItemBId: MashObjectId;
    outcomePerspectiveA: MashOutcome; // Outcome from the perspective of A
}
export interface GetScoreboardMashApiParams extends MashApiParams
{
    count?: number;
}
export interface MashScoreboard 
{
    mashingType: MashingType;
    items: Array<ExtendedMashObject>;
};
