import { IAnimationActor, IAnimationEase, IAnimationParser, IParsedAnimation, AnimationTargetType } from "../typedefs";
import { DirectiveHandler } from "../directives/generic";
import { ParsedAnimation, ParsedElementAnimationMode } from "./parsed/generic";

export class AnimationParser implements IAnimationParser{
    private eases_: Record<string, IAnimationEase> = {};
    private actors_: Record<string, IAnimationActor> = {};
    
    public AddEase(ease: IAnimationEase): void{
        let key = ease.GetKey();
        this.RemoveEase(key);
        this.eases_[key] = ease;
    }

    public RemoveEase(key: string): void{
        if (key in this.eases_){
            delete this.eases_[key];
        }
    }

    public GetEase(key: string): IAnimationEase{
        return ((key in this.eases_) ? this.eases_[key] : null);
    }

    public AddActor(actor: IAnimationActor): void{
        let key = actor.GetKey();
        this.RemoveActor(key);
        this.actors_[key] = actor;
    }

    public RemoveActor(key: string): void{
        if (key in this.actors_){
            delete this.actors_[key];
        }
    }

    public GetActor(key: string): IAnimationActor{
        return ((key in this.actors_) ? this.actors_[key] : null);
    }

    public Parse(options: Array<string>, target?: AnimationTargetType): IParsedAnimation{
        const namedDurations = {
            crawl: 2000,
            slower: 1000,
            slow: 750,
            normal: 500,
            fast: 300,
            faster: 200,
            swift: 100,
        };
        
        let actors = new Array<IAnimationActor>(), eases = new Array<IAnimationEase>(), durations = new Array<number>();
        options.map(option => option.split('-').join('.')).forEach((option) => {
            if (option in this.actors_){
                actors.push(this.actors_[option]);
            }
            else if (option in this.eases_){
                eases.push(this.eases_[option]);
            }
            else if (option in namedDurations){
                eases.push(namedDurations[option]);
            }
            else{//Try duration
                let duration = DirectiveHandler.ExtractDuration(option, null);
                if (duration && duration > 0){
                    durations.push(duration);
                }
            }
        });

        let mode: ParsedElementAnimationMode;
        if (!options.includes('show')){
            mode = (options.includes('hide') ? ParsedElementAnimationMode.HideOnly : ParsedElementAnimationMode.Nil);
        }
        else{//Show only
            mode = ParsedElementAnimationMode.ShowOnly;
        }

        return new ParsedAnimation({
            actors: actors,
            eases: eases,
            durations: durations,
            target: target,
        }, mode);
    }
}
