'use client';
import './album-page.css';
import React from 'react';
import { AlbumId } from '@/app/shared-api/media-objects/albums';
import { ShowerMusicObjectType } from '@/app/settings';
import { ModalPageLoader } from '@/app/components/pages/modal-page/modal-page';

export function AlbumPageLoader({ albumId }: { albumId: AlbumId; })
{
    return (
        <ModalPageLoader itemType={ ShowerMusicObjectType.Album } itemId={ albumId } />
    );
};

