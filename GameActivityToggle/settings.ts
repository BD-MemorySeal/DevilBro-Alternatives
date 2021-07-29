import SettingsManager from "common/classes/settings";
import config from "./package.json";

const Settings = new SettingsManager(config.info.name, {
    playSound: true
});

export default Settings;