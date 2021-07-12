import { IAnimationActor, IParsedCreatorReturn } from "../../../typedefs";
import { ParsedCreator } from "../../creators/generic";
import * as ZoomAnimationActors from "../zoom";

class ZoomAnimationActorCreatorHelper{
    public static CreateResponse<T extends ZoomAnimationActors.GenericZoomAnimationActor>(type: new() => T, scale: number, count = 1): IParsedCreatorReturn<IAnimationActor>{
        let object = new type();
        object.SetScale(scale / 100);
        
        return {
            object: object,
            count: count,
        };
    }
}

export class GenericZoomAnimationActorCreator<T extends ZoomAnimationActors.GenericZoomAnimationActor> extends ParsedCreator<IAnimationActor>{
    public constructor(type: new() => T, key: string){
        super(key, (options, index) => {
            let value = ((index < options.length) ? parseInt(options[index]) : null);
            if (!value || value <= 0){
                return null;
            }

            return ZoomAnimationActorCreatorHelper.CreateResponse(type, value);
        });
    }
}

export class ZoomAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomAnimationActor, 'zoom');
    }
}

export class ZoomWidthAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomWidthAnimationActor, 'zoom.width');
    }
}

export class ZoomHeightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomHeightAnimationActor, 'zoom.height');
    }
}

export class ZoomInAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomInAnimationActor, 'zoom.in');
    }
}

export class ZoomInWidthAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomInWidthAnimationActor, 'zoom.in.width');
    }
}

export class ZoomInHeightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomInHeightAnimationActor, 'zoom.in.height');
    }
}

export class ZoomOutAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomOutAnimationActor, 'zoom.out');
    }
}

export class ZoomOutWidthAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomOutWidthAnimationActor, 'zoom.out.width');
    }
}

export class ZoomOutHeightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomOutHeightAnimationActor, 'zoom.out.height');
    }
}

export class ZoomTopAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomTopAnimationActor, 'zoom.top');
    }
}

export class ZoomTopRightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomTopRightAnimationActor, 'zoom.top.right');
    }
}

export class ZoomRightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomRightAnimationActor, 'zoom.right');
    }
}

export class ZoomBottomRightAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomBottomRightAnimationActor, 'zoom.bottom.right');
    }
}

export class ZoomBottomAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomBottomAnimationActor, 'zoom.bottom');
    }
}

export class ZoomBottomLeftAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomBottomLeftAnimationActor, 'zoom.bottom.left');
    }
}

export class ZoomLeftAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomLeftAnimationActor, 'zoom.left');
    }
}

export class ZoomTopLeftAnimationActorCreator extends GenericZoomAnimationActorCreator<ZoomAnimationActors.GenericZoomAnimationActor>{
    public constructor(){
        super(ZoomAnimationActors.ZoomTopLeftAnimationActor, 'zoom.top.left');
    }
}
