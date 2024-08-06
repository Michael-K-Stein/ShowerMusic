import { EloScoreResult, MashData, MashObject, MashOutcome, MashRating } from "@/app/shared-api/other/media-mash";
import assert from "assert";

export namespace MashMath
{
    function outcomeToEloScoreResult(outcome: MashOutcome): EloScoreResult
    {
        switch (outcome)
        {
            case MashOutcome.Win:
                return 1;
            case MashOutcome.Loss:
                return 0;
            case MashOutcome.Draw:
                return 0.5;
            case MashOutcome.Undefined:
            default:
                assert(false, "Invalid mash outcome!");
        }
    }

    function calculateNewRatingByValue(
        {
            myRating, outcome, opponentRating
        }: { myRating: MashRating, outcome: MashOutcome, opponentRating: MashRating; })
    {
        const oldRating = myRating;

        const K = 32; // Constant for chess (you can adjust this for other games)
        const expectedScore = 1 / (1 + 10 ** ((opponentRating - oldRating) / 400));
        const actualScore = outcomeToEloScoreResult(outcome); // 1 for win, 0 for loss, 0.5 for draw

        const newRating = oldRating + K * (actualScore - expectedScore);
        return newRating;
    }

    function calculateNewRatingByData<T extends MashData>(
        {
            myData, outcome, opponentData
        }: { myData: T, outcome: MashOutcome, opponentData: T; }
    )
    {
        return calculateNewRatingByValue({ myRating: myData.eloRating, outcome, opponentRating: opponentData.eloRating });
    }

    export function calculateNewRating<T extends MashObject>(
        {
            myObject, outcome, opponent
        }: { myObject: T, outcome: MashOutcome, opponent: T; }
    )
    {
        return calculateNewRatingByData({ myData: myObject.mashData, outcome, opponentData: opponent.mashData });
    }
};
