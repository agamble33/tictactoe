import { Injectable } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';

@Injectable()
export class ToastService {

    private toasterService: ToasterService;

    public config1: ToasterConfig = new ToasterConfig( {
        positionClass: 'toast-top-right',
        animation: 'fade'
    } );

    constructor( toasterService: ToasterService ) {
        this.toasterService = toasterService;
    }


    popToast( toastType: string, message: string ) {
        this.toasterService.clear();
        let toast = {
            maxOpened: 1,
            type: toastType,
            body: message,
            showCloseButton: true,
            timeout: 2000 // 2s timeout
        };       
        this.toasterService.pop( toast );
    }

}