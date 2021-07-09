import { ScaleAnimationActor, ScaleDirection, ScaleOrientation, ScaleOrigin } from "./scale";
export declare class GenericZoomAnimationActor extends ScaleAnimationActor {
    constructor(key: string, direction: ScaleDirection, orientation: ScaleOrientation, origin?: ScaleOrigin, scale?: number);
    SetScale(scale: number): void;
}
export declare class ZoomAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomWidthAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomHeightAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomInAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomInWidthAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomInHeightAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomOutAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomOutWidthAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomOutHeightAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomTopAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomTopRightAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomRightAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomBottomRightAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomBottomAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomBottomLeftAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomLeftAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
export declare class ZoomTopLeftAnimationActor extends GenericZoomAnimationActor {
    constructor();
}
