'use client'

import { useEffect, useMemo, useState } from 'react';
import './page-toolbar.css'
import Drawer from '@mui/material/Drawer';
import React from 'react';
import RadioTowerGlyph from '@/glyphs/radio-tower';

function MenuBurgerRoundedGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M36,27.486c1.933,0,3.5-1.567,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5H12c-1.933,0-3.5,1.567-3.5,3.5c0,1.933,1.567,3.5,3.5,3.5H36z" />
          <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M36,15.486c1.933,0,3.5-1.567,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5H12c-1.933,0-3.5,1.567-3.5,3.5c0,1.933,1.567,3.5,3.5,3.5H36z" />
          <path fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M36,39.486c1.933,0,3.5-1.567,3.5-3.5c0-1.933-1.567-3.5-3.5-3.5H12c-1.933,0-3.5,1.567-3.5,3.5c0,1.933,1.567,3.5,3.5,3.5H36z" />
        </svg>
    );
};

function MenuHomeGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path d="M41 5L41 10.73 35 6.05 35 5zM48.79 20.62C48.59 20.87 48.3 21 48 21c-.22 0-.43-.07-.62-.21L46 19.71V46c0 .55-.45 1-1 1H31V29H19v18H5c-.55 0-1-.45-1-1V19.71l-1.38 1.08c-.44.34-1.07.26-1.41-.17-.34-.44-.26-1.07.17-1.41l23-17.95c.37-.28.87-.28 1.24 0l23 17.95C49.05 19.55 49.13 20.18 48.79 20.62z" fill="#FFFFFF" />
        </svg>
    )
};

/**
 * ToolbarItemProps interface for ToolbarItem component
 */
interface ToolbarItemProps {
    name: string;
    glyphGenerator: () => JSX.Element;
    link: string;
};

/**
 * ToolbarItem class component
 * 
 * This class holds the metadata for a toolbar item, including:
 * - The name of the item
 * - A function which generates a glyph representing the item
 * - A relative link to the relevant page
 */
class ToolbarItem extends React.Component<ToolbarItemProps> {
    render() {
        const { name, glyphGenerator, link } = this.props;

        return (
            <a href={link} 
            // className='transition duration-250 ease-in-out transform hover:-translate-y-1 hover:scale-105'
            >
                <div className="toolbar-item flex flex-col center text-center items-center justify-center content-center pt-4">
                    <div className='w-14 h-14'>
                        { glyphGenerator() }
                    </div>
                    <h3 className='text-lg font-bold'>{name}</h3>
                </div>
            </a>
        );
    };
};    

const TOOLBAR_MENU_ITEMS : ToolbarItemProps[] = [
    {
        name: 'Home',
        glyphGenerator: MenuHomeGlyph,
        link: '/home',
    },
    {
        name: 'Stations',
        glyphGenerator: RadioTowerGlyph,
        link: '/stations',
    },
];

export default function PageToolbar()
{
    const PAGE_TOOLBAR_STATE_STORAGE_KEY = 'page-toolbar-open';
    let [pageToolbarState, setPageToolbarState] = useState(true);

    const togglePageToolbar = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (open)
        {
            document.getElementById('page-toolbar-open-burger')?.setAttribute('hidden', 'true');
            document.getElementById('stream-layout')?.setAttribute('toolbar', 'Openned');
        } else {
            document.getElementById('page-toolbar-open-burger')?.removeAttribute('hidden');
            document.getElementById('stream-layout')?.setAttribute('toolbar', 'Closed');
        }
        setPageToolbarState(open);
        sessionStorage.setItem(PAGE_TOOLBAR_STATE_STORAGE_KEY, open.toString());
    };

    // Render the last state of the session
    // Open the toolbar if it was openned, otherwise keep it closed
    // Use Memo with '[]' as the dependency will render only ONCE before the page has finished rendering
    useMemo(() => {
        let initialPageToolbarState = sessionStorage.getItem(PAGE_TOOLBAR_STATE_STORAGE_KEY);
        if (null === initialPageToolbarState)
        {
            initialPageToolbarState = 'true';
            sessionStorage.setItem(PAGE_TOOLBAR_STATE_STORAGE_KEY, initialPageToolbarState);
        }
        pageToolbarState = (initialPageToolbarState === 'true');
        setPageToolbarState(pageToolbarState);
    }, []);

    // UseEffect so this happens AFTER rendering has finished
    useEffect(() => {
        if (!pageToolbarState)
        {
            document.getElementById('stream-layout')?.setAttribute('toolbar', 'Closed');
        }
    }, []);

    const toolbarMenuItems = TOOLBAR_MENU_ITEMS.map((item) => {
        return ( <ToolbarItem name={item.name} glyphGenerator={item.glyphGenerator} link={item.link} /> )
    });

    return (
        <div className='page-toolbar'>
            <Drawer
                anchor='left' 
                open={pageToolbarState} 
                onClose={togglePageToolbar(false)}
                variant="persistent"
                >
                    <div onClick={togglePageToolbar(false)}>Close</div>
                    { toolbarMenuItems }
                    
            </Drawer>
            <div id='page-toolbar-open-burger' onClick={togglePageToolbar(true)} className='clickable w-8 h-8 absolute'>
                <MenuBurgerRoundedGlyph />
            </div>
        </div>
    );
};
