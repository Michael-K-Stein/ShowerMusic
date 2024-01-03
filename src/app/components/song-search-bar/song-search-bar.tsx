'use client'

import { useEffect, useMemo, useState } from 'react';
import './song-search-bar.css'
import React from 'react';
import { TrackDict } from '@/app/db/media-objects/track';
import { RenderSearchResults } from '@/components/search-results/search-results';
import MediaObject from '@/app/db/media-objects/media-object';

function SearchGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className='search-glyph'>
            <path fill="none" stroke="#FFFFFF" strokeWidth="3" d="M19 4A9 9 0 1 0 19 22 9 9 0 1 0 19 4zM4 28L13 19" />
        </svg>  
    );
};

function HandleSearchResult(result: TrackDict)
{
    if (result['type'] === 'track')
    {
        return result as TrackDict;
    };

    throw 'Unrecognized media type in search result!';
};

async function HandleSearchResults(rawResults: string)
{
    const results = JSON.parse(rawResults)
    let items : TrackDict[] = []; 
    results.map((result: any) => { items.push(HandleSearchResult(result)); } );
    RenderSearchResults(items);
}

export default function SongSearchBar()
{
    const performSearch = (formData: FormData) => {
        const query = formData.get('query');
        fetch(`/api/search?q=${query}`)
        .then((response) => response.text())
        .then((data) => {
            HandleSearchResults(data);
        });
    };

    return (
        <form action={performSearch} className='song-search-bar'>
            <div className='song-search-bar-shadow-blur'></div>
            <input type="text" 
            name='query'
            className='song-search-bar-input min-w-full max-w-full w-full text-xlg font-bold' 
            placeholder='song name...'
            />
            <SearchGlyph />
        </form>
    );
};
