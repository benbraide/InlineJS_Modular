import { DisplaceAction, DisplaceAnimationActor, DisplaceAxis } from "./displace";

export class VibrateAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('vibrate', DisplaceAxis.Z, DisplaceAction.Rotate, displacement);
    }
}

export class VibrateXAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('vibrate.x', DisplaceAxis.X, DisplaceAction.Rotate, displacement);
    }
}

export class VibrateYAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('vibrate.y', DisplaceAxis.Y, DisplaceAction.Rotate, displacement);
    }
}

export class VibrateZAnimatorActor extends DisplaceAnimationActor{
    public constructor(displacement = 0){
        super('vibrate.Z', DisplaceAxis.Z, DisplaceAction.Rotate, displacement);
    }
}
