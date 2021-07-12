import { AnimationTargetType, IParsedCreator, IParsedCreatorReturn } from "../../typedefs";

export class ParsedCreator<T> implements IParsedCreator<T>{
    public constructor (protected key_: string, protected create_: (options: Array<string>, index?: number, target?: AnimationTargetType) => IParsedCreatorReturn<T>){}
    
    public GetKey(): string{
        return this.key_;
    }
    
    public Create(options: Array<string>, index?: number, target?: AnimationTargetType): IParsedCreatorReturn<T>{
        return this.create_(options, index, target);
    }
}
