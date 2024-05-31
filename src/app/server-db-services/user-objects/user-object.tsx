import { verifyUser } from "@/app/server-db-services/ldap/common";
import databaseController from "@/app/server-db-services/mongo-db-controller";
import { SSUserId } from "@/app/server-db-services/user-utils";
import { LDAP_DISPLAY_NAME_FIELD, USE_LDAP_AUTHENTICATION } from "@/app/settings";
import { ClientApiError } from "@/app/shared-api/other/errors";
import { LoopState, LyricsState, PauseState, UserDict, UserId, UserPublicInfo } from "@/app/shared-api/user-objects/users";
import assert from "assert";
import { FindOptions, ObjectId } from "mongodb";

export class UserNotFoundError extends Error { };
export class UserPasswordError extends Error { };
export class UserCreationError extends Error { };
export class UserAccessDeniedError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'UserAccessDeniedError';
    }
};

export async function loginUser(username: string, password: string)
{
    let userDisplayName: string = username;
    if (USE_LDAP_AUTHENTICATION)
    {
        try
        {
            const ldapUserData = await verifyUser(username, password);
            console.log(ldapUserData);
            for (const attr of ldapUserData.attributes)
            {
                console.log(attr);
            }

            const possibleLdapDisplayNames = ldapUserData.attributes.find(
                (v) =>
                    v.type === LDAP_DISPLAY_NAME_FIELD
            )?.values;

            if (possibleLdapDisplayNames)
            {
                assert(possibleLdapDisplayNames.length >= 1);
                userDisplayName = possibleLdapDisplayNames[ 0 ];
            }

        } catch (e)
        {
            console.log(`User verification error: `, e);
            throw new UserAccessDeniedError(`Authentication failed!`);
        }
    }

    let user: UserDict | null = null;
    try
    {
        const v = await getUserByUsername(username);
        user = v;
        if (!USE_LDAP_AUTHENTICATION)
        {
            assert(user.password);
            if (user.password !== password)
            {
                throw new UserPasswordError('Username or password is incorrect!');
            }
        }
    }
    catch (e)
    {
        if (!(e instanceof UserNotFoundError))
        {
            e = new Error('Could not find user!');
        }

        // Do not pass the password if we are using LDAP authentication
        user = await createUser(
            username,
            USE_LDAP_AUTHENTICATION ? undefined : password,
            userDisplayName
        );
    };

    assert(user !== null);
    return user;
};

export async function getUserByUsername(username: string)
{
    const user = await databaseController.users.findOne({ 'username': username });
    if (!user)
    {
        throw new UserNotFoundError('User not found!');
    }
    return user;
};

export async function getUserByStringId(id: UserId)
{
    return getUserById(new ObjectId(id));
}

export async function getUserById(userId: SSUserId, options?: FindOptions<Document>)
{
    const user = await databaseController.users.findOne({ '_id': userId }, options);
    if (!user)
    {
        throw new UserNotFoundError('User not found!');
    }
    return user;
};

async function createUser(username: string, password?: string, userDisplayName?: string): Promise<UserDict>
{
    const displayName = userDisplayName ?? username;

    const newUserInfo = await databaseController.users.insertOne({
        'username': username,
        'displayName': displayName,
        'password': password,
        'playingNextTracks': { _id: new ObjectId, tracks: [] },
        'friends': [],
        'player': {
            'currentlyPlayingTrack': '',
            'lastSavedSeekTime': 0,
            'loopState': LoopState.None,
            'lyricsState': LyricsState.Hidden,
            'pauseState': PauseState.Paused,
        },
        _id: new ObjectId,
        'listenHistory': {
            'lastAlbums': [],
            'lastPlaylists': [],
            'lastStations': [],
            'lastArtists': [],
            'lastTracks': [],
            'recents': [],
            'traversableHistory': { _id: new ObjectId, history: [], traversalIndex: 0 }
        },
        playlists: [],
    });

    const user = await databaseController.users.findOne({ _id: newUserInfo.insertedId });
    if (!user)
    {
        throw new UserCreationError('Could not find newly created user!');
    }

    return user;
};

// Throws an error if the user is not an admin.Use as a barrier check.;
export async function verifyAdminUser(userId: SSUserId)
{
    throw new UserAccessDeniedError();
}

export async function getUserPublicInfo(userId: UserId): Promise<UserPublicInfo>
{
    const user = await databaseController.users.findOne(
        { '_id': new ObjectId(userId) },
        {
            projection: {
                username: 1,
            }
        });
    if (!user)
    {
        throw new UserNotFoundError('User not found!');
    }
    return user as UserPublicInfo;
}
