import { useStateFromStores } from "@discord/flux";
import { SettingsStore } from "@discord/stores";
import { WebpackModules } from "@zlibrary";
import GamePad from "./icons/gamepad";
import { useCallback, useMemo } from "react";
import styles from "./button.scss";
import Settings from "../settings";

const PanelButton = WebpackModules.getByDisplayName("PanelButton");
const SettingsUpdater = WebpackModules.getByProps("updateRemoteSettings");
const SoundModule = WebpackModules.getByProps("playSound");

export default function GameActivityToggleButton() {
    const showGameActivity = useStateFromStores([SettingsStore], () => SettingsStore.showCurrentGame);
    const tooltipText = useMemo(() => `Turn ${showGameActivity ? "off" : "on"} game activity`, [showGameActivity]);
    const handleClick = useCallback(() => {
        SettingsUpdater.updateRemoteSettings({
            showCurrentGame: !showGameActivity
        });
       if (Settings.get("playSound", true)) SoundModule.playSound(!showGameActivity ? "unmute" : "mute");
    }, [showGameActivity]);

    return (
        <PanelButton
            icon={() => <GamePad enabled={showGameActivity} />}
            onClick={handleClick}
            tooltipText={tooltipText}
            innerClassName={styles.disabled}
        />
    );
}