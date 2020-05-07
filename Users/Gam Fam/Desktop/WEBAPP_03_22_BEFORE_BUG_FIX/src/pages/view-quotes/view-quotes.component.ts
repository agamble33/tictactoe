import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  HostListener,
  ViewChild
} from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
/*-------------------------------- Providers ----------------------------------*/
import { SidebarService } from "../../providers/sidebar.service";
import { ViewQuoteServiceService } from "../../providers/view-quote-service/view-quote.service";
import { CommonService } from "../../providers/common-service/common.service";
import { ToastService } from "../../providers/common-service/toaster-service";
import { Constants } from "../../providers/app-settings-service/app-constant.service";
import { LocalStorageService } from "../../providers/local-storage-service/local-storage.service";
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDateParserFormatter
} from "@ng-bootstrap/ng-bootstrap";
import { LocalPaginationService } from "../../providers/pagination-service/local-pagination.service";
import { UserService } from "../../providers/user-service/user.service";
import { min } from "rxjs/operator/min";
import { SearchPipe } from "../../pipes/table-filter/table-filter";
import { SortingColumnsPipe } from "../../pipes/sort/sort-column";
@Component({
  selector: "app-view-quotes",
  templateUrl: "./view-quotes.component.html",
  styleUrls: ["./view-quotes.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ViewQuotesComponent implements OnInit {
  @ViewChild("fromDatepicker") fromDatepicker: ElementRef;
  @ViewChild("toDatepicker") toDatepicker: ElementRef;

  public dateRange: any = {
    from: null,
    to: null
  };
  public errorMsg = "";
  public webServiceError;
  public quoteList = [];
  public search: any = "";
  public searchField: any = "all";
  public viewQuoteList = [];
  public salesUserslist = [];
  public loading = false;
  public quotesUser: any = "0";
  public displayForUser = [];
  // array of all items to be paged
  private allItems: any[];
  // pager object
  pager: any = {};
  // paged items
  pagedItems: any[];
  // items per page
  pageSize: number = 10;
  defaultColumnSort = "updated_at";
  defaultSort = "updated_at";
  path: string[] = [this.defaultSort];
  order: number = 1; // 1 asc, -1 desc;
  filterData: any = {
    formDate: null,
    toDate: null,
    quotesUser: "",
    searchField: "",
    search: ""
  };
  loginUserObj;
  currentDate;
  previousDate;
  public text;

  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   if(!this.fromDatepicker.nativeElement.contains(event.target)) {
  //     this.text = "clicked inside";
  //     console.log("this.text", this.text);
  //     from.close();
  //   } else if(!this.toDatepicker.nativeElement.contains(event.target)){
  //     this.text = "clicked outside";
  //     console.log("this.text", this.text);
  //     to.close();
  //   }else{

  //   }
  // }

  constructor(
    private locstr: LocalStorageService,
    public sidebar: SidebarService,
    private viewQuoteServiceService: ViewQuoteServiceService,
    private commonService: CommonService,
    private searchPipe: SearchPipe,
    private sortingColumnsPipe: SortingColumnsPipe,
    private toastService: ToastService,
    public constants: Constants,
    private router: Router,
    private ngbDateParserFormatter: NgbDateParserFormatter,
    private broadcaster: Broadcaster,
    private localPaginationService: LocalPaginationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.sidebar.show();
    this.currentDate = new Date();
    this.dateRange.to = {
      day: this.currentDate.getDate(),
      month: this.currentDate.getMonth() + 1,
      year: this.currentDate.getFullYear()
    };
    let todaysDate = new Date(this.currentDate);
    let date = todaysDate.setDate(todaysDate.getDate() + 1);
    this.previousDate = new Date(date);
    /* date range has 60 days limit */
    this.previousDate.setDate(this.previousDate.getDate() - 59);
    //console.log("newdate.....", this.previousDate);
    this.dateRange.from = {
      day: this.previousDate.getDate(),
      month: this.previousDate.getMonth() + 1,
      year: this.previousDate.getFullYear()
    };

    this.loginUserObj = this.userService.getUser();
    if (this.loginUserObj.role == "USER") {
      this.quotesUser = this.loginUserObj.user_identity_id;
    } else {
      this.quotesUser = "0";
    }
    // console.log("loginUserObj", this.loginUserObj);
    // if (this.loginUserObj.role == 'ORG_ADMIN') {
    //   this.locstr.setObj('userView', true);
    //   this.quotesUser = this.loginUserObj.user_identity_id;
    //   this.getQuotationList(true);
    // } else {
    //   this.locstr.setObj('userView', false);
    //   this.getQuotationList(false);
    // }

    this.getQuotationList(false);
  }

  onSubmit(form) {
    if (form.valid) {
      //     quotesUser = this.loginUserObj.user_identity_id;

      let initialFromDate = new Date("2019-01-01");
      let fromDate = new Date(
        this.ngbDateParserFormatter.format(this.dateRange.from)
      );
      let toDate = new Date(
        this.ngbDateParserFormatter.format(this.dateRange.to)
      );
     // console.log("fromDate...1111", fromDate);
      let diffTime = toDate.getTime() - fromDate.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
     // console.log("diffDays...", diffDays);
      if (fromDate < initialFromDate) {
        this.errorMsg = "Please select 'From' value as 01/01/2019 or above";
      } else {
        if (diffDays > 0 && diffDays < 100) {
          this.errorMsg = "";
          // this.quotesUser =  this.loginUserObj.user_identity_id;
          this.searchField = "all";
          this.search = "";
          this.getQuotationList(false);
        } else {
          if (diffDays < 1) {
            this.errorMsg =
              "'From' date should be less than/equal to 'To' date";
          } else {
            this.errorMsg = "Date range should be between 100 days";
          }
        }
      }
    } else {
      this.errorMsg = "Please enter dates";
    }
  }

  getQuotationList(item?) {
    let viweQuote = this.locstr.getObj("viweQuote");
    let filterViewdata;
    if (viweQuote) {
      filterViewdata = this.locstr.getObj("viweQuoteFilterData");
      if (filterViewdata) {
        //console.log("filterViewdata....", filterViewdata);
        this.dateRange.from = filterViewdata.fromDate;
        this.dateRange.to = filterViewdata.toDate;
      }
    }
    this.commonService.showLoading("Loading...");
    this.loading = true;
    let fromDate = new Date(
      this.ngbDateParserFormatter.format(this.dateRange.from)
    );
    let endDate = new Date(
      this.ngbDateParserFormatter.format(this.dateRange.to)
    );
    let toDate = new Date(endDate.setDate(endDate.getDate() + 1));
    //console.log("toDate.......", toDate);
    let from =
      fromDate.getFullYear() +
      "-" +
      (fromDate.getMonth() + 1) +
      "-" +
      fromDate.getDate();
    let to =
      toDate.getFullYear() +
      "-" +
      (toDate.getMonth() + 1) +
      "-" +
      toDate.getDate();
    this.viewQuoteServiceService.getQuotationList(from, to).subscribe(
      res => {
        this.commonService.hideLoading();
        this.loading = false;
        if (res.status == "success") {
          this.quoteList = res.data;
          this.displayQuotesFor();

          this.getSalesUsers();
          for (let i = 0; i < this.quoteList.length; i++) {
            let updated_at = new Date(this.quoteList[i].updated_at),
              dayNo = updated_at.getDate(),
              monthNo = updated_at.getMonth() + 1,
              year = updated_at.getFullYear(),
              day,
              month,
              time;
            if (dayNo < 10) {
              day = "0" + dayNo;
            } else {
              day = dayNo;
            }
            if (monthNo < 10) {
              month = "0" + monthNo;
            } else {
              month = monthNo;
            }

            time = updated_at.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true
            });
            this.quoteList[i].updated_at =
              month + "/" + day + "/" + year + " " + time + " CST";

            if (this.quoteList[i].is_draft) {
              this.quoteList[i].status = "Draft";
            } else {
              this.quoteList[i].status = "Final";
            }
          }
        } else {
          // this.quoteList = [];
        }
        this.viewQuoteList = this.quoteList;
        this.allItems = this.quoteList;
        if (viweQuote) {
          if (filterViewdata) {
            this.quotesUser = filterViewdata.quotesUser;
            this.searchField = filterViewdata.searchField;
            this.search = filterViewdata.search;
            let currentSortColumn = this.locstr.getObj("currentSortColumn");
            this.sortTable(currentSortColumn);
            let currentPageNo = this.locstr.getObj("currentPageNo");
            this.setPage(currentPageNo);
          }
          this.locstr.setObj("viweQuote", false);
          this.locstr.setObj("viweQuoteFilterData", {});
        } else {
          this.sortTable(this.defaultColumnSort, true);
          // initialize to page 1
          this.setPage(1);
        }
        if (item) {
          this.displayQuotesFor();
        }
      },
      error => {
        this.loading = false;
        this.commonService.hideLoading();
        let errorResponse;
        if (error) {
          if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
            errorResponse = error;
          } else {
            errorResponse = error.json();
          }
        }

        if (
          errorResponse &&
          errorResponse != undefined &&
          errorResponse.statusCode == 401
        ) {
          this.commonService.showAlert(
            "Error",
            errorResponse.error,
            "OK",
            () => {
              this.commonService.logout();
            }
          );
        } else {
          // Error message for back-end If data not matched
          if (error && error != undefined) {
            this.webServiceError = error.message;
            this.toastService.popToast("error", this.webServiceError);
          }
        }
      }
    );
  }

  getSalesUsers() {
    let list = this.quoteList,
      listLength = list.length;
    this.salesUserslist = this.salesUserslist.filter(user => {
      if (user.organization_id === this.loginUserObj.organizationId) {
        return true;
      }
      return false;
    });
    //this.salesUserslist = [];
    for (let i = 0; i < listLength; i++) {
      if (list[i].SalesMan) {
        let userList = this.salesUserslist.length;
        if (userList > 0) {
          let userFound = false;
          for (let j = 0; j < userList; j++) {
            if (this.salesUserslist[j].id == list[i].SalesMan.id) {
              userFound = true;
            }
          }
          if (!userFound) {
            this.salesUserslist.push(list[i].SalesMan);
          }
        } else {
          this.salesUserslist.push(list[i].SalesMan);
        }
      }
    }

    this.salesUserslist = this.salesUserslist.filter(user => {
      if (user.organization_id === this.loginUserObj.organizationId) {
        return true;
      }
      return false;
    });

    let quoteUser = false;
    for (let j = 0; j < this.salesUserslist.length; j++) {
      if (this.salesUserslist[j].id == this.loginUserObj.user_identity_id) {
        quoteUser = true;
        //console.log("user found");
      } else {
        //console.log("user not found");
      }
    }
    if (!quoteUser) {
      this.quotesUser = "0";
    }
  }

  displayQuotesFor() {
    // this.quotesUser = this.loginUserObj.user_identity_id;
    this.displayForUser = [];
    let list = this.quoteList,
      listLength = list.length;
    //console.log('where', this.quoteList);

    if (this.quotesUser == "0") {
      // console.log("ALL USERS SELCTED")
      // all users is slected since userId === 0
      const orgaizationId = this.loginUserObj.organizationId;
      for (let i = 0; i < listLength; i++) {
        // console.log(orgaizationId, list[i].SalesMan && list[i].SalesMan.organization_id == orgaizationId);
        if (
          list[i].SalesMan &&
          list[i].SalesMan.organization_id == orgaizationId
        ) {
          //console.log("PUSHED IN ARRAy")
          this.displayForUser.push(list[i]);
        } else if (this.quotesUser == "0") {
          //          this.displayForUser = this.quotesUser;
        }
      }
    } else {
      // if userId !== 0 which means there is a selected user
      for (let i = 0; i < listLength; i++) {
        if (list[i].SalesMan && list[i].SalesMan.id == this.quotesUser) {
          this.displayForUser.push(list[i]);
        } else if (this.quotesUser == "0") {
          // if (this.loginUserObj.organizationId == list[i].SalesMan.organization_id) this.displayForUser.push(list[i])
          this.displayForUser = this.quotesUser;
        }
      }
    }
    //console.warn(this.displayForUser);
    this.viewQuoteList = this.displayForUser;
    this.allItems = this.displayForUser;
    // initialize to page 1
    this.setPage(1);
  }

  setPage(page: number, isSearchTable?) {
    this.quotesUser = this.loginUserObj.user_identity_id;
    this.locstr.setObj("currentPageNo", page);
    if (this.allItems) {
      // get pager object from service
      this.pager = this.localPaginationService.getPager(
        this.allItems.length,
        page,
        this.pageSize
      );
      //console.log("pager.....", this.pager);
      // get current page of items
      this.pagedItems = this.allItems.slice(
        this.pager.startIndex,
        this.pager.endIndex + 1
      );
      if (isSearchTable) {
      } else {
        this.viewQuoteList = this.pagedItems;
      }

      // console.log("this.pagedItems.....", this.pagedItems);
    }
  }

  sortTable(prop: string, initialSort?) {
    let searchData;
    if (this.quotesUser != "0") {
      searchData = this.displayForUser;
    } else {
      searchData = this.quoteList;
    }

    this.locstr.setObj("currentSortColumn", prop);
    this.path = prop.split(".");
    //console.log("path", this.path[0]);
    if (initialSort) {
      this.order = -1; // change order
    } else {
      this.order = this.order * -1; // change order
    }
    let sortedItems = this.sortingColumnsPipe.transform(
      searchData,
      this.path,
      this.order
    );
    this.allItems = sortedItems;
    this.viewQuoteList = sortedItems;
    // initialize to page 1
    this.setPage(1);
    // return false; // do not reload
  }

  editQuote(quote, isViewQuote) {
    // console.log("selected quote.......", quote);
    if (isViewQuote) {
      this.locstr.set("fromViewQuoteOnlyView", true);
      this.broadcaster.broadcast(
        "ON_VIEW_QUOTE_DISABLE_EDIT_ICON",
        "disable edit icon"
      );
    } else {
      this.locstr.set("fromViewQuoteOnlyView", false);
      this.broadcaster.broadcast(
        "ON_VIEW_QUOTE_ENABLE_EDIT_ICON",
        "enable edit icon"
      );
      this.locstr.set("isEditViewedQuote", true);
    }

    this.getSelectedQuoteData(quote.id);
  }

  shareQuote(quote) {
    this.getSelectedQuoteData(quote.id);
    this.locstr.set("shareQuoteFromViewQuote", true);
  }

  shareQuoteH2(quote) {
    this.getSelectedQuoteData(quote.id);
    this.locstr.set("shareQuoteH2FromViewQuote", true);
  }

  searchTable() {
   // console.log("1 viewQuoteList...");
    this.allItems = [];
    // if(this.search) {
    //   let searchedItems = this.searchPipe.transform(this.quoteList, this.searchField, this.search);
    //   console.log('2 viewQuoteList...', searchedItems);
    //   if (searchedItems) {
    //     this.allItems = searchedItems;
    //     this.viewQuoteList = searchedItems;
    //     console.log('3 viewQuoteList...', this.allItems);
    //     // initialize to page 1

    //   }
    // } else {
    //   if(this.quotesUser == "0") {
    //     this.allItems = this.quoteList;
    //     this.viewQuoteList = this.quoteList;
    //   } else {
    //     this.allItems = this.displayForUser;
    //     this.viewQuoteList = this.displayForUser;
    //   }
    // }
    let searchData;
    if (this.quotesUser != "0") {
      searchData = this.displayForUser;
    } else {
      searchData = this.quoteList;
    }
    let searchedItems = this.searchPipe.transform(
      searchData,
      this.searchField,
      this.search
    );
    // console.log('2 viewQuoteList...', searchedItems);

     ///console.log('3 viewQuoteList...', this.allItems);
    // initialize to page 1

    if (searchedItems) {
      this.allItems = searchedItems;
      this.viewQuoteList = searchedItems;
    } else {
      this.allItems = [];
      this.viewQuoteList = [];
    }
   // console.log('4 viewQuoteList...', this.viewQuoteList);

    this.setPage(1);
  }

  seachField() {
    if (this.search) {
      this.searchTable();
    }
  }

  /**
   * Function to edit quote
   * @param quote
   */
  getSelectedQuoteData(quoteId) {
    this.viewQuoteServiceService.getQuote(quoteId).subscribe(
      res => {
        this.commonService.hideLoading();
        this.loading = false;
        if (res.status == "success") {
          let editQuoteData;
          let createVo;
           //console.log("quoteData........", res);
          editQuoteData = res.data.input.createQuoteVo;
          editQuoteData.id = res.data.id;
          if (res.data.is_draft) {
            editQuoteData.isEditDraftQuote = true;
            editQuoteData.isEditSavedQuote = false;
          } else {
            editQuoteData.isEditSavedQuote = true;
            editQuoteData.isEditDraftQuote = false;
          }
          editQuoteData.quoteNo = res.data.quote_no;
          editQuoteData.parts = res.data.input.parts;
          editQuoteData.draftPath = res.data.input.draftPath;
          editQuoteData.note = res.data.input.note;
          editQuoteData.disclaimer = res.data.input.disclaimer;
          editQuoteData.isAccessories = res.data.input.isAccessories;

          //this flag set to check navigation to accessories page from dashborad or create new quote
          // set true in here and set false in flow-direction component.
          if (res.data.input.isAccessories) {
            this.locstr.setObj("isCreateNewAccessory", true);
          } else {
            this.locstr.setObj("isCreateNewAccessory", false);
          }

          let copyofGetCreateQuoteVo = JSON.parse(
            JSON.stringify(this.commonService.getCreateQuoteVo())
          );
          this.locstr.setObj("copyofGetCreateQuoteVo", copyofGetCreateQuoteVo);
          if (res.data) {
            this.commonService.setCreateQuoteVo(editQuoteData);
            this.broadcaster.broadcast(
              "ON_EDIT_QUOTE",
              editQuoteData.projectDetails
            );
            this.locstr.set("saveQuoteFlag", true);
            this.storePreviousFilterData(); // function to store previous data
            this.router.navigate([res.data.input.draftPath]);
          }
        }
      },
      error => {
        this.loading = false;
        this.commonService.hideLoading();
        let errorResponse;
        if (error) {
          if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
            errorResponse = error;
          } else {
            errorResponse = error.json();
          }
        }
        if (
          errorResponse &&
          errorResponse != undefined &&
          errorResponse.statusCode == 401
        ) {
          this.commonService.showAlert(
            "Error",
            errorResponse.error,
            "OK",
            () => {
              this.commonService.logout();
            }
          );
        } else {
          // Error message for back-end If data not matched
          if (error && error != undefined) {
            this.webServiceError = error.message;
            this.toastService.popToast("error", this.webServiceError);
          }
        }
      }
    );
  }

  /**
   * Function to Delete Quote
   **/
  deleteQuote(quote: any) {
    this.commonService.showConfirm(
      "",
      "Are you sure you want to delete Quote?",
      "Cancel",
      "Ok",
      () => {
        this.commonService.showLoading("Loading...");
        this.userService.deleteSavedQuote(quote.id).subscribe(
          res => {
            if (res.status == "success") {
              this.commonService.hideLoading();
              // console.log("delted...", res);
              //delete quote success toast
              this.getQuotationList(true);
              this.toastService.popToast("success", res.message);
            }
          },
          error => {
            this.commonService.hideLoading();
            let errorResponse;
            if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
              errorResponse = error;
            } else {
              errorResponse = error.json();
            }
            if (
              errorResponse &&
              errorResponse != undefined &&
              errorResponse.statusCode == 401
            ) {
              this.commonService.showAlert(
                "Error",
                errorResponse.error,
                "OK",
                () => {
                  this.commonService.logout();
                }
              );
            } else {
              // Error message for back-end If data not matched
              if (error && error != undefined) {
                this.toastService.popToast("error", error.message);
              }
            }
          }
        );
      }
    );
  }

  storePreviousFilterData() {
    this.locstr.setObj("viweQuote", true);
    this.filterData = {
      fromDate: this.dateRange.from,
      toDate: this.dateRange.to,
      quotesUser: this.quotesUser,
      searchField: this.searchField,
      search: this.search
    };
    this.locstr.setObj("viweQuoteFilterData", this.filterData);
  }
}
