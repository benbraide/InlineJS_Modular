import { IAnimationActor, IAnimationEase, IAnimationParser, IParsedAnimation, AnimationTargetType, IParsedCreator } from "../typedefs";
import { DirectiveHandler } from "../directives/generic";
import { ParsedAnimation, ParsedElementAnimationMode } from "./parsed/generic";
import { CollectionAnimationActor } from "./actors/collection";

export class AnimationParser implements IAnimationParser{
    private easeCreators_: Record<string, IParsedCreator<IAnimationEase>> = {};
    private eases_: Record<string, IAnimationEase> = {};

    private actorCreators_: Record<string, IParsedCreator<IAnimationActor>> = {};
    private actors_: Record<string, IAnimationActor> = {};
    
    public AddEaseCreator(creator: IParsedCreator<IAnimationEase>): void{
        let key = creator.GetKey();
        this.RemoveEaseCreator(key);
        this.easeCreators_[key] = creator;
    }

    public RemoveEaseCreator(key: string): void{
        if (key in this.easeCreators_){
            delete this.easeCreators_[key];
        }
    }

    public GetEaseCreator(key: string): IParsedCreator<IAnimationEase>{
        return ((key in this.easeCreators_) ? this.easeCreators_[key] : null);
    }

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

    public AddActorCreator(creator: IParsedCreator<IAnimationActor>): void{
        let key = creator.GetKey();
        this.RemoveActorCreator(key);
        this.actorCreators_[key] = creator;
    }

    public RemoveActorCreator(key: string): void{
        if (key in this.actorCreators_){
            delete this.actorCreators_[key];
        }
    }

    public GetActorCreator(key: string): IParsedCreator<IAnimationActor>{
        return ((key in this.actorCreators_) ? this.actorCreators_[key] : null);
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
        let formattedOptions = options.map(option => (option.startsWith('-') ? option : option.split('-').join('.'))), infinite = false, interval = 0;
        
        for (let i = 0; i < formattedOptions.length; ++i){
            let option = formattedOptions[i];
            if (option in this.actorCreators_){
                let created = this.actorCreators_[option].Create(options, (i + 1), target);
                if (created){
                    actors.push(created.object);
                    i += created.count;
                    continue;
                }
            }

            if (option in this.easeCreators_){
                let created = this.easeCreators_[option].Create(options, (i + 1), target);
                if (created){
                    eases.push(created.object);
                    i += created.count;
                    continue;
                }
            }
            
            if (option in this.actors_){
                actors.push(this.actors_[option]);
            }
            else if (option in this.eases_){
                eases.push(this.eases_[option]);
            }
            else if (option in namedDurations){
                durations.push(namedDurations[option]);
            }
            else if (option === 'collect'){
                let collection = new CollectionAnimationActor(actors);
                actors = [collection];
            }
            else if (option === 'infinite'){
                infinite = true;
                if ((i + 1) < formattedOptions.length){
                    interval = parseInt(formattedOptions[i + 1]);
                    if (interval || interval === 0){
                        ++i;
                    }
                    else{
                        interval = 0;
                    }
                }
            }
            else{//Try duration
                let duration = DirectiveHandler.ExtractDuration(option, null);
                if (duration && duration > 0){
                    durations.push(duration);
                }
            }
        }

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
            infinite: infinite,
            interval: interval,
        }, mode);
    }
}
