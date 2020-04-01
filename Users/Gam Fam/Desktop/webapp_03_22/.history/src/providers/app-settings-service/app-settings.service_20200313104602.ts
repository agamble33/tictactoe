/**
 * AppSettings provider module
 * contains common url
 */

/*--------------------Angular related components---------------*/
import { Injectable } from '@angular/core';
import { Constants } from '../app-settings-service/app-constant.service';
import { constants } from 'os';

/**
 * AppSettings class : contains common url
*/
@Injectable()
export class AppSettings {

  public static get BASE_URL(): string {
    if (Constants.CURRENT_ENVIRONMENT == 'production') {
      return 'https://www.h2panelbuilder.com/api/v1/';
      //please change below production release date
    } else if (Constants.CURRENT_ENVIRONMENT == 'uat') {
      return 'https://uat.h2panelbuilder.com/api/v1/';
      // return 'http://192.168.1.214:4500/api/v1/';
     } else if (Constants.CURRENT_ENVIRONMENT == 'local') {
       return 'http://localhost:60420/api/v1/';

    } else {  //return ' http://192.168.1.214:4500/api/v1/';
      return  'http://panelbuilder-qa.us-east-1.elasticbeanstalk.com/api/v1/'; 

  
    //  return "http://panelbuilder-qa.us-east-1.elasticbeanstalk.com/api/v1/"; // Testing ELB server
    //  return "http://h2panelbuilder-prod.us-west-2.elasticbeanstalk.com/api/v1/"; // Production ELB server
    //  return "http://192.168.1.49:3000/api/v1/"; //local machine deepak
    //  return 'http://192.168.1.211:3400/api/v1/'; // local machine prashant jadhav
    //  return ' http://192.168.1.103:3400/api/v1/'; // local machine prashant giri
    //  return ' http://192.168.1.214:4500/api/v1/'; // local machine asif
    //  return "https://www.h2panelbuilder.com/api/v1/"; // latest Production ELB server
    //  return "https://uat.h2panelbuilder.com/api/v1/"; // UAT ELB server

  }
  
  /*---------------------- Login Module URL -------------------------------*/
  public static get LOGIN_URL(): String { return 'users/login'; }
  public static get FORGOT_PASSWORD_URL(): string { return 'user/forgotPassword'; }
  public static get CHANGE_PASSWORD_URL(): string { return 'user/changePassword'; }
  public static get UPDATE_PROFILE_URL(): string { return 'users/profile'; }
  public static get RESET_PASSWORD_URL(): string { return 'users/resetPassword'; }
  public static get PANEL_LIST_URL(): string { return 'panel/getPanelOptionList'; }
  public static get CONTROLLER_LIST_URL(): string { return 'controller'; }
  public static get CONTROLLER_SENSOR_IO_URL(): string { return 'controller/iooptions/'; }
  public static get RESET_PASSWORD_LINK_STATUS(): string { return 'user/resetPasswordLink/status' }
  public static get GET_ACCESSORIES(): string { return 'panel/accessories' }
  public static get GET_FLOW_DIRECTION_LIST_URL(): string { return 'panel/getFlowDirectionList' }
  public static get GET_COGNITO_ID(): string { return 'user/cognito'; }
  public static get CONFIGURE_QUOTE(): string { return 'quote/configure'; }
  public static get CONFIGURE_QUOTE_ACCESSORIES(): string { return 'quote/configure/accessories'; }
  public static get CONFIGURE_QUOTE_900(): string { return 'quote/configure'; }
  public static get SAVE_QUOTE(): string { return 'quote/save'; }
  public static get DRAFT_QUOTE_LIST(): string { return 'quote/draft'; }
  public static get SAVED_QUOTE_LIST(): string { return 'quote/saved'; }
  public static get DELETE_DRAFT_QUOTE(): string { return 'quote?quoteId='; }
  public static get DELETE_MULTIPLE_DRAFT_QUOTE(): string { return 'quote/multiple?quoteIds='; }
  public static get UPDATE_DRAFT_QUOTE(): string { return 'quote/update'; }
  public static get QUOTE_PDF_SHARE(): string { return 'quote/share'; }
  public static get COPY_QUOTE(): string { return 'quote/copy'; }
  public static get GET_DATASHEET_LIST(): string { return 'datasheet/unique'; }
  public static get GET_ROLE_BASED_QUOTE_TYPE(): string { return 'quotetype/organizationrolequotationtype?organization_id='; }
  public static get SET_ORG_ROLE_BASED_QUOTE_TYPE(): string { return 'quotetype/organizationrolequotationtype'; }

  /* s3 cognito details production*/
  public static get IDENTITY_POOL_ID(): string { return 'us-east-1:d3cbccc0-b9d6-40cf-839c-fff887d2afd3'; }
  public static get BUCKET_NAME(): string { return 'h2panelbuilder'; } // biz 4 prod bucket
  public static get REGION_NAME(): string { return 'US_EAST_1'; } // Region name

  /*-------------------------- Manage user API -------------------------*/
  public static get GET_ORG_USERS(): string { return 'users/user'; }
  public static get GET_ORG_ADMINS(): string { return 'users/admin'; }
  public static get GET_ORG_SUPER_USERS(): string { return 'users/superuser'; }
  public static get CREATE_USER(): string { return 'users/create'; }
  public static get UPDATE_USER(): string { return 'users/update'; }
  public static get DELETE_USER(): string { return 'users/delete?identity_id='; }
  public static get GET_USER_ASSOCIATED_QUOTETYPES(): string { return 'quotetype/user'; }
  public static get GET_QUOTATION_TYPES_BY_ORG(): string { return 'quotetype/organization?organization_id='; }
  public static get UPDATE_VISIBLE_QUOTES(): string { return 'salesrepresentative'; }
  public static get GET_VISIBLE_QUOTES(): string { return 'salesrepresentative?identity_id='; }
  public static get GET_SALES_REP_LIST_WITH_LOGGED_IN_USER(): string { return 'users/salesrep?organization_id='; }
  
  /*----------------------- View Quotation ----------------------------------------*/
  public static get GET_QUOTE_LIST(): string { return 'quote'; }
  public static get GET_QUOTE(): string { return 'quote/getquotebyid?quoteId='; }
  
}