import { AlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArtistDict } from "@/app/shared-api/media-objects/artists";
import Lyrics from "@/app/shared-api/media-objects/lyrics";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
import Playlist from "@/app/shared-api/other/playlist";
import { MinimalStationsCategory, Station, StationsCategory } from "@/app/shared-api/other/stations";
import { ShowerMusicNamedResolveableItem, ShowerMusicResolveableItem, UserDict } from "@/app/shared-api/user-objects/users";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { Collection, Db, MongoClient, WithId } from "mongodb";
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING ?? 'mongodb://localhost:27017/';

class DatabaseController
{
    private mongoClient!: MongoClient;
    private showermusicDb!: Db;
    private _tracks!: Collection<TrackDict>;
    private _users!: Collection<UserDict>;
    private _artists!: Collection<ArtistDict>;
    private _albums!: Collection<AlbumDict>;
    private _playlists!: Collection<Playlist>;
    private _lyrics!: Collection<Lyrics>;
    private _categories!: Collection<StationsCategory>;

    constructor()
    {
        this.mongoClient = new MongoClient(MONGO_CONNECTION_STRING);
        this.showermusicDb = this.mongoClient.db('showermusic');
        this._tracks = this.showermusicDb.collection('tracks');
        this._users = this.showermusicDb.collection('users');
        this._artists = this.showermusicDb.collection('artists');
        this._albums = this.showermusicDb.collection('albums');
        this._playlists = this.showermusicDb.collection('playlists');
        this._lyrics = this.showermusicDb.collection('lyrics');
        this._categories = this.showermusicDb.collection('categories');
    }

    public get tracks(): Collection<TrackDict>
    {
        return this._tracks;
    }

    public get users(): Collection<UserDict>
    {
        return this._users;
    }

    public getUsers<T extends UserDict = UserDict>(): Collection<T>
    {
        return this._users as unknown as Collection<T>;
    }
    public getCategories<T extends MinimalStationsCategory = MinimalStationsCategory>(): Collection<T>
    {
        return this._categories as unknown as Collection<T>;
    }

    public get artists(): Collection<ArtistDict>
    {
        return this._artists;
    }

    public get albums(): Collection<AlbumDict>
    {
        return this._albums;
    }

    public get playlists(): Collection<Playlist>
    {
        return this._playlists;
    }
    public get stations(): Collection<Station>
    {
        return this._playlists as unknown as Collection<Station>;
    }
    public get categories(): Collection<StationsCategory>
    {
        return this._categories;
    }
    public get lyrics(): Collection<Lyrics>
    {
        return this._lyrics;
    }
}

const databaseController = new DatabaseController();
export default databaseController;


export type ProjectionMap<T> = {
    [ P in keyof T ]: 1;
};

export function createProjectionMap<T extends object>(keys: (keyof T)[]): ProjectionMap<T>
{
    const map: any = {};

    keys.forEach((key) =>
    {
        map[ key ] = 1;
    });

    return map;
}

export async function getDbCollectionByItemType<T extends ShowerMusicNamedResolveableItem>(itemType: T[ 'type' ]): Promise<Collection<T>>
{
    switch (itemType)
    {
        case ShowerMusicObjectType.Track:
            return databaseController.tracks as unknown as Collection<T>;
        case ShowerMusicObjectType.Album:
            return databaseController.albums as unknown as Collection<T>;
        case ShowerMusicObjectType.Artist:
            return databaseController.artists as unknown as Collection<T>;
        case ShowerMusicObjectType.Station:
            return databaseController.stations as unknown as Collection<T>;
        case ShowerMusicObjectType.StationsCategory:
            return databaseController.categories as unknown as Collection<T>;
        case ShowerMusicObjectType.Playlist:
            return databaseController.playlists as unknown as Collection<T>;
        default:
            throw new Error(`Invalid item type ${itemType}`);
    }
}
