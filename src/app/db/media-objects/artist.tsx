export type ArtistDict = {
    id: string,
    type: string,
    name: string,
    popularity: number,
    genres: string[],
    images: {
        height: number,
        width: number,
        url: string,
    }[],
    followers: { total: number, },
};
