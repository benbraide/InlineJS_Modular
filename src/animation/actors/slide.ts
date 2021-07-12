import { TranslateAnimationActor, TranslateDirection } from "./translate";

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
