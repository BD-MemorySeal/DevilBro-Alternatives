// @ts-nocheck

import { Channel } from "@discord/classes";
import { TooltipContainer } from "@discord/components";
import { ChannelTypes, Permissions } from "@discord/constants";
import { Messages } from "@discord/i18n";
import { Channels } from "@discord/stores";
import { Patcher, WebpackModules } from "@zlibrary";
import BasePlugin from "@zlibrary/plugin";
import Lock from "./icons/lock";
import style from "./lock.scss";
import styles from "styles";

const defaultCategory = new Channel({
    id: "null",
    type: ChannelTypes.GUILD_CATEGORY,
    name: Messages.UNCATEGORIZED,
    position: -1
});

const TextTypes = [
    ChannelTypes.GUILD_TEXT,
    ChannelTypes.GUILD_ANNOUNCEMENT
];

const VoiceTypes = [
    ChannelTypes.GUILD_VOICE,
    ChannelTypes.GUILD_STAGE_VOICE
];

const GuildPermissions = WebpackModules.getByProps("getGuildPermissions");

export default class ShowHiddenChannels extends BasePlugin {
    can = GuildPermissions.can;
    onStart() {
        this.#patchChannelsModule();
        this.#patchPermissionModule();
        this.#patchUnreadModule();
        this.#patchChannelItem();

        styles.inject();
    }

    async #patchUnreadModule() {
        const UnreadStore = WebpackModules.getByProps("hasUnread");

        Patcher.after(UnreadStore, "hasUnread", (_, [id]) => {
            if (!this.can(Permissions.VIEW_CHANNEL, Channels.getChannel(id))) return false;
        });
    }

    async #patchChannelItem() {
        const ChannelItem = WebpackModules.find(e => e?.default?.displayName === "ChannelItem");
        
        Patcher.after(ChannelItem, "default", (_, [{ channel, children }]) => {
            if (!this.can(Permissions.VIEW_CHANNEL, channel)) {
                children.push(
                    <TooltipContainer text="Locked" className={style.tooltip}>
                        <Lock />
                    </TooltipContainer>
                );
            }
        });
    }

    async #patchChannelsModule() {
        const AllChannelsStore = WebpackModules.getByProps("getChannels");

        Patcher.instead(AllChannelsStore, "getChannels", (_, [id]) => {
            const channels = this.#getChannelsForGuild(id);

            if (!channels?.length) return {
                [ChannelTypes.GUILD_CATEGORY]: [],
                SELECTABLE: [],
                VOCAL: []
            };

            return {
                id,
                [ChannelTypes.GUILD_CATEGORY]: this.#filterByTypes([defaultCategory].concat(channels), [4]),
                SELECTABLE: this.#filterByTypes(channels, TextTypes),
                VOCAL: this.#filterByTypes(channels, VoiceTypes),
                COUNT: channels.length
            };
        });
    }

    #getChannelsForGuild(guildId: string) {
        const result = [];
        const keys = Object.keys(Channels.getMutableGuildChannelsByGuild()[guildId] ?? {});

        for (let i = 0; i < keys.length; i++) {
            const channelId = keys[i];
            if (!Channels.hasChannel(channelId)) continue;

            result.push(Channels.getChannel(channelId));
        }

        return result;
    }

    async #patchPermissionModule() {
        Patcher.after(GuildPermissions, "can", (_, [perm]) => {
            if (perm === Permissions.VIEW_CHANNEL) return true;
        });
    }

    #filterByTypes(channels: ChannelObject[], types: number[]): boolean {
        const result = [];

        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            if (!~types.indexOf(channel.type)) continue;

            result.push({
                comparator: channel.position,
                channel
            });
        }

        return result.sort(this.#sortFunction);
    }

    #sortFunction(a, b) {
        return a.comparator - b.comparator
    }

    onStop() {
        Patcher.unpatchAll();
        styles.remove();
    }
}