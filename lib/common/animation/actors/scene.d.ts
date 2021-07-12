import { IAnimationEase } from "../../typedefs";
import { AnimationActor } from "./generic";
export interface SceneFrameRange {
    from: number;
    to: number;
}
export declare type SceneFrameHandlerType = (fraction: number, element: HTMLElement) => void;
export interface SceneFrameHandlerInfo {
    ranges: SceneFrameRange | Array<SceneFrameRange>;
    handler: SceneFrameHandlerType;
}
export declare class SceneAnimationActor extends AnimationActor {
    protected frameHandlers_: Array<SceneFrameHandlerInfo>;
    protected wildcardFrameHandler_?: SceneFrameHandlerType;
    protected actionText_: string;
    protected actionRegex_: RegExp;
    protected unit_: string;
    constructor(key: string, frameHandlers_: Array<SceneFrameHandlerInfo>, wildcardFrameHandler_?: SceneFrameHandlerType, preferredEase?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration?: ((show?: boolean) => number) | number, prepare?: (element: HTMLElement) => void);
    protected GetHandler_(fraction: number): SceneFrameHandlerType;
    protected ComputeAndApply_(element: HTMLElement, fraction: number, from: number, to: number, makeNegative?: boolean, count?: number): void;
    protected OnlyApply_(element: HTMLElement, value: number, makeNegative?: boolean, count?: number): void;
    static Apply(element: HTMLElement, action: string, value: number | string, actionRegex?: RegExp): void;
    static Advance(from: number, to: number, fraction: number): number;
}
