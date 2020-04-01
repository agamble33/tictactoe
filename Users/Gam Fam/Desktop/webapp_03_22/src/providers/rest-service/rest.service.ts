import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

/*---------------------- Providers ---------------------------*/
import { AppSettings } from '../app-settings-service/app-settings.service';
import { Constants } from '../app-settings-service/app-constant.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { NetworkService } from '../network-service/network.service';

@Injectable()
export class RestService {
    private networkError: any;

    constructor( private http: Http, private locstr: LocalStorageService, private network: NetworkService, private constants: Constants, private router: Router ) {
        this.networkError = {
            "message": this.constants.ERROR_NETWORK_UNAVAILABLE
        }
    }

    /**
     * All get API call will be done using this function
     * @param1: Path of URL
     * @param2: Data to pass to URL if any
     * @param3: skip authorization if needed
     * @param4: timeout - default will be 40 sec if need more or less pass as argument
     * */
    getCall( path: any, data: any, skipAuth: any, timeout: any ): Observable<any> {
        if ( this.network.isNetworkAvailable() ) {
            var url = AppSettings.BASE_URL + path;
            timeout = timeout || 40000;
            data = data || {};
            skipAuth = skipAuth || false;

            var headerObj: any = {
                'Content-Type': 'application/json'
            }

            if ( skipAuth == false ) {
                var accessToken = this.locstr.getObj( 'accessToken' );
                headerObj["Authorization"] = "Bearer " + accessToken;
            }

            let payload = JSON.stringify( data );
            let headers = new Headers( headerObj );
            let options = new RequestOptions( { headers: headers } );

            return this.http.get( url, options )
                .timeout( timeout );
        } else {
            return Observable.throw( this.networkError );
        }

    }

    /**
     * All POST API call will be done using this function
     * @param1: Path of URL
     * @param2: Data to pass to URL if any
     * @param3: skip authorization if needed
     * @param4: timeout - default will be 40 sec if need more or less pass as argument
     * */
    postCall( path: any, data: any, skipAuth: any, timeout: any ): Observable<any> {
        if ( this.network.isNetworkAvailable() ) {
            var url = AppSettings.BASE_URL + path;
            timeout = timeout || 40000;
            data = data || {};
            skipAuth = skipAuth || false;

            var headerObj: any = {
                'Content-Type': 'application/json'
            }

            if ( skipAuth == false ) {
                if ( this.locstr.getObj( 'accessToken' ) ) {
                    var loginData = this.locstr.getObj( 'accessToken' );
                    headerObj["Authorization"] = "Bearer " + loginData;
                } else {
                    this.router.navigate( ['/'] );
                }
            }

            headerObj["Device-Type"] = "web";
            let payload = JSON.stringify( data );
            let headers = new Headers( headerObj );
            let options = new RequestOptions( { headers: headers } );

            return this.http.post( url, payload, options )
                .timeout( timeout );
        } else {
            return Observable.throw( this.networkError );
        }
    }

    /**
     * All PUT API call will be done using this function
     * @param1: Path of URL
     * @param2: Data to pass to URL if any
     * @param3: skip authorization if needed
     * @param4: timeout - default will be 40 sec if need more or less pass as argument
     * */
    putCall( path: any, data: any, skipAuth: any, timeout: any ): Observable<any> {
        if ( this.network.isNetworkAvailable() ) {
            var url = AppSettings.BASE_URL + path;
            data = data || {};
            timeout = timeout || 40000;
            skipAuth = skipAuth || false;

            var headerObj: any = {
                'Content-Type': 'application/json'
            }

            if ( skipAuth == false ) {
                if ( this.locstr.getObj( 'accessToken' ) ) {
                    var loginData = this.locstr.getObj( 'accessToken' );
                    headerObj["Authorization"] = "Bearer " + loginData;
                } else {
                    this.router.navigate( ['/'] );
                }
            }

            headerObj["Device-Type"] = "web";
            let payload = JSON.stringify( data );
            let headers = new Headers( headerObj );
            let options = new RequestOptions( { headers: headers } );

            return this.http.put( url, payload, options )
                .timeout( timeout );
        } else {
            return Observable.throw( this.networkError );
        }
    }

    deleteCall( path: any, data: any, skipAuth: any, timeout: any ): Observable<any> {
        if ( this.network.isNetworkAvailable() ) {
            var url = AppSettings.BASE_URL + path + data;
            timeout = timeout || 40000;
            data = data || {};
            skipAuth = skipAuth || false;
    
            var headerObj: any = {
                'Content-Type': 'application/json'
            }
            headerObj["Device-Type"] = "web";
            if ( skipAuth == false ) {
                if ( this.locstr.getObj( 'accessToken' ) ) {
                    var authToken = this.locstr.getObj( 'accessToken' );
                    headerObj["Authorization"] = "Bearer " + authToken;
                } else {
                    this.router.navigate( ['/'] );
                }
            }
    
            let payload = JSON.stringify( data );
            let headers = new Headers( headerObj );
            let options = new RequestOptions( { headers: headers } );
    
            return this.http.delete( url, new RequestOptions( { headers: headers, body: payload } ) )
                .timeout( timeout );
        } else {
            return Observable.throw( this.networkError );
        }
    }

    /**
     * All externalCall API call will be done using this function if any
     * */
    externalCall( url: any, params: any, options: any ): Observable<any> {
        return null;
    }

}