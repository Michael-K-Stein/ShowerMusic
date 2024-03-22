import { AlbumNotFoundError, ArtistNotFoundError, ClientApiError, ClientError, ServerNetworkError, TrackNotFoundError, constructErrorFromNetworkMessage } from "@/app/shared-api/other/errors";
import { ApiResponseJson, ArbitraryDataApiRequestBody, ArbitraryTargetAndDataApiRequestBody, ArbitraryTargetAndDataApiRequestBodyWithComplexItem, ComplexItem, ComplexItemType, RemovalId, ShowerMusicObject, ShowerMusicObjectType, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { SetAddToArbitraryModalState } from "@/app/components/providers/session/session";
import { MouseEventHandler } from "react";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { ShowerMusicNamedResolveableItem } from "@/app/shared-api/user-objects/users";
import { TrackId } from "@/app/shared-api/media-objects/tracks";

export function safeFetcher(input: RequestInfo, init?: RequestInit | undefined): Promise<Response | false>
{
    return fetch(input, init);
}

export function safeApiFetcher(input: RequestInfo, init?: RequestInit | undefined, withCatch?: boolean): Promise<any | false>
{
    return safeFetcher(input, init)
        .then((response) =>
        {
            if (response === false) { return response; }
            return response.json()
                .then((data: ApiResponseJson) =>
                {
                    if (data.status === 0)
                    {
                        return data.data;
                    }

                    throw constructErrorFromNetworkMessage(data.error as ClientApiError);
                })
                .catch((e: any | ClientApiError) =>
                {
                    if (withCatch !== true) { throw e; }

                    if (e instanceof ClientApiError)
                    {
                        console.log(`[ClientApiError] ${e}`);
                    }
                    else if (e instanceof ClientError)
                    {
                        console.log(`[ClientError] ${e}`);
                    }
                    else
                    {
                        console.log(`Api json error: ${e}`);
                    }
                    return false;
                });
        })
        .catch((e: any) =>
        {
            if (e instanceof ClientApiError) { throw e; }
            throw new ServerNetworkError(JSON.stringify(e));
        });
}

export async function commandQueryAnyTracks(
    sourceType: ShowerMusicObjectType, sourceId: MediaId
)
{
    const data: ArbitraryDataApiRequestBody = {
        id: sourceId,
        type: sourceType,
    };

    return await safeApiFetcher(`/api/commands/any/tracks`, {
        method: 'POST',
        body: JSON.stringify(data),
    }) as TrackId[];
}

export async function commandAnyAddArbitrary(
    sourceType: ShowerMusicObjectType, sourceId: MediaId,
    targetType: ShowerMusicObjectType, targetId?: MediaId
)
{
    const data: ArbitraryTargetAndDataApiRequestBody = {
        id: sourceId,
        type: sourceType,
        targetType: targetType,
        targetId: targetId,
    };

    return await safeApiFetcher(`/api/commands/any/add`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function commandAnySetArbitrary(
    sourceType: ShowerMusicObjectType, sourceId: MediaId,
    targetType: ShowerMusicObjectType, targetId?: MediaId
)
{
    const data: ArbitraryTargetAndDataApiRequestBody = {
        id: sourceId,
        type: sourceType,
        targetType: targetType,
        targetId: targetId,
    };

    return await safeApiFetcher(`/api/commands/any/set`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function commandAnyRemoveArbitrary(
    removalId: RemovalId, itemType: ComplexItemType,
    targetType: ShowerMusicObjectType, targetId?: MediaId
)
{
    const data: ArbitraryTargetAndDataApiRequestBodyWithComplexItem = {
        item: removalId,
        itemType: itemType,
        targetType: targetType,
        targetId: targetId,
    };

    return await safeApiFetcher(`/api/commands/any/remove`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getClientSideObjectId(object: ShowerMusicObject)
{
    return object._id as unknown as string;
}

export function addAnyToArbitraryClickHandlerFactory<T extends ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem>(
    object: T | undefined,
    objectType: ShowerMusicPlayableMediaType | undefined,
    setAddToArbitraryModalState: SetAddToArbitraryModalState,
): MouseEventHandler
{
    return (event: React.MouseEvent<HTMLElement, MouseEvent>) =>
    {
        if (object === undefined || objectType === undefined) { return; }
        setAddToArbitraryModalState({
            posX: event.clientX,
            posY: event.clientY,
            event: event,
            mediaType: objectType,
            mediaData: object,
        });
    };
}
