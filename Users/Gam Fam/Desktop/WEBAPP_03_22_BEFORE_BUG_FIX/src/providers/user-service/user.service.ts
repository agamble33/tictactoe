/**
 * This service will hold logged in user data and return if needed
 * */
import { Injectable, Inject } from "@angular/core";
import {
  Headers,
  Response,
  RequestOptions,
  URLSearchParams
} from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import { Observable } from "rxjs/Observable";
import { Router } from "@angular/router";

/*-------------------- Providers ----------------------------*/
import { AppSettings } from "../app-settings-service/app-settings.service";
import { Constants } from "../app-settings-service/app-constant.service";
import { LocalStorageService } from "../local-storage-service/local-storage.service";
import { RestService } from "../rest-service/rest.service";
import { CommonService } from "../common-service/common.service";

@Injectable()
export class UserService {
  private userData: any;
  private isUserLoggedIn: boolean;
  private panelList: any;
  private accessoryList: any;
  private isCreateNewAccessory: any;

  constructor(
    private restService: RestService,
    public locstr: LocalStorageService,
    private constant: Constants,
    private commonService: CommonService,
    private router: Router
  ) {}

  /**
   * This function will return copy of logged in user details
   * */
  getUser() {
    let userCopy: any;
    if (this.userData) {
      userCopy = Object.assign({}, this.userData);
    } else {
      userCopy = this.locstr.getObj("loggedInUser");
    }
    return userCopy;
  }

  /**
   * This function will store details of logged in user
   * */
  setUser = (user: any) => {
    this.locstr.setObj("loggedInUser", user);
    this.userData = user;
  };

  /**
   * This function will hold boolean value whether user logged in
   * */
  setIsUserLoggedIn(isLoggedIn: boolean) {
    this.locstr.setObj("isUserLoggedIn", isLoggedIn);
    this.isUserLoggedIn = isLoggedIn;
  }

  /**
   * This function will return boolean value whether user logged in
   * */
  getIsUserLoggedIn = (): boolean => {
    let isUserLoggedIn = Object.assign({}, this.isUserLoggedIn);
    if (this.isUserLoggedIn) {
      isUserLoggedIn = Object.assign({}, this.isUserLoggedIn);
    } else {
      isUserLoggedIn = this.locstr.getObj("isUserLoggedIn");
    }
    return isUserLoggedIn;
  };

  /**
   * Function to perform controller web-service integration
   * @param data
   */
  getPanelList(organization_id: any): Observable<any> {
    var path =
      AppSettings.PANEL_LIST_URL +
      "?organization_id=" +
      organization_id +
      "&app=web";
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * This function will format panel list
   * */
  getFormattedPanelList(panelList, resetHideOnly: boolean) {
    for (let i = 0; i < panelList.length; i++) {
      panelList[i].hide = true;
      if (
        !resetHideOnly &&
        panelList[i].PanelOptions &&
        panelList[i].PanelOptions.length > 0
      ) {
        panelList[i].selectedOption = "";
      }
    }
  }

  /**
   * Function to perform controller web-service integration
   * @param data
   */
  updateProfile(data: any): Observable<any> {
    var path = AppSettings.UPDATE_PROFILE_URL;
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * This function will fetch all accessories list from API
   * */
  getCognitoId() {
    var path = AppSettings.GET_COGNITO_ID;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to perform controller web-service integration
   * @param data
   */
  getController(): Observable<any> {
    var path = AppSettings.CONTROLLER_LIST_URL;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to perform controller sensor/IO selection data
   * @param data
   */
  getControllerSensorIO(data: any): Observable<any> {
    var path = AppSettings.CONTROLLER_SENSOR_IO_URL + data;
    var payloadData = "";
    return this.restService
      .getCall(path, payloadData, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * To add 'hide' key in sensor item list
   * */
  private addHideKeyToSensorItem = item => {
    if (item) {
      item.hide = true;
    }

    if (item.childs && item.childs.length > 0) {
      for (let k = 0; k < item.childs.length; k++) {
        this.addHideKeyToSensorItem(item.childs[k]);
      }
    }
  };

  /**
   * To format sensor item list
   * */
  getFormattedSensorList(sensorList) {
    if (sensorList && sensorList.length > 0) {
      for (let i = 0; i < sensorList.length; i++) {
        this.addHideKeyToSensorItem(sensorList[i]);
      }
    }
    return sensorList;
  }

  /**
   * To format panel option list
   * */
  getFormattedPanelOptionList(panelList) {
    if (panelList && panelList.length > 0) {
      for (let i = 0; i < panelList.length; i++) {
        this.addHideKeyToSensorItem(panelList[i]);
      }
    }
    return panelList;
  }

  /**
   * To format flow direction list
   * */
  getFormattedFlowDirectionList(flowList) {
    if (flowList && flowList.length > 0) {
      for (let i = 0; i < flowList.length; i++) {
        this.addHideKeyToSensorItem(flowList[i]);
      }
    }
    return flowList;
  }

  /**
   * To format panel option list
   * */
  getFormattedAccessoriesList(accessoriesList) {
    if (accessoriesList && accessoriesList.length > 0) {
      for (let i = 0; i < accessoriesList.length; i++) {
        this.addHideKeyToSensorItem(accessoriesList[i]);
      }
    }
    return accessoriesList;
  }

  /**
   * This function will fetch all accessories list from API
   * */
  getFlowList(organization_id: any) {
    var path =
      AppSettings.GET_FLOW_DIRECTION_LIST_URL +
      "?organization_id=" +
      organization_id;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * This function will fetch all accessories list from API
   * */
  getPanelAccessories() {
    var path = AppSettings.GET_ACCESSORIES;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to Configure Quote
   * @param data
   * */
  configureQuote(data: any): Observable<any> {
    let path;

    this.isCreateNewAccessory = this.locstr.getObj("isCreateNewAccessory");
    if (this.isCreateNewAccessory) {
      path = AppSettings.CONFIGURE_QUOTE_ACCESSORIES;
    } else {
      if (
        data.selectedControllerSeries.tag == "WCT900P" ||
        data.selectedControllerSeries.tag == "WCT900H" ||
        data.selectedControllerSeries.tag == "WCT910H" ||
        data.selectedControllerSeries.tag == "WCT910P" ||
        data.selectedControllerSeries.tag == "WCT930P" ||
        data.selectedControllerSeries.tag == "WCT930H"
      ) {
        path = AppSettings.CONFIGURE_QUOTE_900;
      } else {
        path = AppSettings.CONFIGURE_QUOTE;
      }
    }
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to save configured quote
   * @param data
   * */
  saveQuote(data: any): Observable<any> {
    var path = AppSettings.SAVE_QUOTE;
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to Copy saved quote
   * @param data
   * */
  copyQuote(data: any): Observable<any> {
    var path = AppSettings.COPY_QUOTE;
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * This function will fetch all draft quote list
   * */
  getDraftQuoteList() {
    var path = AppSettings.DRAFT_QUOTE_LIST;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * This function will fetch all saved quote list
   * */
  getSavedQuoteList() {
    var path = AppSettings.SAVED_QUOTE_LIST;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to perform delete draft quote
   * @param data
   */
  deleteDraftQuote(data: any): Observable<any> {
    var path = AppSettings.DELETE_DRAFT_QUOTE;
    return this.restService
      .deleteCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to perform delete mutiple draft quote
   * @param data
   */
  deleteMultipleDraftQuote(data: any): Observable<any> {
    var path = AppSettings.DELETE_MULTIPLE_DRAFT_QUOTE;
    return this.restService
      .deleteCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to perform delete saved quote
   * @param data
   */
  deleteSavedQuote(data: any): Observable<any> {
    var path = AppSettings.DELETE_DRAFT_QUOTE;
    return this.restService
      .deleteCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to perform delete mutiple saved quote
   * @param data
   */
  deleteMultipleSavedQuote(data: any): Observable<any> {
    var path = AppSettings.DELETE_MULTIPLE_DRAFT_QUOTE;
    return this.restService
      .deleteCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to share congiigured quote via PDF
   * @param data
   * */
  shareQuote(data: any): Observable<any> {
    var path = AppSettings.QUOTE_PDF_SHARE;
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to get datasheet list
   * */
  getDatasheetList(data: any) {
    var path = AppSettings.GET_DATASHEET_LIST;
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Function to send email details
   * @param data
   * */
  sendEmailDetails(data: any): Observable<any> {
    var path = AppSettings.QUOTE_PDF_SHARE;
    return this.restService
      .postCall(path, data, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }
  /**
   * This function will fetch all saved quote list
   * */
  getUserAssociatedQuoteTypes() {
    var path = AppSettings.GET_USER_ASSOCIATED_QUOTETYPES;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  /**
   * Get users list
   */
  getUsersList(org_id) {
    var path = AppSettings.GET_ORG_USERS + "?organization_id=" + org_id;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }

  getSalesRepListWithLoggedInUser(organization_id) {
    var path =
      AppSettings.GET_SALES_REP_LIST_WITH_LOGGED_IN_USER + organization_id;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(this.commonService.handleError);
  }
}
