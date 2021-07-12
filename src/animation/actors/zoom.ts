import { BackEase } from "../easing/back";
import { DefaultEase } from "../easing/default";
import { ScaleAnimationActor, ScaleDirection, ScaleOrientation, ScaleOrigin } from "./scale";

export class GenericZoomAnimationActor extends ScaleAnimationActor{
    protected static backEase_ = new BackEase();
    protected static defaultEase_ = new DefaultEase();
    
    public constructor(key: string, direction: ScaleDirection, orientation: ScaleOrientation, origin = ScaleOrigin.Nil, scale = 1){
        super(key, direction, orientation, origin, scale, (show) => (show ? GenericZoomAnimationActor.backEase_ : GenericZoomAnimationActor.defaultEase_));
    }

    public SetScale(scale: number){
        this.scale_ = scale;
    }
}

export class ZoomAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom', ScaleDirection.In, ScaleOrientation.Nil);
    }
}

export class ZoomWidthAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.width', ScaleDirection.In, ScaleOrientation.Horizontal);
    }
}

export class ZoomHeightAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.height', ScaleDirection.In, ScaleOrientation.Vertical);
    }
}

export class ZoomInAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.in', ScaleDirection.In, ScaleOrientation.Nil);
    }
}

export class ZoomInWidthAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.in.width', ScaleDirection.In, ScaleOrientation.Horizontal);
    }
}

export class ZoomInHeightAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.in.height', ScaleDirection.In, ScaleOrientation.Vertical);
    }
}

export class ZoomOutAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.out', ScaleDirection.Out, ScaleOrientation.Nil);
    }
}

export class ZoomOutWidthAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.out.width', ScaleDirection.Out, ScaleOrientation.Horizontal);
    }
}

export class ZoomOutHeightAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.out.height', ScaleDirection.Out, ScaleOrientation.Vertical);
    }
}

export class ZoomTopAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.top', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.Top);
    }
}

export class ZoomTopRightAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.top.right', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.TopRight);
    }
}

export class ZoomRightAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.right', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.Right);
    }
}

export class ZoomBottomRightAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.bottom.right', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.BottomRight);
    }
}

export class ZoomBottomAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.bottom', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.Bottom);
    }
}

export class ZoomBottomLeftAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.bottom.left', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.BottomLeft);
    }
}

export class ZoomLeftAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.left', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.Left);
    }
}

export class ZoomTopLeftAnimationActor extends GenericZoomAnimationActor{
    public constructor(){
        super('zoom.top.left', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}
