import { IStack } from './typedefs';
export declare class Stack<T> implements IStack<T> {
    private list_;
    Push(value: T): void;
    Pop(): T;
    Peek(): T;
    IsEmpty(): boolean;
}
