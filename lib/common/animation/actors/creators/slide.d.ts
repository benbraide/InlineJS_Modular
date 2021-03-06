import { IAnimationActor } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
import { TranslateAnimationActor } from "../translate";
export declare class GenericSlideAnimationActorCreator<T extends TranslateAnimationActor> extends ParsedCreator<IAnimationActor> {
    constructor(type: new (d: number) => T, key: string);
}
export declare class SlideAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideUpAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideRightAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideDownAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideLeftAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideUpReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideRightReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideDownReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
export declare class SlideLeftReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor> {
    constructor();
}
