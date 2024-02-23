import { commandAnyRemoveArbitrary } from "@/app/client-api/common-utils";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { ShowerMusicObjectType } from "@/app/settings";
import { ComplexItemType, RemovalId } from "@/app/shared-api/other/common";
import { EnqueueSnackbar } from "notistack";

export default function removeTrackFromArbitrary(
    removalId: RemovalId,
    trackName: string,
    fromId: string,
    fromType: ShowerMusicObjectType,
    enqueueSnackbar?: EnqueueSnackbar
)
{
    let itemType: ComplexItemType = ComplexItemType.RemovalId;

    return commandAnyRemoveArbitrary(
        removalId, itemType,
        fromType, fromId
    )
        .catch((e) =>
        {
            enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to remove ${trackName}`, e);
        });
}
