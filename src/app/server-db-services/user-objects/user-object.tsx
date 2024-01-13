import { GetUsersDb } from "@/app/server-db-services/mongo-utils";
import { MessageTypes } from "@/app/settings";
import { QueuedTrackDict } from "@/app/shared-api/media-objects/tracks";
import { UserDict, UserId } from "@/app/shared-api/user-objects/users";
import { SendServerRequestToSessionServer } from "@/app/web-socket-utils";
import { ObjectId } from "mongodb";

export class UserNotFoundError extends Error { };
export class UserPasswordError extends Error { };
export class UserCreationError extends Error { };
export class UserAccessDeniedError extends Error { };

export async function loginUser(username: string, password: string)
{
    let user: UserDict;
    try
    {
        const v = await getUserByUsername(username);
        user = (v) as unknown as UserDict;
        if (user.password !== password)
        {
            throw new UserPasswordError('Password is incorrect!');
        }
    }
    catch (e)
    {
        if (!(e instanceof UserNotFoundError))
        {
            e = new Error('Could not find user!');
        }

        user = (await createUser(username, password)) as unknown as UserDict;
    };

    return user;
};

export async function getUserByUsername(username: string)
{
    const users = await GetUsersDb();
    const user = await users.findOne({ 'username': username });
    if (!user)
    {
        throw new UserNotFoundError('User not found!');
    }
    return user;
};

export async function getUserById(id: UserId)
{
    const users = await GetUsersDb();
    const user = await users.findOne({ '_id': new ObjectId(id) });
    if (!user)
    {
        throw new UserNotFoundError('User not found!');
    }
    return user;
};

async function createUser(username: string, password: string)
{
    const users = await GetUsersDb();
    const newUserInfo = await users.insertOne({
        'username': username,
        'password': password,
        'playingNextTracks': { _id: new ObjectId, tracks: [] },
        'friends': [],
        'player': {
            'currentlyPlayingTrack': '',
        },
        _id: new ObjectId
    });

    const user = await users.findOne({ _id: newUserInfo.insertedId });
    if (!user)
    {
        throw new UserCreationError('Could not find newly created user!');
    }

    return user;
};

export async function verifyAdminUser(userId: UserId)
{
    throw new UserAccessDeniedError();
}
