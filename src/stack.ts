import { IStack } from './typedefs'

export class Stack<T> implements IStack<T>{
    private list_: Array<T> = new Array<T>();

    public Push(value: T): void{
        this.list_.push(value);
    }

    public Pop(): T{
        return ((this.list_.length == 0) ? null : (this.list_.pop() as T));
    }

    public Peek(): T{
        return ((this.list_.length == 0) ? null : this.list_[this.list_.length - 1]);
    }

    public IsEmpty(): boolean{
        return (this.list_.length == 0);
    }
}
