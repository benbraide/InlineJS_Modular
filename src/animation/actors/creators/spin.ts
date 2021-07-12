import { IAnimationActor, IParsedCreatorReturn } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
import { RotateAnimationActor } from "../rotate";
import * as SpinAnimationActors from "../spin";

class SpinAnimationActorCreatorHelper{
    public static CreateResponse<T extends RotateAnimationActor>(type: new(a: number) => T, angle: number, count = 1): IParsedCreatorReturn<IAnimationActor>{
        return {
            object: new type(angle),
            count: count,
        };
    }
}

export class GenericSpinAnimationActorCreator<T extends RotateAnimationActor> extends ParsedCreator<IAnimationActor>{
    public constructor(type: new(a: number) => T, key: string){
        super(key, (options, index) => {
            let value = ((index < options.length) ? parseInt(options[index]) : null);
            if (!value || value <= 0){
                return null;
            }

            return SpinAnimationActorCreatorHelper.CreateResponse(type, value);
        });
    }
}

export class SpinAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinAnimationActor, 'spin');
    }
}

export class SpinXAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXAnimationActor, 'spin.x');
    }
}

export class SpinYAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYAnimationActor, 'spin.y');
    }
}

export class SpinZAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZAnimationActor, 'spin.z');
    }
}

export class SpinReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinReverseAnimationActor, 'spin.reverse');
    }
}

export class SpinXReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXReverseAnimationActor, 'spin.x.reverse');
    }
}

export class SpinYReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYReverseAnimationActor, 'spin.y.reverse');
    }
}

export class SpinZReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZReverseAnimationActor, 'spin.z.reverse');
    }
}

export class SpinTopAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinTopAnimationActor, 'spin.top');
    }
}

export class SpinXTopAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXTopAnimationActor, 'spin.x.top');
    }
}

export class SpinYTopAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYTopAnimationActor, 'spin.y.top');
    }
}

export class SpinZTopAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZTopAnimationActor, 'spin.z.top');
    }
}

export class SpinTopReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinTopReverseAnimationActor, 'spin.top.reverse');
    }
}

export class SpinXTopReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXTopReverseAnimationActor, 'spin.x.top.reverse');
    }
}

export class SpinYTopReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYTopReverseAnimationActor, 'spin.y.top.reverse');
    }
}

export class SpinZTopReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZTopReverseAnimationActor, 'spin.z.top.reverse');
    }
}

export class SpinTopRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinTopRightAnimationActor, 'spin.top.right');
    }
}

export class SpinXTopRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXTopRightAnimationActor, 'spin.x.top.right');
    }
}

export class SpinYTopRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYTopRightAnimationActor, 'spin.y.top.right');
    }
}

export class SpinZTopRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZTopRightAnimationActor, 'spin.z.top.right');
    }
}

export class SpinTopRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinTopRightReverseAnimationActor, 'spin.top.right.reverse');
    }
}

export class SpinXTopRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXTopRightReverseAnimationActor, 'spin.x.top.right.reverse');
    }
}

export class SpinYTopRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYTopRightReverseAnimationActor, 'spin.y.top.right.reverse');
    }
}

export class SpinZTopRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZTopRightReverseAnimationActor, 'spin.z.top.right.reverse');
    }
}

export class SpinRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinRightAnimationActor, 'spin.right');
    }
}

export class SpinXRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXRightAnimationActor, 'spin.x.right');
    }
}

export class SpinYRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYRightAnimationActor, 'spin.y.right');
    }
}

export class SpinZRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZRightAnimationActor, 'spin.z.right');
    }
}

export class SpinRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinRightReverseAnimationActor, 'spin.right.reverse');
    }
}

export class SpinXRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXRightReverseAnimationActor, 'spin.x.right.reverse');
    }
}

export class SpinYRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYRightReverseAnimationActor, 'spin.y.right.reverse');
    }
}

export class SpinZRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZRightReverseAnimationActor, 'spin.z.right.reverse');
    }
}

export class SpinBottomRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinBottomRightAnimationActor, 'spin.bottom.right');
    }
}

export class SpinXBottomRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXBottomRightAnimationActor, 'spin.x.bottom.right');
    }
}

export class SpinYBottomRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYBottomRightAnimationActor, 'spin.y.bottom.right');
    }
}

export class SpinZBottomRightAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZBottomRightAnimationActor, 'spin.z.bottom.right');
    }
}

export class SpinBottomRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinBottomRightReverseAnimationActor, 'spin.bottom.right.reverse');
    }
}

export class SpinXBottomRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXBottomRightReverseAnimationActor, 'spin.x.bottom.right.reverse');
    }
}

export class SpinYBottomRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYBottomRightReverseAnimationActor, 'spin.y.bottom.right.reverse');
    }
}

export class SpinZBottomRightReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZBottomRightReverseAnimationActor, 'spin.z.bottom.right.reverse');
    }
}

export class SpinBottomAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinBottomAnimationActor, 'spin.bottom');
    }
}

export class SpinXBottomAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXBottomAnimationActor, 'spin.x.bottom');
    }
}

export class SpinYBottomAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYBottomAnimationActor, 'spin.y.bottom');
    }
}

export class SpinZBottomAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZBottomAnimationActor, 'spin.z.bottom');
    }
}

export class SpinBottomReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinBottomReverseAnimationActor, 'spin.bottom.reverse');
    }
}

export class SpinXBottomReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXBottomReverseAnimationActor, 'spin.x.bottom.reverse');
    }
}

export class SpinYBottomReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYBottomReverseAnimationActor, 'spin.y.bottom.reverse');
    }
}

export class SpinZBottomReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZBottomReverseAnimationActor, 'spin.z.bottom.reverse');
    }
}

export class SpinBottomLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinBottomLeftAnimationActor, 'spin.bottom.left');
    }
}

export class SpinXBottomLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXBottomLeftAnimationActor, 'spin.x.bottom.left');
    }
}

export class SpinYBottomLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYBottomLeftAnimationActor, 'spin.y.bottom.left');
    }
}

export class SpinZBottomLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZBottomLeftAnimationActor, 'spin.z.bottom.left');
    }
}

export class SpinBottomLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinBottomLeftReverseAnimationActor, 'spin.bottom.left.reverse');
    }
}

export class SpinXBottomLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXBottomLeftReverseAnimationActor, 'spin.x.bottom.left.reverse');
    }
}

export class SpinYBottomLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYBottomLeftReverseAnimationActor, 'spin.y.bottom.left.reverse');
    }
}

export class SpinZBottomLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZBottomLeftReverseAnimationActor, 'spin.z.bottom.left.reverse');
    }
}

export class SpinLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinLeftAnimationActor, 'spin.left');
    }
}

export class SpinXLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXLeftAnimationActor, 'spin.x.left');
    }
}

export class SpinYLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYLeftAnimationActor, 'spin.y.left');
    }
}

export class SpinZLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZLeftAnimationActor, 'spin.z.left');
    }
}

export class SpinLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinLeftReverseAnimationActor, 'spin.left.reverse');
    }
}

export class SpinXLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXLeftReverseAnimationActor, 'spin.x.left.reverse');
    }
}

export class SpinYLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYLeftReverseAnimationActor, 'spin.y.left.reverse');
    }
}

export class SpinZLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZLeftReverseAnimationActor, 'spin.z.left.reverse');
    }
}

export class SpinTopLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinTopLeftAnimationActor, 'spin.top.left');
    }
}

export class SpinXTopLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXTopLeftAnimationActor, 'spin.x.top.left');
    }
}

export class SpinYTopLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYTopLeftAnimationActor, 'spin.y.top.left');
    }
}

export class SpinZTopLeftAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZTopLeftAnimationActor, 'spin.z.top.left');
    }
}

export class SpinTopLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinTopLeftReverseAnimationActor, 'spin.top.left.reverse');
    }
}

export class SpinXTopLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinXTopLeftReverseAnimationActor, 'spin.x.top.left.reverse');
    }
}

export class SpinYTopLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinYTopLeftReverseAnimationActor, 'spin.y.top.left.reverse');
    }
}

export class SpinZTopLeftReverseAnimationActorCreator extends GenericSpinAnimationActorCreator<RotateAnimationActor>{
    public constructor(){
        super(SpinAnimationActors.SpinZTopLeftReverseAnimationActor, 'spin.z.top.left.reverse');
    }
}
