'use client';

import BarChartGlyph from "@/app/components/glyphs/bar-chart";
import GoldMedalGlyph from "@/app/components/glyphs/gold-medal";
import { useMash } from "@/app/components/providers/mash-provider";
import { Box, Typography } from "@mui/material";

export default function MashPageHeader()
{
    const { mashingType } = useMash();

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-row items-center">
                <BarChartGlyph glyphTitle="" className="w-12 h-12" data-static />
                <Box sx={ { width: '1rem' } } />
                <Typography fontWeight={ 700 } variant="h2">MediaMasher</Typography>
            </div>
            <div className="flex flex-row items-center">
                <GoldMedalGlyph glyphTitle={ "" } className="w-7 h-7" data-static />
                <Box sx={ { width: '0.3rem' } } />
                <Typography fontWeight={ 600 } variant="h4">Decide which is the hottest { mashingType }</Typography>
            </div>
        </div>
    );
} 