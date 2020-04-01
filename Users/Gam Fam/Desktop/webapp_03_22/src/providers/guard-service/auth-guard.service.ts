import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

/*-------------------- Providers ----------------------------*/
import { UserService } from '../../providers/user-service/user.service';
import { NetworkService } from '../network-service/network.service';
import { ToastService } from '../../providers/common-service/toaster-service';
import { Constants } from '../app-settings-service/app-constant.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor( private userService: UserService, private router: Router, private network: NetworkService, private toastService: ToastService, private constants: Constants ) {

    }

    canActivate() {
        if ( this.userService.getIsUserLoggedIn() ) {
            if ( this.network.isNetworkAvailable() ) {
                // AuthGuard# Passed
                return true;
            } else {
                this.toastService.popToast("error", this.constants.ERROR_NETWORK_UNAVAILABLE);
                return false;
            }
            
        } else {
            // AuthGuard# Failed
            this.router.navigate(['']);
            window.alert( "You don't have permission to view this page" );
            return false;
        }
    }
}