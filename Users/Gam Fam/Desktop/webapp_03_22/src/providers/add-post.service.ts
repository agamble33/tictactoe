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
import { AppSettings } from "./app-settings-service/app-settings.service";
import { Constants } from "./app-settings-service/app-constant.service";
import { LocalStorageService } from "./local-storage-service/local-storage.service";
import { RestService } from "./rest-service/rest.service";
import { CommonService } from "./common-service/common.service";
/*-------------------- Providers ----------------------------*/

@Injectable()
export class AddPostService {
  constructor(
    private restService: RestService,
    public locstr: LocalStorageService,
    private constant: Constants,
    private commonService: CommonService,
    private router: Router
  ) {}
  private handleError = (errorResponse: Response | any) => {};

  // addPost(data: any): Observable<any> {
  //   console.log("CAlling addPost");
  //   var path = AppSettings.UPDATE_POST_URL;
  //   return this.restService
  //     .postCall(path, data, false, null)
  //     .map(res => res.json())
  //     .catch(error => Observable.throw(error));
  // }

  getPost(): Observable<any> {
    console.log("CAlling hetPost");
    var path = AppSettings.UPDATE_POST_URL;
    return this.restService
      .getCall(path, null, false, null)
      .map(res => res.json())
      .catch(error => Observable.throw(error));
  }

  // getAllPosts(){

  // }

  // getPost(){

  // }
}
