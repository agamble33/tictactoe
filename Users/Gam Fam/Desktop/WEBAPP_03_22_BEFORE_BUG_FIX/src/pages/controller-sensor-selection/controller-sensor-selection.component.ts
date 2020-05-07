import { MyProfileComponent } from "./../my-profile/my-profile.component";
import {
    Component,
    OnInit,
    ViewEncapsulation,
    ElementRef,
    ViewChild,
    ChangeDetectorRef,
} from "@angular/core";
import { Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

/*------------------------------- Providers -------------------------------------*/
import { LocalStorageService } from "../../providers/local-storage-service/local-storage.service";
import { Constants } from "../../providers/app-settings-service/app-constant.service";
import { SidebarService } from "../../providers/sidebar.service";
import { CommonService } from "../../providers/common-service/common.service";
import { UserService } from "../../providers/user-service/user.service";
import { QuoteService } from "../../providers/quote-service/quote-service.service";
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { ToastService } from "../../providers/common-service/toaster-service";

/*------------------------------- pipe -------------------------------------*/
import { OrderByPipe } from "../../pipes/sort/sort";
import { IfObservable } from "rxjs/observable/IfObservable";

@Component({
    selector: "app-controller-sensor-selection",
    templateUrl: "./controller-sensor-selection.component.html",
    styleUrls: ["./controller-sensor-selection.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class ControllerSensorSelection implements OnInit {
    @ViewChild("controllerSensorView") controllerSensorView: ElementRef;
    @ViewChild("sensorBreadcrumbList") sensorBreadcrumbList: ElementRef;
    @ViewChild("sensorBtn") sensorBtn: ElementRef;

    public panelHeight;
    public selectedItems: any;
    public isTabSelected: boolean;
    public hasDisableItem: boolean;
    public validSensorArrCheck;
    errMsg: any;
    public seriesList: Array<any> = [];
    list: Array<any> = [];
    selectedControllerSeries: any;
    selectedControllerTitle: any;
    invalidSeriesSelectionArray: Array<any> = [];
    isDiscard: boolean = false;
    seriesItemHolder: any;
    previousSeriesItem: any;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public isborder: boolean = false;
    public choosedControllerSensor: any;
    public count;
    public copyOfSelectedSensorsList;
    public isItem;
    public isSensorSelectionInLimitValid;
    protected isShowRadio = false;
    protected radioFlag = { value: false };
    public isValid;
    public isSaveDraftBtnClicked;
    public isW900Series;
    public corrosionItems: Array<any> = [];
    public prominentItems: Array<any> = [];
    public analogItems: Array<any> = [];
    public corrosionChilds: Array<any> = [];
    public previousItem;
    public selectedSeries900;
    public topSectionHeight;

    public WalchemMinLimit;
    public WalchemMaxLimit;
    public AnalogMinLimit;
    public AnalogMaxLimit;
    public sensorOptionMinLimit;
    public sensorOptionMaxLimit;
    public additionalIOMinLimit;
    public wifiOptionMinLimit;
    public additionalIOMaxLimit;
    public wifiOptionMaxLimit;
    public isAdditionalIOInValidLimit;
    public validAdditionalIOSensorArrCheck;
    public isWifiOptionsInValidLimit;
    public validWifiOptionsArrCheck;
    public showSelected: boolean;

    public isCellCumSelected: boolean = false;
    public isMTCPSelected: boolean = false;

    constructor(
        public constants: Constants,
        private locstr: LocalStorageService,
        public sidebar: SidebarService,
        private toastService: ToastService,
        private commonService: CommonService,
        private broadcaster: Broadcaster,
        private userService: UserService,
        private router: Router,
        private quoteService: QuoteService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.sidebar.show();
        this.isTabSelected = false;
        this.isLoadFailed = false;
        this.isValid = false;
        this.isSaveDraftBtnClicked = false;
        this.isW900Series = false;
        this.getPrevSeletedItems();
        this.prominentItems = [];
        this.analogItems = [];
        this.count = 0;
        this.isItem = false;
        this.isSensorSelectionInLimitValid = false;
        // this.locstr.set('saveQuoteFlag', false);

        let controllerSeries;

        // Get selected controller and series to show it on header

        this.selectedControllerTitle = this.commonService.getCreateQuoteVo().selectedController.name;
        this.selectedControllerSeries = this.commonService.getCreateQuoteVo().selectedControllerSeries;

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
        // If w900 series
        if (this.selectedSeries900 == "WCT900P") {
            this.isW900Series = true;
        } else {
            this.isW900Series = false;
        }

        // If it is edit draft set new quoteId and quoteNo which is already saved as draft
        if (
            this.commonService.getCreateQuoteVo().draftPath ==
            "/controllerSensorSelection" &&
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

        // get If locally stored
        if (this.locstr.getArray("corrosionItems")) {
            this.corrosionItems = this.locstr.getArray("corrosionItems");
        }

        if (this.locstr.getArray("prominentItems")) {
            this.prominentItems = this.locstr.getArray("prominentItems");
        }

        if (this.locstr.getArray("analogItems")) {
            this.analogItems = this.locstr.getArray("analogItems");
        }
        // get selected controller sensor & I/O if route changes
        this.getControllerSensorData();
    }

    ngAfterViewInit() {
        let height = this.controllerSensorView.nativeElement.offsetHeight;
        let topBottomSpace = 40;
        this.panelHeight = height - topBottomSpace;

        setTimeout(() => {
            let breadCrumbbtnHeight;
            let breadCrumbHeight;
            let breadcrumbWidth;
            breadCrumbHeight = this.sensorBreadcrumbList.nativeElement.offsetHeight;
            breadCrumbbtnHeight = this.sensorBtn.nativeElement.offsetHeight;
            breadcrumbWidth = this.sensorBreadcrumbList.nativeElement.offsetWidth;
            console.log(
                "window.innerHeight",
                window.innerHeight,
                " window.innerWidth",
                window.innerWidth
            );
            console.log("window.orientation", window.orientation);

            // if(window.innerHeight > window.innerWidth){
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
        this.sensorSelectionValidCheck();
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
                        this.commonService.showSensorDiscardConfirm(
                            () => {
                                // yes callback -> save quote as draft
                                this.saveDraft(true, "/controllerSensorSelection", true);
                                this.broadcaster
                                    .on<any>("ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS")
                                    .subscribe((message) => {
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
     * Function to get controller sensor list from API
     * */
    protected getControllerSensorData = () => {
        this.isLoading = true;
        this.isLoadFailed = false;
        this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);

        this.userService
            .getControllerSensorIO(this.selectedControllerSeries.id)
            .subscribe(
                (res) => {
                    if (res.status == "success") {
                        this.seriesList = this.userService.getFormattedSensorList(res.data);

                        // show selected IO options if present in local storage
                        if (
                            this.commonService.getCreateQuoteVo() &&
                            this.commonService.getCreateQuoteVo().selectedSensorList
                        ) {
                            let selectedSensorList: any = this.commonService.getCreateQuoteVo()
                                .selectedSensorList;
                            if (
                                this.seriesList &&
                                this.seriesList.length > 0 &&
                                selectedSensorList &&
                                selectedSensorList.length > 0
                            ) {
                                for (let i = 0; i < selectedSensorList.length; i++) {
                                    for (let j = 0; j < this.seriesList.length; j++) {
                                        if (selectedSensorList[i].id === this.seriesList[j].id) {
                                            this.setSensorSelection(
                                                this.seriesList[j],
                                                selectedSensorList[i]
                                            );
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        this.seriesList = this.userService.getFormattedSensorList(
                            this.seriesList
                        );

                        // For Prominent controller - aegis series - conductivity option byDefault selected(hide from the view)
                        if (this.selectedControllerSeries.tag == "PA-2") {
                            for (let k = 0; k < this.seriesList.length; k++) {
                                if (
                                    this.seriesList[k].tag == "SO" &&
                                    this.seriesList[k].childs &&
                                    this.seriesList[k].childs.length
                                ) {
                                    this.seriesList[k].isChecked = true;
                                    for (let m = 0; m < this.seriesList[k].childs.length; m++) {
                                        if (
                                            this.seriesList[k].childs[m].tag == "WAL-SEN" &&
                                            this.seriesList[k].childs[m].childs &&
                                            this.seriesList[k].childs[m].childs.length
                                        ) {
                                            this.seriesList[k].childs[m].isChecked = true;
                                            for (
                                                let n = 0;
                                                n < this.seriesList[k].childs[m].childs.length;
                                                n++
                                            ) {
                                                if (
                                                    this.seriesList[k].childs[m].childs[n].tag ==
                                                    "CON-SEN"
                                                ) {
                                                    this.seriesList[k].childs[m].childs[
                                                        n
                                                    ].isChecked = true;
                                                    this.seriesList[k].childs[m].childs[n].disable = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        this.isLoadFailed = true;
                    }
                    this.isLoading = false;
                    this.commonService.hideLoading();
                },
                (error) => {
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
     * set sensor selection using locally saved item
     **/
    setSensorSelection(seriesItem: any, localSavedItem: any) {
        seriesItem.isChecked = localSavedItem.isChecked;
        if (localSavedItem.tag == "CELL-CUM" && localSavedItem.isChecked) {
            this.hasDisableItem = true;
        }

        if (seriesItem.tag == "CTRC" && this.hasDisableItem) {
            seriesItem.disabled = true;

            for (let p = 0; p < seriesItem.childs.length; p++) {
                seriesItem.childs[p].disabled = true;
            }
        }

        if (seriesItem.tag == "CTRC900" && this.hasDisableItem) {
            seriesItem.disabled = true;

            for (let p = 0; p < seriesItem.childs.length; p++) {
                seriesItem.childs[p].disabled = true;
            }
        }

        // initially check items type when moving back to( controller sensor screen) from next screens
        if (
            (seriesItem.tag == "AN-PTSA-SEN" && seriesItem.childs.length > 0) ||
            (seriesItem.tag == "PRMNT-AN-SEN" && seriesItem.childs.length > 0) ||
            (seriesItem.tag == "Sl-01" && seriesItem.childs.length > 0) ||
            (seriesItem.tag == "Sl-02" && seriesItem.childs.length > 0) ||
            (seriesItem.tag == "Sl-03" && seriesItem.childs.length > 0)
        ) {
            this.checkSelectionType(seriesItem);
        }

        if (seriesItem.childs && seriesItem.childs.length > 0) {
            if (localSavedItem.childs && localSavedItem.childs.length > 0) {
                for (let i = 0; i < seriesItem.childs.length; i++) {
                    for (let j = 0; j < localSavedItem.childs.length; j++) {
                        if (seriesItem.childs[i].id == localSavedItem.childs[j].id) {
                            this.setSensorSelection(
                                seriesItem.childs[i],
                                localSavedItem.childs[j]
                            );
                        }
                    }
                }
            }
        }
    }

    /**
     * get previously selected Items to display it on breadcrumbs
     **/
    getPrevSeletedItems() {
        this.selectedItems = this.locstr.getObj("selectedItems");
    }

    /**
     * This function will be called on series child item select
     **/
    onItemSelect(item: any, list: any) {
        //if (item) console.log("item....", item, "...... list.......", list);
        const mTcp = list.find(i => i.tag === 'M-TCP');
        const wifi = list.find(i => i.tag === 'W');
        const dual = list.find(i => i.tag === 'D');
        const cellCum = this.seriesList.find(i => i.tag === 'CELL-CUM');
        if (item.is_checkBox) {
            if (item.tag === 'M-TCP' || item.tag === 'D') {
                wifi.isChecked = false;
                if (cellCum.isChecked) {
                    if (!item.isChecked) {
                        dual.isChecked = true;
                    } else {
                        dual.isChecked = false;
                    }
                } else {
                    if (!item.isChecked) {
                        mTcp.isChecked = true;
                        dual.isChecked = true;
                    } else {
                        mTcp.isChecked = false;
                        dual.isChecked = false;
                    }
                }
            } else if (item.tag === 'W') {
                if (!item.isChecked) {
                    mTcp.disable = true;
                    wifi.isChecked = true;
                } else {
                    wifi.isChecked = false;
                    mTcp.disable = false;
                }
                mTcp.isChecked = false;
                dual.isChecked = false;
            } else {
                item.isChecked = !item.isChecked;
            }
        }

        /*if (item.is_checkBox) {
            item.isChecked = !item.isChecked;
        }*/

        let activeChild = false,
            listLength = item.childs.length;
        for (let i = 0; i < listLength; i++) {
            if (item.childs[i].isChecked) {
                activeChild = true;
                i = listLength;
            }
        }

        if (activeChild) {
            // this.isTabSelected = true;
            // item.isSelectedTab = this.isTabSelected;
            item.isChecked = true;
            // item.hide = false;
        }

        // if aegis series then make only single selection in analog items, the flag is still same is_checkBox = true
        // because we need deselect functionalityas well.
        if (
            this.selectedControllerSeries.tag == "PA-2" &&
            (item.tag == "LD" || item.tag == "PS")
        ) {
            list.forEach((listItem) => {
                if (listItem.id != item.id) {
                    listItem.isChecked = false;
                }
            });
        }

        if (
            this.selectedControllerSeries.tag == "MVEC" &&
            (item.tag == "LD" || item.tag == "PS")
        ) {
            list.forEach((listItem) => {
                if (listItem.id != item.id) {
                    listItem.isChecked = false;
                }
            });
        }

        if (
            this.selectedControllerSeries.tag == "XS" &&
            (item.tag == "LD" || item.tag == "PS")
        ) {
            list.forEach((listItem) => {
                if (listItem.id != item.id) {
                    listItem.isChecked = false;
                }
            });
        }

        // if (item.tag == 'SI-1' || item.tag == 'AI - 1' || item.tag == 'AI - 2' || item.tag == 'AI - 3' || item.tag == 'AO - 1' ||
        // item.tag == 'AO - 2' || item.tag == 'AIAO') {
        //     list.forEach((listItem) => {
        //         if (listItem.id != item.id) {
        //             listItem.isChecked = false;
        //         }
        //     })
        // }

        // Those items childs selection type is Radio
        if (
            (item.tag == "AN-PTSA-SEN" && item.childs.length > 0) ||
            (item.tag == "PRMNT-AN-SEN" && item.childs.length > 0) ||
            (item.tag == "Sl-01" && item.childs.length > 0) ||
            (item.tag == "Sl-02" && item.childs.length > 0) ||
            (item.tag == "Sl-03" && item.childs.length > 0)
        ) {
            this.checkSelectionType(item);
        }

        this.aegisValidation(item);
    }

    // Aegis series validation- selected items pushed in an array
    aegisValidation(item: any) {
        // IF Aegis series then additional I/O validation based on sensor options selection
        if (this.selectedControllerSeries.tag == "PA-2") {
            // If Prominent sensor options selected then push selected items in prominentItems array
            if (
                (item.tag == "ORP-SEN" && item.isChecked) ||
                (item.tag == "PH-SEN" && item.isChecked)
            ) {
                this.prominentItems.push(item);
            } else {
                for (let c = 0; c < this.prominentItems.length; c++) {
                    if (this.prominentItems[c].id == item.id) {
                        let index = this.prominentItems.indexOf(this.prominentItems[c]);
                        this.prominentItems.splice(index, 1);
                    }
                }
            }

            // If analog sensor options selected then push selected items in analogItems array
            if (
                (item.tag == "LD" && item.isChecked) ||
                (item.tag == "PS" && item.isChecked)
            ) {
                this.analogItems = [];
                this.analogItems.push(item);
            } else {
                for (let c = 0; c < this.analogItems.length; c++) {
                    if (this.analogItems[c].id == item.id) {
                        let index = this.analogItems.indexOf(this.analogItems[c]);
                        this.analogItems.splice(index, 1);
                    }
                }
            }

            // If Corrosion sensor options selected then push selected items in corrosionItems array
            if (
                (item.tag == "STST-01" && item.isChecked) ||
                (item.tag == "Admiralty" && item.isChecked) ||
                (item.tag == "CUP-01" && item.isChecked) ||
                (item.tag == "CS01" && item.isChecked) ||
                (item.tag == "DC" && item.isChecked)
            ) {
                this.corrosionItems.push(item);
            } else {
                for (let c = 0; c < this.corrosionItems.length; c++) {
                    if (this.corrosionItems[c].id == item.id) {
                        let index = this.corrosionItems.indexOf(this.corrosionItems[c]);
                        this.corrosionItems.splice(index, 1);
                    }
                }
            }
            this.aegisAdditionalioOptionValidation(item);
        }
        // end of if (aegis series)

        // Aegis series validation- selected items pushed in an array
    }

    /**
     * Aegis validation based on selected items in an array active/inactive additional I/o slots childs
     **/
    aegisAdditionalioOptionValidation(item?: any) {
        // additional I/O validation based on sensor options selection
        for (let k = 0; k < this.seriesList.length; k++) {
            if (
                this.seriesList[k].tag == "AG-AI/OO" &&
                this.seriesList[k].childs &&
                this.seriesList[k].childs.length
            ) {
                for (let m = 0; m < this.seriesList[k].childs.length; m++) {
                    // If corrosion sensor options selected slot #1 ( D1 = active, H1 & I1 = inactive)
                    if (this.corrosionItems.length >= 2) {
                        this.seriesList[k].isChecked = true;
                        if (
                            this.seriesList[k].childs[m].tag == "Sl-01" &&
                            this.seriesList[k].childs[m].childs &&
                            this.seriesList[k].childs[m].childs.length > 0
                        ) {
                            this.seriesList[k].childs[m].isChecked = true;
                            for (
                                let n = 0;
                                n < this.seriesList[k].childs[m].childs.length;
                                n++
                            ) {
                                if (this.seriesList[k].childs[m].childs[n].tag == "DDS-01") {
                                    this.seriesList[k].childs[m].childs[n].isChecked = true;
                                } else {
                                    if (this.seriesList[k].childs[m].childs[n].isChecked) {
                                        this.seriesList[k].childs[m].childs[n].isChecked = false;
                                    }
                                    this.seriesList[k].childs[m].childs[n].disable = true;
                                }
                            }
                        }
                    } else {
                        if (item) {
                            if (
                                item.tag == "STST-01" ||
                                item.tag == "Admiralty" ||
                                item.tag == "CUP-01" ||
                                item.tag == "CS01" ||
                                item.tag == "DC"
                            ) {
                                // item.tag != 'DDS-01' || item.tag != 'DUA-02' || item.tag != 'DU-01'
                                if (
                                    this.seriesList[k].childs[m].tag == "Sl-01" &&
                                    this.seriesList[k].childs[m].childs &&
                                    this.seriesList[k].childs[m].childs.length > 0
                                ) {
                                    if (this.seriesList[k].isChecked) {
                                        this.seriesList[k].isChecked = false;
                                    }
                                    if (this.seriesList[k].childs[m].isChecked) {
                                        this.seriesList[k].childs[m].isChecked = false;
                                    }
                                    for (
                                        let n = 0;
                                        n < this.seriesList[k].childs[m].childs.length;
                                        n++
                                    ) {
                                        if (
                                            this.seriesList[k].childs[m].childs[n].tag == "DDS-01"
                                        ) {
                                            this.seriesList[k].childs[m].childs[n].isChecked = false;
                                        } else {
                                            if (this.seriesList[k].childs[m].childs[n].isChecked) {
                                                this.seriesList[k].childs[m].childs[
                                                    n
                                                ].isChecked = false;
                                            }
                                            this.seriesList[k].childs[m].childs[n].disable = false;
                                        }
                                    }
                                }
                            }
                        }
                    } //end of slot #1

                    //If corrosion sensor options selected slot #2 ( G1 = active, H1 & I1 = inactive)
                    if (this.prominentItems.length > 0) {
                        this.seriesList[k].isChecked = true;
                        if (
                            this.seriesList[k].childs[m].tag == "Sl-02" &&
                            this.seriesList[k].childs[m].childs &&
                            this.seriesList[k].childs[m].childs.length > 0
                        ) {
                            this.seriesList[k].childs[m].isChecked = true;
                            for (
                                let n = 0;
                                n < this.seriesList[k].childs[m].childs.length;
                                n++
                            ) {
                                if (this.seriesList[k].childs[m].childs[n].tag == "ORPH-01") {
                                    this.seriesList[k].childs[m].childs[n].isChecked = true;
                                } else {
                                    if (this.seriesList[k].childs[m].childs[n].isChecked) {
                                        this.seriesList[k].childs[m].childs[n].isChecked = false;
                                    }
                                    this.seriesList[k].childs[m].childs[n].disable = true;
                                }
                            }
                        }
                    } else {
                        if (item) {
                            if (item.tag == "PH-SEN" || item.tag == "ORP-SEN") {
                                // item.tag != 'ORPH-01' || item.tag != 'DU-01' || item.tag != 'DUA-02'
                                if (
                                    this.seriesList[k].childs[m].tag == "Sl-02" &&
                                    this.seriesList[k].childs[m].childs &&
                                    this.seriesList[k].childs[m].childs.length > 0
                                ) {
                                    if (this.seriesList[k].isChecked) {
                                        this.seriesList[k].isChecked = false;
                                    }
                                    if (this.seriesList[k].childs[m].isChecked) {
                                        this.seriesList[k].childs[m].isChecked = false;
                                    }
                                    for (
                                        let n = 0;
                                        n < this.seriesList[k].childs[m].childs.length;
                                        n++
                                    ) {
                                        if (
                                            this.seriesList[k].childs[m].childs[n].tag == "ORPH-01"
                                        ) {
                                            this.seriesList[k].childs[m].childs[n].isChecked = false;
                                        } else {
                                            if (this.seriesList[k].childs[m].childs[n].isChecked) {
                                                this.seriesList[k].childs[m].childs[
                                                    n
                                                ].isChecked = false;
                                            }
                                            this.seriesList[k].childs[m].childs[n].disable = false;
                                        }
                                    }
                                }
                            }
                        }
                    } //end of slot #2

                    // If corrosion sensor options selected slot #3 ( I1 = active, G1 & H1 = inactive)
                    if (this.analogItems.length > 0) {
                        this.seriesList[k].isChecked = true;
                        if (
                            this.seriesList[k].childs[m].tag == "Sl-03" &&
                            this.seriesList[k].childs[m].childs &&
                            this.seriesList[k].childs[m].childs.length > 0
                        ) {
                            this.seriesList[k].childs[m].isChecked = true;
                            for (
                                let n = 0;
                                n < this.seriesList[k].childs[m].childs.length;
                                n++
                            ) {
                                if (this.seriesList[k].childs[m].childs[n].tag == "DUA-02") {
                                    this.seriesList[k].childs[m].childs[n].isChecked = true;
                                } else {
                                    if (this.seriesList[k].childs[m].childs[n].isChecked) {
                                        this.seriesList[k].childs[m].childs[n].isChecked = false;
                                    }
                                    this.seriesList[k].childs[m].childs[n].disable = true;
                                }
                            }
                        }
                    } else {
                        if (item) {
                            if (item.tag == "LD" || item.tag == "PS") {
                                //item.tag != 'DU-01' || item.tag != 'DUA-02' || item.tag != 'ORPH-01'
                                if (
                                    this.seriesList[k].childs[m].tag == "Sl-03" &&
                                    this.seriesList[k].childs[m].childs &&
                                    this.seriesList[k].childs[m].childs.length > 0
                                ) {
                                    if (this.seriesList[k].isChecked) {
                                        this.seriesList[k].isChecked = false;
                                    }
                                    if (this.seriesList[k].childs[m].isChecked) {
                                        this.seriesList[k].childs[m].isChecked = false;
                                    }
                                    for (
                                        let n = 0;
                                        n < this.seriesList[k].childs[m].childs.length;
                                        n++
                                    ) {
                                        if (
                                            this.seriesList[k].childs[m].childs[n].tag == "DUA-02"
                                        ) {
                                            this.seriesList[k].childs[m].childs[n].isChecked = false;
                                        } else {
                                            if (this.seriesList[k].childs[m].childs[n].isChecked) {
                                                this.seriesList[k].childs[m].childs[
                                                    n
                                                ].isChecked = false;
                                            }
                                            this.seriesList[k].childs[m].childs[n].disable = false;
                                        }
                                    }
                                }
                            }
                        }
                    } //end of slot #3
                }
            } //end of if(additional I/O)item
        } //end of seriesList for
    }

    /**
     * This function will be called on series select
     **/
    selectSeries(item: any, seriesList: any) {
        //console.log("Selecting... Series", item, seriesList);
        // Assign min and max valus of sensors to variables at the time of selection
        if (item.tag == "SO") {
            this.sensorOptionMinLimit = item.min_childs;
            this.sensorOptionMaxLimit = item.max_childs;
            if (item && item.childs && item.childs.length > 0) {
                for (let j = 0; j < item.childs.length; j++) {
                    if (item.childs[j].tag == "AN-SEN") {
                        this.AnalogMinLimit = item.childs[j].min_childs;
                        this.AnalogMaxLimit = item.childs[j].max_childs;
                    } else if (item.childs[j].tag == "WAL-SEN") {
                        this.WalchemMinLimit = item.childs[j].min_childs;
                        this.WalchemMaxLimit = item.childs[j].max_childs;
                    } else if (item.childs[j].tag == "WAL-CS") {
                        this.WalchemMinLimit = item.childs[j].min_childs;
                        this.WalchemMaxLimit = item.childs[j].max_childs;
                    }
                }
            }
        }

        if (item.tag == "AI/OO") {
            this.additionalIOMinLimit = item.min_childs;
            this.additionalIOMaxLimit = item.max_childs;
            this.showSelected = !this.showSelected;
        }

        if (item.tag == "WF") {
            this.wifiOptionMinLimit = item.min_childs;
            this.wifiOptionMaxLimit = item.max_childs;
        }

        if (item.tag == "CTRC") {
            for (let i = 0; i < seriesList.length; i++) {
                if (seriesList[i].tag == "CELL-CUM" && seriesList[i].isChecked) {
                    item.disabled = true;

                    for (let k = 0; k < item.childs.length; k++) {
                        item.childs[k].is_checkBox = false;
                        item.childs[k].disabled = true;
                        if (item.childs[k].tag == "EE") {
                            item.childs[k].isChecked = true;
                        } else {
                            item.childs[k].isChecked = false;
                        }
                    }
                } else if (
                    seriesList[i].tag == "CELL-CUM" &&
                    !seriesList[i].isChecked
                ) {
                    item.disabled = false;

                    for (let j = 0; j < item.childs.length; j++) {
                        item.childs[j].is_checkBox = false;
                        item.childs[j].disabled = false;
                    }
                }
            }
        }


        if (item.tag == "CTRC900") { ///logic for modbus to disable wct900
            const cellCum = seriesList.find(i => i.tag == 'CELL-CUM');
            if (cellCum.isChecked) {
                const mTcp = item.childs.find(i => i.tag === 'M-TCP');
                mTcp.disable = true;
            }
        }


        /*if (item.tag === "CTRC900") {
            console.log("Here...", item.tag);
            ///logic for modbus to disable wct900  //CTRC is  Controller Communications
            let isMTCP = false;
            for (let i = 0; i < seriesList.length; i++) {
                console.log("Here 2", seriesList[i].tag, seriesList[i].isChecked);
                if (seriesList[i].tag == "CELL-CUM" && seriesList[i].isChecked) {
                    console.log("Item... here");
                    // CELL-CUM equals Cellular Communications Option
                    item.disabled = true;
                    // console.log("BABY#####--------",item.tag)
                    for (let k = 0; k < item.childs.length; k++) {
                        item.childs[k].is_checkBox = false;
                        item.childs[k].disabled = false;

                        console.log("Running...");
                        if (item.childs[k].tag == "M-TCP") {
                            // modbus
                            //isMTCP = true;
                            // W needs disabled
                            // items.childs[Object.keys()]
                            console.log("###", item.childs);
                            item.childs[k].disabled = true;
                            item.childs[k].isChecked = false;
                            // console.log("BABY#####--------",item.childs[k])
                        } else {
                            item.childs[k].isChecked = false;
                            //console.log("BABY#####--------",item.tag)
                        }
                    }

                    // let singleCon = item.childs.find((anItem) => anItem.tag == "W");
                    // let double = item.childs.find((anItem) => anItem.tag == "D");
                    // let modbus = item.childs.find((anItem) => anItem.tag == "M-TCP");
                    // console.log("single...", singleCon, double, modbus);
                    // if (modbus.isChecked || double.isChecked) {
                    //     console.log("H...");
                    //     double.is_checkBox = false;
                    //     modbus.is_checkBox = false;
                    // } else if (singleCon.isChecked) {
                    //     console.log("..2..");
                    //     double.is_checkBox = true;
                    //     singleCon.is_checkBox = true;
                    //     modbus.is_checkBox = true;
                    // }
                } else if (
                    seriesList[i].tag == "CELL-CUM" &&
                    !seriesList[i].isChecked
                ) {
                    item.disabled = false;
                    //console.log("BABY#####4-------",seriesList[i])
                    for (let j = 0; j < item.childs.length; j++) {
                        item.childs[j].is_checkBox = false;
                        item.childs[j].disabled = false;
                        //console.log("####item", item.childs[j])

                        // if (item.childs[j].tag == 'W' ) {  // single selection
                        //     item.childs[j].disabled = true;
                        //     //console.log("BABY#####2--------",item.childs[j]);
                        // }
                        // console.log("BABY#####disabled--------",item.childs[j])
                    }

                    // } else if (seriesList[i].tag == "CELL-CUM" && !seriesList[i].isChecked) {
                    //     item.disabled = false;
                    //    // console.log("BABY#####--------",item.tag)
                    //     for (let j = 0; j < item.childs.length; j++) {
                    //         item.childs[j].is_checkBox = false;
                    //         item.childs[j].disabled = false;
                    //     }
                }
            }

            //   item.childs.map((it) => {
            //     if (isMTCP) {    // is CELL-CUM not MTCP
            //         if (it.tag === "W") { //single disabled

            //             it.disabled = true;
            //         }
            //         if (it.tag === "D") {

            //         }
            //     }
            // });

            //isMTCP = false;
        }*/

        // if (item.id == '219' || item.id == '252'|| item.id == '124' ||item.id == '159'|| item.id == '34' ) {

        // console.log('MTCP####---------------',item.id)

        // }

        // if (item.tag == 'CELL-CUM' ) {

        //     console.log('###CELLCUM####---------------',item.tag)

        // }

        this.list = [];
        if (this.previousSeriesItem) {
            this.previousSeriesItem.hide = true;
        }

        // If list has no childs check i
        if (item && item.childs && item.childs.length == 0) {
            item.isChecked = !item.isChecked;
            item.hide = !item.hide;
        } else {
            // item has childs then check selection types
            this.checkSelectionType(item);

            // For aegis Additional I/o slots childs selection type is radio
            if (item.tag == "AG-AI/OO") {
                for (let i = 0; i < item.childs.length; i++) {
                    this.checkSelectionType(item.childs[i]);
                }
            }

            this.list = this.list.concat(item.childs);

            let activeChild = false,
                listLength = this.list.length;
            for (let i = 0; i < listLength; i++) {
                if (this.list[i].isChecked) {
                    activeChild = true;
                    i = listLength;
                }
            }

            if (item.disabled) {
                item.isChecked = true;
                this.isTabSelected = true;
            } else {
                item.isChecked = !item.isChecked;
                item.hide = !item.isChecked;
                this.isTabSelected = item.isChecked ? true : false;
            }

            if (activeChild) {
                this.isTabSelected = true;
                item.isSelectedTab = this.isTabSelected;
                item.isChecked = true;
                item.hide = false;
            }

            for (var j = 0; j < this.list.length; j++) {
                if (this.list[j].childType == "radio") {
                    this.isShowRadio = true;
                } else {
                    this.isShowRadio = false;
                }
            }
        }

        this.previousSeriesItem = item;
    }

    /**
     * On mobile view item click - aegis validaton
     **/
    onMobileViewItemSelected(item, list) {
        // If clicked on sensor Option then apply additional I/O options childs checkbox /radio type dynamically
        if (item.tag == "SO") {
            for (let i = 0; i < list.length; i++) {
                if (list[i].tag == "AG-AI/OO") {
                    for (let k = 0; k < list[i].childs.length; k++) {
                        this.checkSelectionType(list[i].childs[k]);
                    }
                }
            }
        }
        // if aegis series then make only single selection in analog items, the flag is still same is_checkBox = true because we need deselect functionalityas well.
        if (
            this.selectedControllerSeries.tag == "PA-2" &&
            (item.tag == "LD" || item.tag == "PS")
        ) {
            list.forEach((listItem) => {
                if (listItem.id != item.id) {
                    listItem.isChecked = false;
                }
            });
        }
        this.aegisValidation(item);

        if (
            this.selectedControllerSeries.tag == "MVEC" &&
            (item.tag == "LD" || item.tag == "PS")
        ) {
            list.forEach((listItem) => {
                if (listItem.id != item.id) {
                    listItem.isChecked = false;
                }
            });
        }
        this.aegisValidation(item);

        if (
            this.selectedControllerSeries.tag == "XS" &&
            (item.tag == "LD" || item.tag == "PS")
        ) {
            list.forEach((listItem) => {
                if (listItem.id != item.id) {
                    listItem.isChecked = false;
                }
            });
        }
        this.aegisValidation(item);
    }

    /**
     *  Based on items selection flag( if checkbox = is_checkBox ; if radio = !is_checkBox)
     **/
    checkSelectionType(item: any) {
        let childTypeValue;
        let typeClass;
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

    /**
     * Function called on controller communication options selection
     **/
    radioSelection(item: any, list: any) {
        item.isChecked = true;
        // active radio input will be deselect if we click radio second time.
        if (!item.is_checkBox) {
            if (this.previousItem && this.previousItem.tag == item.tag) {
                item.isChecked = false;
            }
        }
        this.previousItem = item;
        for (let i = 0; i < list.length; i++) {
            if (list[i].tag != item.tag) {
                list[i].isChecked = false;
            }
        }
    }

    /**
     * This function will be reset invalid series selection
     **/
    resetSeries(item: any) {
        if (item && item.isChecked) {
            item.isChecked = false;
            if (item.childs && item.childs.length > 0) {
                for (let i = 0; i < item.childs.length; i++) {
                    this.resetSeries(item.childs[i]);
                }
            }
        }
    }

    /**
     * This function will be called on 'Next' button
     **/
    sensorSelectionValidCheck = () => {
        let seriesSelectionStatus = this.isSeriesSelectionValid();
        let controllerSensor = false;
        let cellularSensor = false;
        let sensorOption = false;
        let msg;
        let sensorName;
        if (seriesSelectionStatus.isValid) {
            this.isValid = false;
            // set object to get selected controller sensor & I/O if route changes
            var selectedSensorList = this.seriesList.filter((item) => {
                return item.isChecked;
            });

            this.isValid = false;

            for (let i = 0; i < selectedSensorList.length; i++) {
                if (
                    this.selectedControllerSeries.tag == "WCT600P" ||
                    this.selectedControllerSeries.tag == "WCT600H"
                ) {
                    if (selectedSensorList[i].tag == "CTRC") {
                        controllerSensor = true;
                    }
                    if (selectedSensorList[i].tag == "CTRC900") {
                        controllerSensor = true;
                    }

                    if (selectedSensorList[i].tag == "CELL-CUM") {
                        cellularSensor = true;
                    }
                } else if (this.selectedControllerSeries.tag == "XS") {
                    // makes no sense please test
                    this.isValid = false;
                    sensorOption = true;
                } else if (this.selectedControllerSeries.tag == "MVEC") {
                    this.isValid = false;
                    sensorOption = true;
                }

                if (selectedSensorList[i].tag == "SO") {
                    sensorOption = true;
                }
            }

            if (!sensorOption) {
                this.isValid = true;
                msg = "Please select Sensor Options";
                this.reuiredSensorSet(msg);
            }

            if (
                sensorOption &&
                this.selectedControllerSeries.tag != "PA-2" &&
                this.selectedControllerSeries.tag != "XS" &&
                this.selectedControllerSeries.tag != "MVEC"
            ) {
                // form only selected and checked item array
                this.copyOfSelectedSensorsList = JSON.parse(
                    JSON.stringify(selectedSensorList)
                );

                //check sonsor options selected in limit or not
                this.limitValidation(this.copyOfSelectedSensorsList);

                //If sensor seletion not in limit then will show alert
                if (this.validSensorArrCheck && this.validSensorArrCheck.length > 0) {
                    let msg;
                    msg =
                        "Walchem sensors selection range : (minimum " +
                        this.WalchemMinLimit +
                        " and maximum " +
                        this.WalchemMaxLimit +
                        ")" +
                        " Analog sensors selection range : (minimum " +
                        this.AnalogMinLimit +
                        " and maximum " +
                        this.AnalogMaxLimit +
                        ")" +
                        " Sensor option selection range : (minimum " +
                        this.sensorOptionMinLimit +
                        " and maximum " +
                        this.sensorOptionMaxLimit +
                        ")" +
                        " Combination of walchem sensor and analog sensor should not exceed Sensor option range";
                    this.commonService.showAlert("Alert", msg, "OK", () => {
                        this.limitValidation(this.copyOfSelectedSensorsList);
                    });
                    this.isValid = true;
                } else if (
                    this.validAdditionalIOSensorArrCheck &&
                    this.validAdditionalIOSensorArrCheck.length > 0
                ) {
                    let msg;
                    msg =
                        "Additional I/O options selection range: (minimum " +
                        this.additionalIOMinLimit +
                        " and maximum " +
                        this.additionalIOMaxLimit +
                        ")";
                    this.commonService.showAlert("Alert", msg, "OK", () => {
                        this.limitValidation(this.copyOfSelectedSensorsList);
                    });
                    this.isValid = true;
                } else if (
                    this.validWifiOptionsArrCheck &&
                    this.validWifiOptionsArrCheck.length > 0
                ) {
                    let msg;
                    msg =
                        "Wifi options selection range: (minimum " +
                        this.wifiOptionMinLimit +
                        " and maximum " +
                        this.wifiOptionMaxLimit +
                        ")";
                    this.commonService.showAlert("Alert", msg, "OK", () => {
                        this.limitValidation(this.copyOfSelectedSensorsList);
                    });
                    this.isValid = true;
                } else {
                    this.isValid = false;
                }
            }

            if (!this.isValid) {
                this.commonService.storeDataInCreateQuoteVo(
                    "selectedSensorList",
                    selectedSensorList
                );
            }
        } else {
            this.isValid = true;
            // Invalid Series selection, show message
            if (seriesSelectionStatus.reason == "No series Item selection") {
                // No series Item selected
                this.commonService.showAlert(
                    "Info",
                    "Please select at least one controller sensor & I/O.",
                    "OK",
                    () => {
                        // Ok click code will be here
                    }
                );
            } else {
                // Invalid series selection, show discard message
                let invalidSeries: string = "";
                for (let k = 0; k < this.invalidSeriesSelectionArray.length; k++) {
                    if (k == 0) {
                        invalidSeries = this.invalidSeriesSelectionArray[k].seriesName;
                    } else {
                        invalidSeries =
                            invalidSeries +
                            ", " +
                            this.invalidSeriesSelectionArray[k].seriesName;
                    }
                }
                let messageText: string =
                    "You have incomplete Controller Sensor & I/O selection for " +
                    '"' +
                    invalidSeries +
                    '"' +
                    ", Do you want to discard the selection?";
                this.showDiscardPrompt(messageText);
            }
        }
    };

    /**
     * Function to call on next button
     **/
    onNext(flag: boolean) {
        this.locstr.setArray("corrosionItems", this.corrosionItems);
        this.locstr.setArray("prominentItems", this.prominentItems);
        this.locstr.setArray("analogItems", this.analogItems);
        this.sensorSelectionValidCheck();
        if (!this.isValid) {
            // Series selection valid, navigate to panel options screen
            this.router.navigate(["/panelOptions"]);
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
                // series discard code will be here
                for (let i = 0; i < this.seriesList.length; i++) {
                    if (this.invalidSeriesSelectionArray.length) {
                        for (let j = 0; j < this.invalidSeriesSelectionArray.length; j++) {
                            if (
                                this.seriesList[i].id ==
                                this.invalidSeriesSelectionArray[j].seriesId
                            ) {
                                this.resetSeries(this.seriesList[i]);
                                this.isTabSelected = false;
                                this.seriesList[i].hide = true;
                            } else if (!this.seriesList[i].hide) {
                                this.isTabSelected = true;
                            }

                            // if invalid selection in sensor option and additional I/O options are selected then remove selection.
                            if (
                                this.selectedControllerSeries.tag == "PA-2" &&
                                this.invalidSeriesSelectionArray[j].seriesName ==
                                "Sensor Options"
                            ) {
                                if (
                                    this.prominentItems.length > 0 ||
                                    this.corrosionItems.length > 0 ||
                                    this.analogItems.length > 0
                                ) {
                                    for (let k = 0; k < this.seriesList.length; k++) {
                                        if (
                                            this.seriesList[k].tag == "AG-AI/OO" &&
                                            this.seriesList[k].isChecked &&
                                            this.seriesList[k].childs &&
                                            this.seriesList[k].childs.length
                                        ) {
                                            this.seriesList[k].isChecked = false;
                                            this.analogItems = [];
                                            this.prominentItems = [];
                                            this.corrosionItems = [];
                                            for (
                                                let m = 0;
                                                m < this.seriesList[k].childs.length;
                                                m++
                                            ) {
                                                if (
                                                    this.seriesList[k].childs[m].isChecked &&
                                                    this.seriesList[k].childs[m].childs &&
                                                    this.seriesList[k].childs[m].childs.length > 0
                                                ) {
                                                    this.seriesList[k].childs[m].isChecked = false;
                                                    for (
                                                        let n = 0;
                                                        n < this.seriesList[k].childs[m].childs.length;
                                                        n++
                                                    ) {
                                                        if (
                                                            this.seriesList[k].childs[m].childs[n].isChecked
                                                        ) {
                                                            this.seriesList[k].childs[m].childs[
                                                                n
                                                            ].isChecked = false;
                                                        } else if (
                                                            this.seriesList[k].childs[m].childs[n].disable
                                                        ) {
                                                            this.seriesList[k].childs[m].childs[
                                                                n
                                                            ].disable = false;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // if invalid selection in sensor option and additional I/O options are selected then remove selection.
                            if (
                                this.selectedControllerSeries.tag == "MVEC" &&
                                this.invalidSeriesSelectionArray[j].seriesName ==
                                "Sensor Options"
                            ) {
                                if (
                                    this.prominentItems.length > 0 ||
                                    this.corrosionItems.length > 0 ||
                                    this.analogItems.length > 0
                                ) {
                                    for (let k = 0; k < this.seriesList.length; k++) {
                                        if (
                                            this.seriesList[k].tag == "AG-AI/OO" &&
                                            this.seriesList[k].isChecked &&
                                            this.seriesList[k].childs &&
                                            this.seriesList[k].childs.length
                                        ) {
                                            this.seriesList[k].isChecked = false;
                                            this.analogItems = [];
                                            this.prominentItems = [];
                                            this.corrosionItems = [];
                                            for (
                                                let m = 0;
                                                m < this.seriesList[k].childs.length;
                                                m++
                                            ) {
                                                if (
                                                    this.seriesList[k].childs[m].isChecked &&
                                                    this.seriesList[k].childs[m].childs &&
                                                    this.seriesList[k].childs[m].childs.length > 0
                                                ) {
                                                    this.seriesList[k].childs[m].isChecked = false;
                                                    for (
                                                        let n = 0;
                                                        n < this.seriesList[k].childs[m].childs.length;
                                                        n++
                                                    ) {
                                                        if (
                                                            this.seriesList[k].childs[m].childs[n].isChecked
                                                        ) {
                                                            this.seriesList[k].childs[m].childs[
                                                                n
                                                            ].isChecked = false;
                                                        } else if (
                                                            this.seriesList[k].childs[m].childs[n].disable
                                                        ) {
                                                            this.seriesList[k].childs[m].childs[
                                                                n
                                                            ].disable = false;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            //if invalid selection in sensor option and additional I/O options are selected then remove selection.
                            if (
                                this.selectedControllerSeries.tag == "XS" &&
                                this.invalidSeriesSelectionArray[j].seriesName ==
                                "Sensor Options"
                            ) {
                                if (
                                    this.prominentItems.length > 0 ||
                                    this.corrosionItems.length > 0 ||
                                    this.analogItems.length > 0
                                ) {
                                    for (let k = 0; k < this.seriesList.length; k++) {
                                        if (
                                            this.seriesList[k].tag == "AG-AI/OO" &&
                                            this.seriesList[k].isChecked &&
                                            this.seriesList[k].childs &&
                                            this.seriesList[k].childs.length
                                        ) {
                                            this.seriesList[k].isChecked = false;
                                            this.analogItems = [];
                                            this.prominentItems = [];
                                            this.corrosionItems = [];
                                            for (
                                                let m = 0;
                                                m < this.seriesList[k].childs.length;
                                                m++
                                            ) {
                                                if (
                                                    this.seriesList[k].childs[m].isChecked &&
                                                    this.seriesList[k].childs[m].childs &&
                                                    this.seriesList[k].childs[m].childs.length > 0
                                                ) {
                                                    this.seriesList[k].childs[m].isChecked = false;
                                                    for (
                                                        let n = 0;
                                                        n < this.seriesList[k].childs[m].childs.length;
                                                        n++
                                                    ) {
                                                        if (
                                                            this.seriesList[k].childs[m].childs[n].isChecked
                                                        ) {
                                                            this.seriesList[k].childs[m].childs[
                                                                n
                                                            ].isChecked = false;
                                                        } else if (
                                                            this.seriesList[k].childs[m].childs[n].disable
                                                        ) {
                                                            this.seriesList[k].childs[m].childs[
                                                                n
                                                            ].disable = false;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        );
    }

    /**
     * This function will be called to check if series selection invalid
     * */
    isSeriesSelectionValid = () => {
        this.isDiscard = false;
        this.invalidSeriesSelectionArray = [];
        if (this.seriesList && this.seriesList.length > 0) {
            let isSeriesItemSelected: boolean = false;
            for (let i = 0; i < this.seriesList.length; i++) {
                if (this.seriesList[i].isChecked) {
                    isSeriesItemSelected = true;
                    this.recursionFunction(this.seriesList[i], true);
                }
            }
            if (!isSeriesItemSelected) {
                return {
                    isValid: false,
                    reason: "No series Item selection",
                };
            }
            if (this.isDiscard && this.invalidSeriesSelectionArray.length > 0) {
                return {
                    isValid: false,
                    reason: "Invalid series Item selection",
                };
            }
            return {
                isValid: true,
                reason: "Valid series Item selection",
            };
        }
    };

    /**
     * This function will be used to check invalid series recursivly
     * */
    recursionFunction(item: any, isSeriesCall: boolean) {
        if (isSeriesCall) {
            // This will hold seriesItem and get pushed if series has invalid selection
            this.seriesItemHolder = {
                seriesId: item.id,
                seriesName: item.name,
            };
        }
        if (item && item.childs && item.childs.length == 0) {
            if (!item.isChecked) {
                // Last child item, which is not selected, but parents are selected, show discard message
                this.isDiscard = true;
                this.invalidSeriesSelectionArray.push(this.seriesItemHolder);
            } // else series last child is selected
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
                    this.invalidSeriesSelectionArray.push(this.seriesItemHolder);
                }
            } else {
                // Child not defined
                if (!item.isChecked) {
                    // Last child item, which is not selected, but parents are selected, show discard message
                    this.isDiscard = true;
                    this.invalidSeriesSelectionArray.push(this.seriesItemHolder);
                } // else series last child is selected
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

    /**
     * Required combination of sensors
     * */
    reuiredSensorSet(msg) {
        this.commonService.showAlert("Info", msg, "OK", () => {
            // Ok click code will be here
        });
    }

    /**
     * Function to check sensor option selection limit validation
     **/
    limitValidation(copyOfSelectedSensorsList) {
        if (copyOfSelectedSensorsList && copyOfSelectedSensorsList.length > 0) {
            for (let s = 0; s < copyOfSelectedSensorsList.length; s++) {
                if (copyOfSelectedSensorsList[s].tag == "SO") {
                    this.selectedSensorsOnly(copyOfSelectedSensorsList[s]);
                } else if (copyOfSelectedSensorsList[s].tag == "AI/OO") {
                    this.selectedSensorsOnly(copyOfSelectedSensorsList[s]);
                } else if (copyOfSelectedSensorsList[s].tag == "WF") {
                    this.selectedSensorsOnly(copyOfSelectedSensorsList[s]);
                }
            }
        }

        // Pass sensor option to limit checking function for limit validation
        if (copyOfSelectedSensorsList && copyOfSelectedSensorsList.length > 0) {
            for (let c = 0; c < copyOfSelectedSensorsList.length; c++) {
                if (copyOfSelectedSensorsList[c].tag == "SO") {
                    this.selectedSensorsValidation(copyOfSelectedSensorsList[c]);
                } else if (copyOfSelectedSensorsList[c].tag == "AI/OO") {
                    this.additionalIOValidation(copyOfSelectedSensorsList[c]);
                } else if (copyOfSelectedSensorsList[c].tag == "WF") {
                    this.wifiOptionsValidation(copyOfSelectedSensorsList[c]);
                }
            }
        }
    }

    /**
     * This function will be to create only selected controller sensor I/O array formation(not include unchecked items)
     **/
    selectedSensorsOnly(item) {
        if (item && item.isChecked && item.childs) {
            for (let c = item.childs.length - 1; c >= 0; c--) {
                if (!item.childs[c].isChecked) {
                    item.childs.splice(c, 1);
                } else {
                    this.selectedSensorsOnly(item.childs[c]);
                }
            }
        }
    }

    /**
     * This function to check sensor option selection in min and limit or not
     **/
    selectedSensorsValidation(item) {
        let isValidChildSelection = false;
        this.validSensorArrCheck = [];
        let parentCount = 0;

        this.sensorOptionMaxLimit = item.max_childs;
        this.sensorOptionMinLimit = item.min_childs;

        if (item && item.childs && item.childs.length > 0) {
            for (let j = 0; j < item.childs.length; j++) {
                this.count = 0;
                if (item.childs[j].tag == "AN-SEN") {
                    this.AnalogMinLimit = item.childs[j].min_childs;
                    this.AnalogMaxLimit = item.childs[j].max_childs;
                    this.childRecursion(item.childs[j]);
                    item.childs[j].count = this.count;
                    if (
                        item.childs[j].count >= this.AnalogMinLimit &&
                        item.childs[j].count <= this.AnalogMaxLimit
                    ) {
                        item.childs[j].isValidChildSelection = true;
                    } else {
                        item.childs[j].isValidChildSelection = false;
                    }
                } else if (
                    item.childs[j].tag == "WAL-SEN" ||
                    item.childs[j].tag == "WAL-CS"
                ) {
                    this.WalchemMaxLimit = item.childs[j].max_childs;
                    this.WalchemMinLimit = item.childs[j].min_childs;
                    this.childRecursion(item.childs[j]);
                    item.childs[j].count = this.count;
                    if (
                        item.childs[j].count >= this.WalchemMinLimit &&
                        item.childs[j].count <= this.WalchemMaxLimit
                    ) {
                        item.childs[j].isValidChildSelection = true;
                    } else {
                        item.childs[j].isValidChildSelection = false;
                    }
                }

                //If walchem and anlog seletion in limit then sum of count = 4
                if (item.childs[j].isValidChildSelection) {
                    parentCount = item.childs[j].count + parentCount;
                    //log("parentCount........", parentCount);
                    if (
                        parentCount >= this.sensorOptionMinLimit &&
                        parentCount <= this.sensorOptionMaxLimit
                    ) {
                        this.isSensorSelectionInLimitValid = false;
                    } else {
                        this.isSensorSelectionInLimitValid = true;
                        this.validSensorArrCheck.push(item.childs[j]);
                    }
                } else {
                    this.isSensorSelectionInLimitValid = true;
                    this.validSensorArrCheck.push(item.childs[j]);
                }
            }
        } //end of if 1
    }

    /**
     * This function to check additional i/o option selection in min and limit or not(w900 series)
     **/
    additionalIOValidation(item) {
        let isValidChildSelection = false;
        this.validAdditionalIOSensorArrCheck = [];
        let parentItemCount = 0;

        if (item && item.childs && item.childs.length > 0) {
            for (let j = 0; j < item.childs.length; j++) {
                this.count = 0;
                this.childRecursion(item.childs[j]);
                item.childs[j].count = this.count;
                if (
                    item.childs[j].count >= item.min_childs &&
                    item.childs[j].count <= item.max_childs
                ) {
                    item.childs[j].isValidChildSelection = true;
                } else {
                    item.childs[j].isValidChildSelection = false;
                }

                //If walchem and anlog seletion in limit then sum of count = 4
                if (item.childs[j].isValidChildSelection) {
                    parentItemCount = item.childs[j].count + parentItemCount;
                    console.log("parentItemCount........", parentItemCount);
                    if (
                        parentItemCount >= item.min_childs &&
                        parentItemCount <= item.max_childs
                    ) {
                        this.isAdditionalIOInValidLimit = false;
                    } else {
                        this.isAdditionalIOInValidLimit = true;
                        this.validAdditionalIOSensorArrCheck.push(item.childs[j]);
                    }
                } else {
                    this.isAdditionalIOInValidLimit = true;
                    this.validAdditionalIOSensorArrCheck.push(item.childs[j]);
                }
            }
        } //end of if 1
    }

    /**
     * This function to check additional i/o option selection in min and limit or not(w900 series)
     **/
    wifiOptionsValidation(item) {
        let isValidChildSelection = false;
        this.validWifiOptionsArrCheck = [];
        let parentItemCount = 0;

        if (item && item.childs && item.childs.length > 0) {
            for (let j = 0; j < item.childs.length; j++) {
                this.count = 0;
                this.childRecursion(item.childs[j]);
                item.childs[j].count = this.count;
                if (
                    item.childs[j].count >= item.min_childs &&
                    item.childs[j].count <= item.max_childs
                ) {
                    item.childs[j].isValidChildSelection = true;
                } else {
                    item.childs[j].isValidChildSelection = false;
                }

                //If walchem and anlog seletion in limit then sum of count = 4
                if (item.childs[j].isValidChildSelection) {
                    parentItemCount = item.childs[j].count + parentItemCount;
                    // console.log("parentItemCount........", parentItemCount);
                    if (
                        parentItemCount >= item.min_childs &&
                        parentItemCount <= item.max_childs
                    ) {
                        this.isWifiOptionsInValidLimit = false;
                    } else {
                        this.isWifiOptionsInValidLimit = true;
                        this.validWifiOptionsArrCheck.push(item.childs[j]);
                    }
                } else {
                    this.isWifiOptionsInValidLimit = true;
                    this.validWifiOptionsArrCheck.push(item.childs[j]);
                }
            }
        } //end of if 1
    }

    /**
     * Function to get deep child count through recursion
     **/
    childRecursion(item) {
        if (item && item.childs && item.childs.length > 0) {
            for (let p = 0; p < item.childs.length; p++) {
                this.childRecursion(item.childs[p]);
            }
        } else {
            this.count++;
        }
    }
}
