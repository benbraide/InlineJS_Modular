import { IAnimationActor, IAnimationEase, IAnimationParser, IParsedAnimation, AnimationTargetType } from "../typedefs";
export declare class AnimationParser implements IAnimationParser {
    private eases_;
    private actors_;
    AddEase(ease: IAnimationEase): void;
    RemoveEase(key: string): void;
    GetEase(key: string): IAnimationEase;
    AddActor(actor: IAnimationActor): void;
    RemoveActor(key: string): void;
    GetActor(key: string): IAnimationActor;
    Parse(options: Array<string>, target?: AnimationTargetType): IParsedAnimation;
}
