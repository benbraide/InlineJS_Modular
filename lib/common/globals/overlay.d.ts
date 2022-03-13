import { IOverlayGlobalHandler } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { GlobalHandler } from './generic';
export declare class OverlayDirectiveHandler extends ExtendedDirectiveHandler {
    private overlay_;
    constructor(overlay_: OverlayGlobalHandler);
}
export declare class OverlayGlobalHandler extends GlobalHandler implements IOverlayGlobalHandler {
    private updateBody_;
    private padBody_;
    private scopeId_;
    private clickHandlers_;
    private resizeHandler_;
    private state_;
    private styles_;
    constructor(updateBody_?: boolean, padBody_?: string, styles?: Record<string, string>);
    SetZIndex(value: number): void;
    GetZIndex(): number;
    OffsetCount(offset: number): void;
    AddClickHandler(handler: (bubbled?: boolean, e?: Event) => void): void;
    RemoveClickHandler(handler: (bubbled?: boolean, e?: Event) => void): void;
    private SetVisibility_;
    private CheckOverflow_;
}
