import { IAnimationActor, IAnimationEase, IParsedAnimation, AnimationBindInfo, AnimationTargetType } from "../../typedefs";
export declare enum ParsedElementAnimationMode {
    Nil = 0,
    ShowOnly = 1,
    HideOnly = 2
}
export interface ParsedElementAnimationOptions {
    actors: Array<IAnimationActor>;
    eases: Array<IAnimationEase>;
    durations: Array<number>;
    target?: AnimationTargetType;
}
export declare class ParsedAnimation implements IParsedAnimation {
    private mode_;
    private multi_;
    private bounds_;
    private actors_;
    private eases_;
    private durations_;
    private target_;
    private beforeHandlers_;
    private afterHandlers_;
    constructor(options: ParsedElementAnimationOptions, mode_?: ParsedElementAnimationMode);
    Run(show: boolean, target?: AnimationTargetType, afterHandler?: (isCanceled?: boolean, show?: boolean) => void, beforeHandler?: (show?: boolean) => void): void;
    Cancel(target?: AnimationTargetType): void;
    Bind(target: HTMLElement): AnimationBindInfo;
    BindOne(show: boolean, target?: AnimationTargetType): AnimationBindInfo;
    AddBeforeHandler(handler: () => void): void;
    RemoveBeforeHandler(handler: () => void): void;
    AddAfterHandler(handler: (isCanceled?: boolean) => void): void;
    RemoveAfterHandler(handler: (isCanceled?: boolean) => void): void;
    private ExtractExisting_;
    private RunNoAnimation_;
    private IsNoAnimation_;
}
