import { RotateAnimationActor, RotateAxis, RotateDirection, RotateOrigin } from "./rotate";

export class SpinAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin', RotateAxis.Z, RotateDirection.Clockwise, angle);
    }
}

export class SpinXAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.x', RotateAxis.X, RotateDirection.Clockwise, angle);
    }
}

export class SpinYAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.y', RotateAxis.Y, RotateDirection.Clockwise, angle);
    }
}

export class SpinZAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.z', RotateAxis.Z, RotateDirection.Clockwise, angle);
    }
}

export class SpinReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle);
    }
}

export class SpinXReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.x.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle);
    }
}

export class SpinYReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.y.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle);
    }
}

export class SpinZReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.z.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle);
    }
}

export class SpinTopAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.top', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Top);
    }
}

export class SpinXTopAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.top.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.Top);
    }
}

export class SpinYTopAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.top.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.Top);
    }
}

export class SpinZTopAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.top.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Top);
    }
}

export class SpinTopReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.top.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Top);
    }
}

export class SpinXTopReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.x.top.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.Top);
    }
}

export class SpinYTopReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.y.top.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.Top);
    }
}

export class SpinZTopReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.z.top.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Top);
    }
}

export class SpinTopRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.right', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinXTopRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.right.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinYTopRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.right.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinZTopRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.right.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinTopRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.right.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinXTopRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.x.top.right.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinYTopRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.y.top.right.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinZTopRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.z.top.right.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.TopRight);
    }
}

export class SpinRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.right', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Right);
    }
}

export class SpinXRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.right.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.Right);
    }
}

export class SpinYRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.right.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.Right);
    }
}

export class SpinZRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.right.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Right);
    }
}

export class SpinRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.right.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Right);
    }
}

export class SpinXRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.x.right.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.Right);
    }
}

export class SpinYRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.y.right.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.Right);
    }
}

export class SpinZRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.z.right.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Right);
    }
}

export class SpinBottomRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.right', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinXBottomRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.right.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinYBottomRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.right.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinZBottomRightAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.right.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinBottomRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.right.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinXBottomRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.x.bottom.right.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinYBottomRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.y.bottom.right.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinZBottomRightReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.z.bottom.right.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomRight);
    }
}

export class SpinBottomAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.bottom', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinXBottomAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.bottom.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinYBottomAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.bottom.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinZBottomAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.bottom.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinBottomReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.bottom.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinXBottomReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.x.bottom.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinYBottomReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.y.bottom.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinZBottomReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.z.bottom.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Bottom);
    }
}

export class SpinBottomLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.left', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinXBottomLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.left.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinYBottomLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.left.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinZBottomLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.left.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinBottomLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.bottom.left.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinXBottomLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.x.bottom.left.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinYBottomLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.y.bottom.left.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinZBottomLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.z.bottom.left.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.BottomLeft);
    }
}

export class SpinLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.left', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Left);
    }
}

export class SpinXLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.left.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.Left);
    }
}

export class SpinYLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.left.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.Left);
    }
}

export class SpinZLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.left.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.Left);
    }
}

export class SpinLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.left.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Left);
    }
}

export class SpinXLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.x.left.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.Left);
    }
}

export class SpinYLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.y.left.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.Left);
    }
}

export class SpinZLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 360){
        super('spin.z.left.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.Left);
    }
}

export class SpinTopLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.left', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinXTopLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.left.x', RotateAxis.X, RotateDirection.Clockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinYTopLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.left.y', RotateAxis.Y, RotateDirection.Clockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinZTopLeftAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.left.z', RotateAxis.Z, RotateDirection.Clockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinTopLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.top.left.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinXTopLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.x.top.left.reverse', RotateAxis.X, RotateDirection.CounterClockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinYTopLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.y.top.left.reverse', RotateAxis.Y, RotateDirection.CounterClockwise, angle, RotateOrigin.TopLeft);
    }
}

export class SpinZTopLeftReverseAnimationActor extends RotateAnimationActor{
    public constructor(angle = 90){
        super('spin.z.top.left.reverse', RotateAxis.Z, RotateDirection.CounterClockwise, angle, RotateOrigin.TopLeft);
    }
}
