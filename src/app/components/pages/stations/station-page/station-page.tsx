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
import SharedSyncObjectProvider, { useSharedSyncObject } from "@/app/components/providers/shared-sync-object-provider";
import { PrivateStation, PublicStation, Station, StationId, StationParticipant } from "@/app/shared-api/other/stations";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import { EnqueueSnackbar, useSnackbar } from "notistack";
import React, { MouseEventHandler, useCallback, useMemo, useState } from "react";
import LoginRoundedUpGlyph from "@/app/components/glyphs/login-rounded-up";
import { UserId, getUserPreferedName } from "@/app/shared-api/user-objects/users";
import DeleteUserMaleGlyph from "@/app/components/glyphs/delete-user-male";
import { useAuth } from "@/app/components/auth-provider";
import { getClientSideObjectId } from "@/app/client-api/common-utils";
import { MessageTypes } from "@/app/settings";


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

function StationAdminGlyphControls({ stationId, member, ...props }: { stationId: StationId, member: StationParticipant | undefined; } & React.HTMLAttributes<HTMLDivElement>)
{
    return (
        <div { ...props } className="relative overflow-visible">
            <div className="flex flex-row-reverse group overflow-visible">
                <CaptainGlyph
                    glyphTitle={ "Admin" }
                    placement={ 'bottom-end' }
                    data-static
                    className="w-4 h-4 text-pink-300"
                />
                <div className="absolute overflow-visible w-4 h-4 -left-4">
                    <DeleteUserMaleGlyph
                        className="h-4 text-pink-300 absolute group-hover:w-4 overflow-visible"
                        glyphTitle={ "Remove" }
                        placement={ 'bottom-start' }
                    />
                </div>
            </div>
        </div>
    );
}

function StationMember({ stationId, member }: { stationId: StationId, member: StationParticipant | undefined; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { userData: me } = useAuth();
    const [ memberName, setMemberName ] = useState<string>();
    const isUserMe = me && member && me._id && member.userId && (me._id as unknown == member.userId as unknown);

    useMemo(() =>
    {
        console.log('Re-rendering Memo!');
        if (!member) { return; }
        commandGetUserById(member.userId as unknown as string)
            .then((userInfo) =>
            {
                setMemberName(getUserPreferedName(userInfo));
            });

    }, [ member, setMemberName ]);

    return (
        <div className="flex flex-row items-center justify-center overflow-x-visible">
            {
                (
                    member?.isCreator &&
                    <CaptainGeneralGlyph
                        glyphTitle={ "Creator" }
                        placement={ 'left' }
                        data-static
                        className="w-4 h-4 text-pink-300"
                    />
                ) || (
                    (
                        member?.isAdmin &&
                        <StationAdminGlyphControls stationId={ stationId } member={ member } />

                    ) || (
                        member &&
                        <LoginRoundedUpGlyph
                            glyphTitle={ "Promote" }
                            placement={ 'left' }
                            className="w-4 h-4 text-pink-300 opacity-60 scale-75"
                            onClick={ (member && memberName) ? promoteStationMemberClickHandlerFactory(enqueueSnackbar, stationId, member, memberName) : () => { } }
                        />
                    )
                )
            }
            <Box sx={ { width: '0.3em' } } />
            <Typography fontWeight={ 500 }>
                { isUserMe ? 'You' : (memberName ?? <TextLoader />) }
            </Typography>
        </div>
    );
}

function inviteMemberToStationClickHandlerFactory<T extends Element = Element>(enqueueSnackbar: EnqueueSnackbar, station: PrivateStation | PublicStation)
{
    return async (e: React.MouseEvent<T>) =>
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
    const [ inviteLinkCreationDisabled, setInviteLinkCreationDisabled ] = useState<boolean>(false);

    const inviteMemberToStationClickHandlerFactoryWrapper = useCallback((station: PrivateStation | PublicStation) =>
    {
        const invitationGenerator = inviteMemberToStationClickHandlerFactory(enqueueSnackbar, station);
        return ((e) =>
        {
            setInviteLinkCreationDisabled(true);
            invitationGenerator(e)
                .then(() =>
                {
                    setInviteLinkCreationDisabled(false);
                });
        }) as MouseEventHandler;


    }, [ setInviteLinkCreationDisabled, enqueueSnackbar ]);

    return (
        <div className="flex flex-row-reverse justify-start w-full">
            <div className="w-4 h-4 p-0 m-0" aria-disabled={ inviteLinkCreationDisabled }>
                {
                    inviteLinkCreationDisabled
                    &&
                    <CircularProgress color="inherit" className="w-4 h-4" sx={ { width: '1rem', height: '1rem' } } size={ '1rem' } />
                    ||
                    <AddUserMaleGlyph
                        glyphTitle={ "Invite member" }
                        className="w-5 h-5"
                        onClick={ inviteMemberToStationClickHandlerFactoryWrapper(station) }
                    />
                }
            </div>
        </div>
    );
}

function StationMembers({ station }: { station: PrivateStation | PublicStation | undefined; })
{
    console.log('Re-rendering!');
    const members = station ? accumulateStationMembersAndAdmins(station) : [ undefined, undefined, undefined, undefined ];
    const memberComponents = members.map(
        (member?: StationParticipant) =>
            <StationMember
                key={ member?.userId as unknown as string }
                member={ member }
                stationId={ station?.id ?? '' }
            />);
    return (
        <div className="flex flex-col justify-center items-center p-2 overflow-y-hidden overflow-x-visible">
            <div className="flex flex-row items-center">
                <Typography fontWeight={ 700 }>{ members.length.toString() }</Typography>
                <Box sx={ { width: '2px', height: '70%', backgroundColor: 'rgba(147,197,253,0.35)', marginX: '0.3rem' } } />
                <Typography fontWeight={ 700 }>Members</Typography>
            </div>
            <Box sx={ { width: '100%', height: '2px', backgroundColor: 'rgba(147,197,253,0.35)' } } />
            <div className="flex flex-col justify-center items-start h-full overflow-y-scroll overflow-x-visible">
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
    const stationData = useSharedSyncObject(stationId, commandGetStation, MessageTypes.STATION_UPDATE);

    console.log('StationPageInsideSync');

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
