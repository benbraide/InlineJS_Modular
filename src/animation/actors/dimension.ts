import { ScaleAnimationActor, ScaleDirection, ScaleOrientation, ScaleOrigin } from "./scale";

export class Width extends ScaleAnimationActor{
    public constructor(){
        super('width', ScaleDirection.In, ScaleOrientation.Horizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthReverse extends ScaleAnimationActor{
    public constructor(){
        super('width.reverse', ScaleDirection.In, ScaleOrientation.ReversedHorizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthIn extends ScaleAnimationActor{
    public constructor(){
        super('width.in', ScaleDirection.In, ScaleOrientation.Horizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthInReverse extends ScaleAnimationActor{
    public constructor(){
        super('width.in.reverse', ScaleDirection.In, ScaleOrientation.ReversedHorizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthOut extends ScaleAnimationActor{
    public constructor(){
        super('width.out', ScaleDirection.Out, ScaleOrientation.Horizontal, ScaleOrigin.TopLeft);
    }
}

export class WidthOutReverse extends ScaleAnimationActor{
    public constructor(){
        super('width.out.reverse', ScaleDirection.Out, ScaleOrientation.ReversedHorizontal, ScaleOrigin.TopLeft);
    }
}

export class Height extends ScaleAnimationActor{
    public constructor(){
        super('height', ScaleDirection.In, ScaleOrientation.Vertical, ScaleOrigin.TopLeft);
    }
}

export class HeightReverse extends ScaleAnimationActor{
    public constructor(){
        super('height.reverse', ScaleDirection.In, ScaleOrientation.ReversedVertical, ScaleOrigin.TopLeft);
    }
}

export class HeightIn extends ScaleAnimationActor{
    public constructor(){
        super('height.in', ScaleDirection.In, ScaleOrientation.Vertical, ScaleOrigin.TopLeft);
    }
}

export class HeightInReverse extends ScaleAnimationActor{
    public constructor(){
        super('height.in.reverse', ScaleDirection.In, ScaleOrientation.ReversedVertical, ScaleOrigin.TopLeft);
    }
}

export class HeightOut extends ScaleAnimationActor{
    public constructor(){
        super('height.out', ScaleDirection.Out, ScaleOrientation.Vertical, ScaleOrigin.TopLeft);
    }
}

export class HeightOutReverse extends ScaleAnimationActor{
    public constructor(){
        super('height.out.reverse', ScaleDirection.Out, ScaleOrientation.ReversedVertical, ScaleOrigin.TopLeft);
    }
}

export class WidthHeight extends ScaleAnimationActor{
    public constructor(){
        super('width.height', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightReverse extends ScaleAnimationActor{
    public constructor(){
        super('width.height.reverse', ScaleDirection.In, ScaleOrientation.Reversed, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightIn extends ScaleAnimationActor{
    public constructor(){
        super('width.height.in', ScaleDirection.In, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightInReverse extends ScaleAnimationActor{
    public constructor(){
        super('width.height.in.reverse', ScaleDirection.In, ScaleOrientation.Reversed, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightOut extends ScaleAnimationActor{
    public constructor(){
        super('width.height.out', ScaleDirection.Out, ScaleOrientation.Nil, ScaleOrigin.TopLeft);
    }
}

export class WidthHeightOutReverse extends ScaleAnimationActor{
    public constructor(){
        super('width.height.out.reverse', ScaleDirection.Out, ScaleOrientation.Reversed, ScaleOrigin.TopLeft);
    }
}
