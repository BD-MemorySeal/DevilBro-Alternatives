/// <reference path="../typings/main.d.ts" />

import { Patcher, ReactComponents, Utilities, WebpackModules } from "@zlibrary";
import BasePlugin from "@zlibrary/plugin";
import GameActivityToggleButton from "./components/button";
import styles from "styles";
import React from "react";

export default class GameActivityToggle extends BasePlugin {
    public onStart() {
        this.patchAccount();
        styles.inject();
    }

    private async patchAccount() {
        const selector = `.${WebpackModules.getByProps("container", "avatar", "redIcon")?.container}`;
        const Account = await ReactComponents.getComponentByName("Account", selector);

        Patcher.after(Account.component.prototype, "render", (_, __, res) => {
            const tree = Utilities.findInReactTree(res, (e) => Array.isArray(e?.children) && !e.onMouseEnter);
            if (!tree || tree.children.some((child: React.ReactElement) => child?.type === GameActivityToggleButton)) return;

            tree.children.unshift(
                <GameActivityToggleButton />
            );
        });

        Account.forceUpdateAll();
    }

    public onStop() {
        styles.remove();
        Patcher.unpatchAll();
    }
}