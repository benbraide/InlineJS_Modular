import { IDirectiveHandler } from "../../typedefs";
import { ExtendedDirectiveHandler } from "./generic";
export declare class StateDirectiveHandler extends ExtendedDirectiveHandler {
    private form_;
    private observer_;
    private observerHandlers_;
    constructor(form_: IDirectiveHandler);
    protected AddObserverHandler_(target: HTMLElement, handler: (node?: HTMLElement) => void): void;
    protected RemoveObserverHandler_(target: HTMLElement | ((node?: HTMLElement) => void)): void;
}
