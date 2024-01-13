'use client';
import './song-search-bar.css';
import React from 'react';
import { useSearch } from '@/app/components/search/search-provider';

function SearchGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className='search-glyph'>
            <path fill="none" stroke="#FFFFFF" strokeWidth="3" d="M19 4A9 9 0 1 0 19 22 9 9 0 1 0 19 4zM4 28L13 19" />
        </svg>
    );
};

export default function SongSearchBar()
{
    const { performSearch } = useSearch();

    return (
        <form action={ performSearch } className='song-search-bar'>
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
