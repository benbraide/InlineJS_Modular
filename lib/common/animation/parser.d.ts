import { IAnimationActor, IAnimationEase, IAnimationParser, IParsedAnimation, AnimationTargetType, IParsedCreator } from "../typedefs";
export declare class AnimationParser implements IAnimationParser {
    private easeCreators_;
    private eases_;
    private actorCreators_;
    private actors_;
    AddEaseCreator(creator: IParsedCreator<IAnimationEase>): void;
    RemoveEaseCreator(key: string): void;
    GetEaseCreator(key: string): IParsedCreator<IAnimationEase>;
    AddEase(ease: IAnimationEase): void;
    RemoveEase(key: string): void;
    GetEase(key: string): IAnimationEase;
    AddActorCreator(creator: IParsedCreator<IAnimationActor>): void;
    RemoveActorCreator(key: string): void;
    GetActorCreator(key: string): IParsedCreator<IAnimationActor>;
    AddActor(actor: IAnimationActor): void;
    RemoveActor(key: string): void;
    GetActor(key: string): IAnimationActor;
    Parse(options: Array<string>, target?: AnimationTargetType): IParsedAnimation;
}
