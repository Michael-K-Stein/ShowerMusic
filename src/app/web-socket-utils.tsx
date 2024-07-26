import { SSUserId } from "@/app/server-db-services/user-utils";
import { WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { StationId } from "@/app/shared-api/other/stations";
import { COMBO_DATA_KEY, MessageTypes, ServerRequestTarget, ServerRequestTargets, ShowerMusicObjectType, WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY, WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC } from "@/session-server/src/common";

export function SendServerRequestToSessionServer(type: MessageTypes, targets: ServerRequestTargets)
{
    const ws = new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING);
    ws.onopen = () =>
    {
        ws.send(
            JSON.stringify(
                {
                    'sender': WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC,
                    'authKey': WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY,
                    'type': type,
                    'targets': targets,
                }
            )
        );
    };
};

export function SendComboServerRequestToSessionServer(messageTypes: MessageTypes[], targets: ServerRequestTargets)
{
    const ws = new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING);
    ws.onopen = () =>
    {
        ws.send(
            JSON.stringify(
                {
                    'sender': WEBSOCKET_SESSION_SERVER_SENDER_SERVER_MAGIC,
                    'authKey': WEBSOCKET_SESSION_SERVER_SENDER_AUTH_KEY,
                    'type': MessageTypes.COMBO,
                    'targets': targets,
                    [ COMBO_DATA_KEY ]: messageTypes,
                }
            )
        );
    };
};

export function SendServerRequestToSessionServerForUsers(type: MessageTypes, users: SSUserId[])
{
    const targets: ServerRequestTargets = {
        targets: users.map((user): ServerRequestTarget =>
        {
            return {
                type: ShowerMusicObjectType.User,
                id: user,
            };
        })
    };

    return SendServerRequestToSessionServer(type, targets);
}

export function SendServerRequestToSessionServerForPlaylistListeners(type: MessageTypes, targetPlaylists: (PlaylistId | StationId)[])
{
    SendServerRequestToSessionServer(
        type, {
        targets: targetPlaylists.map(
            (playlistId: PlaylistId | StationId): ServerRequestTarget =>
            {
                return {
                    type: ShowerMusicObjectType.Playlist,
                    id: playlistId
                };
            })
    });
}

export function SendServerRequestToSessionServerForStationListeners(type: MessageTypes, targetStations: StationId[])
{
    return SendServerRequestToSessionServerForPlaylistListeners(type, targetStations);
}

export function SendComboServerRequestToSessionServerForStationListeners(messageTypes: MessageTypes[], targetStation: StationId)
{
    SendComboServerRequestToSessionServer(
        messageTypes,
        {
            targets: [ {
                id: targetStation, type: ShowerMusicObjectType.Station
            } ]
        }
    );
}
