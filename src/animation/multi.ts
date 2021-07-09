import { IAnimationActor, IAnimationEase } from '../typedefs'
import { Animation } from './generic'

export class MultiAnimation extends Animation{
    public constructor(protected multiActors_: Record<string, Array<IAnimationActor>>, protected multiEase_: Record<string, IAnimationEase>,
        protected multiDuration_: Record<string, number>, isInfinite = false, interval = 0){
        super(Object.values(multiActors_)[0], Object.values(multiEase_)[0], Object.values(multiDuration_)[0], isInfinite, interval);
    }

    public Add(key: string, actors: Array<IAnimationActor>, ease: IAnimationEase){
        this.AddActors(key, actors);
        this.AddEase(key, ease);
    }

    public AddActors(key: string, actors: Array<IAnimationActor>){
        this.multiActors_[key] = actors;
        if (!this.actors_){
            this.actors_ = actors;
        }
    }

    public AddEase(key: string, ease: IAnimationEase){
        this.multiEase_[key] = ease;
        if (!this.ease_){
            this.ease_ = ease;
        }
    }

    public Remove(key: string){
        this.RemoveActors(key);
        this.RemoveEase(key);
    }

    public RemoveActors(key: string){
        if (!(key in this.multiActors_)){
            return;
        }

        if (this.actors_ === this.multiActors_[key]){
            this.actors_ = null;
        }

        delete this.multiActors_[key];
        if (!this.actors_ && Object.keys(this.multiActors_).length > 0){
            this.actors_ = Object.values(this.multiActors_)[0];
        }
    }

    public RemoveEase(key: string){
        if (!(key in this.multiEase_)){
            return;
        }

        if (this.ease_ === this.multiEase_[key]){
            this.ease_ = null;
        }

        delete this.multiEase_[key];
        if (!this.ease_ && Object.keys(this.multiEase_).length > 0){
            this.ease_ = Object.values(this.multiEase_)[0];
        }
    }

    public SetActive(key: string){
        this.SetActiveActors(key);
        this.SetActiveEase(key);
        this.SetActiveDuration(key);
    }

    public SetActiveActors(key: string){
        if (key in this.multiActors_){
            this.actors_ = this.multiActors_[key];
        }
    }

    public SetActiveEase(key: string){
        if (key in this.multiEase_){
            this.ease_ = this.multiEase_[key];
        }
    }

    public SetActiveDuration(key: string){
        if (key in this.multiDuration_){
            this.duration_ = this.multiDuration_[key];
        }
    }
}
