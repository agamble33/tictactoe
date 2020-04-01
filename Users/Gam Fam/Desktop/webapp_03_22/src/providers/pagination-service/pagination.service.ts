
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

/*----------------- Providers ---------------------*/
import { AppSettings } from '../app-settings-service/app-settings.service';
import { RestService } from '../rest-service/rest.service';
import { CommonService } from '../common-service/common.service';

export interface paginationVo {
    url: string,
    data: any,
    limit: number,
    offset: number,
    organization_id?: number,
    pageNumber: number,
    isEOL: boolean,
    isLoadMore: boolean,
    isLoadFailed: boolean,
    isLoading: boolean,
    searchText: string
}

@Injectable()
export class PaginationService {
    private defaultPaginationVo: paginationVo = {
        url: '',
        data: [],
        limit: 20,
        offset: 0,
        organization_id: 0,
        pageNumber: 0,
        isEOL: false,
        isLoadMore: false,
        isLoadFailed: false,
        isLoading: false,
        searchText: ''
    }

    constructor( private restService: RestService, private commonService: CommonService ) {

    }

    /**
     * This function will return copy of defaultPaginationVo
     * */
    getDefaultPaginationVo() {
        return Object.assign( {}, this.defaultPaginationVo );
    }

    getPaginationData( paginationObj: paginationVo, isDraftQuotePagination ): Observable<any> {
        let path;
        if( !isDraftQuotePagination ){
           // console.log("isDraftQuotePagination", isDraftQuotePagination);
            path = paginationObj.url + '?limit=' + paginationObj.limit + '&offset=' + ( paginationObj.pageNumber * paginationObj.limit ) + '&organization_id=' + paginationObj.organization_id;

            if ( paginationObj.searchText ) {
                path = path + '&searchKey=' + paginationObj.searchText;
            }
        }else{
            //console.log("isDraftQuotePagination", isDraftQuotePagination);
            path = paginationObj.url + '?limit=' + paginationObj.limit + '&offset=' + ( paginationObj.pageNumber * paginationObj.limit );

            if ( paginationObj.searchText ) {
                path = path + '&searchKey=' + paginationObj.searchText;
            }else{
                path = path + '&searchKey=' + '';
            }
        }
       

        return this.restService.getCall( path, null, false, null )
            .map( res => res.json() )
            .catch( this.commonService.handleError );
    }

}