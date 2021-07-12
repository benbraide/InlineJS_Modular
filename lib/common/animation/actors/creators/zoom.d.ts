import { IAnimationActor } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
import * as ZoomAnimationActors from "../zoom";
export declare class GenericZoomAnimationActorCreator<T extends ZoomAnimationActors.GenericZoomAnimationActor> extends ParsedCreator<IAnimationActor> {
    constructor(type: new () => T, key: string);
}
export declare class ZoomAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomWidthAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomHeightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomInAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomInWidthAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomInHeightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomOutAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomOutWidthAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomOutHeightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomTopAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomTopRightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomRightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomBottomRightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomBottomAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomBottomLeftAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomLeftAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
export declare class ZoomTopLeftAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor> {
    constructor();
}
