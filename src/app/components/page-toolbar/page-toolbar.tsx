'use client';

import { useRef } from 'react';
import './page-toolbar.css';
import React from 'react';
import RadioTowerGlyph from '@/glyphs/radio-tower';
import HomeGlyph from '@/glyphs/home';
import { SetView, useSessionState } from '@/app/components/providers/session/session';
import { ViewportType } from "@/app/shared-api/other/common";
import assert from 'assert';
import ToolbarUserFavorites from '@/app/components/toolbar-user-favorites';
import { Typography } from '@mui/material';

/**
 * ToolbarItemProps interface for ToolbarItem component
 */
interface ToolbarItemProps
{
    name: string;
    glyphGenerator: (glyphTitle: string) => JSX.Element;
    viewType: ViewportType;
    setView?: SetView;
    accessKey?: React.HTMLAttributes<HTMLDivElement>[ 'accessKey' ];
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
            <div onClick={ () => { setView(viewType); } } accessKey={ this.props.accessKey }>
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
        accessKey: 'h',
    },
    {
        name: 'Stations',
        glyphGenerator: (_glyphTitle: string) => <RadioTowerGlyph glyphTitle='' />,
        viewType: ViewportType.Stations,
    },
];

export default function PageToolbar()
{
    const { setView } = useSessionState();

    const toolbarMenuItems = TOOLBAR_MENU_ITEMS.map((item) =>
    {
        return (<ToolbarItem key={ item.name } name={ item.name } glyphGenerator={ item.glyphGenerator } viewType={ item.viewType } setView={ setView } accessKey={ item.accessKey } />);
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
