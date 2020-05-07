/*--------------------Angular related components---------------*/
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

/*-----------------App Providers---------------------*/
import { AppSettings } from '../app-settings-service/app-settings.service';
import { Constants } from '../app-settings-service/app-constant.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { RestService } from '../rest-service/rest.service';
import { CommonService } from '../common-service/common.service';

@Injectable()
export class AuthServices {
    errorMsg: string;
    successMsg: string;

    constructor( private restService: RestService, public locstr: LocalStorageService, private constant: Constants,
        private commonService: CommonService, private router: Router ) {

    }

    /**
     * Function to perform login
     * @param data
     */
    login( data: any ): Observable<any> {
        var path = AppSettings.LOGIN_URL;
        return this.restService.postCall( path, data, true, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * Function to perform reset password web-service integration
     * @param data
     */
    resetPassword( data: any ): Observable<any> {
        var path = AppSettings.RESET_PASSWORD_URL;
        return this.restService.postCall( path, data, true, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * This function will return reset password link status
     * @param data
     */
    getResetPasswordLinkStatus( data: any ): Observable<any> {
        var path = AppSettings.RESET_PASSWORD_LINK_STATUS;
        return this.restService.postCall( path, data, true, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * Function to perform forgot password web-service integration
     * @param data
     */
    forgotPassword( data: any ): Observable<any> {
        var path = AppSettings.FORGOT_PASSWORD_URL;
        return this.restService.postCall( path, data, true, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * Function to perform change password web-service integration
     * @param data
     */
    changePassword( data: any ): Observable<any> {
        var path = AppSettings.CHANGE_PASSWORD_URL;
        return this.restService.postCall( path, data, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

}