import { StreamStateType } from "@/app/components/stream-bar/stream-state";
import { QueuedTrackDict, TrackId } from "@/app/db/media-objects/track";
import { GetUsersDb } from "@/app/db/mongo-utils";
import { MessageTypes } from "@/app/settings";
import { SendServerRequestToSessionServer } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

type UserId = string;

class UserNotFoundError extends Error { };
class UserPasswordError extends Error { };
class UserCreationError extends Error { };

export type SessionUser = { _id: string, userId: string, username: string, password: string, playingNextTracks: any[] };

export async function loginUser(username: string, password: string) {
    let user: SessionUser;
    try {
        const v = await getUserByUsername(username);
        user = (v) as unknown as SessionUser;
        user.userId = v._id.toHexString();
        if (user.password !== password) {
            throw new UserPasswordError('Password is incorrect!');
        }
    }
    catch (e) {
        if (!(e instanceof UserNotFoundError)) {
            e = new Error('Could not find user!');
        }

        user = (await createUser(username, password)) as unknown as SessionUser;
    };

    return user;
};

export async function getUserByUsername(username: string) {
    const users = await GetUsersDb();
    const user = await users.findOne({ 'username': username });
    if (!user) {
        throw new UserNotFoundError('User not found!');
    }
    return user;
};

export async function getUserById(id: string) {
    const users = await GetUsersDb();
    console.log(id);
    const user = await users.findOne({ '_id': new ObjectId(id) });
    if (!user) {
        throw new UserNotFoundError('User not found!');
    }
    return user;
};

async function createUser(username: string, password: string) {
    const users = await GetUsersDb();
    const newUserInfo = await users.insertOne({
        'username': username,
        'password': password,
        'playingNextTracks': [],
        'friends': [],
        'player': {
            'currentlyPlayingTrack': null,
        }
    });

    const user = await users.findOne({ '_id': newUserInfo.insertedId });
    if (!user) {
        throw new UserCreationError('Could not find newly created user!');
    }

    return user;
};

export async function queryUserPlayingNextQueue(id: string) {
    const users = await GetUsersDb();
    console.log(`id: ${id}`);
    const userData = await users.findOne({ '_id': new ObjectId(id) }, {
        'projection': { 'playingNextTracks': 1 }
    });
    if (!userData) {
        throw new UserNotFoundError('Could not find user by id!');
    }

    return userData['playingNextTracks'];
}

export async function addTrackToUserPlayingNextQueue(userId: string, trackId: string) {
    const users = await GetUsersDb();
    const queueItem : QueuedTrackDict = {
        _id: new ObjectId(),
        trackId: trackId,
    };
    users.updateOne({ '_id': new ObjectId(userId) }, {
        '$push': {
            'playingNextTracks': queueItem,
        }
    });

    SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [userId]);
}

export async function popUserPlayingNextQueue(userId: string) {
    const users = await GetUsersDb();
    const oldData = await users.findOneAndUpdate(
        { '_id': new ObjectId(userId) },
        {
            '$pop': {
                'playingNextTracks': -1,
            },
        },
        {
            'returnDocument': 'before',
            'projection': {
                'player': {
                    'currentlyPlayingTrack': 1,
                },
                'playingNextTracks': 1,
            }
        }
    );

    SendServerRequestToSessionServer(MessageTypes.QUEUE_UPDATE, [userId]);

    if (!oldData)
    {
        return null;
    }

    console.log(oldData['playingNextTracks'][0]);
    return oldData['playingNextTracks'][0] as QueuedTrackDict;
}
