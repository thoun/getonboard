interface ZoomControls {
    visible?: boolean;
    position?: 'top-start' | 'top-end';
    color?: 'black' | 'white';
}

interface ZoomManagerSettings {
    element: HTMLElement;
    defaultZoom?: number;
    localStorageZoomKey?: string;
    zoomLevels?: number[];
    zoomControls?: ZoomControls;
    onZoomChange?: (zoom: number) => void;
    onDimensionsChange?: (zoom: number) => void;
}

declare class ZoomManager {
    get zoom(): number;
    constructor(settings: ZoomManagerSettings);
}

declare const BgaZoom: {
    Manager: typeof ZoomManager;
};

export { BgaZoom };
