import { IAnimationActor } from "../../typedefs";
import { AnimationActor } from "./generic";
export declare class CollectionAnimationActor extends AnimationActor {
    private collection_;
    constructor(collection_: Array<IAnimationActor>);
}
