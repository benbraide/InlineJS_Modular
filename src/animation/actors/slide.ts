import { TranslateAnimationActor, TranslateDirection, TranslateMode } from "./translate";

export class SlideAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide', TranslateDirection.Down, displacement);
    }
}

export class SlideUpAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.up', TranslateDirection.Up, displacement);
    }
}

export class SlideRightAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.right', TranslateDirection.Right, displacement);
    }
}

export class SlideDownAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.down', TranslateDirection.Down, displacement);
    }
}

export class SlideLeftAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.left', TranslateDirection.Left, displacement);
    }
}

export class SlideReverseAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.reverse', TranslateDirection.Down, displacement, TranslateMode.Reversed);
    }
}

export class SlideUpReverseAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.up.reverse', TranslateDirection.Up, displacement, TranslateMode.Reversed);
    }
}

export class SlideRightReverseAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.right.reverse', TranslateDirection.Right, displacement, TranslateMode.Reversed);
    }
}

export class SlideDownReverseAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.down.reverse', TranslateDirection.Down, displacement, TranslateMode.Reversed);
    }
}

export class SlideLeftReverseAnimationActor extends TranslateAnimationActor{
    public constructor(displacement = 9999){
        super('slide.left.reverse', TranslateDirection.Left, displacement, TranslateMode.Reversed);
    }
}
