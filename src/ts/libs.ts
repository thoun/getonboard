const BgaZoom: typeof globalThis.BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaJumpTo: typeof globalThis.BgaJumpTo = await globalThis.importEsmLib('bga-jump-to', '1.x');

export { BgaJumpTo, BgaZoom };
