'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './page-toolbar.css';
import Drawer from '@mui/material/Drawer';
import React from 'react';
import RadioTowerGlyph from '@/glyphs/radio-tower';
import HomeGlyph from '@/glyphs/home';
import { SetView, ViewportType, useSessionState } from '@/app/components/providers/session/session';
import assert from 'assert';
import { Paper } from '@mui/material';
import ToolbarUserFavorites from '@/app/components/toolbar-user-favorites';

function MenuBurgerRoundedGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M36,27.486c1.933,0,3.5-1.567,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5H12c-1.933,0-3.5,1.567-3.5,3.5c0,1.933,1.567,3.5,3.5,3.5H36z" />
            <path fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M36,15.486c1.933,0,3.5-1.567,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5H12c-1.933,0-3.5,1.567-3.5,3.5c0,1.933,1.567,3.5,3.5,3.5H36z" />
            <path fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M36,39.486c1.933,0,3.5-1.567,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5H12c-1.933,0-3.5,1.567-3.5,3.5c0,1.933,1.567,3.5,3.5,3.5H36z" />
        </svg>
    );
};

/**
 * ToolbarItemProps interface for ToolbarItem component
 */
interface ToolbarItemProps
{
    name: string;
    glyphGenerator: (glyphTitle: string) => JSX.Element;
    viewType: ViewportType;
    setView?: SetView;
};

/**
 * ToolbarItem class component
 * 
 * This class holds the metadata for a toolbar item, including:
 * - The name of the item
 * - A function which generates a glyph representing the item
 * - A relative link to the relevant page
 */
class ToolbarItem extends React.Component<ToolbarItemProps>
{
    render()
    {
        const { setView } = this.props;
        const { name, glyphGenerator, viewType } = this.props;

        assert(setView !== undefined);

        return (
            <div onClick={ () => { setView(viewType); } }>
                <div className="toolbar-item flex flex-col center text-center items-center justify-center content-center pt-4">
                    <div className='w-14 h-14'>
                        { glyphGenerator(name) }
                    </div>
                    <h3 className='text-lg font-bold'>{ name }</h3>
                </div>
            </div>
        );
    };
};

const TOOLBAR_MENU_ITEMS: ToolbarItemProps[] = [
    {
        name: 'Home',
        glyphGenerator: (_glyphTitle: string) => <HomeGlyph glyphTitle={ '' } />,
        viewType: ViewportType.Home,
    },
    {
        name: 'Stations',
        glyphGenerator: (_glyphTitle: string) => <RadioTowerGlyph glyphTitle='' />,
        viewType: ViewportType.Stations,
    },
];

export default function PageToolbar()
{
    const PAGE_TOOLBAR_STATE_STORAGE_KEY = 'page-toolbar-open';
    let pageToolbarState = useRef(true);
    const { setView } = useSessionState();

    const togglePageToolbar = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) =>
    {
        if (open)
        {
            document.getElementById('page-toolbar-open-burger')?.setAttribute('hidden', 'true');
            document.getElementById('stream-layout')?.setAttribute('toolbar', 'Openned');
        } else
        {
            document.getElementById('page-toolbar-open-burger')?.removeAttribute('hidden');
            document.getElementById('stream-layout')?.setAttribute('toolbar', 'Closed');
        }
        pageToolbarState.current = open;
        sessionStorage.setItem(PAGE_TOOLBAR_STATE_STORAGE_KEY, open.toString());
    };

    // Render the last state of the session
    // Open the toolbar if it was openned, otherwise keep it closed
    // Use Memo with '[]' as the dependency will render only ONCE before the page has finished rendering
    useMemo(() =>
    {
        if (typeof sessionStorage === 'undefined')
        {
            return;
        }

        let initialPageToolbarState = sessionStorage.getItem(PAGE_TOOLBAR_STATE_STORAGE_KEY);
        if (null === initialPageToolbarState)
        {
            initialPageToolbarState = 'true';
            sessionStorage.setItem(PAGE_TOOLBAR_STATE_STORAGE_KEY, initialPageToolbarState);
        }
        pageToolbarState.current = (initialPageToolbarState === 'true');
    }, []);

    // UseEffect so this happens AFTER rendering has finished
    useEffect(() =>
    {
        if (!pageToolbarState)
        {
            document.getElementById('stream-layout')?.setAttribute('toolbar', 'Closed');
        }
    }, []);

    const toolbarMenuItems = TOOLBAR_MENU_ITEMS.map((item) =>
    {
        return (<ToolbarItem key={ item.name } name={ item.name } glyphGenerator={ item.glyphGenerator } viewType={ item.viewType } setView={ setView } />);
    });

    return (
        <div className='page-toolbar'>
            <div className='toolbar-menu-items'>
                { toolbarMenuItems }
            </div>
            <ToolbarSubItems />
        </div>
    );
};

function ToolbarSubItems()
{
    return (
        <div className='toolbar-sub-items'>
            <ToolbarUserFavorites />
        </div>
    );
}
