import type { BgaJumpTo as BgaJumpToType } from '../../bga-jump-to';
import type { BgaZoom as BgaZoomType } from '../../bga-zoom';

const BgaZoom: typeof BgaZoomType = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaJumpTo: typeof BgaJumpToType = await globalThis.importEsmLib('bga-jump-to', '1.x');

export { BgaJumpTo, BgaZoom };
