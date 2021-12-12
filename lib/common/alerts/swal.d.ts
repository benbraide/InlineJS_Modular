import { IAlertHandler } from "../typedefs";
export declare class SwalAlertHandler implements IAlertHandler {
    Alert(data: any): void;
    Confirm(data: any, confirmed: () => void, canceled?: (buttonClicked?: boolean) => void): void;
    Prompt(data: any, callback: (response: any) => void): void;
    ServerError(err: any): void;
}
