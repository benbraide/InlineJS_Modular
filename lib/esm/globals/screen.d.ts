import { Point, IAnimation } from '../typedefs';
import { ExtendedDirectiveHandler } from '../directives/extended/generic';
import { GlobalHandler } from './generic';
export interface ScreenCheckpoints {
    name: string;
    value: number;
}
export declare class ScreenDirectiveHandler extends ExtendedDirectiveHandler {
    constructor(screen: ScreenGlobalHandler);
}
export declare class ScreenGlobalHandler extends GlobalHandler {
    private checkpoints_;
    private animator_;
    private debounce_;
    private scopeId_;
    private properties_;
    private methods_;
    private scheduledResize_;
    private scheduledScroll_;
    private resizeEventHandler_;
    private scrollEventHandler_;
    constructor(checkpoints_?: Array<ScreenCheckpoints>, animator_?: IAnimation, debounce_?: number);
    private HandleResize_;
    private HandleScroll_;
    private ComputeBreakpoint_;
    static GetScrollPosition(): Point;
    static ComputePercentage(position: Point): Point;
    static Scroll(from: Point, to: Point, handler?: ScreenGlobalHandler, animate?: boolean): void;
}
