import { commandGetStation } from "@/app/client-api/stations/get-station-specific";
import { commandGenerateStationInvitationUrl, commandPromoteStationUser } from "@/app/client-api/stations/users";
import commandGetUserById from "@/app/client-api/users/get-user";
import AddUserMaleGlyph from "@/app/components/glyphs/add-user-male";
import CaptainGlyph from "@/app/components/glyphs/rez-Captain";
import CaptainGeneralGlyph from "@/app/components/glyphs/rez-captain-general";
import { enqueueShareableUrl } from "@/app/components/other/share";
import { ModalPageLoader, TextLoader } from "@/app/components/pages/modal-page/modal-page";
import { ObjectCreatorTitleContainer, RenameableTitleContainer } from "@/app/components/pages/playlist-page/playlist-page";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { ViewportType } from "@/app/shared-api/other/common";
import { buildUrlForState } from "@/app/shared-api/other/common";
import SharedSyncObjectProvider, { useSharedSyncObject } from "@/app/components/providers/shared-sync-object-provides";
import { PrivateStation, PublicStation, Station, StationId, StationParticipant } from "@/app/shared-api/other/stations";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { Box, Typography } from "@mui/material";
import { EnqueueSnackbar, useSnackbar } from "notistack";
import { MouseEventHandler, useMemo, useState } from "react";
import LoginRoundedUpGlyph from "@/app/components/glyphs/login-rounded-up";
import { UserId } from "@/app/shared-api/user-objects/users";


function accumulateStationMembersAndAdmins(station: PrivateStation | PublicStation)
    : StationParticipant[]
{
    const adminMembers = station.admins;
    const nonAdminMembers = ('members' in station) ? station.members : [];

    const allParticipantsMapping: { [ userId: string ]: StationParticipant; } = {};

    adminMembers.map((member) =>
    {
        allParticipantsMapping[ member as unknown as string ] = {
            userId: member,
            isAdmin: true,
            isCreator: member === station.creator,
        };
    });

    nonAdminMembers.map((member) =>
    {
        if ((member as unknown as string) in allParticipantsMapping) { return; }
        allParticipantsMapping[ member as unknown as string ] = {
            userId: member,
            isAdmin: false,
            isCreator: member === station.creator,
        };
    });

    // Define a good order
    const valueOfParticipant = (participant: StationParticipant): number =>
    {
        /**
         * Mapping:
         *  C -> Creator
         *  A -> Admin
         *  V -> Value
         * 
         *  C | A |  V
         * ------------
         *  0 | 0 | 00
         *  0 | 1 | 01
         *  1 | 0 | 10 // This sould not happen...
         *  1 | 1 | 11
         */
        return ((participant.isCreator ? 1 : 0) << 1) | (participant.isAdmin ? 1 : 0);
    };

    return Object.values(allParticipantsMapping).sort(
        (a, b) =>
            -(valueOfParticipant(a) - valueOfParticipant(b)) // Negative so the order is reversed
    );
}

function promoteStationMemberClickHandlerFactory(enqueueSnackbar: EnqueueSnackbar, stationId: StationId, member: StationParticipant, memberName: string): MouseEventHandler
{
    if (member.isCreator || member.isAdmin || !stationId) { return () => { }; };

    return (e) =>
    {
        commandPromoteStationUser(stationId, member.userId as unknown as UserId)
            .then(() =>
            {
                enqueueSnackbar(`${memberName} has been promoted to admin`, { variant: 'success' });
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to promote ${memberName}`, error);
            });
    };
}

function StationMember({ stationId, member }: { stationId: StationId, member: StationParticipant | undefined; })
{
    const { enqueueSnackbar } = useSnackbar();
    const [ memberName, setMemberName ] = useState<string>();

    useMemo(() =>
    {
        if (!member) { return; }
        commandGetUserById(member.userId as unknown as string)
            .then((userInfo) =>
            {
                setMemberName(userInfo.username);
            });
    }, [ member, setMemberName ]);

    return (
        <div className="flex flex-row items-center justify-center">
            {
                (member?.isCreator && <CaptainGeneralGlyph glyphTitle={ "Creator" } placement={ 'left' } data-static className="w-4 h-4 text-pink-300" />) ||
                (member?.isAdmin && <CaptainGlyph glyphTitle={ "Admin" } placement={ 'left' } data-static className="w-4 h-4 text-pink-300" /> ||
                    member && <LoginRoundedUpGlyph
                        glyphTitle={ "Promote" }
                        placement={ 'left' }
                        className="w-4 h-4 text-pink-300 opacity-60 scale-75"
                        onClick={ (member && memberName) ? promoteStationMemberClickHandlerFactory(enqueueSnackbar, stationId, member, memberName) : () => { } }
                    />)
            }
            <Box sx={ { width: '0.3em' } } />
            <Typography fontWeight={ 500 }>
                { memberName ?? <TextLoader /> }
            </Typography>
        </div>
    );
}

function inviteMemberToStationClickHandlerFactory(enqueueSnackbar: EnqueueSnackbar, station: PrivateStation | PublicStation): MouseEventHandler
{
    return async (e) =>
    {
        const stationInvitationUrl = await commandGenerateStationInvitationUrl(station.id)
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to generate invitation link for ${station.name}!`, error);
                return null;
            });

        if (stationInvitationUrl)
        {
            enqueueShareableUrl(enqueueSnackbar, stationInvitationUrl);
        }
    };
}

function StationGeneralMemberControls({ station }: { station: PrivateStation | PublicStation; })
{
    const { enqueueSnackbar } = useSnackbar();

    return (
        <div className="flex flex-row-reverse justify-start w-full">
            <AddUserMaleGlyph glyphTitle={ "Invite member" } className="w-5 h-5" onClick={ inviteMemberToStationClickHandlerFactory(enqueueSnackbar, station) } />
        </div>
    );
}

function StationMembers({ station }: { station: PrivateStation | PublicStation | undefined; })
{
    const members = station ? accumulateStationMembersAndAdmins(station) : [ undefined, undefined, undefined, undefined ];
    const memberComponents = members.map(
        (member?: StationParticipant) =>
            <StationMember
                key={ member?.userId as unknown as string }
                member={ member }
                stationId={ station?.id ?? '' }
            />);
    return (
        <div className="flex flex-col justify-center items-center p-2 overflow-hidden">
            <div className="flex flex-row items-center">
                <Typography fontWeight={ 700 }>{ members.length.toString() }</Typography>
                <Box sx={ { width: '2px', height: '70%', backgroundColor: 'rgba(147,197,253,0.35)', marginX: '0.3rem' } } />
                <Typography fontWeight={ 700 }>Members</Typography>
            </div>
            <Box sx={ { width: '100%', height: '2px', backgroundColor: 'rgba(147,197,253,0.35)' } } />
            <div className="flex flex-col justify-center items-start h-full overflow-y-scroll">
                { memberComponents }
            </div>
            <Box sx={ { height: '0.5em' } } />
            { station && <StationGeneralMemberControls station={ station } /> }
        </div>
    );
}

function StationCustomHeader({ stationData }: { stationData: Station | undefined; })
{
    return (
        <RenameableTitleContainer
            itemId={ stationData?.id }
            itemName={ stationData?.name }
            itemType={ ShowerMusicObjectType.Station }
        >
            <ObjectCreatorTitleContainer itemData={ stationData } />
            <div className="w-full flex flex-row justify-end overflow-hidden">
                <StationMembers station={ stationData } />
            </div>
        </RenameableTitleContainer>
    );
}

function StationPageInsideSync({ stationId }: { stationId: StationId; })
{
    const stationData = useSharedSyncObject(commandGetStation, stationId);
    return (
        <ModalPageLoader
            itemId={ stationId }
            itemType={ ShowerMusicObjectType.Station }
            itemData={ stationData }
            customTitle={ <StationCustomHeader stationData={ stationData } /> }
        />
    );
}

export default function StationPage({ stationId }: { stationId: StationId; })
{
    return (
        <SharedSyncObjectProvider id={ stationId }>
            <StationPageInsideSync stationId={ stationId } />
        </SharedSyncObjectProvider>
    );
}

export function buildStationShareUrl(stationId: StationId)
{
    const shareUrl = buildUrlForState({
        newViewportType: ViewportType.Station,
        newViewMediaId: stationId
    });

    return shareUrl;
}
