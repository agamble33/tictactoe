import { Injectable } from '@angular/core';

/*-------------------- Providers ----------------------------*/
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { AppSettings } from '../app-settings-service/app-settings.service';
import { RestService } from '../rest-service/rest.service';
import { CommonService } from '../common-service/common.service';


@Injectable()
export class ViewQuoteServiceService {

  constructor(private restService: RestService, private commonService: CommonService) { }

/**
 * Function to get quotation list
 */
  getQuotationList(from, to): Observable<any> {
    var path = AppSettings.GET_QUOTE_LIST + "?startDate=" + from + "&endDate=" + to;
    return this.restService.getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }


  // getUsersList(org_id){
  //   var path = AppSettings.GET_ORG_USERS + "?organization_id=" + org_id;
  //   return this.restService.getCall( path, null, false, null )
  //       .map( res => res.json() )
  //       .catch( this.commonService.handleError );


  // }

/**
 * Function to get quote data
 */
getQuote(quoteId): Observable<any> {
  var path = AppSettings.GET_QUOTE + quoteId;
  return this.restService.getCall(path, null, false, null)
    .map(res => res.json())
    .catch(this.commonService.handleError);
}


}
