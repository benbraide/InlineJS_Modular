import { Animation } from './generic';
import { InvertedEase } from './easing/inverted';
export class DisplayAnimation extends Animation {
    constructor(actors, ease, duration) {
        super(actors, ease, duration, false, 0);
        this.showEase_ = ease;
        this.hideEase_ = new InvertedEase(ease);
    }
    BindShow(target) {
        this.ease_ = this.showEase_;
        return this.Bind(target);
    }
    BindHide(target) {
        this.ease_ = this.hideEase_;
        return this.Bind(target);
    }
}
