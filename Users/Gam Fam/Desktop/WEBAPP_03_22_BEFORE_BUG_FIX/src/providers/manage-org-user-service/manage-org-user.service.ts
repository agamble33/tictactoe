
/**
 * This service will hold logged in user data and return if needed
 * */
import { Injectable, Inject } from '@angular/core';
import { Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

/*-------------------- Providers ----------------------------*/
import { AppSettings } from '../app-settings-service/app-settings.service';
import { Constants } from '../app-settings-service/app-constant.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { RestService } from '../rest-service/rest.service';
import { CommonService } from '../common-service/common.service';

@Injectable()
export class ManageOrgUserService {

    constructor( private restService: RestService, public locstr: LocalStorageService, private constant: Constants,
        private commonService: CommonService, private router: Router ) {

    }

    /**
     * Function to perform controller web-service integration
     * @param data
     */
    createUser( data: any ): Observable<any> {
        var path = AppSettings.CREATE_USER;
        return this.restService.postCall( path, data, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * Function to perform controller web-service integration
     * @param data
     */
    updateUser( data: any ): Observable<any> {
        var path = AppSettings.UPDATE_USER;
        return this.restService.postCall( path, data, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * Function to perform controller web-service integration
     * @param data
     */
    deleteUser( data: any ): Observable<any> {
        var path = AppSettings.DELETE_USER;
        return this.restService.deleteCall( path, data, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }


    /**
     * Function to get quotation type list
     */
    getQuotationTypeByOrganization(organization_id): Observable<any> {
        var path = AppSettings.GET_QUOTATION_TYPES_BY_ORG + organization_id;
        return this.restService.getCall( path, null, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    /**
     * Function to get quotation type list against role
     */
    getQuotationTypeByRole(organization_id, role): Observable<any> {
        var path = AppSettings.GET_ROLE_BASED_QUOTE_TYPE + organization_id +"&role=" + role;
        return this.restService.getCall( path, null, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

        /**
     * Function to get quotation type list against role
     */
    setQuotationTypeByOrgRole(data: any): Observable<any> {
        var path = AppSettings.SET_ORG_ROLE_BASED_QUOTE_TYPE;
        return this.restService.postCall( path, data, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    updateVisibleQuotes(data:any){
        var path = AppSettings.UPDATE_VISIBLE_QUOTES;
        return this.restService.putCall( path, data, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

    getVisibleQuotes(salesRepIdentityId){
        var path = AppSettings.GET_VISIBLE_QUOTES + salesRepIdentityId;
        return this.restService.getCall( path, null, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

   
}