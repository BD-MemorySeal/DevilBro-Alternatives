import { WebpackModules } from "@zlibrary";
import createUpdateWrapper from "common/hooks/createUpdateWrapper";
import Settings from "../settings";

const SwitchItem = createUpdateWrapper(WebpackModules.getByDisplayName("SwitchItem"));

const settings = {
    playSound: {
        name: "Play Sound",
        note: "Plays a sound when Enabling/Disabling the GameActivity with the button.",
        value: true
    }
};

export default function SettingsPanel() {
    return <>
        {Object.keys(settings).map(id => (
            <SwitchItem
                {...settings[id]}
                children={settings[id].name}
                value={Settings.get(id, settings[id].value)}
                onChange={value => Settings.set(id, value)}
            />
        ))}
    </>;
}