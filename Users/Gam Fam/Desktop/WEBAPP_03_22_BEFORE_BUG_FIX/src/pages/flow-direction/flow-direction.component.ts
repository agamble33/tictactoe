import {
  Component,
  OnInit,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

/*------------------------------- Providers -------------------------------------*/
import { LocalStorageService } from "../../providers/local-storage-service/local-storage.service";
import { SidebarService } from "../../providers/sidebar.service";
import { UserService } from "../../providers/user-service/user.service";
import { Constants } from "../../providers/app-settings-service/app-constant.service";
import { CommonService } from "../../providers/common-service/common.service";
import { QuoteService } from "../../providers/quote-service/quote-service.service";
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { ToastService } from "../../providers/common-service/toaster-service";

/*------------------------------- pipe -------------------------------------*/
import { OrderByPipe } from "../../pipes/sort/sort";

@Component({
  selector: "app-flow-direction",
  templateUrl: "./flow-direction.component.html",
  styleUrls: ["./flow-direction.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class flowDirection implements OnInit {
  @ViewChild("flowDesktopView") flowDesktopView: ElementRef;
  @ViewChild("flowBreadcrumbList") flowBreadcrumbList: ElementRef;
  @ViewChild("flowBtn") flowBtn: ElementRef;
  public flowHeight;
  public selectedControllerTitle: any;
  public selectedControllerSeries: any;

  public isTabSelected: boolean;
  list: Array<any> = [];
  invalidSelectionArray: Array<any> = [];
  flowList = [];
  flowOptions: any;
  showItemOptions: boolean = false;
  selectedFlowItem: any;
  previousFlowItem: any;
  isLoadFailed: boolean = false;
  isLoading: boolean = false;
  flowType: any;
  isDiscard: boolean = false;
  flowItemHolder: any;
  activeCorrosion: boolean = false;
  activePanelType;
  activePanel;
  public isValid;
  public isSaveDraftBtnClicked;
  public organizationId: any;
  public selectedPanelMaterial;
  public isPanelP2Enable = false; // this is isMTCPSelected
  public isPanelP3Enable = false;
  public isPanelP4Enable = false;
  public isPanelP5AEnable = false;
  public isPanelP5BEnable = false;
  public selectedSeries900;
  public topSectionHeight;

  constructor(
    private locstr: LocalStorageService,
    public sidebar: SidebarService,
    private userService: UserService,
    private toastService: ToastService,
    public constants: Constants,
    private broadcaster: Broadcaster,
    private commonService: CommonService,
    private router: Router,
    private quoteService: QuoteService,
    private cdr: ChangeDetectorRef
  ) {
    // organization id requred to getPanel option according to organization.
    if (this.locstr.getObj("loggedInUser")) {
      this.organizationId = this.locstr.getObj("loggedInUser").organizationId;
    }
  }

  ngOnInit() {
    //console.log();
    this.sidebar.show();
    this.isLoadFailed = false;
    this.isValid = false;
    this.isSaveDraftBtnClicked = false;
    // this.locstr.set('saveQuoteFlag', false);
    let controllerSeries;
    //Get selected controller and series to show it on header
    this.selectedControllerTitle = this.commonService.getCreateQuoteVo().selectedController.name;
    this.selectedControllerSeries = this.commonService.getCreateQuoteVo().selectedControllerSeries;
    this.selectedPanelMaterial = this.commonService.getCreateQuoteVo().selectedPanelMaterial;

    if (
      this.selectedControllerSeries.tag == "WCT900P" ||
      this.selectedControllerSeries.tag == "WCT900H" ||
      this.selectedControllerSeries.tag == "WCT910H" ||
      this.selectedControllerSeries.tag == "WCT910P" ||
      this.selectedControllerSeries.tag == "WCT930P" ||
      this.selectedControllerSeries.tag == "WCT930H"
    ) {
      this.selectedSeries900 = "WCT900P";
    }

    let activeFlowDirection;
    if (
      this.commonService.getCreateQuoteVo().selectedFlowDirections &&
      this.commonService.getCreateQuoteVo().selectedFlowDirections[0]
    ) {
      activeFlowDirection = this.commonService.getCreateQuoteVo()
        .selectedFlowDirections[0];
    }

    if (
      this.selectedPanelMaterial.tag == "PM-1" ||
      this.selectedPanelMaterial.tag == "PM-2" ||
      this.selectedPanelMaterial.tag == "PM-3"
    ) {
      this.isPanelP3Enable = true;
      //.log('WHERE IS DIASBALED1####------------',this.selectedPanelMaterial.tag)
      if (
        activeFlowDirection &&
        activeFlowDirection.isChecked &&
        (activeFlowDirection.tag == "PP4-A" ||
          activeFlowDirection.tag == "PP4-B" ||
          activeFlowDirection.tag == "PP2" ||
          activeFlowDirection.tag == "PP33" ||
          activeFlowDirection.tag == "PE1")
      ) {
        this.commonService.storeDataInCreateQuoteVo(
          "selectedFlowDirections",
          []
        );
      }
    } else if (
      this.selectedPanelMaterial.tag == "PM-7" ||
      this.selectedPanelMaterial.tag == "PM-8" ||
      this.selectedPanelMaterial.tag == "PM-9"
    ) {
      this.isPanelP4Enable = true;
      //console.log('WHERE IS DIASBALED2####------------',this.selectedPanelMaterial.tag)
      if (
        activeFlowDirection &&
        activeFlowDirection.isChecked &&
        (activeFlowDirection.tag == "PP3" ||
          activeFlowDirection.tag == "PP2" ||
          activeFlowDirection.tag == "PP33" ||
          activeFlowDirection.tag == "PE1")
      ) {
        this.commonService.storeDataInCreateQuoteVo(
          "selectedFlowDirections",
          []
        );
      }
    } else if (this.selectedPanelMaterial.tag == "PM-10") {
      this.isPanelP5AEnable = true;
      //console.log('WHERE IS DIASBALED3####------------',this.selectedPanelMaterial.tag)
      if (
        activeFlowDirection &&
        activeFlowDirection.isChecked &&
        activeFlowDirection.tag !== "PP33"
      ) {
        this.commonService.storeDataInCreateQuoteVo(
          "selectedFlowDirections",
          []
        );
      }
    } else if (this.selectedPanelMaterial.tag == "PM-11") {
      this.isPanelP5BEnable = true;
      //console.log('WHERE IS DIASBALED4####------------',this.selectedPanelMaterial.tag)
      if (
        activeFlowDirection &&
        activeFlowDirection.isChecked &&
        activeFlowDirection.tag !== "PE1"
      ) {
        this.commonService.storeDataInCreateQuoteVo(
          "selectedFlowDirections",
          []
        );
      }
    } else {
      this.isPanelP2Enable = true;
     // console.log('WHERE IS DIASBALED5####------------',this.selectedPanelMaterial.tag)
      if (
        activeFlowDirection &&
        activeFlowDirection.isChecked &&
        (activeFlowDirection.tag == "PP4-A" ||
          activeFlowDirection.tag == "PP4-B" ||
          activeFlowDirection.tag == "PP3" ||
          activeFlowDirection.tag == "PP33" ||
          activeFlowDirection.tag == "PE1")
      ) {
        this.commonService.storeDataInCreateQuoteVo(
          "selectedFlowDirections",
          []
        );
      }
    }

    // To get list of flow directions
    this.getFlowList();
    //console.warn('what',this.flowList)

    //If it is edit draft set new quoteId and quoteNo which is already saved as draft
    if (
      this.commonService.getCreateQuoteVo().draftPath == "/flowDirection" &&
      this.commonService.getCreateQuoteVo().isEditDraftQuote
    ) {
      if (this.commonService.getCreateQuoteVo().isEditDraftQuote) {
        this.locstr.set("quoteId", this.commonService.getCreateQuoteVo().id);
        this.locstr.set(
          "quoteNo",
          this.commonService.getCreateQuoteVo().quoteNo
        );
      }
    }
  }

  ngAfterViewInit() {
    let height = this.flowDesktopView.nativeElement.offsetHeight;
    let topBottomSpace = 40;
    this.flowHeight = height - topBottomSpace;
    setTimeout(() => {
      let breadCrumbbtnHeight;
      let breadCrumbHeight;
      breadCrumbHeight = this.flowBreadcrumbList.nativeElement.offsetHeight;
      breadCrumbbtnHeight = this.flowBtn.nativeElement.offsetHeight;
      if (window.orientation == 0) {
        this.topSectionHeight = breadCrumbHeight + 104;
        if (window.innerWidth > 768) {
          this.topSectionHeight = breadCrumbHeight + breadCrumbbtnHeight + 68;
        }
      } else {
        this.topSectionHeight = breadCrumbHeight + breadCrumbbtnHeight + 68;
      }
      this.cdr.detectChanges();
    }, 500);
  }

  /**
   * Function to save as draft
   * @param isDraft
   */
  saveDraft(isDraft: boolean, draftPath: string, isRouteChange?: boolean) {
    this.directionSelectionValidCheck();
    if (!this.isValid) {
      this.quoteService.saveQuote(isDraft, draftPath, isRouteChange);
    }
  }

  /**
   * Function to check if quote already saved as draft and
   * switching to another tab then
   *  it will not show confirmation popup for save as draft
   **/
  saveDraftBtnClicked() {
    this.isSaveDraftBtnClicked = true;
  }

  /**
   * This function of router guard, will check if state can be deactivated
   * */
  canDeactivate(
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) {
    if (
      !this.commonService.isCreateQuoteRoute(nextState["url"]) &&
      !this.isSaveDraftBtnClicked
    ) {
      if (nextState["url"] === "/") {
        // logout option selected
        return true;
      } else {
        return Observable.create((observer: Observer<boolean>) => {
          if (
            this.locstr.get("isEditViewedQuote") === "false" &&
            this.locstr.get("fromViewQuoteOnlyView") === "false" &&
              this.locstr.get("shareQuoteFromViewQuote") === "false"
          ) {
            this.commonService.showFlowDiscardConfirm(
              () => {
                // yes callback -> save quote as draft
                this.saveDraft(true, "/flowDirection", true);
                this.broadcaster
                  .on<any>("ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS")
                  .subscribe(message => {
                    observer.next(true);
                    observer.complete();
                  });
              },
              () => {
                // Discard callback -> remove all locally stored create quote data
                // this.commonService.clearCreateRouteData();
                observer.next(true);
                observer.complete();
              },
              () => {
                // cross button callback -> stay on page
                observer.next(false);
                observer.complete();
              }
            );
          } else {
            observer.next(true);
            observer.complete();
            this.locstr.set("shareQuoteFromViewQuote", false);
            this.locstr.set("fromViewQuoteOnlyView", false);
          }
        });
      }
    } else {
      return true;
    }
  }

  /**
   * Function to get flow directions data
   * */
  protected getFlowList = () => {
    this.isLoading = true;
    this.isLoadFailed = false;
    this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
    this.userService.getFlowList(this.organizationId).subscribe(
      res => {
        if (res.status == "success") {
          this.flowList = res.data;

          this.flowList.forEach(arrayItem => {
            arrayItem.is_checkBox = false;
          });
          //console.log('WHO', this.flowList)
          // show selected flow directions
          if (
            this.commonService.getCreateQuoteVo() &&
            this.commonService.getCreateQuoteVo().selectedFlowDirections
          ) {
            let selectedFlowDirection: any = this.commonService.getCreateQuoteVo()
              .selectedFlowDirections;
            if (
              this.flowList &&
              this.flowList.length > 0 &&
              selectedFlowDirection && selectedFlowDirection.length > 0
            ) {
              for (let i = 0; i < selectedFlowDirection.length; i++) {
                for (let j = 0; j < this.flowList.length; j++) {
                  if (selectedFlowDirection[i].id === this.flowList[j].id) {
                    this.setFlowSelection(
                      this.flowList[j],
                      selectedFlowDirection[i]
                    );
                    break;
                  }
                }
              }
            }
          }
          let allPanelListObj = this.commonService.getCreateQuoteVo()
            .panelListArray;

          for (let i = 0; i < allPanelListObj.length; i++) {
            if (
              allPanelListObj[i].tag == "CCR" &&
              allPanelListObj[i].isChecked
            ) {
              this.activeCorrosion = true;
              for (let i = 0; i < this.flowList.length; i++) {
                if (
                  this.flowList[i].tag == "PP2" &&
                  this.flowList[i].isChecked
                ) {
                  this.flowList[i].isChecked = false;
                }
              }
            }
          }
          this.userService.getFormattedFlowDirectionList(this.flowList);
        } else {
          this.isLoadFailed = true;
        }
        this.isLoading = false;
        this.commonService.hideLoading();
      },
      error => {
        this.isLoading = false;
        this.isLoadFailed = true;
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
  };

  /**
   * set flow directions selection using locally saved item
   * */
  setFlowSelection(flowItem: any, localSavedItem: any) {
    flowItem.isChecked = localSavedItem.isChecked;
    if (flowItem.childs && flowItem.childs.length > 0) {
      if (localSavedItem.childs && localSavedItem.childs.length > 0) {
        for (let i = 0; i < flowItem.childs.length; i++) {
          for (let j = 0; j < localSavedItem.childs.length; j++) {
            if (flowItem.childs[i].id == localSavedItem.childs[j].id) {
              this.setFlowSelection(
                flowItem.childs[i],
                localSavedItem.childs[j]
              );
              break;
            }
          }
        }
      }
    }
  }
  /**
   * This function will be called on flow directions select
   * */
  selectFlowItem(item: any, itemList: any) {
    this.list = [];

    if (this.previousFlowItem) {
      this.previousFlowItem.hide = true;
    }

    // If list has no childs check i
    if (item && item.childs && item.childs.length == 0) {
      item.isChecked = !item.isChecked;
      item.hide = !item.hide;
    } else {
      this.checkSelectionType(item);
      this.list = this.list.concat(item.childs);
      item.isChecked = true;
      item.hide = false;
      itemList.forEach(arrayItem => {
        if (arrayItem.id != item.id) {
          arrayItem.isChecked = false;
          arrayItem.hide = true;
        }
      });
      this.isTabSelected = item.isChecked ? true : false;
      item.isSelectedTab = this.isTabSelected;
    }
    this.previousFlowItem = item;
  }

  /**
   *  Based on items selection flag( if checkbox = is_checkBox ; if radio = !is_checkBox)
   **/
  checkSelectionType(item: any) {
    let childTypeValue;
    let typeClass;
    if (item && item.childs && item.childs.length > 0) {
      for (let j = 0; j < item.childs.length; j++) {
        if (item.childs[j].is_checkBox) {
          childTypeValue = "checkbox";
          typeClass = "checkboxControl";
        } else {
          childTypeValue = "radio";
          typeClass = "radioControl";
        }

        item.childs[j].childType = childTypeValue;
        item.childs[j].typeClass = typeClass;
      }
    }
  }

  /**
   * Function called on controller communication options selection
   **/
  radioSelection(item: any, list: any) {
    //console.log("item..", item, "list....", list);
    item.isChecked = true;
    for (let i = 0; i < list.length; i++) {
      if (list[i].tag != item.tag) {
        list[i].isChecked = false;
      }
      // if(list && list[i].childs.length > 0){
      //     for (let j = 0; j < list[i].childs.length; j++) {
      //         list[i].childs[j].hide = false;
      //     }
      // }
    }
  }

  /**
   * This function will be show flow directions
   * */
  selectPanelItem(list: any) {
    this.activePanelType = list.id;
    list.hide = !list.hide;
  }

  /**
   * This function will be called on flow directions child item select
   * */
  onItemSelect(list: any) {
    list.isChecked = !list.isChecked;
  }

  /**
   * This function will be called on panel child item select for single select
   * */
  onItemCheck = (list, listItem) => {
    let childActive = false;

    // console.log("on item check..", list, "list item....", listItem)
    for (let i = 0; i < listItem.childs.length; i++) {
      if (listItem.childs[i].isChecked) {
        childActive = true;
      }
    }

    if (childActive) {
      listItem.isChecked = false;
    } else {
      listItem.isChecked = true;
    }

    list.forEach(item => {
      if (item.id != listItem.id) {
        item.isChecked = false;
      }
    });

    this.checkSelectionType(listItem);
  };

  /**
   * This function will be reset invalid flow directions selection
   * */
  resetFlowItem(item: any) {
    if (item && item.isChecked) {
      item.isChecked = false;
      if (item.childs && item.childs.length > 0) {
        for (let i = 0; i < item.childs.length; i++) {
          this.resetFlowItem(item.childs[i]);
        }
      }
    }
  }

  //Get the flow direction types
  getFlowType = item => {
    this.flowType = item.childs.filter(item => {
      return item.isChecked;
    });
  };

  /**
   * This function will be called on 'Next' button
   * */
  directionSelectionValidCheck = () => {
    //set object to get selected flow directions if route changes
    var selectedFlowList = this.flowList.filter(item => {
      if (item.isChecked) {
        this.getFlowType(item);
        return item.isChecked;
      }
    });

    if (selectedFlowList.length == 1 && this.flowType.length == 1) {
      this.isValid = false;
      this.commonService.storeDataInCreateQuoteVo(
        "selectedFlowDirections",
        selectedFlowList
      );
    } else {
      this.isValid = true;
      this.commonService.showAlert(
        "Alert",
        "Please select flow direction item.",
        "OK",
        () => {
          // Ok click code will be here
        }
      );
    }
  };

  /**
   * Function to call on next button
   **/
  onNext() {
    this.directionSelectionValidCheck();
    if (!this.isValid) {
      //this flag set to check navigation to accessories page from dashborad or creatwe new quote
      // set true in dashboard and set false in here.
      this.locstr.setObj("isCreateNewAccessory", false);
      this.locstr.removeObj("disclaimerAndNotes");
      // flow directions selection valid, navigate to accessories screen
      this.router.navigate(["/accessories"]);
    }
  }

  /**
   * To show discard prompt
   * */
  showDiscardPrompt(messageText: string) {
    let titleText: string = "Warning";
    let cancelText: string = "Cancel";
    let okText: string = "Ok";
    this.commonService.showConfirm(
      titleText,
      messageText,
      cancelText,
      okText,
      () => {
        // flow directions discard code will be here
        let notSelectedItem = [];
        for (let i = 0; i < this.flowList.length; i++) {
          if (this.invalidSelectionArray.length) {
            for (let j = 0; j < this.invalidSelectionArray.length; j++) {
              if (this.flowList[i].id == this.invalidSelectionArray[j].flowId) {
                this.resetFlowItem(this.flowList[i]);
                this.isTabSelected = false;
                this.flowList[i].hide = true;
              } else if (!this.flowList[i].hide) {
                this.isTabSelected = true;
              }
            }
          }
        }
      }
    );
  }

  /**
   * This function will be called to check if flow directions selection invalid
   * */
  isFlowSelectionValid = () => {
    this.isDiscard = false;
    this.invalidSelectionArray = [];

    if (this.flowList && this.flowList.length > 0) {
      let isFlowItemSelected: boolean = false;
      for (let i = 0; i < this.flowList.length; i++) {
        if (this.flowList[i].isChecked) {
          isFlowItemSelected = true;
          this.recursionFunction(this.flowList[i], true);
        }
      }
      if (!isFlowItemSelected) {
        return {
          isValid: false,
          reason: "No Flow Direction Item selection"
        };
      }
      if (this.isDiscard && this.invalidSelectionArray.length > 0) {
        return {
          isValid: false,
          reason: "Invalid Flow Direction Item selection"
        };
      }
      return {
        isValid: true,
        reason: "Valid Flow Direction Item selection"
      };
    }
  };

  /**
   * This function will be used to check invalid flow directions recursively
   * */
  recursionFunction(item: any, isFlowCall: boolean) {
    if (isFlowCall) {
      // This will hold flow directions Item and get pushed if flow directions has invalid selection
      this.flowItemHolder = {
        flowId: item.id,
        flowName: item.name
      };
    }
    if (item && item.childs && item.childs.length == 0) {
      if (!item.isChecked) {
        // Last child item, which is not selected, but parents are selected, show discard message
        this.isDiscard = true;
        this.invalidSelectionArray.push(this.flowItemHolder);
      } // else flow directions last child is selected
    } else {
      if (item.childs && item.childs.length > 0) {
        let isChildSelected: boolean = false;
        for (let i = 0; i < item.childs.length; i++) {
          if (item.childs[i].isChecked) {
            isChildSelected = true;
            break;
          }
        }
        if (isChildSelected) {
          for (let k = 0; k < item.childs.length; k++) {
            if (item.childs[k].isChecked) {
              this.recursionFunction(item.childs[k], false);
            }
          }
        } else {
          // My child not selected, discard message
          this.isDiscard = true;
          this.invalidSelectionArray.push(this.flowItemHolder);
        }
      } else {
        // Child not defined
        if (!item.isChecked) {
          // Last child item, which is not selected, but parents are selected, show discard message
          this.isDiscard = true;
          this.invalidSelectionArray.push(this.flowItemHolder);
        } // else flow directions last child is selected
      }
    }
  }

  /**
   * coming soon pop-up
   * */
  commingSoonPopup() {
    this.commonService.showAlert(
      "Info",
      this.constants.COMMING_SOON_MSG,
      "OK",
      () => {
        // Ok click code will be here
      }
    );
  }
}
