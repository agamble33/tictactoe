import { Injectable } from '@angular/core';

@Injectable()
export class NetworkService {
    private networkFlag = false;
    private networkType: any;
    private isWeb: boolean = false;
    constructor() {
        this.isWeb = true;
    }

    isNetworkAvailable() {
        return navigator.onLine;
    }

    getNetworkType() {
        return navigator.onLine;
    }
}