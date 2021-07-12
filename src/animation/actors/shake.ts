import { DisplaceAction, DisplaceAnimationActor, DisplaceAxis } from "./displace";

export class ShakeAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('shake', DisplaceAxis.X, DisplaceAction.Translate, displacement);
    }
}

export class ShakeXAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('shake.x', DisplaceAxis.X, DisplaceAction.Translate, displacement);
    }
}

export class ShakeYAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('shake.y', DisplaceAxis.Y, DisplaceAction.Translate, displacement);
    }
}
