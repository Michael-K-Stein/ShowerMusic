'use client'
import { TrackDict } from '@/app/db/media-objects/track';
import './search-results.css'
import MediaObject from '@/app/db/media-objects/media-object';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Grid, IconButton, Input, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import TrackModal from '../media-modals/song-modal/track-modal';

let g_searchResults: TrackDict[], g_setSearchResults: any;

export default function SearchResults({
    children,
}: {
    children: React.ReactNode
}) {
    [g_searchResults, g_setSearchResults] = useState([]);

    const generateTable = () => {
        return (
            g_searchResults.map(
                (result: TrackDict) => (
                    <TrackModal key={result.id} track={result} />
                )
            )
        );
    };

    const [tableData, setTableData] = useState(generateTable());

    useEffect(() => {
        setTableData(generateTable());
    }, [g_searchResults]);

    return (
        <div id='search-results'>
            { tableData }
        </div>
    );
}

export function RenderSearchResults(searchResults: TrackDict[]) {
    g_setSearchResults(searchResults);
};
