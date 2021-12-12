import { IAlertHandler } from "../typedefs";
import { Region } from "../region";

import Swal from 'sweetalert2'

export class SwalAlertHandler implements IAlertHandler{
    public Alert(data: any): void{
        if (Region.IsObject(data)){
            data['icon'] = (data['icon'] || (data['error'] ? 'error' : (data['type'] || data['code'] || 'success')));
            data['text'] = (data['text'] || data['message']);
            data['toast'] = (!!data['toast'] || !!data['asToast']);
            data['position'] = (data['position'] || (data['toast'] ? 'top-end' : 'center'));
            data['timer'] = (data['timer'] ||((typeof data['duration'] === 'number') ?  data['duration'] : ((data['duration'] === false) ? undefined : 5000)));
        }
        
        Swal.fire(data);
    }

    public Confirm(data: any, confirmed: () => void, canceled?: (buttonClicked?: boolean) => void): void{
        if (Region.IsObject(data)){
            data['icon'] = (data['icon'] || 'warning');
            data['title'] = (data['title'] || 'Please confirm your action');
            data['text'] = (data['text'] || data['message']);
            data['confirmButtonText'] = (data['confirmButtonText'] || 'Yes, continue');
            data['position'] = (data['position'] || 'center');
            data['toast'] = false;
            data['timer'] = undefined;
        }
        else{
            data = {
                icon: 'warning',
                title: 'Please confirm your action',
                text: data,
                confirmButtonText: 'Yes, continue',
                position: 'center',
            };
        }

        data['showCancelButton'] = true;
        Swal.fire(data).then((value) => {
            if (value.isConfirmed){
                confirmed();
            }
            else if (canceled){
                canceled(value.isDenied);
            }
        });
    }

    public Prompt(data: any, callback: (response: any) => void): void{
        if (Region.IsObject(data)){
            data['icon'] = (data['icon'] || 'info');
            data['title'] = (data['title'] || 'Please enter details below');
            data['text'] = (data['text'] || data['message']);
            data['confirmButtonText'] = (data['confirmButtonText'] || 'Submit');
            data['position'] = (data['position'] || 'center');
            data['input'] = (data['input'] || data['type'] || 'text');
            data['toast'] = false;
            data['timer'] = undefined;
        }
        else{
            data = {
                icon: 'info',
                title: 'Please enter details below',
                text: data,
                confirmButtonText: 'Submit',
                position: 'center',
                input: 'text',
            };
        }

        Swal.fire(data).then((response) => {
            if (response.isConfirmed){
                callback(response.value);
            }
            else{
                callback(null);
            }
        });
    }

    public ServerError(err: any): void{}
}
