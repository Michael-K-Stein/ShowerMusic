import * as mongoDB from "mongodb";
import { MediaId } from "./media-objects/media-id";
import { TrackDict } from "./media-objects/track";
import { ArtistDict } from "@/app/db/media-objects/artist";
import { AlbumDict } from "@/app/db/media-objects/album";

const MONGO_CONNECTION_STRING = "mongodb://127.0.0.1:27017/";

let mongoClient = undefined;
let showermusicDb = undefined;
let tracks: mongoDB.Collection<mongoDB.BSON.Document> | undefined = undefined;
let users: mongoDB.Collection<mongoDB.BSON.Document> | undefined = undefined;
let artists: mongoDB.Collection<mongoDB.BSON.Document> | undefined = undefined;
let albums: mongoDB.Collection<mongoDB.BSON.Document> | undefined = undefined;

async function ConnectTracksDb()
{
    mongoClient = new mongoDB.MongoClient(MONGO_CONNECTION_STRING)
    await mongoClient.connect()
    showermusicDb = mongoClient.db('showermusic');
    tracks = showermusicDb.collection('tracks');
};

async function ConnectUsersDb()
{
    mongoClient = new mongoDB.MongoClient(MONGO_CONNECTION_STRING)
    await mongoClient.connect()
    showermusicDb = mongoClient.db('showermusic');
    users = showermusicDb.collection('users');
};

async function ConnectArtistsDb()
{
    mongoClient = new mongoDB.MongoClient(MONGO_CONNECTION_STRING)
    await mongoClient.connect()
    showermusicDb = mongoClient.db('showermusic');
    artists = showermusicDb.collection('artists');
};

async function ConnectAlbumsDb()
{
    mongoClient = new mongoDB.MongoClient(MONGO_CONNECTION_STRING)
    await mongoClient.connect()
    showermusicDb = mongoClient.db('showermusic');
    albums = showermusicDb.collection('albums');
};


export async function GetTracksDb()
{
    if (tracks === undefined || tracks === null)
    {
        await ConnectTracksDb();
        if (tracks === undefined || tracks === null)
        {
            throw 'Tracks\' database has not been initialized!';
        }
    }

    return tracks;
}

export async function GetUsersDb()
{
    if (users === undefined || users === null)
    {
        await ConnectUsersDb();
        if (users === undefined || users === null)
        {
            throw 'Users\' database has not been initialized!';
        }
    }

    return users;
}

export async function GetArtistsDb()
{
    if (artists === undefined || artists === null)
    {
        await ConnectArtistsDb();
        if (artists === undefined || artists === null)
        {
            throw 'Artists\' database has not been initialized!';
        }
    }

    return artists;
}

export async function GetAlbumsDb()
{
    if (albums === undefined || albums === null)
    {
        await ConnectAlbumsDb();
        if (albums === undefined || albums === null)
        {
            throw 'Albums\' database has not been initialized!';
        }
    }

    return albums;
}

export async function GetDbTrackInfo(trackId: MediaId)
{
    const tracksDb = await GetTracksDb();

    const data = await tracksDb.findOne({'id': trackId});
    if (data === undefined || data === null)
    {
        throw 'Track not found!';
    }

    return data as unknown as TrackDict;
}

export async function GetDbArtistInfo(artistId: MediaId)
{
    const artistDb = await GetArtistsDb();

    const data = await artistDb.findOne({'id': artistId});
    if (data === undefined || data === null)
    {
        throw 'Artist not found!';
    }

    return data as unknown as ArtistDict;
}

export async function GetDbAlbumsOfArtist(artistId: MediaId, offset: number, limit: number, include_groups: string[])
{
    const albumsDb = await GetAlbumsDb();

    const data = await albumsDb.find({'artists': artistId}).skip(offset).limit(limit).toArray();
    
    if (data === undefined || data === null)
    {
        throw 'Albums not found!';
    }

    return data as unknown as AlbumDict[];
}

export async function GetDbAlbumInfo(albumId: string)
{
    const tracksDb = await GetAlbumsDb();

    const data = await tracksDb.findOne({'id': albumId});
    if (data === undefined || data === null)
    {
        throw 'Album not found!';
    }

    return data as unknown as AlbumDict;
}

export async function GetDbAlbumTracks(albumId: string, offset: number, limit: number)
{
    const albumsDb = await GetAlbumsDb();

    const data = await albumsDb.find({'id': albumId}).skip(offset).limit(limit).toArray();

    if (data === undefined || data === null)
    {
        throw 'Album not found!';
    }

    return data as unknown as TrackDict[];
}
