import MashPageHeader from "@/app/components/pages/mash-page/mash-page-header";
import MashScoreboard from "@/app/components/pages/mash-page/mash-scoreboard";
import Masher from "@/app/components/pages/mash-page/masher";
import { MashProvider } from "@/app/components/providers/mash-provider";
import { Box } from "@mui/material";

export default function MashPage()
{
    return (
        <MashProvider>
            <div className="relative w-full h-full box-border">
                <MashScoreboard />
                <div className="flex flex-col items-center">
                    <Box sx={ { height: '5rem' } } />
                    <MashPageHeader />
                    <Masher />
                </div>
            </div>
        </MashProvider>
    );
}