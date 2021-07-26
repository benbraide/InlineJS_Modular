import { IAnimationActor, IParsedCreatorReturn } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
import { TranslateAnimationActor } from "../translate";
import * as SlideAnimationActors from "../slide";

class SlideAnimationActorCreatorHelper{
    public static CreateResponse<T extends TranslateAnimationActor>(type: new(d: number) => T, displacement: number, count = 1): IParsedCreatorReturn<IAnimationActor>{
        return {
            object: new type(displacement),
            count: count,
        };
    }
}

export class GenericSlideAnimationActorCreator<T extends TranslateAnimationActor> extends ParsedCreator<IAnimationActor>{
    public constructor(type: new(d: number) => T, key: string){
        super(key, (options, index) => {
            let value = ((index < options.length) ? parseInt(options[index]) : null);
            if (!value && value !== 0){
                return null;
            }

            return SlideAnimationActorCreatorHelper.CreateResponse(type, value);
        });
    }
}

export class SlideAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideAnimationActor, 'slide');
    }
}

export class SlideUpAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideUpAnimationActor, 'slide.up');
    }
}

export class SlideRightAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideRightAnimationActor, 'slide.right');
    }
}

export class SlideDownAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideDownAnimationActor, 'slide.down');
    }
}

export class SlideLeftAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideLeftAnimationActor, 'slide.left');
    }
}

export class SlideReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideReverseAnimationActor, 'slide.reverse');
    }
}

export class SlideUpReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideUpReverseAnimationActor, 'slide.up.reverse');
    }
}

export class SlideRightReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideRightReverseAnimationActor, 'slide.right.reverse');
    }
}

export class SlideDownReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideDownReverseAnimationActor, 'slide.down.reverse');
    }
}

export class SlideLeftReverseAnimationActorCreator extends GenericSlideAnimationActorCreator<TranslateAnimationActor>{
    public constructor(){
        super(SlideAnimationActors.SlideLeftReverseAnimationActor, 'slide.left.reverse');
    }
}
