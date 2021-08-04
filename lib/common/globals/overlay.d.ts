import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { GlobalHandler } from './generic';
export declare class OverlayDirectiveHandler extends ExtendedDirectiveHandler {
    private overlay_;
    constructor(overlay_: OverlayGlobalHandler);
}
export declare class OverlayGlobalHandler extends GlobalHandler {
    private updateBody_;
    private padBody_;
    private scopeId_;
    private clickHandlers_;
    private resizeHandler_;
    private state_;
    constructor(updateBody_?: boolean, padBody_?: boolean);
    SetZIndex(value: number): void;
    OffsetCount(offset: number): void;
    AddClickHandler(handler: (e?: Event) => void): void;
    RemoveClickHandler(handler: (e?: Event) => void): void;
    private SetVisibility_;
    private CheckOverflow_;
}
