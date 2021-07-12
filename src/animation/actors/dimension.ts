import { ScaleAnimationActor, ScaleDirection, ScaleOrientation, ScaleOrigin } from "./scale";

export class WidthAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width', ScaleDirection.In, ScaleOrientation.Horizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.reverse', ScaleDirection.In, ScaleOrientation.ReversedHorizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthInAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.in', ScaleDirection.In, ScaleOrientation.Horizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthInReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.in.reverse', ScaleDirection.In, ScaleOrientation.ReversedHorizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthOutAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.out', ScaleDirection.Out, ScaleOrientation.Horizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthOutReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.out.reverse', ScaleDirection.Out, ScaleOrientation.ReversedHorizontal, ScaleOrigin.TopLeft);
    }
}

export class HeightAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('height', ScaleDirection.In, ScaleOrientation.Vertical, ScaleOrigin.TopLeft);
    }
}

export class HeightReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('height.reverse', ScaleDirection.In, ScaleOrientation.ReversedVertical, ScaleOrigin.TopLeft);
    }
}

export class HeightInAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('height.in', ScaleDirection.In, ScaleOrientation.Vertical, ScaleOrigin.TopLeft);
    }
}

export class HeightInReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('height.in.reverse', ScaleDirection.In, ScaleOrientation.ReversedVertical, ScaleOrigin.TopLeft);
    }
}

export class HeightOutAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('height.out', ScaleDirection.Out, ScaleOrientation.Vertical, ScaleOrigin.TopLeft);
    }
}

export class HeightOutReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('height.out.reverse', ScaleDirection.Out, ScaleOrientation.ReversedVertical, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.height', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.height.reverse', ScaleDirection.In, ScaleOrientation.Reversed, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightInAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.height.in', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightInReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.height.in.reverse', ScaleDirection.In, ScaleOrientation.Reversed, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightOutAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.height.out', ScaleDirection.Out, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightOutReverseAnimationActor extends ScaleAnimationActor{
    public constructor(){
        super('width.height.out.reverse', ScaleDirection.Out, ScaleOrientation.Reversed, ScaleOrigin.TopLeft);
    }
}
