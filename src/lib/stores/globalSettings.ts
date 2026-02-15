import {PersistedState} from "runed";

export const theme = new PersistedState<string>("theme", "gruvbox");
export const expandedMenu = new PersistedState<boolean>("expandedMenu", true);
export const expandedHomeMenu = new PersistedState<boolean>("expandedHomeMenu", false);
export const showCrt = new PersistedState<boolean>("showCrt", true);

export function changeTheme(newTheme: string) {
    theme.current = newTheme;
}

export function toggleMenu() {
    expandedMenu.current = !expandedMenu.current;
}

export function toggleExpandedMenu() {
    expandedHomeMenu.current = !expandedHomeMenu.current;
}

export function toggleShowCrt() {
    showCrt.current = !showCrt.current;
}