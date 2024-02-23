interface User { id: string; history: Array<string>; }
interface Song { id: string; }
interface Recommendation { songs: Array<string>; }
class SongRecommender
{
    private db: any;
    constructor(db: any) { this.db = db; }
    async recommendSongs(user: User, currentSongs?: Array<string>): Promise<Recommendation>
    {
        if (!currentSongs || currentSongs.length === 0) { currentSongs = [ user.history[ user.history.length - 1 ] ]; }
        let recommendedSongs: Array<string> = [];
        for (let songId of currentSongs)
        {
            let similarSongs = await this.getSimilarSongs(songId);
            similarSongs = similarSongs.filter(songId => !user.history.includes(songId));
            recommendedSongs = recommendedSongs.concat(similarSongs);
        }
        if (recommendedSongs.length > 10) { recommendedSongs = recommendedSongs.slice(0, 10); }
        return { songs: recommendedSongs };
    }
    async getSimilarSongs(songId: string): Promise<Array<string>>
    {
        let song = await this.db.collection('songs').findOne({ id: songId });
        if (!song || !song.similarSongs) { return []; }
        return song.similarSongs;
    }
    async getSongFeatures(songId: string): Promise<Array<number>>
    {
        let song = await this.db.collection('songs').findOne({ id: songId });
        if (!song || !song.features) { return []; }
        return song.features;
    }
    async calculateSongSimilarity(songId1: string, songId2: string): Promise<number>
    {
        let features1 = await this.getSongFeatures(songId1);
        let features2 = await this.getSongFeatures(songId2);
        let dotProduct = features1.reduce((sum, feature, i) => sum + feature * features2[ i ], 0);
        let magnitude1 = Math.sqrt(features1.reduce((sum, feature) => sum + Math.pow(feature, 2), 0));
        let magnitude2 = Math.sqrt(features2.reduce((sum, feature) => sum + Math.pow(feature, 2), 0));
        return dotProduct / (magnitude1 * magnitude2);
    }
}
