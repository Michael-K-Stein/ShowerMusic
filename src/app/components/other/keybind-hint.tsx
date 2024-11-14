import useKeybinds, { getUserAgentAccessKey, KeybindHintState, KeybindRegistrationOptions, PureKeybind } from "@/app/components/providers/global-props/keybinds-provider";
import { Box, Tooltip, Typography, TypographyProps } from "@mui/material";

export interface KeybindHintProps 
{
    keybind: PureKeybind;
    keybindOptions?: KeybindRegistrationOptions;
    importantHint?: boolean;
    fontSize?: TypographyProps[ 'fontSize' ];
};

export default function KeybindHint({ keybind, keybindOptions, fontSize, importantHint, ...props }: KeybindHintProps & React.HTMLAttributes<HTMLDivElement>)
{
    const { keybindHintsState, showKeybindInfo } = useKeybinds();
    const isHidden = importantHint ?
        keybindHintsState === KeybindHintState.Hidden :
        keybindHintsState !== KeybindHintState.Visible;

    const hintString = `${keybind}`;
    return (
        <div { ...props } data-static tabIndex={ -1 }>
            <Tooltip aria-hidden={ isHidden } hidden={ isHidden } title={
                <div>
                    <div className="flex flex-row items-center justify-center content-center text-center">
                        <Typography fontWeight={ 400 }>Try the keybind</Typography>
                        <Box sx={ { width: '0.3em' } } />
                        <Typography fontWeight={ 400 }>&quot;</Typography>
                        <Typography fontWeight={ 700 }>{ hintString }</Typography>
                        <Typography fontWeight={ 400 }>&quot;</Typography>
                    </div>
                    <div className="flex flex-col items-center justify-center content-center text-center">
                        <Typography fontSize={ '0.8rem' } fontWeight={ 400 }>To learn about more keybinds, hold down the &quot;Alt&quot; key</Typography>
                        <Typography fontSize={ '0.8rem' } fontWeight={ 400 } onClick={ showKeybindInfo } className='cursor-pointer'>or click here</Typography>
                    </div>
                </div>
            }>
                <div className="
                    bg-blue-950 bg-opacity-20 
                    rounded-[0.5em] 
                    p-[0.3em] py-0
                    opacity-60
                    hover:opacity-95
            ">
                    <Typography fontSize={ fontSize } fontWeight={ 700 }>{ hintString }</Typography>
                </div>
            </Tooltip>
        </div>
    );
}