'use client';
import { Box, Button, Typography } from "@mui/material";
import './landing-page.css';
import React, { useMemo, useRef, useState } from "react";
import { commandGetTopAlbums } from "@/app/client-api/get-album";
import { ArbitraryPlayableMediaImage } from "@/app/components/pages/home-page/user-recently-played";
import { commandGetTopArtists } from "@/app/client-api/get-artist";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicGenericHeader } from "@/app/components/other/generic-header";

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
    }, [ setItems, getterFunction ]);

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

export default function LandingPage()
{
    return (
        <main className="flex min-h-screen flex-col w-full items-center justify-between p-24 relative">
            <div className="h-full w-full flex flex-col items-center justify-center">
                <ShowerMusicGenericHeader noAnimation={ false } />
                <Box sx={ { height: '0.8em' } } />
                <div className="landing-page-login-btn-container">
                    <Button
                        type='submit'
                        variant='outlined'
                        href="/login"
                    >
                        Login
                    </Button>
                </div>
            </div>
            <ScrollingAlbums />
            <ScrollingArtists />
        </main>
    );
}
