import { AnimationActor } from "./generic";

export class OpacityAnimationActor extends AnimationActor{
    public constructor(){
        super('opacity', (fraction, element) => {
            element.style.opacity = fraction.toString();
        });
    }
}
