'use client';
import { Box, Typography } from "@mui/material";
import './landing-page.css';
import React, { useMemo, useRef, useState } from "react";
import { commandGetTopAlbums } from "@/app/client-api/get-album";
import { AlbumDict } from "@/app/shared-api/media-objects/albums";
import { ArbitraryPlayableMediaImage } from "@/app/components/pages/home-page/user-recently-played";
import { commandGetTopArtists } from "@/app/client-api/get-artist";
import { ArtistDict } from "@/app/shared-api/media-objects/artists";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";

function ScrollingElements<T extends ShowerMusicPlayableMediaDict>({
    getterFunction,
    ...props
}: { getterFunction: (n: number) => Promise<T[]>; } & React.HTMLAttributes<HTMLDivElement>)
{
    const scrollElement = useRef<HTMLDivElement>(null);
    const [ items, setItems ] = useState<T[]>();

    useMemo(() =>
    {
        getterFunction(200).then((items: T[]) =>
        {
            setItems(items);
            scrollElement.current?.setAttribute('data-resolved', 'true');
        }).catch(() => { });
    }, [ setItems ]);

    const itemImages = items ? items.map(
        (item: T, index) =>
            <ArbitraryPlayableMediaImage key={ item.id } data={ item } quality={ 40 } />) : <></>;

    return (
        <div className={ `scrolling-container ${props.className ?? ''}` } ref={ scrollElement } data-resolved={ false }>
            { itemImages }
        </div>
    );
}

function ScrollingAlbums()
{
    return (<ScrollingElements getterFunction={ commandGetTopAlbums } className="scrolling-albums-container" />);
}

function ScrollingArtists()
{
    return (<ScrollingElements getterFunction={ commandGetTopArtists } className="scrolling-artists-container" />);
}

export default function Home()
{
    return (
        <main className="flex min-h-screen flex-col w-full items-center justify-between p-24 relative">
            <div className="h-full w-full flex flex-col items-center justify-center">
                <div className="flex flex-col max-w-fit items-center justify-center">
                    <Typography className="landing-page-title" variant="h1" fontWeight={ 800 } style={ { textShadow: '-2px 2px 1px rgba(30,30,30,0.3)' } }>ShowerMusic</Typography>
                    <Box className="landing-page-divider" sx={ { backgroundColor: 'rgba(240,240,240,0.3)', height: '3px', borderRadius: '3px' } } />
                    <Typography className="landing-page-subtitle" variant="h3" fontWeight={ 600 } style={ { textShadow: '-2px 2px 1px rgba(30,30,30,0.3)' } }>פשוט לשטוף ת'ראש</Typography>
                </div>
            </div>
            <ScrollingAlbums />
            <ScrollingArtists />
        </main>
    );
}
