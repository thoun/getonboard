interface JumpToEntrySettings {
    color?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    classes?: string;
    id?: string;
    html?: string;
}

declare class JumpToEntry {
    constructor(label: string, target: string | HTMLElement, settings?: JumpToEntrySettings);
}

interface BgaPlayerEntriesSettings {
    playerOrder?: (number | string)[];
    entryTarget?: (playerId: number, player: Player) => string | HTMLElement;
    entrySettings?: (playerId: number, player: Player) => JumpToEntrySettings;
}

interface JumpToSettings {
    localStorageFoldedKey?: string;
    entries: JumpToEntry[];
    defaultFolded?: boolean;
    element?: HTMLElement;
}

declare class JumpToManager {
    constructor(settings: JumpToSettings);
}

declare const BgaJumpTo: {
    Entry: typeof JumpToEntry;
    Manager: typeof JumpToManager;
    BgaPlayerEntries: (bga: Bga, settings?: BgaPlayerEntriesSettings) => JumpToEntry[];
};

export { BgaJumpTo };
