import { Component, OnInit, ViewEncapsulation, NgZone, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

import { ShareQuoteComponent } from '../../pages/share-quote/share-quote.component';
import { ShareQuoteH2Component } from '../../pages/share-quoteH2/share-quoteH2.component';

/*-------------------------------- Providers ----------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { UserService } from '../../providers/user-service/user.service';
import { QuoteService } from '../../providers/quote-service/quote-service.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';
import { UploadAwsService } from '../../providers/uploadAwsService/uploadAwsService';
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { PanelDiagramService } from '../../providers/panel-diagram-service/panel-diagram.service';
import { share } from 'rxjs/operators';
import { read } from 'fs';
import { ReadVarExpr } from '@angular/compiler';

@Component({
    selector: 'app-configured-quote',
    templateUrl: './configured-quote.component.html',
    styleUrls: ['./configured-quote.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ConfiguredQuoteComponent implements OnInit {
    @ViewChild('configureBreadcrumbList') configureBreadcrumbList: ElementRef;
    @ViewChild('configureBtn') configureBtn: ElementRef;

    public repoUrl = 'https://github.com/Epotignano/ng2-social-share';
    public imageUrl = 'https://avatars2.githubusercontent.com/u/10674541?v=3&s=200';

    public headerHeight;
    public pageHeight;
    public quoteData: any;
    public configureData: any;
    public selectedFlag: boolean;
    noOfSets: number = 1;
    public decrementFlag: boolean;    
    public selectedController: any;
    public selectedControllerTitle: any;
    public selectedControllerSeries: any;
    public quantity: number = 1;
    public webServiceError: string;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public totalListPrice;
    public totalNetCost;
    public finalNetCost;
    public controllerDiscount;
    public panelDiscount;
    public accessoriesDiscount;
    public finalCost;
    public loggedinUserData;
    public isPanelDiscount;
    public isSensorDiscount;
    public isAccessoriesDiscount;
    finalQuote: any;
    public shareLink;
    public isSaveDarftBtnClicked;
    public isSaveFinalBtnClicked;
    public controllerSeries;
    public saveDraftQuote: boolean = false;
    public panelP4Type;
    public imageName;
    public datasheetList;
    public disclaimerAndNotes = {
        note : '',
        disclaimer : ''
    }
    count;
    corrosionCount = 0;
    panelUrl;
    emailText: any = '';
    public isCreateNewAccessory:any = false;
    public isSpecificOrganization:any;

    public totalTerritoryCost = 0;
    public totalUnitNetTerritoryPrice = 0;
    public totalUnitTerritoryPrice = 0;
    public sensorListDiscountDiscount;
    public fromViewQuoteOnlyView= false;

    panelComponents = {
        "ballcheck": false,
        "rotameter": false,
        "ptsaSensor": false,
        "twistToClean": false,
        "banjo": false,
        "ronVik": false,
        "asahi": false,
        "samplePort": false,
        "flowSwitch": false,
        "conductivity": false,
        "orp": false,
        "ph": false,
        "cellModem": false,
        "isolationValves": false
    };
    componenentDimensionList: any;
    panelDiscountRate;
    controllerDiscountRate;
    panelType;
    selectedPanel;
    panelName;
    corrosion = false;
    saveQuoteFlag;
    selectedValve;
    corrosionMonitorsType;
    corrosionLOGRCount = 0;
    selectedCorrosionCouponRack;
    totalCorrosion = 0;
    componenentDimensionObj;
    flowDirection;
    isSensorArrListDiscount;
    isPanelSensorDiscount;
    controllerPanelDiscount;
    panelCanvas;
    subscription;
    isHeaderPricingOptionChanged:boolean = false;
    isOldQuote = false;
    shareQuoteFromViewQuote = false;
    shareQuoteH2FromViewQuote = false;
    isEditViewedQuote = false;
    quotationNo;
    public selectedSeries900;
    public topSectionHeight;
    public isTypeClear;

    constructor(private zone:NgZone,
        private locstr: LocalStorageService, public sidebar: SidebarService,
        private commonService: CommonService, private _elementRef: ElementRef,
        private userService: UserService, private broadcaster: Broadcaster, private quoteService: QuoteService, 
        public constants: Constants, private toastService: ToastService, private router: Router, 
        public uploadAwsService: UploadAwsService, public panelDiagramService: PanelDiagramService, 
        private cdr: ChangeDetectorRef) {
         
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
        if(this.locstr.get( 'isOldDraft' )){
            this.locstr.removeObj('isOldDraft');
        }
    }

    ngOnInit() {
        this.subscription = this.broadcaster.on<any>( 'ON_HEADER_QUOTE_UPDATE' )
        .subscribe( message => {
           this.onLoad();
           this.isHeaderPricingOptionChanged = true;
        } );

        this.subscription = this.broadcaster.on<any>( 'RECALL_CONFIGURE_QUOTE' )
        .subscribe( message => {
            this.onLoad();
        } );
       
        this.subscription = this.broadcaster.on<any>( 'ON_SHARE_CHANGED_PRICING_OPTION' )
            .subscribe( message => {
                console.log("message................", message);
                if(message){
                    this.configureData.QuotationType = message;
                    setTimeout(()=>{
                        this.configureQuote(this.configureData, true);
                    }, 500);
                }
            } );
        this.subscription =  this.broadcaster.on<any>( 'QUOTE_NO_CHANGE' )
        .subscribe( message => {
            console.log("QUOTE_NO_CHANGE message.....", message);
            this.quoteData.quoteNo = message;
            if(this.locstr.get('quoteNo')){
                this.locstr.set('quoteNo',message);
            }
            if (this.commonService.getCreateQuoteVo()) {
                this.commonService.getCreateQuoteVo().quoteNo = message;
                this.commonService.setCreateQuoteVo( this.commonService.getCreateQuoteVo());
            }
        } );
        this.onLoad();
    }

    onLoad(){
        this.sidebar.show();
        this.isLoadFailed = false;
        this.isPanelDiscount = false;
        this.isSaveDarftBtnClicked = false;
        this.isAccessoriesDiscount = false;

        this.isCreateNewAccessory =  this.locstr.getObj("isCreateNewAccessory");
        if(this.locstr.get( 'saveQuoteFlag' )){
            this.saveQuoteFlag = this.locstr.get( 'saveQuoteFlag' );
        }
        // this.isSaveFinalBtnClicked = false;

        //discount shwwing only to ORG admin
        this.loggedinUserData = this.userService.getUser();
        //bredcrumb : selected controller and series 
        if (!this.isCreateNewAccessory) {
            this.selectedControllerTitle = this.commonService.getCreateQuoteVo().selectedController.name;
            this.selectedControllerSeries = this.commonService.getCreateQuoteVo().selectedControllerSeries;
            if(this.selectedControllerSeries.tag == 'WCT900P' || this.selectedControllerSeries.tag == 'WCT900H' || this.selectedControllerSeries.tag == 'WCT910H' || this.selectedControllerSeries.tag == 'WCT910P' || this.selectedControllerSeries.tag == 'WCT930P' || this.selectedControllerSeries.tag == 'WCT930H'){
                this.selectedSeries900 = "WCT900P";
            }
        }

        if(this.locstr.get( 'shareQuoteFromViewQuote' ) === 'true'){
            this.shareQuoteFromViewQuote = true;
        }else{
            this.shareQuoteFromViewQuote = false;
        }
        if (this.locstr.get('shareQuoteH2FromViewQuote') === 'true') {
            this.shareQuoteH2FromViewQuote = true;

        } else {
            this.shareQuoteH2FromViewQuote = false;
        }

        if(this.locstr.get( 'isEditViewedQuote' ) === 'true'){
            this.isEditViewedQuote = true;
        }else{
            this.isEditViewedQuote = false;
        }
        
        if (this.commonService.getCreateQuoteVo().draftPath == '/configuredQuote' && this.commonService.getCreateQuoteVo().isEditDraftQuote) {
            if (this.commonService.getCreateQuoteVo().isEditDraftQuote) {
                console.log("this.commonService.getCreateQuoteVo()................", this.commonService.getCreateQuoteVo());
                this.locstr.set('quoteId', this.commonService.getCreateQuoteVo().id);
                this.locstr.set('quoteNo', this.commonService.getCreateQuoteVo().quoteNo);
                this.disclaimerAndNotes.disclaimer = this.commonService.getCreateQuoteVo().disclaimer;
                this.disclaimerAndNotes.note = this.commonService.getCreateQuoteVo().note;
                this.locstr.setObj('disclaimerAndNotes', this.disclaimerAndNotes);
                let getQuoteData;
                getQuoteData = this.commonService.getCreateQuoteVo();
                getQuoteData.parts.quoteNo = getQuoteData.quoteNo;
                this.locstr.setObj('parts', getQuoteData.parts);                
                this.saveDraftQuote = true;
                if(this.locstr.get('fromViewQuoteOnlyView')){
                    if(this.locstr.get('fromViewQuoteOnlyView') == 'true')
                    this.fromViewQuoteOnlyView = true;
                }else{
                    this.fromViewQuoteOnlyView = false;
                }
            } else {
                this.saveDraftQuote = false;
            }
        } else if (this.commonService.getCreateQuoteVo().draftPath == '/configuredQuote' && this.commonService.getCreateQuoteVo().isEditSavedQuote) {
            if (this.commonService.getCreateQuoteVo().isEditSavedQuote) {
                this.locstr.set('quoteId', this.commonService.getCreateQuoteVo().id);
                this.locstr.set('quoteNo', this.commonService.getCreateQuoteVo().quoteNo);
                this.disclaimerAndNotes.disclaimer = this.commonService.getCreateQuoteVo().disclaimer;
                this.disclaimerAndNotes.note = this.commonService.getCreateQuoteVo().note;
                this.locstr.setObj('disclaimerAndNotes', this.disclaimerAndNotes);
                let getQuoteData;
                getQuoteData = this.commonService.getCreateQuoteVo();
                getQuoteData.parts.quoteNo = getQuoteData.quoteNo;
                this.locstr.setObj('parts', getQuoteData.parts);  
                this.saveDraftQuote = true;
                if(this.locstr.get('fromViewQuoteOnlyView')){
                    if(this.locstr.get('fromViewQuoteOnlyView') == 'true')
                    this.fromViewQuoteOnlyView = true;
                }else{
                    this.fromViewQuoteOnlyView = false;
                }
            } else {
                this.saveDraftQuote = false;
            }
        }

        if (this.isCreateNewAccessory) {
            this.commonService.storeDataInCreateQuoteVo('selectedFlowDirections',[]);
            this.commonService.storeDataInCreateQuoteVo('selectedPanelOptions',[]);
            this.commonService.storeDataInCreateQuoteVo('selectedSensorList',[]);
            this.configureData = this.quoteService.configureQuoteVoFormationForAccessories();
        } else {
            this.configureData = this.quoteService.configureQuoteVoFormation();
        }

        //web service call
        this.configureQuote(this.configureData, false);
    }

    /**
     * This function of router guard, will check if state can be deactivated
     **/
    canDeactivate(currentState: RouterStateSnapshot, nextState: RouterStateSnapshot) {
        if (!this.commonService.isCreateQuoteRoute(nextState['url']) && !this.isSaveDarftBtnClicked) {
            if (nextState['url'] === "/") {
                // logout option selected
                return true;
            } else {
                return Observable.create((observer: Observer<boolean>) => {
                    if (this.commonService.getCreateQuoteVo().isEditDraftQuote && ( this.fromViewQuoteOnlyView == false && this.shareQuoteFromViewQuote == false && this.shareQuoteH2FromViewQuote == false)) {
                        this.commonService.showDiscardConfirmAsDraft(() => {
                            // yes callback -> save quote as draft
                            this.save(true, '/configuredQuote', true);
                            this.broadcaster.on<any>('ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS')
                                .subscribe(message => {
                                    observer.next(true);
                                    observer.complete();
                                });
                        }, () => {
                            // Discard callback -> remove all locally stored create quote data
                            //this.commonService.clearCreateRouteData();
                            observer.next(true);
                            observer.complete();
                        }, () => {
                            // cross button callback -> stay on page
                            observer.next(false);
                            observer.complete();
                        });
                    }else if (this.commonService.getCreateQuoteVo().isEditSavedQuote && (this.fromViewQuoteOnlyView == false && this.shareQuoteFromViewQuote == false && this.shareQuoteH2FromViewQuote == false)) {
                        this.commonService.showDiscardConfirmAsSaveFinal(() => {
                            // yes callback -> save quote as draft
                            this.save(false, '/configuredQuote', true);
                            this.broadcaster.on<any>('ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS')
                                .subscribe(message => {
                                    observer.next(true);
                                    observer.complete();
                                });
                        }, () => {
                            // Discard callback -> remove all locally stored create quote data
                            //this.commonService.clearCreateRouteData();
                            observer.next(true);
                            observer.complete();
                        }, () => {
                            // cross button callback -> stay on page
                            observer.next(false);
                            observer.complete();
                        });
                    } else {
                        if( (this.isEditViewedQuote === false) && (this.fromViewQuoteOnlyView === false && this.shareQuoteFromViewQuote === false && this.shareQuoteH2FromViewQuote == false)){
                            this.commonService.showDiscardConfirmAsDraft(() => {
                                // yes callback -> save quote as draft
                                this.save(true, '/configuredQuote', true);
                                this.broadcaster.on<any>('ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS')
                                    .subscribe(message => {
                                        observer.next(true);
                                        observer.complete();
                                    });
                            }, () => {
                                // Discard callback -> remove all locally stored create quote data
                                //this.commonService.clearCreateRouteData();
                                observer.next(true);
                                observer.complete();
                            }, () => {
                                // cross button callback -> stay on page
                                observer.next(false);
                                observer.complete();
                            });

                        }else{
                            observer.next(true);
                            observer.complete();
                            this.locstr.set('shareQuoteFromViewQuote', false);
                            this.locstr.set('shareQuoteH2FromViewQuote', false);
                            this.locstr.set('fromViewQuoteOnlyView', false);
                            this.locstr.set('isEditViewedQuote', false);
                        }
                    }

                });
            }
        } else {
            return true;
        }

    }

    /**
 * Function to add new organization admin
 **/
    emailQuote = (fromShareQuote) => {

        //get formatted configuredQuoteVo
        this.locstr.setObj("disclaimerAndNotes", this.disclaimerAndNotes);
        if (this.isCreateNewAccessory) {
            this.configureData = this.quoteService.configureQuoteVoFormationForAccessories();
        } else {
            this.configureData = this.quoteService.configureQuoteVoFormation();
        }

        // if(this.locstr.get('shareQuoteFromViewQuote')){
        //     this.locstr.set('shareQuoteFromViewQuote', false);
        // }

        let createdQuote = this.commonService.getCreateQuoteVo();
        let OrgLogo;
        this.broadcaster.on<any>('USER_CREATED')
            .subscribe(data => {
                OrgLogo = data.orgLogoUrl;
            });

        if (!OrgLogo) {
            let userData = this.userService.getUser();
            if (userData.orgLogoUrl) {
                OrgLogo = userData.orgLogoUrl;
            } else {
                OrgLogo = 'https://s3.amazonaws.com/configuratortestenv/pdf/logo_here.png';
            }
        }

        //Change quotation price for pdf generation according to special organization and quote type
        if(this.isSpecificOrganization && this.quoteData.QuotationType.type == 'q1'){
            this.finalCost = this.totalListPrice;
        }else if(this.quoteData.QuotationType.type == 'q3'){
            this.finalCost = this.totalListPrice;
        }else if(this.quoteData.QuotationType.type == 'q6'){
            this.finalCost = this.totalListPrice;
        }else if(this.quoteData.QuotationType.type == 'q2'){
            this.finalCost = this.totalListPrice;
            this.finalNetCost = this.totalNetCost;
        }else if( this.quoteData.QuotationType.type == 'q4' || this.quoteData.QuotationType.type == 'q5'){
            this.finalCost = this.totalUnitTerritoryPrice;
            this.finalNetCost = this.totalUnitNetTerritoryPrice;;
        }else if(!this.isSpecificOrganization && this.quoteData.QuotationType.type == 'q1'){
            this.finalCost = this.totalListPrice;
        }

        var payload = {};

        //If createdQuote object has selectedPanelOptions array length means it is normal quote else its accessories only quote
        if (createdQuote.selectedPanelOptions.length) {
             payload = {
                'imagename': this.imageName + '.jpeg',
                'imagelink': this.panelUrl,
                'quote': this.configureData,
                'customerName': createdQuote.projectDetails.customerName,
                'projectName': createdQuote.projectDetails.projectName,
                'quoteNo': this.quoteData.quoteNo,
                'logo': OrgLogo,
                'preparedBy': this.quoteData.userName,
                'quotetionObjArray': this.quoteData.parts,
                'totalAmount': this.finalCost,
                'totalNetAmount': this.finalNetCost,
                'totalTerritoryAmount': this.totalTerritoryCost,
                'is_specific_organization': this.isSpecificOrganization,
                'salesRep': this.quoteData.salesRep,
                'quoteType': this.quoteData.QuotationType
            };
        } else {
            //send imagename and image imagelink null in accessories only case
             payload = {
                'imagename': null,
                'imagelink': null,
                'quote': this.configureData,
                'customerName': createdQuote.projectDetails.customerName,
                'projectName': createdQuote.projectDetails.projectName,
                'quoteNo': this.quoteData.quoteNo,
                'logo': OrgLogo,
                'preparedBy': this.quoteData.userName,
                'quotetionObjArray': this.quoteData.parts,
                'totalAmount': this.finalCost,
                'totalNetAmount': this.finalNetCost,
                'totalTerritoryAmount': this.totalTerritoryCost,
                'is_specific_organization': this.isSpecificOrganization,
                'salesRep': this.quoteData.salesRep,
                'quoteType': this.quoteData.QuotationType
            };
        }
        if(!fromShareQuote){
            this.commonService.openComponentModal(ShareQuoteComponent, payload, "Cancel", "Send", "customModal emailQuote", (res) => {
                if (res.status == 'success') {
                    this.toastService.popToast("success", res.message);
                } else {
                    this.toastService.popToast("Error", res.message);
                }
            });
        }else{
            this.broadcaster.broadcast( 'QUOTE_GENERATED_WITH_SHARED_QUOTE_TYPE', payload);
        }
    }

    emailH2Quote = (fromShareQuote) => {

        //get formatted configuredQuoteVo
        this.locstr.setObj("disclaimerAndNotes", this.disclaimerAndNotes);
        if (this.isCreateNewAccessory) {
            this.configureData = this.quoteService.configureQuoteVoFormationForAccessories();
        } else {
            this.configureData = this.quoteService.configureQuoteVoFormation();
        }

        // if(this.locstr.get('shareQuoteFromViewQuote')){
        //     this.locstr.set('shareQuoteFromViewQuote', false);
        // }

        let createdQuote = this.commonService.getCreateQuoteVo();
        let OrgLogo;
        this.broadcaster.on<any>('USER_CREATED')
            .subscribe(data => {
                OrgLogo = data.orgLogoUrl;
            });

        if (!OrgLogo) {
            let userData = this.userService.getUser();
            if (userData.orgLogoUrl) {
                OrgLogo = userData.orgLogoUrl;
            } else {
                OrgLogo = 'https://s3.amazonaws.com/configuratortestenv/pdf/logo_here.png';
            }
        }

        //Change quotation price for pdf generation according to special organization and quote type
        if (this.isSpecificOrganization && this.quoteData.QuotationType.type == 'q1') {
            this.finalCost = this.totalListPrice;
        } else if (this.quoteData.QuotationType.type == 'q3') {
            this.finalCost = this.totalListPrice;
        } else if (this.quoteData.QuotationType.type == 'q6') {
            this.finalCost = this.totalListPrice;
        } else if (this.quoteData.QuotationType.type == 'q2') {
            this.finalCost = this.totalListPrice;
            this.finalNetCost = this.totalNetCost;
        } else if (this.quoteData.QuotationType.type == 'q4' || this.quoteData.QuotationType.type == 'q5') {
            this.finalCost = this.totalUnitTerritoryPrice;
            this.finalNetCost = this.totalUnitNetTerritoryPrice;;
        } else if (!this.isSpecificOrganization && this.quoteData.QuotationType.type == 'q1') {
            this.finalCost = this.totalListPrice;
        }

        var payload = {};

        //If createdQuote object has selectedPanelOptions array length means it is normal quote else its accessories only quote
        if (createdQuote.selectedPanelOptions.length) {
            payload = {
                'imagename': this.imageName + '.jpeg',
                'imagelink': this.panelUrl,
                'quote': this.configureData,
                'customerName': createdQuote.projectDetails.customerName,
                'projectName': createdQuote.projectDetails.projectName,
                'quoteNo': this.quoteData.quoteNo,
                'logo': OrgLogo,
                'preparedBy': this.quoteData.userName,
                'quotetionObjArray': this.quoteData.parts,
                'totalAmount': this.finalCost,
                'totalNetAmount': this.finalNetCost,
                'totalTerritoryAmount': this.totalTerritoryCost,
                'is_specific_organization': this.isSpecificOrganization,
                'salesRep': this.quoteData.salesRep,
                'quoteType': this.quoteData.QuotationType
            };
        } else {
            //send imagename and image imagelink null in accessories only case
            payload = {
                'imagename': null,
                'imagelink': null,
                'quote': this.configureData,
                'customerName': createdQuote.projectDetails.customerName,
                'projectName': createdQuote.projectDetails.projectName,
                'quoteNo': this.quoteData.quoteNo,
                'logo': OrgLogo,
                'preparedBy': this.quoteData.userName,
                'quotetionObjArray': this.quoteData.parts,
                'totalAmount': this.finalCost,
                'totalNetAmount': this.finalNetCost,
                'totalTerritoryAmount': this.totalTerritoryCost,
                'is_specific_organization': this.isSpecificOrganization,
                'salesRep': this.quoteData.salesRep,
                'quoteType': this.quoteData.QuotationType
            };
        }

        if (!fromShareQuote) {
            this.commonService.openComponentModal(ShareQuoteH2Component, payload, "Cancel", "Send", "customModal emailH2Quote", (res) => {
                if (res.status == 'success') {
                    this.toastService.popToast("success", res.message);
                } else {
                    this.toastService.popToast("Error", res.message);
                }
            });
        } else {
            this.broadcaster.broadcast('QUOTE_GENERATED_WITH_SHARED_QUOTE_TYPE', payload);
        }
    }


    /**
     * Function to check if quote already saved as draft and
     * switching to another tab then
     *  it will not show confirmation popup for save as draft 
     **/
    saveDarftBtnClicked() {
        this.isSaveDarftBtnClicked = true;
    }

    /**
     * Function to check if quote already saved as final and
     * switching to another tab then
     *  it will not show confirmation popup for save as final
     **/
    saveAsFinalBtnClicked() {
        this.isSaveDarftBtnClicked = true;
    }

    ngAfterViewInit() {
        setTimeout( () => {
            let breadCrumbbtnHeight;
            let breadCrumbHeight;
            breadCrumbHeight = this.configureBreadcrumbList.nativeElement.offsetHeight;
            breadCrumbbtnHeight = this.configureBtn.nativeElement.offsetHeight;
            if(window.orientation == 0){
                this.topSectionHeight = breadCrumbHeight + 104;
                if(window.innerWidth > 768){
                    this.topSectionHeight = breadCrumbHeight + breadCrumbbtnHeight + 68;
                }
            }else{
                this.topSectionHeight = breadCrumbHeight + breadCrumbbtnHeight + 68;
            }
            this.cdr.detectChanges();
        }, 500);
       
        if(this.locstr.get( 'isOldDraft' ) === 'true'){
            this.isOldQuote = true;
            this.cdr.detectChanges();
        }else{
            this.isOldQuote = false;
        }

        this.componenentDimensionObj = this.panelDiagramService.getDiagramAxisValue();

        this.finalQuote = this.commonService.getCreateQuoteVo();
        if (!this.isCreateNewAccessory) {
            this.panelName = this.finalQuote.selectedFlowDirections[0].tag;
            this.selectedPanel = this.finalQuote.selectedFlowDirections[0].tag;
            this.flowDirection = JSON.parse(JSON.stringify(this.finalQuote.selectedFlowDirections[0].tag));
            this.panelP4Type = this.finalQuote.selectedFlowDirections[0].tag;
            var activeSeries = this.finalQuote.selectedControllerSeries.tag;
        }

        if (activeSeries == "WCT600P" || activeSeries == "WCT600H") {
            this.controllerSeries = 'w600_walchem';
        } else if (activeSeries == "WCT910P" || activeSeries == "WCT900P" || activeSeries == "WCT900H" || activeSeries == "WCT910H" || activeSeries == "WCT930P" || activeSeries == "WCT930H") {
            this.controllerSeries = 'w900_walchem';
        } else if (activeSeries == "PA-2") {
            this.controllerSeries = 'Aegis2';
        }else if (activeSeries == "XS") {
            this.controllerSeries = 'mega_tron';
        }

        if (this.selectedPanel == 'PP4-A' || this.selectedPanel == 'PP4-B') {
            this.selectedPanel = 'PP4';
        }
        if (this.selectedPanel == 'PP3' || this.selectedPanel == 'PP33' || this.selectedPanel == 'PE1') {
            this.selectedPanel = 'PP3';
        }

        if (this.selectedPanel == 'PP2') {
            this.componenentDimensionList = this.componenentDimensionObj.PP2;
            console.log("componenentDimensionList pp2........", this.componenentDimensionList);
            this.panelType = "P2-diagram";
        } else if (this.selectedPanel == 'PP3') {
            this.componenentDimensionList = this.componenentDimensionObj.PP3;
            console.log("componenentDimensionList pp3........", this.componenentDimensionList);
            this.panelType = "P3-diagram";
        } else if (this.selectedPanel == 'PP4') {
            this.count = 0;
            this.componenentDimensionList = this.componenentDimensionObj.PP4;
            console.log("componenentDimensionList pp4........", this.componenentDimensionList);
            this.panelType = "P4-diagram";
            if (this.finalQuote.selectedAccessories) {
                for (let i = 0; i < this.finalQuote.selectedAccessories.length; i++) {
                    if (this.finalQuote.selectedAccessories[i].tag == 'PMP') {
                        for (let j = 0; j < this.finalQuote.selectedAccessories[i].childs.length; j++) {
                            if (this.finalQuote.selectedAccessories[i].childs[j].isChecked) {
                                this.count++;
                            }
                        }
                    }
                }
            }
        }
    }
    
    public drawPanelDigram = () => {
        this.panelCanvas = false;
        this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );  
        if (!this.isCreateNewAccessory) {
            this.createPanelDiagram();
        }
        setTimeout(() => {
            this.createPanelDiagram();
            this.commonService.hideLoading();
            this.panelCanvas = true;
        }, 2000);
    }

    /**
     * Create Panel Diagram
     **/
    public createPanelDiagram = () => {
        let flowDirectionObj;
        let flowDirection;
        let pipeName;
        let dimension;
        let flowType;
        let couponRackType;
        let is3passClearCamRack = false;

        if( this.finalQuote && this.finalQuote.selectedController){
            this.selectedController = this.finalQuote.selectedController;
        }
        let optionLength;
        if( this.finalQuote && this.finalQuote.selectedPanelOptions){
            optionLength = this.finalQuote.selectedPanelOptions.length;
        }
        
        for (let i = 0; i < optionLength; i++) {
            if (this.finalQuote.selectedPanelOptions[i].tag == 'BC' || this.finalQuote.selectedPanelOptions[i].tag == 'H2-RBC') {
                this.panelComponents.ballcheck = true;
            }

            if (this.finalQuote.selectedPanelOptions[i].tag == 'RTM' || this.finalQuote.selectedPanelOptions[i].tag == 'H2-RBC') {
                this.panelComponents.rotameter = true;
            }

            if (this.finalQuote.selectedPanelOptions[i].tag == 'ST' && this.panelName != 'PE1') {
                for (let j = 0; j < this.finalQuote.selectedPanelOptions[i].childs.length; j++) {
                    if (this.finalQuote.selectedPanelOptions[i].childs[j].isChecked) {
                        if (this.finalQuote.selectedPanelOptions[i].childs[j].tag == 'STNR-1') {
                            this.panelComponents.twistToClean = true;
                        } else if (this.finalQuote.selectedPanelOptions[i].childs[j].tag == 'STNR-2') {
                            this.panelComponents.asahi = true;
                        } else if (this.finalQuote.selectedPanelOptions[i].childs[j].tag == 'STNR-3') {
                            this.panelComponents.banjo = true;
                        } else if (this.finalQuote.selectedPanelOptions[i].childs[j].tag == 'STNR-4') {
                            this.panelComponents.ronVik = true;
                        }
                    }
                }
            }
           
            // if (this.finalQuote.selectedPanelOptions[i].tag == 'SAPO' && this.panelName != 'PE1') {                
            //     this.panelComponents.samplePort = true;
            // }

            if (this.panelName != 'PE1') {                
                this.panelComponents.samplePort = true;
            }

            if (this.finalQuote.selectedPanelOptions[i].tag == 'FLSW') {
                this.panelComponents.flowSwitch = true;
            }

            if (this.finalQuote.selectedPanelOptions[i].tag == 'CELL-CUM') {
                this.panelComponents.cellModem = true;
            }

            if (this.finalQuote.selectedPanelOptions[i].tag == 'IV' && this.panelName != 'PE1') {
                let valves = this.finalQuote.selectedPanelOptions[i].childs;
                for (let j = 0; j < valves.length; j++) {
                    if (valves[j].isChecked) {
                        if (valves[j].tag == 'IV-2') {
                            this.selectedValve = 'true-union';
                        } else {
                            this.selectedValve = '01';
                        }
                    }
                }
                this.panelComponents.isolationValves = true;
            }

            if (this.finalQuote.selectedPanelOptions[i].tag == 'CCR') {
                let corrosionCouponRack = this.finalQuote.selectedPanelOptions[i].childs;
                for (let j = 0; j < corrosionCouponRack.length; j++) {
                    if (corrosionCouponRack[j].isChecked) {
                        //Cam rack corrosion coupon
                        if (corrosionCouponRack[j].tag == 'CCR-2' || corrosionCouponRack[j].tag == 'CCR-4' || corrosionCouponRack[j].tag == 'CCR-3PCR' || corrosionCouponRack[j].tag == 'H2-CR2-CL' || corrosionCouponRack[j].tag == 'H2-CR3-CLv' || corrosionCouponRack[j].tag == 'H2-CR4-CL') {
                            this.selectedCorrosionCouponRack = 'cam-rack';
                            if(corrosionCouponRack[j].tag == 'H2-CR2-CL' && this.selectedPanel == 'PP3'){
                                couponRackType = "2-Pass-Coupon-Rack";
                            }else if((corrosionCouponRack[j].tag == 'CCR-3PCR' || corrosionCouponRack[j].tag == 'H2-CR3-CLv') && this.selectedPanel == 'PP3' ){
                                couponRackType = "3-Pass-Coupon-Rack";
                                //3pass clear cam rack
                                if(corrosionCouponRack[j].tag == 'CCR-3PCR'){
                                    is3passClearCamRack = true;
                                }
                             
                            }
                        } else {
                            //Standard corrosion coupon
                            this.selectedCorrosionCouponRack = '01';
                            //If 2pass gray standard coupon selected
                            if(corrosionCouponRack[j].tag == 'CCR-2PGS' && this.selectedPanel == 'PP3'){
                                couponRackType = "2-Pass-Coupon-Rack";
                            }else if((corrosionCouponRack[j].tag == 'CCR-3' || corrosionCouponRack[j].tag == 'CCR-3PGS' ) && this.selectedPanel == 'PP3'){
                                //If 3pass gray standard coupon selected
                                //3pass clear, 3pass gray
                                couponRackType = "3-Pass-Coupon-Rack";
                            }else{
                                couponRackType = null;
                            }
                        }        
                        
                        if(corrosionCouponRack[j].tag == 'CCR-2' || corrosionCouponRack[j].tag == 'CCR-1' || corrosionCouponRack[j].tag == 'CCR-4' || 
                            corrosionCouponRack[j].tag == 'CCR-4-CL' ||  corrosionCouponRack[j].tag == 'CCR-3PCR' || corrosionCouponRack[j].tag == 'CCR-3'){
                            this.isTypeClear = true;
                        }
                    }
                }
            }
        }

        let sensorListObj;
        if( this.finalQuote && this.finalQuote.selectedSensorList){
            sensorListObj = this.finalQuote.selectedSensorList;
            this.searchObj(sensorListObj, 'tag');
        }

        if( this.finalQuote && this.finalQuote.selectedFlowDirections[0]){
            flowDirectionObj = this.finalQuote.selectedFlowDirections[0].childs.filter((item) => {
                return item.isChecked;
            });
        }

        if(flowDirectionObj && flowDirectionObj[0]){
            flowDirection = flowDirectionObj[0].tag;
        }
        
        let panelType;
        if(this.selectedCorrosionCouponRack) {
            panelType = '';
            // corrosionLOGRCount is the corrision monitor
            // corrisionCount is the corrision
            this.totalCorrosion = this.corrosionLOGRCount + this.corrosionCount;
        } else {
            /* Conditional dimension when corrosion coupon rack not selected */
            if (this.selectedPanel == 'PP3') {
                panelType = '_1';
                this.componenentDimensionList = this.componenentDimensionObj.PP3_panel_without_Coupon_Rack;
            } else if (this.selectedPanel == 'PP4') {
                panelType = '_1';
                this.componenentDimensionList = this.componenentDimensionObj.PP4_panel_without_Coupon_Rack;
            } else {
                panelType = '';
            }
        }

        //Dimesions for H2P3 gray 3pass clear coupon holder and H2P3 gray 2pass coupon holder
        if(this.selectedPanel == 'PP3' && couponRackType == "3-Pass-Coupon-Rack" && this.loggedinUserData && this.loggedinUserData.isSpecificOrganization){
            this.componenentDimensionList = this.componenentDimensionObj.H2P3_Gray_3pass_Clear_Coupon_Holder;
            this.panelType = "H2P3-3pass-clear";
           console.log("componenentDimensionList H2P3-3pass-clear........", this.componenentDimensionList);
        }else if(this.selectedPanel == 'PP3' && couponRackType == "2-Pass-Coupon-Rack" && this.loggedinUserData && this.loggedinUserData.isSpecificOrganization){
            this.componenentDimensionList = this.componenentDimensionObj.H2P3_Gray_2pass_Coupon_Holder;
            this.panelType = "H2P3-2pass";
            console.log("componenentDimensionList H2P3_Gray_2pass_Coupon_Holder........", this.componenentDimensionList);
        }
        
        //Flow direction (BLTL, BRTR, BRTL, BLTR)
        if (flowDirection && flowDirection == 'H2-BL-TL') {
            flowType = "BLTL";
            pipeName = "BLTL_Pipe" + panelType;
            dimension = this.componenentDimensionList.P2A;
        } else if (flowDirection && flowDirection == 'H2-BL-TR') {
            flowType = "BLTR";
            pipeName = "BLTR_Pipe" + panelType;
            dimension = this.componenentDimensionList.P2B;
        } else if (flowDirection && flowDirection == 'H2-BR-TL') {
            flowType = "BRTL";
            pipeName = "BRTL_Pipe" + panelType;
            dimension = this.componenentDimensionList.P2C;
        } else if (flowDirection && flowDirection == 'H2-BR-TR') {
            flowType = "BRTR";
            pipeName = "BRTR_Pipe" + panelType;
            dimension = this.componenentDimensionList.P2D;
        }

        
        var canvas = null,
        ctx = null;
        canvas = this._elementRef.nativeElement.querySelector('canvas');
        ctx = canvas.getContext("2d");
        var background = new Image();
        background.src = "";
        
        //If selected panel "PP3" then draw different pipes images
        if (this.selectedPanel == 'PP3') {
            //Based on coupon rack types draw pipe img
            if( couponRackType == "2-Pass-Coupon-Rack" && this.isSpecificOrganization){
                if(this.isTypeClear){
                    background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + "_Clear.png";
                }else{
                    background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + ".png";
                }
               
                
            }else if( couponRackType == "3-Pass-Coupon-Rack" && this.isSpecificOrganization){
                if(this.isTypeClear){
                    background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + "_Clear.png";
                }else{
                    background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + ".png";
                }
            }else{
                if(this.panelName == 'PE1') {
                    if(this.isTypeClear){
                        background.src = "../../assets/images/" + this.panelName +'-diagram' + "/" + flowType + "/" + pipeName + "_Clear.png";
                    }else{
                        background.src = "../../assets/images/" + this.panelName +'-diagram' + "/" + flowType + "/" + pipeName + ".png";
                    }
                } else {
                    if(this.isTypeClear){
                        background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + "_Clear.png";
                    }else{
                        background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + ".png";
                    }
                }
            }
        }else{
            if(this.panelName == 'PE1') {
                if(this.isTypeClear){
                    background.src = "../../assets/images/" + this.panelName +'-diagram' + "/" + flowType + "/" + pipeName + "_Clear.png";
                }else{
                    background.src = "../../assets/images/" + this.panelName +'-diagram' + "/" + flowType + "/" + pipeName + ".png";
                }
            } else {
                if(this.isTypeClear){
                    background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + "_Clear.png";
                }else{
                    background.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + pipeName + ".png";
                }
            }
        }

        console.log("background.src.....", background.src);
        background.onload = function () {
            if(background.complete) {
                ctx.drawImage(background, 0, 0);
            } else {
                background.onload = function () {
                    ctx.drawImage(background, 0, 0);                    
                }
            }                
        }
        
        if (this.panelComponents.isolationValves) {
            var background1 = new Image();
            let width, 
                height,
                valveName;
            if(this.selectedPanel == 'PP4') {
                width = 34, 
                height = 29;
            } else {
                width = 50, 
                height = 43;
            }

            // Outlet valve img
            if(this.selectedValve == 'true-union') {
                valveName = this.selectedValve+"-1";
            } else {
                valveName = "01";
            }
            background1.src = "";
            background1.src = "../../assets/images/" + this.panelType + "/" + flowType + "/"+ valveName +".png";


            // Make sure the image is loaded first otherwise nothing will draw.
            background1.onload = function () {
                if(background1.complete) {
                    ctx.drawImage(background1, dimension.component1.x, dimension.component1.y,  width, height);
                } else {
                    background1.onload = function () {
                        ctx.drawImage(background1, dimension.component1.x, dimension.component1.y,  width, height);
                    }
                }                
            }

            // Inlet valve img
            var background13 = new Image();
            var secondvalveName;
            // Need to change below code for optimization
            if(this.selectedValve == 'true-union') {
                secondvalveName = this.selectedValve+"-2";
            } else {
                secondvalveName = "13";
            }
            background13.src = "";
            background13.src = "../../assets/images/" + this.panelType + "/" + flowType + "/"+ secondvalveName +".png";
           
            // Make sure the image is loaded first otherwise nothing will draw.
            background13.onload = function () {
                if(background13.complete) {
                    ctx.drawImage(background13, dimension.component13.x, dimension.component13.y, width, height);
                } else {
                    background13.onload = function () {
                        ctx.drawImage(background13, dimension.component13.x, dimension.component13.y, width, height);
                    }
                }                
            }
        }

        //If ballcheck selected
        if (this.panelComponents.ballcheck) {
            var background3 = new Image();
            background3.src = "";
            background3.src = "../../assets/images/" + this.panelType + "/" + flowType + "/03_Nibco_Check_Valve.png";
            // Make sure the image is loaded first otherwise nothing will draw.
            background3.onload = function () {
                if(background3.complete) {
                    ctx.drawImage(background3, dimension.component2.x, dimension.component2.y);
                } else {
                    background3.onload = function () {
                        ctx.drawImage(background3, dimension.component2.x, dimension.component2.y);
                    }
                }                
            }
        }

        //Removed unnecessary elbow images for 3pass coupon rack
        if(((couponRackType == "3-Pass-Coupon-Rack" && flowType != "BLTR" ) && (couponRackType == "3-Pass-Coupon-Rack" && flowType != "BRTL")) || ((couponRackType == "2-Pass-Coupon-Rack" && flowType != "BRTR" ) && (couponRackType == "2-Pass-Coupon-Rack" && flowType != "BLTL")) || couponRackType == null ){
            var background2 = new Image();
            background2.src = "";
            background2.src = "../../assets/images/" + this.panelType + "/" + flowType + "/02.png";
           console.log("02..................",  dimension.component3);
            background2.onload = function () {
                if(background2.complete) {
                    ctx.drawImage(background2, dimension.component3.x, dimension.component3.y);
                } else {
                    background2.onload = function () {
                        ctx.drawImage(background2, dimension.component3.x, dimension.component3.y);
                    }
                }                
            }
        }

        //If rotameter seleceted
        if (this.panelComponents.rotameter) {
            var background4 = new Image();
            background4.src = "";
            background4.src = "../../assets/images/" + this.panelType + "/" + flowType + "/04_King_Flow_Meter.png";
            // Make sure the image is loaded first otherwise nothing will draw.
            background4.onload = function () {
                if(background4.complete) {
                    ctx.drawImage(background4, dimension.component4.x, dimension.component4.y);
                } else {
                    background4.onload = function () {
                        ctx.drawImage(background4, dimension.component4.x, dimension.component4.y);
                    }
                }                
            }
        }

        //If PTSA sensor selected
        if (this.panelComponents.ptsaSensor) {
            var background5 = new Image();
            background5.src = "";
            background5.src = "../../assets/images/" + this.panelType + "/" + flowType + "/05_Little_Dipper_Sensor.png";
            
            // Make sure the image is loaded first otherwise nothing will draw.
            background5.onload = function () {
                if(background5.complete) {
                    ctx.drawImage(background5, dimension.component5.x, dimension.component5.y);
                } else {
                    background5.onload = function () {
                        ctx.drawImage(background5, dimension.component5.x, dimension.component5.y);
                    }
                }                
            }
        }

        //elbow below PTSA sensor
            var background5_1 = new Image();
            background5_1.src = "";
            background5_1.src = "../../assets/images/" + this.panelType + "/" + flowType + "/elbow_1.png";
            // Make sure the image is loaded first otherwise nothing will draw.
            background5_1.onload = function () {
                if(background5_1.complete) {
                    ctx.drawImage(background5_1, dimension.component5_elbow.x, dimension.component5_elbow.y);
                } else {
                    background5_1.onload = function () {
                        ctx.drawImage(background5_1, dimension.component5_elbow.x, dimension.component5_elbow.y);
                    }
                }                
            }
        
        if (this.panelComponents.ph) {
            var background6 = new Image();
            let x,
                y,
                image;
            if(this.selectedController.tag == 'PRMN-CTRL') {
                image = 'Prominent-PH-sensor';
                x = dimension.prmnComponent6.x;
                y = dimension.prmnComponent6.y;
            } else {
                image = '06_PH_Sensor';
                x = dimension.component6.x;
                y = dimension.component6.y;
            }

            background6.src = "";
            // dimension.component6.x, dimension.component6.y
            background6.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + image + ".png";
            // Make sure the image is loaded first otherwise nothing will draw.
            background6.onload = function () {
                if(background6.complete) {
                    ctx.drawImage(background6, x, y);
                } else {
                    background6.onload = function () {
                        ctx.drawImage(background6, x, y);
                    }
                }                
            }
        }

        if (this.panelComponents.orp) {
            let image;
            if (this.selectedController.tag == 'PRMN-CTRL') {
                image = 'Prominent-ORP-sensor';
            } else {
                image = '07_ORP_Sensor';
            }
            let x, y;
            var background7 = new Image();
            background7.src = "";
            background7.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + image + ".png";

            if (this.selectedController.tag == 'PRMN-CTRL') {
                if (!this.panelComponents.ph) {
                    x = dimension.prmnComponent6.x;
                } else {
                    x = dimension.prmnComponent7.x;
                }
                y = dimension.prmnComponent7.y;
            } else {
                if (!this.panelComponents.ph) {
                    x = dimension.component6.x;
                } else {
                    x = dimension.component7.x;
                }
                y = dimension.component7.y;
            }
            // Make sure the image is loaded first otherwise nothing will draw.
            background7.onload = function () {
                if(background7.complete) {
                    ctx.drawImage(background7, x, y);
                } else {
                    background7.onload = function () {
                        ctx.drawImage(background7, x, y);
                    }
                }                
            }
        }
        if (this.panelComponents.conductivity) {
            let image;
            if (this.selectedController.tag == 'PRMN-CTRL') {
                image = 'Prominent-Conductivity-Sensor';
            } else {
                image = '08_Conductivity_Sensor_wt';
            }
            let x, y;
            var background8 = new Image();
            background8.src = "";
            background8.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + image + ".png";

            if (this.selectedController.tag == 'PRMN-CTRL') {
                if (!this.panelComponents.ph && this.panelComponents.orp || this.panelComponents.ph && !this.panelComponents.orp) {
                    x = dimension.prmnComponent7.x;
                } else if (!this.panelComponents.ph && !this.panelComponents.orp) {
                    x = dimension.prmnComponent6.x;
                } else {
                    x = dimension.prmnComponent8.x;
                }
                y = dimension.prmnComponent8.y;
            } else {
                if (!this.panelComponents.ph && this.panelComponents.orp || this.panelComponents.ph && !this.panelComponents.orp) {
                    x = dimension.component7.x;
                } else if (!this.panelComponents.ph && !this.panelComponents.orp) {
                    x = dimension.component6.x;
                } else {
                    x = dimension.component8.x;
                }
                y = dimension.component8.y;
            }

            // Make sure the image is loaded first otherwise nothing will draw.
            background8.onload = function () {
                if(background8.complete) {
                    ctx.drawImage(background8, x, y);
                } else {
                    background8.onload = function () {
                        ctx.drawImage(background8, x, y);
                    }
                }                
            }
        }

        //If flow switch (It is bydefault selected)
        if (this.panelComponents.flowSwitch) {
            var background9 = new Image();
            background9.src = "";
            background9.src = "../../assets/images/" + this.panelType + "/" + flowType + "/09_Flow_Switch.png";

            
            // Make sure the image is loaded first otherwise nothing will draw.
            background9.onload = function () {
                if(background9.complete) {
                    ctx.drawImage(background9, dimension.component9.x, dimension.component9.y);
                } else {
                    background9.onload = function () {
                        ctx.drawImage(background9, dimension.component9.x, dimension.component9.y);
                    }
                }                
            }
        }

        //If sample port selected
        if (this.panelComponents.samplePort) {
            var background11 = new Image();
            background11.src = "";
            //If 3 pass coupon rack selected
            if(couponRackType != "3-Pass-Coupon-Rack"){
                //sample port front img
                background11.src = "../../assets/images/" + this.panelType + "/" + flowType + "/11_Sample_Port.png";
               
                    //sample port backbone
                    var background10 = new Image();
                    background10.src = "";
                    background10.src = "../../assets/images/" + this.panelType + "/" + flowType + "/10.png";
            
                    background10.onload = function () {
                        if(background10.complete) {
                            ctx.drawImage(background10, dimension.component11.x, dimension.component11.y);
                        } else {
                            background10.onload = function () {
                                ctx.drawImage(background10, dimension.component11.x, dimension.component11.y);
                            }
                        }                
                    }
                
            }
            
            background11.onload = function () {
                ctx.drawImage(background11, dimension.component10.x, dimension.component10.y);
            }
        }

        //If twist to clean panel component selected
        if (this.panelComponents.twistToClean) {
            var background12 = new Image();
            background12.src = "";
            if(couponRackType == "3-Pass-Coupon-Rack" || couponRackType == "2-Pass-Coupon-Rack"){
                background12.src = "../../assets/images/" + this.panelType + "/" + flowType + "/20_Twist_to_Clean.png";
            }else{
                background12.src = "../../assets/images/" + this.panelType + "/" + flowType + "/12_Twist_to_Clean.png";
            }
            
            // Make sure the image is loaded first otherwise nothing will draw.
            background12.onload = function () {
                if(background12.complete) {
                    ctx.drawImage(background12, dimension.component12.twistToClean.x, dimension.component12.twistToClean.y);
                } else {
                    background12.onload = function () {
                        ctx.drawImage(background12, dimension.component12.twistToClean.x, dimension.component12.twistToClean.y);
                    }
                }                
            }
        } else if (this.panelComponents.banjo) {
            var background12 = new Image();
            background12.src = "";
            let componentName;
            let panelFlowType = this.finalQuote.selectedFlowDirections[0].childs[0].tag;
            if (panelFlowType == "H2-BL-TL" || panelFlowType == "H2-BL-TR") {
                componentName = "banjoLeftToRight";
            } else {
                componentName = "banjoRightToLeft";
            }
            if (this.panelType == "P4-diagram") {
                background12.src = "../../assets/images/" + this.panelType + "/" + componentName + ".png";
            } else {
                background12.src = "../../assets/images/strainersDiagram/" + componentName + ".png";
            }
            // Make sure the image is loaded first otherwise nothing will draw.
            background12.onload = function () {
                if(background12.complete) {
                    ctx.drawImage(background12, dimension.component12.banjo.x, dimension.component12.banjo.y);
                } else {
                    background12.onload = function () {
                        ctx.drawImage(background12, dimension.component12.banjo.x, dimension.component12.banjo.y);
                    }
                }                
            }
        } else if (this.panelComponents.ronVik) {
            var background12 = new Image();
            background12.src = "";
            if (this.panelType == "P4-diagram") {
                background12.src = "../../assets/images/" + this.panelType + "/Ron-Vik.png";
            } else {
                background12.src = "../../assets/images/strainersDiagram/Ron-Vik.png";
            }

            // Make sure the image is loaded first otherwise nothing will draw.
            background12.onload = function () {
                if(background12.complete) {
                    ctx.drawImage(background12, dimension.component12.ronVik.x, dimension.component12.ronVik.y);
                } else {
                    background12.onload = function () {
                        ctx.drawImage(background12, dimension.component12.ronVik.x, dimension.component12.ronVik.y);
                    }
                }                
            }
        } else if (this.panelComponents.asahi) {
            var background12 = new Image();
            background12.src = "";
            let componentName;
            let panelFlowType = this.finalQuote.selectedFlowDirections[0].childs[0].tag;
            if (panelFlowType == "H2-BL-TL" || panelFlowType == "H2-BL-TR") {
                componentName = "asahiLeftToRight";
            } else {
                componentName = "asahiRightToLeft";
            }
            if (this.panelType == "P4-diagram") {
                background12.src = "../../assets/images/" + this.panelType + "/" + componentName + ".png";
            } else {
                background12.src = "../../assets/images/strainersDiagram/" + componentName + ".png";
            }
            // Make sure the image is loaded first otherwise nothing will draw.
            background12.onload = function () {
                if(background12.complete) {
                    ctx.drawImage(background12, dimension.component12.asahi.x, dimension.component12.asahi.y);
                } else {
                    background12.onload = function () {
                        ctx.drawImage(background12, dimension.component12.asahi.x, dimension.component12.asahi.y);
                    }
                }                
            }
        }

        if (this.selectedPanel == 'PP2') {
            var background14 = new Image();
            background14.src = "";
            background14.src = "../../assets/images/" + this.panelType + "/" + flowType + "/" + this.controllerSeries + ".png";
            // Make sure the image is loaded first otherwise nothing will draw.
            background14.onload = function () {
                if(background14.complete) {
                    ctx.drawImage(background14, dimension.component14.x, dimension.component14.y);
                } else {
                    background14.onload = function () {
                        ctx.drawImage(background14, dimension.component14.x, dimension.component14.y);
                    }
                }                
            }

            if (this.panelComponents.cellModem) {
                var background15 = new Image();
                background15.src = "";
                background15.src = "../../assets/images/" + this.panelType + "/" + flowType + "/cell_modem.png";
                // Make sure the image is loaded first otherwise nothing will draw.
                background15.onload = function () {
                    if(background15.complete) {
                        ctx.drawImage(background15, dimension.component15.x, dimension.component15.y);
                    } else {
                        background15.onload = function () {
                            ctx.drawImage(background15, dimension.component15.x, dimension.component15.y);
                        }
                    }                
                }
            }

        } else if (this.selectedPanel == 'PP3' || this.selectedPanel == 'PP4') {
            let showCorrosion = this.corrosionCount + this.corrosionLOGRCount;
            if (showCorrosion > 0) {
                var background16 = new Image();
                background16.src = "";
                background16.src = "../../assets/images/" + this.panelType + "/" + flowType + "/14.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background16.onload = function () {
                    if(background16.complete) {
                        ctx.drawImage(background16, dimension.component16.x, dimension.component16.y);
                    } else {
                        background16.onload = function () {
                            ctx.drawImage(background16, dimension.component16.x, dimension.component16.y);
                        }
                    }                
                }

                var background17 = new Image();
                background17.src = "";
                background17.src = "../../assets/images/" + this.panelType + "/" + flowType + "/18_Corrosion.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background17.onload = function () {
                    if(background17.complete) {
                        ctx.drawImage(background17, dimension.component17.x, dimension.component17.y);
                    } else {
                        background17.onload = function () {
                            ctx.drawImage(background17, dimension.component17.x, dimension.component17.y);
                        }
                    }                
                }
            } else {
                if(this.selectedCorrosionCouponRack ) {
                    //elbow appears when logr sensor not selected
                    var background17 = new Image();
                    background17.src = "";
                    background17.src = "../../assets/images/" + this.panelType + "/" + flowType + "/elbow_3.png";
    
                    // Make sure the image is loaded first otherwise nothing will draw.
                    background17.onload = function () {
                        if(background17.complete) {
                            ctx.drawImage(background17, dimension.component17_elbow.x, dimension.component17_elbow.y);
                        } else {
                            background17.onload = function () {
                                ctx.drawImage(background17, dimension.component17_elbow.x, dimension.component17_elbow.y);
                            }
                        }                
                    }
                }  
            }


            let corrosionCouponRack;
            let corrosionCouponRackDimension;
            //If selected coupon is cam rack
            if(this.selectedCorrosionCouponRack == 'cam-rack') {
                //if 3 pass gray coupon selected
                if(!is3passClearCamRack && couponRackType == "3-Pass-Coupon-Rack"){
                    corrosionCouponRack = '20_Cam_Lock_Coupon_Holder';
                    corrosionCouponRackDimension = dimension.component36;
                }else if(is3passClearCamRack && couponRackType == "3-Pass-Coupon-Rack"){
                     //if 3 pass clear coupon selected
                    corrosionCouponRack = '19_Cam_Lock_Coupon_Holder';
                    corrosionCouponRackDimension = dimension.component39;
                }else{
                    corrosionCouponRack = '19_Cam_Lock_Coupon_Holder';
                    corrosionCouponRackDimension = dimension.component18;
                }
            } else if(this.selectedCorrosionCouponRack == '01') {
                corrosionCouponRack = 'standard-cam-rack-2';
                corrosionCouponRackDimension = dimension.component18;
            } else {
                corrosionCouponRack = null;
                corrosionCouponRackDimension = dimension.component18;
            }
            if(corrosionCouponRack) {
                var background18 = new Image();
                background18.src = "";
                background18.src = "../../assets/images/" + this.panelType + "/" + flowType + "/"+ corrosionCouponRack +".png";
    
                // Make sure the image is loaded first otherwise nothing will draw.
                background18.onload = function () {
                    if(background18.complete) {
                        ctx.drawImage(background18, corrosionCouponRackDimension.x, corrosionCouponRackDimension.y);
                    } else {
                        background18.onload = function () {
                            ctx.drawImage(background18, corrosionCouponRackDimension.x, corrosionCouponRackDimension.y);
                        }
                    }                
                }

                //If 3 pass coupon rack then draw 3rd coupon holder
                if(couponRackType == "3-Pass-Coupon-Rack" || couponRackType == "2-Pass-Coupon-Rack"){
                    if(couponRackType == "2-Pass-Coupon-Rack" || (couponRackType == "3-Pass-Coupon-Rack" && corrosionCouponRack == '01')){
                        //coupon holder image
                        var background33 = new Image();
                        background33.src = "";
                        background33.src = "../../assets/images/" + this.panelType + "/" + flowType + "/12_3.png";
                    
                        background33.onload = function () {
                            if(background33.complete) {
                                ctx.drawImage(background33, dimension.component30.x, dimension.component30.y);
                            } else {
                                background33.onload = function () {
                                    ctx.drawImage(background33, dimension.component30.x, dimension.component30.y);
                                }
                            }                
                        }
                    }

                    if(couponRackType == "3-Pass-Coupon-Rack"){
                        //If 3 pass coupon rack then draw 3rd coupon(2nd left coupon)
                        let compDimension;
                        var background35 = new Image();
                        background35.src = "";
                        if(couponRackType == "3-Pass-Coupon-Rack" && this.selectedCorrosionCouponRack == 'cam-rack'){
                            //If 3pass gray cam rack
                            if(!is3passClearCamRack){
                                background35.src = "../../assets/images/" + this.panelType + "/" + flowType + "/24_Cam_Rack_Coupon_Holder.png";
                                compDimension = dimension.component35;
                            }else if(is3passClearCamRack){
                                //If 3pass clear cam rack
                                background35.src = "../../assets/images/" + this.panelType + "/" + flowType + "/23_Cam_Rack_Coupon_Holder.png";
                                compDimension = dimension.component40;
                            }else{
                                background35.src = "../../assets/images/" + this.panelType + "/" + flowType + "/23_Cam_Rack_Coupon_Holder.png";
                                compDimension = dimension.component32;
                            }
                            
                        }else{
                            background35.src = "../../assets/images/" + this.panelType + "/" + flowType + "/23_Coupon_Holder.png";
                            compDimension = dimension.component32;
                        }
                        

                        // Make sure the image is loaded first otherwise nothing will draw.
                        background35.onload = function () {
                            if(background35.complete) {
                                ctx.drawImage(background35, compDimension.x, compDimension.y);
                            } else {
                                background35.onload = function () {
                                    ctx.drawImage(background35, compDimension.x, compDimension.y);
                                }
                            }                
                        } 

                    }

                }
            }
            
            //If 3 pass coupon rack then draw 3rd coupon holder
            if(couponRackType == "3-Pass-Coupon-Rack"){
                //coupon holder image
                var background37 = new Image();
                background37.src = "";
                background37.src = "../../assets/images/" + this.panelType + "/" + flowType + "/19.png";
            
                background37.onload = function () {
                    if(background37.complete) {
                        ctx.drawImage(background37, dimension.component34.x, dimension.component34.y);
                    } else {
                        background37.onload = function () {
                            ctx.drawImage(background37, dimension.component34.x, dimension.component34.y);
                        }
                    }                
                }
            }

            if (showCorrosion > 1) {
                var background19 = new Image();
                background19.src = "";
                if(couponRackType == "3-Pass-Coupon-Rack" || couponRackType == "2-Pass-Coupon-Rack"){
                    background19.src = "../../assets/images/" + this.panelType + "/" + flowType + "/14_3.png";
                }else{
                    background19.src = "../../assets/images/" + this.panelType + "/" + flowType + "/17.png";
                }

                // Make sure the image is loaded first otherwise nothing will draw.
                background19.onload = function () {
                    ctx.drawImage(background19, dimension.component19.x, dimension.component19.y);
                }

                var background20 = new Image();
                background20.src = "";
                background20.src = "../../assets/images/" + this.panelType + "/" + flowType + "/15_Corrosion.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background20.onload = function () {
                    if(background20.complete) {
                        ctx.drawImage(background20, dimension.component14.x, dimension.component14.y);
                    } else {
                        background20.onload = function () {
                            ctx.drawImage(background20, dimension.component14.x, dimension.component14.y);
                        }
                    }                
                }
            } else {
                if(this.selectedCorrosionCouponRack) {
                    //elbow appears when logr sensor not selected
                    var background20 = new Image();
                    background20.src = "";
                    background20.src = "../../assets/images/" + this.panelType + "/" + flowType + "/elbow_2.png";
                    // Make sure the image is loaded first otherwise nothing will draw.
                    background20.onload = function () {
                        if(background20.complete) {
                            ctx.drawImage(background20, dimension.component14_elbow.x, dimension.component14_elbow.y);
                        } else {
                            background20.onload = function () {
                                ctx.drawImage(background20, dimension.component14_elbow.x, dimension.component14_elbow.y);
                            }
                        }                
                    }
                }    

            }

            let corrosionCouponRackName;
            let corrosionCouponRackNameDimension;
            if(this.selectedCorrosionCouponRack == 'cam-rack') {
                if(!is3passClearCamRack && couponRackType == "3-Pass-Coupon-Rack"){
                    corrosionCouponRackName = '17_Cam_Lock_Coupon_Holder';
                    corrosionCouponRackNameDimension = dimension.component37;
                    
                }else if(is3passClearCamRack && couponRackType == "3-Pass-Coupon-Rack"){
                    corrosionCouponRackName = '16_Cam_Lock_Coupon_Holder';
                    corrosionCouponRackNameDimension = dimension.component38;
                   
                }else{
                    corrosionCouponRackName = '16_Cam_Lock_Coupon_Holder';
                    corrosionCouponRackNameDimension = dimension.component15;
                }
            } else if (this.selectedCorrosionCouponRack == '01') {
                corrosionCouponRackName = 'standard-cam-rack-1';
                corrosionCouponRackNameDimension = dimension.component15;
               
            } else {
                corrosionCouponRack = null;
                corrosionCouponRackNameDimension = dimension.component15;
            }

            if(corrosionCouponRackName) {
                var background21 = new Image();
                background21.src = "";
                background21.src = "../../assets/images/" + this.panelType + "/" + flowType + "/"+ corrosionCouponRackName +".png";
    
                // Make sure the image is loaded first otherwise nothing will draw.
                background21.onload = function () {
                    if(background21.complete) {
                        ctx.drawImage(background21, corrosionCouponRackNameDimension.x, corrosionCouponRackNameDimension.y);
                    } else {
                        background21.onload = function () {
                            ctx.drawImage(background21, corrosionCouponRackNameDimension.x, corrosionCouponRackNameDimension.y);
                        }
                    }                
                }

                if( couponRackType == "3-Pass-Coupon-Rack" || couponRackType == "2-Pass-Coupon-Rack" ){
                    if(couponRackType == "2-Pass-Coupon-Rack" || (couponRackType == "3-Pass-Coupon-Rack" && corrosionCouponRack == '01')){
                        //coupon holder image
                        var background34 = new Image();
                        background34.src = "";
                        background34.src = "../../assets/images/" + this.panelType + "/" + flowType + "/17_3.png";
            
                        // Make sure the image is loaded first otherwise nothing will draw.
                        background34.onload = function () {
                            if(background34.complete) {
                                ctx.drawImage(background34, dimension.component31.x, dimension.component31.y);
                            } else {
                                background34.onload = function () {
                                    ctx.drawImage(background34, dimension.component31.x, dimension.component31.y);
                                }
                            }                
                        }
                    }
                }
            }
            
            var background22 = new Image();
            background22.src = "";
            background22.src = "../../assets/images/P2-diagram/BLTL/" + this.controllerSeries + ".png";

            // Make sure the image is loaded first otherwise nothing will draw.            
            let controllerSeries = this.controllerSeries;

            background22.onload = function () {
                if(background22.complete) {
                    if (controllerSeries == 'Aegis2') {
                        ctx.drawImage(background22, dimension.component20.x, dimension.component20.y, 110, 86);
                    } else {
                        ctx.drawImage(background22, dimension.component20.x, dimension.component20.y);
                    }
                } else {
                    background22.onload = function () {
                        if (controllerSeries == 'Aegis2') {
                            ctx.drawImage(background22, dimension.component20.x, dimension.component20.y, 110, 86);
                        } else {
                            ctx.drawImage(background22, dimension.component20.x, dimension.component20.y);
                        }
                    }
                }                
            }

            //If cell modem selected 
            if (this.panelComponents.cellModem) {
                var background23 = new Image();
                background23.src = "";
                background23.src = "../../assets/images/" + this.panelType + "/" + flowType + "/02_Cell_Modem.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background23.onload = function () {
                    if(background23.complete) {
                        ctx.drawImage(background23, dimension.component21.x, dimension.component21.y);
                    } else {
                        background23.onload = function () {
                            ctx.drawImage(background23, dimension.component21.x, dimension.component21.y);
                        }
                    }                
                }
            }

            //If LogR sensor selected
            if (this.corrosionLOGRCount > 0) {
                    var background24 = new Image();
                    background24.src = "";
                    background24.src = "../../assets/images/" + this.panelType + "/" + flowType + "/03_LogR_CORROSSION_MONITOR_CS.png";
    
                    // Make sure the image is loaded first otherwise nothing will draw.
                    background24.onload = function () {
                        if(background24.complete) {
                            ctx.drawImage(background24, dimension.component22.x, dimension.component22.y);
                        } else {
                            background24.onload = function () {
                                ctx.drawImage(background24, dimension.component22.x, dimension.component22.y);
                            }
                        }                
                    }             
            }

            if (this.corrosionLOGRCount > 1) {
                    var background25 = new Image();
                    background25.src = "";
                    background25.src = "../../assets/images/" + this.panelType + "/" + flowType + "/03_LogR_CORROSSION_MONITOR_CS.png";

                    // Make sure the image is loaded first otherwise nothing will draw.
                    background25.onload = function () {
                        if(background25.complete) {
                            ctx.drawImage(background25, dimension.component23.x, dimension.component23.y);
                        } else {
                            background25.onload = function () {
                                ctx.drawImage(background25, dimension.component23.x, dimension.component23.y);
                            }
                        }                
                    } 
            }
        }

        if (this.flowDirection == 'PP4-B') {
            var background26 = new Image();
            background26.src = "";
            background26.src = "../../assets/images/" + this.panelType + "/" + flowType + "/injection_Points.png";

            // Make sure the image is loaded first otherwise nothing will draw.
            background26.onload = function () {
                if(background26.complete) {
                    ctx.drawImage(background26, dimension.component24.x, dimension.component24.y);
                } else {
                    background26.onload = function () {
                        ctx.drawImage(background26, dimension.component24.x, dimension.component24.y);
                    }
                }                
            }

            var background27 = new Image();
            background27.src = "";
            background27.src = "../../assets/images/" + this.panelType + "/" + flowType + "/injection_Points.png";

            // Make sure the image is loaded first otherwise nothing will draw.
            background27.onload = function () {
                if(background27.complete) {
                    ctx.drawImage(background27, dimension.component25.x, dimension.component25.y);
                } else {
                    background27.onload = function () {
                        ctx.drawImage(background27, dimension.component25.x, dimension.component25.y);
                    }
                }                
            }

            var background28 = new Image();
            background28.src = "";
            background28.src = "../../assets/images/" + this.panelType + "/" + flowType + "/injection_Points.png";

            // Make sure the image is loaded first otherwise nothing will draw.
            background28.onload = function () {
                if(background28.complete) {
                    ctx.drawImage(background28, dimension.component26.x, dimension.component26.y);
                } else {
                    background28.onload = function () {
                        ctx.drawImage(background28, dimension.component26.x, dimension.component26.y);
                    }
                }                
            }
        }

        if (this.selectedPanel == 'PP4') {
            let width,
                height;
            if (this.selectedPanel == 'PP3') {
                width = 50;
                height = 43;
            } else {
                width = 61;
                height = 52;
            }
            if (this.count > 0) {
                var background29 = new Image();
                background29.src = "";
                background29.src = "../../assets/images/" + this.panelType + "/" + flowType + "/pump.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background29.onload = function () {
                    if(background29.complete) {
                        ctx.drawImage(background29, dimension.component27.x, dimension.component27.y, width, height);
                    } else {
                        background29.onload = function () {
                            ctx.drawImage(background29, dimension.component27.x, dimension.component27.y, width, height);
                        }
                    }                
                }
            }

            if (this.count > 1) {
                var background30 = new Image();
                background30.src = "";
                background30.src = "../../assets/images/" + this.panelType + "/" + flowType + "/pump.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background30.onload = function () {
                    if(background30.complete) {
                        ctx.drawImage(background30, dimension.component28.x, dimension.component28.y, width, height);
                    } else {
                        background30.onload = function () {
                            ctx.drawImage(background30, dimension.component28.x, dimension.component28.y, width, height);
                        }
                    }                
                }
            }

            if (this.count > 2) {
                var background31 = new Image();
                background31.src = "";
                background31.src = "../../assets/images/" + this.panelType + "/" + flowType + "/pump.png";

                // Make sure the image is loaded first otherwise nothing will draw.
                background31.onload = function () {
                    if(background31.complete) {
                        ctx.drawImage(background31, dimension.component29.x, dimension.component29.y, width, height);
                    } else {
                        background31.onload = function () {
                            ctx.drawImage(background31, dimension.component29.x, dimension.component29.y, width, height);
                        }
                    }                
                }
            }
        }
    }

    private getPanelImage() {
        let image = this._elementRef.nativeElement.querySelector('canvas').toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
    
        var base64Blob = this.dataURItoBlob(image);
        //   let panelName = new Date().getTime();
        this.imageName = 'Panel' + new Date().getTime();

        let payload = {
            'type': 'Panel',
            'image': this.imageName
        };
        this.uploadAwsService.uploadFileAWSCognito(base64Blob, payload, (data) => {
            // get cognito uploaded image path assign it to editable field
            if(data && data.Location) {
                this.panelUrl = data.Location;
            } else {
                this.panelUrl = null;
            }          

            //    this.emailText = "Panel Image: " + this.panelUrl + "\n" + "Pdf Link: " + this.shareLink;
        });
        
    }

    private getDatasheetList() {
        this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
        this.userService.getDatasheetList(this.configureData).subscribe(
            res => {
                if (res.status == "success") {
                    this.datasheetList = res.data.slice(0, res.data.length);
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
                if (error && error != undefined) {
                    if(error._body) {
                        let errorMsg = JSON.parse( error._body );
                        this.webServiceError = errorMsg.message;
                    } else {
                        this.webServiceError = error.message;
                    }
                    this.toastService.popToast("error", this.webServiceError);
                } else {
                    this.webServiceError = 'Datasheet list failed.';
                    this.toastService.popToast("error", this.webServiceError);
                }
            }
        );
    }

    /**
     * Function to convert base64 image 
     * 
     */
    dataURItoBlob = (dataURI) => {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    }

    public searchObj = (obj, query) => {
        for (var key in obj) {
            var value = obj[key];
            if (typeof value === 'object') {
                this.searchObj(value, query);
            }
            if (key === query) {
                if (value == 'AN-PTSA-SEN' || value == 'PRMNT-AN-SEN') {
                    if (obj.isChecked) {
                        this.panelComponents.ptsaSensor = true;
                    }
                }
                if (value == 'CON-SEN') {
                    if (obj.isChecked) {
                        this.panelComponents.conductivity = true;
                    }
                }
                if (value == 'ORP-SEN' || value == 'ORPF-1') {
                    if (obj.isChecked) {
                        this.panelComponents.orp = true;
                    }
                }
                if (value == 'PH-SEN') {
                    if (obj.isChecked) {
                        this.panelComponents.ph = true;
                    }
                }

                if (value == 'CELL-CUM') {
                    if (obj.isChecked) {
                        this.panelComponents.cellModem = true;
                    }
                }

                if (value == 'AN-SEN' || (value == 'CM' && this.selectedControllerSeries.tag == 'PA-2')){
                  
                    if (obj.isChecked) {
                        if(obj.tag == 'CM'){
                            this.corrosion = true;
                        }else if(obj.tag != 'CM'){
                            for (let j = 0; j < obj.childs.length; j++) {
                              
                                if(obj.childs[j].tag == 'CM' && obj.childs[j].isChecked) {
                                    this.corrosion = true;
                                } else {
                                   
                                }
                            
                            }
                        }else{
                            this.corrosion = false; 
                        }
                    } else {
                        this.corrosion = false;
                         obj.childs.filter((item) => {
                            if(item.isChecked) {
                                item.isChecked = false;
                            }
                        });
                    }
                }

                // if (value == 'CM') {
                //     if (obj.isChecked) {
                //         this.corrosion = true;
                //     } else {
                //         this.corrosion = false;
                //     }
                    
                // }

                if (value == 'PCSS-01' &&  this.corrosion) {
                    this.corrosionMonitorsType = value; 
                    this.corrosionCount = 0;
                    if (obj.isChecked) {
                        for (let j = 0; j < obj.childs.length; j++) {
                            if (obj.childs[j].isChecked) {
                                this.corrosionCount++;
                            }
                        }
                    }
                }
                if (((value == 'LRCS-01' && this.selectedControllerSeries.tag != 'PA-2') || (value == 'CM' && this.selectedControllerSeries.tag == 'PA-2')) &&  this.corrosion) {
                    this.corrosionMonitorsType = value; 
                    this.corrosionLOGRCount = 0;
                    if (obj.isChecked) {
                        for (let j = 0; j < obj.childs.length; j++) {
                            if (obj.childs[j].isChecked) {
                                this.corrosionLOGRCount++;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Function To post created quote data and get configured data 
     **/
    configureQuote(data, isShareQuote) {
        this.isLoading = true;
        this.isLoadFailed = false;
        this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
        console.log('SENT DATA', data);
        this.userService.configureQuote(data).subscribe(            
            res => {
                if (res.status == "success") {
                        this.quoteData = res.data;
                    console.log("quote data........", this.quoteData);
                        this.panelDiscountRate = this.quoteData.panelDiscount;
                        this.controllerDiscountRate = this.quoteData.controllerDiscount;
                        this.locstr.set('quoteNo', this.quoteData.quoteNo);
                        this.disclaimerAndNotes.note = this.quoteData.note;
                        this.disclaimerAndNotes.disclaimer = this.quoteData.disclaimer;
                        this.isSpecificOrganization = this.quoteData.is_specific_organization;
                        if( this.locstr.get('quoteNo')){
                            this.quotationNo = this.locstr.get('quoteNo');
                        }
                        this.isCreateNewAccessory = this.locstr.getObj('isCreateNewAccessory');
                        if (this.isCreateNewAccessory) {
                            this.quoteData = res.data;
                        } else {
                            if (this.locstr.getObj('parts') && this.saveDraftQuote && this.saveQuoteFlag == 'true' && !this.isHeaderPricingOptionChanged && this.isEditViewedQuote === false && !isShareQuote) {
                               let tempArr = this.locstr.getObj('parts');
                               let partNoArr = [];
                                for(let i = 0; i < tempArr.parts.length; i++){
                                    for(let j = 0; j < res.data.parts.length; j++){
                                        if(i === j){
                                            if(tempArr.parts[i].partNo != res.data.parts[j].partNo){
                                                partNoArr.push(true);
                                            }
                                        }
                                    }
                                }
                                if(partNoArr && partNoArr.length != 0){
                                    this.quoteData = res.data;
                                }else{
                                    this.quoteData = this.locstr.getObj('parts');
                                }
                                console.log("partNoArr.....", partNoArr);
                                
                            } else {
                                this.quoteData = res.data;
                            }
                        }
                      
                        if (this.quoteData && this.quoteData.parts && this.quoteData.parts.length > 0) {
                                for (let i = 0; i < this.quoteData.parts.length; i++) {
                                    if (!this.quoteData.parts[i].quantity) {
                                        this.quoteData.parts[i].quantity = 1;
                                    }
                                    this.discountBasedOnNoofSets(this.quoteData.parts[i], this.quoteData.parts[i].quantity);
                                }
                                
                                //share via pdf
                            
                           
                                if(!isShareQuote && !this.fromViewQuoteOnlyView){
                                    this.toastService.popToast("success", res.message); 
                                    this.shareQuotePDF();
                                }else{
                                    if(this.locstr.get('shareQuoteFromViewQuote') === 'true'){
                                        this.emailQuote(true);
                                    }else{
                                        this.emailQuote(true);
                                    }
                                }
    
                                if(this.locstr.get('shareQuoteFromViewQuote')){
                                    let value = this.locstr.get('shareQuoteFromViewQuote');
                                    if( value == 'true' && !isShareQuote ){
                                        this.emailQuote(false);
                                    }
                                }

                                
                                if(!isShareQuote && !this.fromViewQuoteOnlyView){
                                    this.toastService.popToast("success", res.message); 
                                    this.shareQuotePDF();
                                }else{
                                    if(this.locstr.get('shareQuoteH2FromViewQuote') === 'true'){
                                        this.emailH2Quote(true);
                                    }else{
                                        this.emailH2Quote(true);
                                    }
                                }
    
                                if(this.locstr.get('shareQuoteH2FromViewQuote')){
                                    let value = this.locstr.get('shareQuoteH2FromViewQuote');
                                    if( value == 'true' && !isShareQuote ){
                                        this.emailQuote(false);
                                    }
                                }
                            }

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
                if (error && error != undefined) {
                    if(error._body) {
                        let errorMsg = JSON.parse( error._body );
                        this.webServiceError = errorMsg.message;
                    } else {
                        this.webServiceError = error.message;
                    }
                    this.toastService.popToast("error", this.webServiceError);
                } else {
                    this.webServiceError = 'Create quote failed. Please try again.';
                    this.toastService.popToast("error", this.webServiceError);
                }
            }
        );
    }

    save(isDraft: boolean, draftPath: string, isRouteChange: boolean) {
        //get formatted configuredQuoteVo
        this.locstr.setObj("disclaimerAndNotes", this.disclaimerAndNotes);
        if (this.isCreateNewAccessory) {
            this.configureData = this.quoteService.configureQuoteVoFormationForAccessories();
        } else {
            this.configureData = this.quoteService.configureQuoteVoFormation();
        }
        this.quoteService.saveQuote(isDraft, draftPath, isRouteChange);
    }

    /**
     * Calculate price and discount as per no of sets 
     **/
    discountBasedOnNoofSets(part, noOfSets) {
        //  this.locstr.set('noOfSets', noOfSets);
        let totalListPrice = 0;
        let totalNetCost = 0;
        this.totalNetCost = 0;
        this.finalCost = 0;
        this.controllerDiscount = 0;
        this.controllerPanelDiscount = 0;
        this.panelDiscount = 0;
        this.accessoriesDiscount = 0;
        this.sensorListDiscountDiscount = 0;
        let panelPrice;
        let accessoriesPrice;
        let sensorArrPrice;
        let accesoryArr = [];
        let sensorPrice;
        let panelSensorPrice;
        let sensorArr = [];
        let panelSensorArr = [];
        let panelArr = [];
        let sensorArrList = [];
        let partPrice;
        let partPriceAccessory;

        let totalTerritoryCost = 0;
        let totalUnitNetTerritoryPrice = 0;
        let totalUnitTerritoryPrice = 0;


        if (this.quoteData && this.quoteData.parts && this.quoteData.parts.length > 0) {
            for (let i = 0; i < this.quoteData.parts.length; i++) {

                if(this.quoteData.parts[i].partNo == "FLSW") {
                    delete this.quoteData.parts[i].isPanel;
                    this.quoteData.parts[i].isPanelController = true;
                }

                if (this.quoteData.parts[i].partNo == part.partNo) {
                    this.quoteData.parts[i].noOfSetsPrice = parseFloat((this.quoteData.parts[i].price * noOfSets).toFixed(2));
                }


                //Organization discount calculation for unit net and total net quote price quotation for Specific Organization
                if (this.quoteData.QuotationType.type == 'q2' && this.isSpecificOrganization) {
                    if (this.quoteData.parts[i] && (this.quoteData.parts[i].isController || this.quoteData.parts[i].isSensor || this.quoteData.parts[i].isPanelController)) {
                      this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.controllerDiscount / 100))).toFixed(2));
                        //sensor manufacturer discount condition
                        if(this.quoteData.parts[i].isSensor && this.quoteData.parts[i].discount){
                            this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.parts[i].discount / 100))).toFixed(2));
                            console.log("this.quoteData.parts[i].unitNetPrice....", this.quoteData.parts[i].unitNetPrice);
                        }else{
                            this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.controllerDiscount / 100))).toFixed(2));
                        }
                    }else if(this.quoteData.parts[i] && this.quoteData.parts[i].isAccessories){
                        this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.parts[i].discount / 100))).toFixed(2));
                    }else{
                        this.quoteData.parts[i].unitNetPrice = this.quoteData.parts[i].price;
                    }                  
                    if (this.quoteData.parts[i].unitNetPrice) {
                        this.quoteData.parts[i].extNetPrice =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].unitNetPrice).toFixed(2));
                        if (this.quoteData.parts[i].extNetPrice) { 
                            totalNetCost =  totalNetCost  + this.quoteData.parts[i].extNetPrice;
                        }
                    }
                }

                //Organization discount calculation for unit net and total net quote price quotation for not Specific Organization 
                if (this.quoteData.QuotationType.type == 'q2' && !this.isSpecificOrganization) {
                    if (this.quoteData.parts[i] && (this.quoteData.parts[i].isController || this.quoteData.parts[i].isSensor || this.quoteData.parts[i].isPanelController)) {
                        this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.controllerDiscount / 100))).toFixed(2));

                        //sensor manufacturer discount condition
                        if(this.quoteData.parts[i].isSensor && this.quoteData.parts[i].discount){
                            this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.parts[i].discount / 100))).toFixed(2));
                        }else{
                            this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.controllerDiscount / 100))).toFixed(2));
                        }
                    }else if(this.quoteData.parts[i] && this.quoteData.parts[i].isAccessories){
                        this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.parts[i].discount / 100))).toFixed(2));
                    }else if(this.quoteData.parts[i] && this.quoteData.parts[i].isPanel){
                        this.quoteData.parts[i].unitNetPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.panelDiscount / 100))).toFixed(2));
                    }else{
                        this.quoteData.parts[i].unitNetPrice = this.quoteData.parts[i].price;
                    }                  
                    if (this.quoteData.parts[i].unitNetPrice) {
                        this.quoteData.parts[i].extNetPrice =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].unitNetPrice).toFixed(2));
                        if (this.quoteData.parts[i].extNetPrice) { 
                            totalNetCost =  totalNetCost  + this.quoteData.parts[i].extNetPrice;
                        }
                    }
                }

                //Territory discount calculation, type q4/q5 is for territory quote. parseFloat(this.quoteData.parts[i].unitNetTerritoryPrice) * 1.05;
                if (this.quoteData.QuotationType.type == 'q4' || this.quoteData.QuotationType.type == 'q5'){
                    if (this.quoteData.parts[i] && (this.quoteData.parts[i].isController || this.quoteData.parts[i].isSensor || this.quoteData.parts[i].isPanelController)) {
                        this.quoteData.parts[i].unitNetTerritoryPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.controllerDiscount / 100))).toFixed(2));

                        //sensor manufacturer discount condition
                        if(this.quoteData.parts[i].isSensor && this.quoteData.parts[i].discount){
                            this.quoteData.parts[i].unitNetTerritoryPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.parts[i].discount / 100))).toFixed(2));
                        }else{
                            this.quoteData.parts[i].unitNetTerritoryPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.controllerDiscount / 100))).toFixed(2));
                        }

                        let terCost = this.quoteData.parts[i].unitNetTerritoryPrice  * 1.05
                        this.quoteData.parts[i].territoryCost = parseFloat(terCost.toFixed(2));
                        let unitCost = this.quoteData.parts[i].territoryCost * 2;
                        this.quoteData.parts[i].unitTerritoryPrice = parseFloat(unitCost.toFixed(2));
                    }else if(this.quoteData.parts[i] && this.quoteData.parts[i].isAccessories){   // Accessories discount applied here.
                        this.quoteData.parts[i].unitNetTerritoryPrice = parseFloat((this.quoteData.parts[i].price - ( this.quoteData.parts[i].price * ( this.quoteData.parts[i].discount / 100))).toFixed(2));
                        let cost = this.quoteData.parts[i].unitNetTerritoryPrice * 1.05;
                        this.quoteData.parts[i].territoryCost = parseFloat( cost.toFixed(2));
                        let unitCost = this.quoteData.parts[i].territoryCost * 2;
                        this.quoteData.parts[i].unitTerritoryPrice = parseFloat(unitCost.toFixed(2));
                    }else{
                        this.quoteData.parts[i].unitNetTerritoryPrice = this.quoteData.parts[i].price;
                        let terCost = this.quoteData.parts[i].unitNetTerritoryPrice * 1.05;
                        this.quoteData.parts[i].territoryCost = parseFloat(terCost.toFixed(2));
                        let unitCost = this.quoteData.parts[i].territoryCost * 2;
                        this.quoteData.parts[i].unitTerritoryPrice = parseFloat(unitCost.toFixed(2));
                    }

                    if (this.quoteData.parts[i].unitNetTerritoryPrice) {
                        this.quoteData.parts[i].extUnitNetTerritoryPrice =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].unitNetTerritoryPrice).toFixed(2));
                        this.quoteData.parts[i].extTerritoryCost =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].territoryCost).toFixed(2));
                        this.quoteData.parts[i].extUnitTerritoryPrice =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].unitTerritoryPrice).toFixed(2));
                        if (this.quoteData.parts[i].extUnitNetTerritoryPrice && this.quoteData.parts[i].extTerritoryCost &&  this.quoteData.parts[i].extUnitTerritoryPrice ) { 
                            totalTerritoryCost =  totalTerritoryCost  + this.quoteData.parts[i].extTerritoryCost;
                            totalUnitNetTerritoryPrice = totalUnitNetTerritoryPrice + this.quoteData.parts[i].extUnitNetTerritoryPrice;
                            totalUnitTerritoryPrice = totalUnitTerritoryPrice + this.quoteData.parts[i].extUnitTerritoryPrice;
                        }
                    }else{
                        this.quoteData.parts[i].extUnitNetTerritoryPrice =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].unitNetTerritoryPrice).toFixed(2));
                        this.quoteData.parts[i].extTerritoryCost =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].territoryCost).toFixed(2));
                        this.quoteData.parts[i].extUnitTerritoryPrice =  parseFloat((this.quoteData.parts[i].quantity * this.quoteData.parts[i].unitTerritoryPrice).toFixed(2));
                   }

                }
                
                totalListPrice = totalListPrice + this.quoteData.parts[i].noOfSetsPrice;
                // totalUnitNetTerritoryPrice = totalUnitNetTerritoryPrice + this.quoteData.parts[i].noOfSetsPrice;
                // totalUnitTerritoryPrice = totalUnitTerritoryPrice + this.quoteData.parts[i].noOfSetsPrice;

               //If controller 
                if (this.quoteData.parts[i].isController) {
                    sensorArr.push(this.quoteData.parts[i]);
                    sensorPrice = this.quoteData.parts[i].noOfSetsPrice;
                }

                //If sensor has controller discount
                if (this.quoteData.parts[i].isPanelController) {
                    panelSensorArr.push(this.quoteData.parts[i]);
                    panelSensorPrice = this.quoteData.parts[i].noOfSetsPrice;
                }

                //If panel
                if (this.quoteData.parts[i].isPanel) {
                    panelArr.push(this.quoteData.parts[i]);
                    panelPrice = this.quoteData.parts[i].noOfSetsPrice;
                }

                //If accessories
                if (this.quoteData.parts[i].isAccessories) {
                    accesoryArr.push(this.quoteData.parts[i]);
                    accessoriesPrice = this.quoteData.parts[i].noOfSetsPrice;
                }

                //If sensorArrPrice
                if (this.quoteData.parts[i].isSensor) {
                    sensorArrList.push(this.quoteData.parts[i]);
                    sensorArrPrice = this.quoteData.parts[i].noOfSetsPrice;
                }


            }

            if (panelArr.length > 0) {
                this.isPanelDiscount = true;
                this.panelDiscount = parseFloat(((this.quoteData.panelDiscount / 100) * panelPrice).toFixed(2));
            } else {
                this.isPanelDiscount = false;
                this.panelDiscount = 0;
            }

            if (sensorArr.length > 0) {
                this.isSensorDiscount = true;
                this.controllerDiscount = parseFloat(((this.quoteData.controllerDiscount / 100) * sensorPrice).toFixed(2));
            } else {
                this.isSensorDiscount = false;
                this.controllerDiscount = 0;
            }

            // panelSensorArr
            if (panelSensorArr.length > 0) {
                this.isPanelSensorDiscount = true;
                this.controllerPanelDiscount = parseFloat(((this.quoteData.controllerDiscount / 100) * panelSensorPrice).toFixed(2));
            } else {
                this.isPanelSensorDiscount = false;
                this.controllerPanelDiscount = 0;
            }

            if (accesoryArr.length > 0) {
                this.isAccessoriesDiscount = true;
                for (let i = 0; i < accesoryArr.length; i++) {
                    accesoryArr[i].discountPrice = parseFloat(((accesoryArr[i].discount / 100) * accesoryArr[i].noOfSetsPrice).toFixed(2));
                }

                for (let j = 0; j < accesoryArr.length; j++) {
                    this.accessoriesDiscount = parseFloat(( accesoryArr[j].discountPrice + this.accessoriesDiscount).toFixed(2));
                }
            } else {
                this.isAccessoriesDiscount = false;
                this.accessoriesDiscount = 0;
            }

            if (sensorArrList.length > 0) {
                this.isSensorArrListDiscount = true;
                for (let i = 0; i < sensorArrList.length; i++) {
                    sensorArrList[i].discountPrice = parseFloat(((this.quoteData.controllerDiscount / 100) * sensorArrList[i].noOfSetsPrice).toFixed(2));                   

                    //sensor manufacturer discount condition
                    if(this.quoteData.parts[i].isSensor && this.quoteData.parts[i].discount){
                        sensorArrList[i].discountPrice = parseFloat(((this.quoteData.parts[i].discount / 100) * sensorArrList[i].noOfSetsPrice).toFixed(2));                    
                      
                    }else{
                        sensorArrList[i].discountPrice = parseFloat(((this.quoteData.controllerDiscount / 100) * sensorArrList[i].noOfSetsPrice).toFixed(2));                   
                    }
                    
                }
                console.log("sensorArrList......", sensorArrList);
                for (let j = 0; j < sensorArrList.length; j++) {
                    this.sensorListDiscountDiscount = parseFloat(( sensorArrList[j].discountPrice + this.sensorListDiscountDiscount).toFixed(2));
                }
            } else {
                this.isSensorArrListDiscount = false;
                this.sensorListDiscountDiscount = 0;
            }

            this.totalListPrice = parseFloat((totalListPrice).toFixed(2));
            this.finalCost = parseFloat((this.totalListPrice - (this.controllerDiscount + this.controllerPanelDiscount + this.panelDiscount + this.accessoriesDiscount + this.sensorListDiscountDiscount)).toFixed(2));
            
            this.totalNetCost = parseFloat((totalNetCost).toFixed(2));
            this.finalNetCost = parseFloat((this.totalNetCost - (this.controllerDiscount + this.controllerPanelDiscount + this.panelDiscount + this.accessoriesDiscount + this.sensorListDiscountDiscount )).toFixed(2));

            this.totalTerritoryCost =  parseFloat((totalTerritoryCost).toFixed(2));
            this.totalUnitNetTerritoryPrice =  parseFloat((totalUnitNetTerritoryPrice).toFixed(2));
            this.totalUnitTerritoryPrice =  parseFloat((totalUnitTerritoryPrice).toFixed(2));
    
            // this.finalTerritoryCost = parseFloat((this.totalTerritoryPrice - (this.controllerDiscount + this.controllerPanelDiscount + this.panelDiscount + this.accessoriesDiscount)).toFixed(2));
    
             if (this.configureData.QuotationType.type == 'q2') {
                 this.locstr.set('finalCost', this.totalNetCost);
             } else if(this.configureData.QuotationType.type == 'q3') {
                 this.locstr.set('finalCost', this.totalListPrice);
                } else if(this.configureData.QuotationType.type == 'q6') {
                    this.locstr.set('finalCost', this.totalListPrice);
             } else if (this.configureData.QuotationType.type == 'q1') {
                this.locstr.set('finalCost', this.totalListPrice);
             }else if (this.configureData.QuotationType.type == 'q4'){
                this.locstr.set('finalCost', this.totalUnitNetTerritoryPrice);
             }else if (this.configureData.QuotationType.type == 'q5'){
                this.locstr.set('finalCost', this.totalTerritoryCost);
             }
            this.locstr.set('finalNetCost', this.finalNetCost);
        }
        this.locstr.setObj('parts', this.quoteData);
    }

    /**
     * For Decrement Set
     **/
    private decrementSet(part) {
        if (part.quantity > 1) {
            if (part.quantity == 1) {
                this.decrementFlag = false;
            }
            part.quantity = part.quantity - 1;
            this.discountBasedOnNoofSets(part, part.quantity);
        } else {
            this.decrementFlag = false;
        }
    }

    /**
     * For increment Set
     **/
    private incrementSet(part) {
        part.quantity = part.quantity + 1;
        this.decrementFlag = true;
        this.discountBasedOnNoofSets(part, part.quantity);
    }


    /**
     * This function used to track ngFor changes if user delete/add row.
     **/
    trackByFn(index, item) {
        return index;
    }

    /**
     * For sharing quote via email
     **/
    shareQuotePDF() {
        let sharePayload;
        let createdQuote = this.commonService.getCreateQuoteVo();
        let OrgLogo;

        this.broadcaster.on<any>('USER_CREATED')
            .subscribe(data => {
                OrgLogo = data.orgLogoUrl;
            });

        if (!OrgLogo) {
            let userData = this.userService.getUser();
            if (userData.orgLogoUrl) {
                OrgLogo = userData.orgLogoUrl;
            } else {
                OrgLogo = "https://s3.amazonaws.com/configuratortestenv/pdf/logo_here.png";
            }
        }

        if (this.quoteData && this.quoteData.parts.length > 0) {
            sharePayload = {
                "customerName": createdQuote.projectDetails.customerName,
                "projectName": createdQuote.projectDetails.projectName,
                "quoteNo": this.quoteData.quoteNo,
                "logo": OrgLogo,
                "preparedBy": this.quoteData.userName,
                "quotetionObjArray": this.quoteData.parts,
                "totalAmount": this.finalCost,
                'totalNetAmount': this.finalNetCost
            }
        }

        // this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
        // this.userService.shareQuote(sharePayload).subscribe(
        //     res => {
        //         if (res.status == "success") {
        //             this.shareLink = res.data.link;
        //         } else {
        //             this.isLoadFailed = true;
        //         }
        //         this.isLoading = false;
        //         this.commonService.hideLoading();
        //     },
        //     error => {
        //         this.isLoading = false;
        //         this.isLoadFailed = true;
        //         this.commonService.hideLoading();
        //         if (error && error != undefined) {
        //             // let errorMsg = JSON.parse( error._body );
        //             this.webServiceError = error.message;
        //             this.toastService.popToast("error", this.webServiceError);
        //         } else {
        //             this.webServiceError = 'share failed.';
        //             this.toastService.popToast("error", this.webServiceError);
        //         }
        //     }
        // );

        this.getDatasheetList();
        this.drawPanelDigram();
        setTimeout(() => {
            this.getPanelImage();
        }, 4000);
    }
}
