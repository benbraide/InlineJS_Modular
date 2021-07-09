import { IAnimationActor, IAnimationEase } from "../../typedefs";
export declare class AnimationActor implements IAnimationActor {
    protected key_: string;
    private step_?;
    private prepare_?;
    private preferredEase_?;
    private preferredDuration_?;
    constructor(key_: string, step_?: (fraction: number, element: HTMLElement) => void, prepare_?: (element: HTMLElement) => void, preferredEase_?: ((show?: boolean) => IAnimationEase) | IAnimationEase, preferredDuration_?: ((show?: boolean) => number) | number);
    GetKey(): string;
    Prepare(element: HTMLElement): void;
    Step(fraction: number, element: HTMLElement): void;
    GetPreferredEase(show?: boolean): IAnimationEase;
    GetPreferredDuration(show?: boolean): number;
}
