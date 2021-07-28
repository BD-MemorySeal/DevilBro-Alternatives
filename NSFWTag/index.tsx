import { TooltipContainer } from "@discord/components";
import { useStateFromStores } from "@discord/flux";
import { Channels } from "@discord/stores";
import { Patcher, WebpackModules } from "@zlibrary";
import BasePlugin from "@zlibrary/plugin";
import stylesheet from "styles";
import style from "./badge.scss";

const { TextBadge } = WebpackModules.getByProps("TextBadge");
function NSFWBadge({channelId}) {
    const nsfw = useStateFromStores([Channels], () => Channels.getChannel(channelId)?.nsfw);
    if (!nsfw) return null;
    
    return (
        <TooltipContainer spacing={10} className={style.tooltip} position="top" text="This channel was marked as not-safe-for-netword.">
            <TextBadge text="NSFW" className={style.tag} />
        </TooltipContainer>
    );
}

export default class NSFWTag extends BasePlugin {
    onStart() {
        this.patchChannelItem();
        stylesheet.inject();
    }

    async patchChannelItem() {
        const ChannelItem = WebpackModules.getModule(m => m?.default?.displayName === "ChannelItem");

        Patcher.after(ChannelItem, "default", (_, [props]) => {
            if (!Array.isArray(props.children) || props.children.some(e => e?.type === NSFWBadge)) return;
            
            props.children.push(
                <NSFWBadge channelId={props.channel.id} />
            );
        });
    }

    onStop() {
        stylesheet.remove();
        Patcher.unpatchAll();
    }
}