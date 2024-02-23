import { SSUserId } from "@/app/server-db-services/user-utils";
import { WEBSOCKET_SESSION_SERVER_CONN_STRING } from "@/app/settings";
import { PlaylistId } from "@/app/shared-api/other/playlist";
import { MessageTypes, ServerRequestTarget, ServerRequestTargets, ShowerMusicObjectType } from "@/session-server/src/common";

export function SendServerRequestToSessionServer(type: string, targets: ServerRequestTargets)
{
    const ws = new WebSocket(WEBSOCKET_SESSION_SERVER_CONN_STRING);
    ws.onopen = () =>
    {
        ws.send(
            JSON.stringify(
                { 'sender': 'server', 'authKey': null, 'type': type, 'targets': targets }
            )
        );
    };
};

export function SendServerRequestToSessionServerForUsers(type: string, users: SSUserId[])
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

export function SendServerRequestToSessionServerForPlaylistListeners(type: MessageTypes, targetPlaylists: PlaylistId[])
{
    SendServerRequestToSessionServer(
        type, {
        targets: targetPlaylists.map(
            (playlistId: PlaylistId): ServerRequestTarget =>
            {
                return {
                    type: ShowerMusicObjectType.Playlist,
                    id: playlistId
                };
            })
    });
}
