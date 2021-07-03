import { IAnimationActor, IAnimationEase } from '../typedefs'
import { Animation } from './generic'
import { InvertedEase } from './easing/inverted'

export class DisplayAnimation extends Animation{
    private showEase_: IAnimationEase;
    private hideEase_: IAnimationEase;
    
    public constructor(actors: Array<IAnimationActor>, ease: IAnimationEase, duration: number){
        super(actors, ease, duration, false, 0);
        this.showEase_ = ease;
        this.hideEase_ = new InvertedEase(ease);
    }

    public BindShow(target: HTMLElement){
        this.ease_ = this.showEase_;
        return this.Bind(target);
    }

    public BindHide(target: HTMLElement){
        this.ease_ = this.hideEase_;
        return this.Bind(target);
    }
}
