import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

/*------------------------------- Providers -------------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { UserService } from '../../providers/user-service/user.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { CommonService } from '../../providers/common-service/common.service';
import { QuoteService } from '../../providers/quote-service/quote-service.service';
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { ToastService } from '../../providers/common-service/toaster-service';

/*------------------------------- pipe -------------------------------------*/
import { OrderByPipe } from '../../pipes/sort/sort';

@Component( {
    selector: 'app-panel-options',
    templateUrl: './panel-options.component.html',
    styleUrls: ['./panel-options.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class panelOptions implements OnInit {
    @ViewChild( 'panelDesktopView' ) panelDesktopView: ElementRef;
    @ViewChild('panelBreadcrumbList') panelBreadcrumbList: ElementRef; 
    @ViewChild('panelBtn') panelBtn: ElementRef;
    public panelHeight;
    public selectedControllerTitle: any;
    public selectedControllerSeries: any;

    public isTabSelected: boolean;
    list: Array<any> = [];
    invalidSelectionArray: Array<any> = [];
    panelList = [];
    panelOptions: any;
    showItemOptions: boolean = false;
    selectedPanelItem: any;
    previousPanelItem: any;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    isDiscard: boolean = false;
    activeCorrosion: boolean = false;
    corrosionSelected: boolean = false;
    panelMaterialSelected: boolean = false;
    panelItemHolder: any;
    defaultSelectedItem;
    public isValid;
    public isSaveDraftBtnClicked;
    public checkedItemArr;
    public isShowRadio: boolean;
    public selectedSeries900;
    // organization id requred to getPanel option according to organization.
    public organizationId:any = null;
    public panel22X33Selected;
    public topSectionHeight;
    public isSpecialOrganization = false;

    constructor( private locstr: LocalStorageService, public sidebar: SidebarService,
        private userService: UserService, private toastService: ToastService,
        public constants: Constants, private broadcaster: Broadcaster, private commonService: CommonService,
        private router: Router, private quoteService: QuoteService, private cdr: ChangeDetectorRef ) {
    }

    ngOnInit() {
        this.sidebar.show();
        this.isLoadFailed = false;
        this.isValid = false;
        this.isShowRadio = false;
        this.isSaveDraftBtnClicked = false;
       // this.locstr.set('saveQuoteFlag', false);
        
        // organization id requred to getPanel option according to organization.
        if (this.locstr.getObj('loggedInUser')){
            this.organizationId = this.locstr.getObj('loggedInUser').organizationId;     
            this.isSpecialOrganization = this.locstr.getObj('loggedInUser').isSpecificOrganization;        
        }    
        // Get selected controller and series to show it on header
        this.selectedControllerTitle = this.commonService.getCreateQuoteVo().selectedController.name;
        this.selectedControllerSeries = this.commonService.getCreateQuoteVo().selectedControllerSeries; 
        
        if(this.selectedControllerSeries.tag == 'WCT900P' || this.selectedControllerSeries.tag == 'WCT900H' || this.selectedControllerSeries.tag == 'WCT910H' || this.selectedControllerSeries.tag == 'WCT910P' || this.selectedControllerSeries.tag == 'WCT930P' || this.selectedControllerSeries.tag == 'WCT930H'){
            this.selectedSeries900 = "WCT900P";
        }
        // If it is edit draft set new quoteId and quoteNo which is already saved as draft
        if( this.commonService.getCreateQuoteVo().draftPath == '/panelOptions' && this.commonService.getCreateQuoteVo().isEditDraftQuote){
            if( this.commonService.getCreateQuoteVo().isEditDraftQuote ){
                this.locstr.set('quoteId', this.commonService.getCreateQuoteVo().id);
                this.locstr.set('quoteNo', this.commonService.getCreateQuoteVo().quoteNo);
            }
         }
        
        // To get list of panels
        this.getPanelList();        
    }

    ngAfterViewInit() {
        let height = this.panelDesktopView.nativeElement.offsetHeight;
        let topBottomSpace = 40;
        this.panelHeight = height - topBottomSpace;
        setTimeout( () => {
            let breadCrumbbtnHeight;
            let breadCrumbHeight;
            breadCrumbHeight = this.panelBreadcrumbList.nativeElement.offsetHeight;
            breadCrumbbtnHeight = this.panelBtn.nativeElement.offsetHeight;
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
        
    }

    /**
     * Function to save as draft
     * @param isDraft
     */
    saveAsDraft( isDraft: boolean, draftPath: string, isRouteChange?:boolean ){
        this.panelSelectionValidCheck();
      // get formatted configuredQuoteVo 
        let draftData = this.quoteService.configureQuoteVoFormation();
        if( !this.isValid ){
            this.quoteService.saveQuote( isDraft, draftPath, isRouteChange );
        }    
    }
    
    /**
     * Function to check if quote already saved as draft and
     * switching to another tab then
     *  it will not show confirmation popup for save as draft 
     **/
    saveDraftBtnClicked(){
        this.isSaveDraftBtnClicked = true;
    }
     
    /**
     * This function of router guard, will check if state can be deactivated
     **/
    canDeactivate( currentState: RouterStateSnapshot, nextState: RouterStateSnapshot ) {
        if ( !this.commonService.isCreateQuoteRoute( nextState['url'] ) && !this.isSaveDraftBtnClicked  ) {
            if ( nextState['url'] === "/" ) {
                // logout option selected
                return true;
            } else {
                return Observable.create(( observer: Observer<boolean> ) => {
                    if( (this.locstr.get('isEditViewedQuote') === 'false') && (this.locstr.get('fromViewQuoteOnlyView') === 'false' && this.locstr.get('shareQuoteFromViewQuote') === 'false') ){
                        this.commonService.showPanelDiscardConfirm(() => {
                            // yes callback -> save quote as draft
                            this.saveAsDraft( true, '/panelOptions', true );
                            this.broadcaster.on<any>( 'ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS' )
                            .subscribe( message => {
                                observer.next( true );
                                observer.complete();
                            } );
                        }, () => {
                            // Discard callback -> remove all locally stored create quote data
                        // this.commonService.clearCreateRouteData();
                            observer.next( true );
                            observer.complete();
                        }, () => {
                            // cross button callback -> stay on page
                            observer.next( false );
                            observer.complete();
                        } );
                    } else {
                        observer.next(true);
                        observer.complete();
                        this.locstr.set('shareQuoteFromViewQuote', false);
                        this.locstr.set('fromViewQuoteOnlyView', false);
                    }
                } );
            }
        } else {
            return true;
        }
    }

    /* As per client requirement we have changed frontend instead of backend (for production only)*/
    protected changePanelItemPosition = (res, a, b) => {
        res[a] = res.splice(b, 1, res[a])[0];
    }

    /**
     * Function to get Panel Options data
     * */
    protected getPanelList = () => {
        this.defaultSelectedItem = [];
        this.isLoading = true;
        this.isLoadFailed = false;
        this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
        this.userService.getPanelList( this.organizationId ).subscribe(
            res => {
                if ( res.status == "success" ) {
                     let panelData = res.data;
                    /* As per client requirement we have changed frontend instead of backend (for production only)*/
                   // this.changePanelItemPosition(res.data, 0,1);
                    if ( panelData && panelData.length > 0 ) {
                        // if ( panelData[0].PanelOptions && panelData[0].PanelOptions.length > 0 ) {
                        //     for ( let j = 0; j < panelData[0].PanelOptions.length; j++ ) {
                        //         this.panelList.push( panelData[0].PanelOptions[j] );
                        //     }
                        // }
                        this.panelList = panelData;
                    }
                    // console.log('WHEN', this.panelList)
                    
                    // Initial if corrosion accordian is open then set radio type to its child
                    if( this.panelList && this.panelList.length > 0 ){
                        for ( let i = 0; i < this.panelList.length; i++ ) {    
                            this.checkSelectionType(this.panelList[i]);
                         }
                    }
                            
                    // By default options selected
                    for ( let k = 0; k < this.panelList.length; k++ ) {
                        if ( this.panelList[k].tag == 'FLSW' || this.panelList[k].tag == 'SAPO' ) {
                            this.defaultSelectedItem.push( this.panelList[k] );
                        }
                    }
                    
                    // show selected panel options
                   if ( this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().selectedPanelOptions ) {
                        let selectedPanelOptions: any = this.commonService.getCreateQuoteVo().selectedPanelOptions;
                        if ( ( this.panelList && this.panelList.length > 0 ) && ( selectedPanelOptions && selectedPanelOptions.length > 0 ) ) {
                            for ( let i = 0; i < selectedPanelOptions.length; i++ ) {
                                for ( let j = 0; j < this.panelList.length; j++ ) {
                                    if ( selectedPanelOptions[i].id === this.panelList[j].id ) {
                                        this.setPanelSelection( this.panelList[j], selectedPanelOptions[i] );
                                        break;
                                    }
                                }
                            }
                        }
                   }
                   this.userService.getFormattedPanelOptionList( this.panelList );
                   
                    // Based on controller sensor & I/o screen corrosion item selection set validation on coupon rack
                  
                        let sensorListObj = this.commonService.getCreateQuoteVo().selectedSensorList;
                        if( sensorListObj ){
                            for(let i=0;i<sensorListObj.length;i++) {
                                if(sensorListObj[i].tag == 'SO') {
                                    this.searchObj( sensorListObj[i], 'tag' );
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
                let errorResponse;
                if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                    errorResponse = error;
                } else {
                    errorResponse = error.json();
                }
                if (errorResponse && errorResponse != undefined && errorResponse.statusCode == 401) {
                    this.commonService.showAlert("Error", errorResponse.error, "OK", () => {
                        this.commonService.logout();
                    });
                } else {
                    // Error message for back-end If data not matched                  
                    if (error && error != undefined) {
                        this.toastService.popToast("error", error.message);
                    }
                }
            }
        );
    }

    /**
     * set panel selection using locally saved item
     **/
    setPanelSelection( panelItem: any, localSavedItem: any ) {
        panelItem.isChecked = localSavedItem.isChecked;
    
        if ( panelItem.childs && panelItem.childs.length > 0 ) {
            if ( localSavedItem.childs && localSavedItem.childs.length > 0 ) {
                for ( let i = 0; i < panelItem.childs.length; i++ ) {
                    for ( let j = 0; j < localSavedItem.childs.length; j++ ) {
                        if ( panelItem.childs[i].id == localSavedItem.childs[j].id ) {
                            this.setPanelSelection( panelItem.childs[i], localSavedItem.childs[j] );
                            break;
                        }
                    }
                }
            }
        }
    }
    
    /**
     *  Based on items selection flag( if checkbox = is_checkBox ; if radio = !is_checkBox)
     **/
    checkSelectionType( item:any ){
        let childTypeValue;
        let typeClass;
        if( item && item.childs.length > 0){
            for(let j=0;j<item.childs.length;j++){
                if(item.childs[j].is_checkBox) {
                    childTypeValue = 'checkbox';
                    typeClass = 'checkboxControl';
                } else {
                    childTypeValue = 'radio';
                    typeClass = 'radioControl';
                }  
                
                item.childs[j].childType = childTypeValue;
                item.childs[j].typeClass = typeClass;
            }  
        }
     }
            
    /**
     * This function will be called on panel select 
     **/
    selectPanelItem( item: any ) {
        //log("item....", item);
        /* as per client requiremnet we will change frontend instead of backend */
        if(item.tag == 'PM') {
            let itemChild = item.childs;
            for(let k=0;k<itemChild.length;k++) {
                itemChild[k].is_checkBox = false;
            }
        }
        this.list = [];

        if ( this.previousPanelItem ) {
            this.previousPanelItem.hide = true;
        }

        // If list has no childs check i
        if ( item && item.childs && ( item.childs.length == 0 ) ) {
            item.isChecked = !item.isChecked;
            item.hide = !item.hide;
        } else {
            // Based on selection type (checkbox or radio) add conditionally checkbox or radio
            this.checkSelectionType(item);
            this.list = this.list.concat( item.childs );
            let activeChild = false,
                listLength = this.list.length;                            
            for(let i=0;i<listLength;i++) {
                if(this.list[i].isChecked) {
                    activeChild = true;
                    i = listLength;
                }
            }

                item.isChecked = !item.isChecked;
                item.hide = !item.isChecked;
                this.isTabSelected = item.isChecked ? true : false;
                item.isSelectedTab = this.isTabSelected;

                if(activeChild) {
                    this.isTabSelected = true;
                    item.isSelectedTab = this.isTabSelected;
                    item.isChecked = true;
                    item.hide = false;
                }
                //Based on selection type different html code shown
                for(var j= 0; j < this.list.length; j++){
                    if(this.list[j].childType == "radio"){
                        this.isShowRadio = true;
                    }else{
                        this.isShowRadio = false;
                    }
                }
            

        }
        this.previousPanelItem = item;
    }

    /**
     * This function will be called on panel child item select for multiple select
     **/
    onItemSelect( list ) {
   // console.log("list....", list);
        list.isChecked = !list.isChecked;
    }

    /**
     * Function called on radio selection type items
     **/
    radioSelection( item:any, list:any ){
        //console.log("item...radioSelection.", item);
        // item.isChecked = true; 
        item.isChecked = !item.isChecked; 
        // if(item && (item.tag != 'CCR-4-CL' || item.tag != 'CCR-1' ) ){
        //     this.isDefaultCouponRackSelect = true;
        //     this.locstr.set('isDefaultCouponRackSelect', this.isDefaultCouponRackSelect);
        // }
        for(let i=0; i<list.length; i++){
            if(list[i].tag != item.tag){
                list[i].isChecked = false;
            }
        }
    }
        
    /**
     * This function will be called on panel child item select for single select
     **/
    onItemCheck = ( list, listItem ) => {
        //console.log("listItem....", listItem);
        listItem.isChecked = true;
        list.forEach(( item ) => {
            if ( item.id != listItem.id ) {
                item.isChecked = false;
            }
        } )
    }

    /**
     * This function will be reset invalid panel options selection
     **/
    resetPanelItem( item: any ) {
        if ( item && item.isChecked ) {
            item.isChecked = false;
            if ( item.childs && ( item.childs.length > 0 ) ) {
                for ( let i = 0; i < item.childs.length; i++ ) {
                    this.resetPanelItem( item.childs[i] );
                }
            }
        }
    }

    /**
     * This function will be called on 'Next' button
     **/
    panelSelectionValidCheck = () => {
        
        let panelSelectionStatus = this.isPanelSelectionValid();
        if ( panelSelectionStatus.isValid ) {
            //set object to get selected panel options if route changes
            var selectedPanelListArray = this.panelList.filter(( item ) => {
                return item.isChecked;
            } );

            var selectedPanelList = selectedPanelListArray.concat( this.defaultSelectedItem );
            this.isValid = false;
            
            if(!this.isValid){
                this.commonService.storeDataInCreateQuoteVo( 'selectedPanelOptions', selectedPanelList );
                this.commonService.storeDataInCreateQuoteVo( 'panelListArray', this.panelList );
            }else{
                this.isValid = true;
            }
        } else {
            this.isValid = true;
            // Invalid panel options selection, show message
            if ( panelSelectionStatus.reason == 'No Panel Material Item selection' ) {
                // No panel options Item selected
                this.commonService.showAlert( "Info", 'Please select required Panel Material', "OK", () => {
                    // Ok click code will be here
                } );
            } else if(panelSelectionStatus.reason == 'No Corrosion Coupon Rack Item selection') {
                this.commonService.showAlert( "Info", 'Please select Corrosion Coupon Rack', "OK", () => {
                    // Ok click code will be here
                } );
            } else if(panelSelectionStatus.reason == 'Invalid Panel material selection') {
                this.commonService.showAlert( "Info", 'Invalid panel material selection. Select panel material size other than 22wx33H', "OK", () => {
                    // Ok click code will be here
                } );
            } else {
                // Invalid panel options selection, show discard message
                let invalidPanels: string = '';
                for ( let k = 0; k < this.invalidSelectionArray.length; k++ ) {
                    if ( k == 0 ) {
                        invalidPanels = this.invalidSelectionArray[k].panelName;
                    } else {
                        invalidPanels = invalidPanels + ', ' + this.invalidSelectionArray[k].panelName;
                    }
                }
                let messageText: string = 'You have incomplete panel options selection for '+ '"' + invalidPanels + '"' + ', Do you want to discard the selection?';
                this.showDiscardPrompt( messageText );
            }
        }
    }

    /**
     * Function to call on next button
     **/
    onNext(){
        this.panelSelectionValidCheck();
        if( !this.isValid ){
         // panel options selection valid, navigate to flow direction screen
            this.router.navigate( ['/flowDirection'] );
        }
    }
    
    /**
     * To show discard prompt
     **/
    showDiscardPrompt( messageText: string ) {
        let titleText: string = "Warning";
        let cancelText: string = "Cancel";
        let okText: string = "Ok";
        this.commonService.showConfirm( titleText, messageText, cancelText, okText, () => {
            // panel options discard code will be here
            let notSelectedItem = [];

            for ( let i = 0; i < this.panelList.length; i++ ) {
                if ( this.invalidSelectionArray.length ) {
                    for ( let j = 0; j < this.invalidSelectionArray.length; j++ ) {
                        if ( this.panelList[i].id == this.invalidSelectionArray[j].panelId ) {
                            this.resetPanelItem( this.panelList[i] );
                            this.isTabSelected = false;
                            this.panelList[i].hide = true;
                        } else if ( !this.panelList[i].hide ) {
                            this.isTabSelected = true;
                        }
                    }
                }
            }
        } );
    }

    /**
     * This function will be called to check if panel options selection invalid
     **/
    isPanelSelectionValid = () => {
        this.isDiscard = false;
        this.invalidSelectionArray = [];
        if ( this.panelList && this.panelList.length > 0 ) {
            this.corrosionSelected = false;
            this.panelMaterialSelected = false;
            let isPanelItemSelected: boolean = false;
            for ( let i = 0; i < this.panelList.length; i++ ) {
                if ( this.panelList[i].isChecked ) {
                    isPanelItemSelected = true;
                    this.recursionFunction( this.panelList[i], true );
                }

                if ( this.panelList[i].tag=='CCR' && this.panelList[i].isChecked ) {
                    for(let k=0;k<this.panelList[i].childs.length;k++) {
                        if(this.panelList[i].childs[k].isChecked) {
                            this.corrosionSelected = true; 
                            k = this.panelList[i].childs.length;               
                        }
                    }
                }

                if ( this.panelList[i].tag=='PM' && this.panelList[i].isChecked ) {
                    this.panel22X33Selected = false;
                    for(let p=0; p<this.panelList[i].childs.length; p++) {
                        if(this.panelList[i].childs[p].isChecked) {
                            this.commonService.storeDataInCreateQuoteVo( 'selectedPanelMaterial', this.panelList[i].childs[p] );
                            if(this.panelList[i].childs[p].tag == 'PM-4' || this.panelList[i].childs[p].tag == 'PM-5' || this.panelList[i].childs[p].tag == 'PM-6') {
                               this.panel22X33Selected = true;
                                p = this.panelList[i].childs.length;
                            }                            
                        }
                    }
                    this.panelMaterialSelected = true;
                }
                
            }
           
            if (!this.panelMaterialSelected) {
                return {
                    'isValid': false,
                    'reason': 'No Panel Material Item selection'
                }
            }                  
            if (isPanelItemSelected && this.activeCorrosion && !this.corrosionSelected) {
                return {
                    'isValid': false,
                    'reason': 'No Corrosion Coupon Rack Item selection'
                }
            }            
            if ( this.isDiscard && ( this.invalidSelectionArray.length > 0 ) ) {
                return {
                    'isValid': false,
                    'reason': 'Invalid Panel Item selection'
                }
            }
            if ( this.corrosionSelected && this.panel22X33Selected ) {
                return {
                    'isValid': false,
                    'reason': 'Invalid Panel material selection'
                }
            }
            return {
                'isValid': true,
                'reason': 'Valid Panel Item selection'
            }
        }
    }
// Based on controller sensor & I/O selection - corrosion coupon rack option selected
    public searchObj = ( obj, query ) => {
        for ( var key in obj ) {
            var value = obj[key];
            if ( typeof value === 'object' ) {
                this.searchObj( value, query );
            }
            if ( key === query ) {
                if(obj.tag=='CM' && obj.isChecked) {                
                    this.activeCorrosion = true;

                    
                    
                    // For W900 series check count of (controller sensor screen) corrosion monitor selected item
                    let objTraverse;
                    this.checkedItemArr = [];
                    objTraverse = obj;
                    if( this.selectedSeries900 = "WCT900P" || this.selectedControllerSeries.tag =='PA-2' || this.selectedControllerSeries.tag =='MVEC'|| this.selectedControllerSeries.tag =='XS'){
                        for(let i=0; i<objTraverse.childs.length; i++){
                            if( objTraverse.childs[i].isChecked ){
                                if( objTraverse.childs[i].childs && objTraverse.childs[i].childs.length > 0 ){
                                    for(let j=0; j<objTraverse.childs[i].childs.length; j++){
                                        if( objTraverse.childs[i].childs[j].isChecked ){
                                            this.checkedItemArr.push(objTraverse.childs[i].childs[j]);
                                        }
                                    }
                                }else{
                                    this.checkedItemArr.push(objTraverse.childs[i]);
                                }
                            }
                        }
                          /* checked if locally saved item does not match with the default selected item then change selection
                          ** For W900 series if (on controller sensor screen) selected corrosion items then 
                          ** selected item count (1 or 2)- 2pass coupon rack options are available with bydefault selected any one
                          ** selected item count (3 or 4)- 4pass coupon rack options are available with bydefault selected any one        
                          */
                        
                         let locallySavedItems = this.commonService.getCreateQuoteVo().selectedPanelOptions;
                        for ( let i = 0; i < this.panelList.length; i++ ) {
                            if(this.panelList[i].tag=="CCR" && this.checkedItemArr.length > 0) {
                                this.panelList[i].isChecked = true;
                                this.panelList[i].disabled = true;
                                let isShow = false;
                                for(let j=0; j<this.panelList[i].childs.length; j++){
                                    // if(!this.isSpecialOrganization){       
                                    //     if( this.panelList[i].isChecked && this.checkedItemArr.length <= 2){
                                    //         if(!this.isDefaultCouponRackSelect && this.panelList[i].childs[j].tag == 'CCR-1' ){
                                    //             this.panelList[i].childs[j].isChecked = true; 
                                    //         }

                                    //         if(locallySavedItems){
                                    //             for(let k=0; k<locallySavedItems.length; k++){
                                    //                 if( locallySavedItems[k].tag=="CCR" && locallySavedItems[k].childs.length > 0){
                                    //                     for(let l=0; l<locallySavedItems[k].childs.length; l++){
                                    //                     if(locallySavedItems[k].childs[l].id == this.panelList[i].childs[j].id){
                                    //                             if( locallySavedItems[k].childs[l].tag=="CCR-2" && locallySavedItems[k].childs[l].isChecked ){
                                    //                                 this.panelList[i].childs[j].isChecked = true;
                                    //                                 isShow = true; 
                                    //                             }
                                                                
                                    //                             if(isShow && locallySavedItems[k].childs[l].tag == "CCR-1"){
                                    //                                 this.panelList[i].childs[j].isChecked = false;
                                    //                             }
                                    //                         }
                                    //                     }
                                    //                 }
                                    //             }
                                    //         }
                                    //         if( this.panelList[i].childs[j].tag == 'CCR-4-CL' || this.panelList[i].childs[j].tag == 'CCR-4'){
                                    //             this.panelList[i].childs[j].disabled = true;
                                    //             this.panelList[i].childs[j].isChecked = false;
                                    //         }
                                    //     }else{
                                        //     if( !this.isDefaultCouponRackSelect && this.panelList[i].childs[j].tag == 'CCR-4-CL'){
                                        //         this.panelList[i].childs[j].isChecked = true; 
                                        //     }
                                        //     if(locallySavedItems){
                                        //         for(let k=0; k<locallySavedItems.length; k++){
                                        //             if( locallySavedItems[k].tag=="CCR" && locallySavedItems[k].childs.length > 0){
                                        //                 for(let l=0; l<locallySavedItems[k].childs.length; l++){
                                        //                 if(locallySavedItems[k].childs[l].id == this.panelList[i].childs[j].id){
                                        //                         if( locallySavedItems[k].childs[l].tag=="CCR-4" && locallySavedItems[k].childs[l].isChecked ){
                                        //                             this.panelList[i].childs[j].isChecked = true;
                                        //                             isShow = true; 
                                        //                         }
                                                                
                                        //                         if(isShow && locallySavedItems[k].childs[l].tag=="CCR-4-CL"){
                                        //                             this.panelList[i].childs[j].isChecked = false;
                                        //                         }
                                        //                     }
                                        //                 }
                                        //             }
                                        //         }
                                        //     }
                                        //     if( this.panelList[i].childs[j].tag == 'CCR-1' || this.panelList[i].childs[j].tag == 'CCR-2'){
                                        //         this.panelList[i].childs[j].disabled = true;
                                        //         this.panelList[i].childs[j].isChecked = false;
                                        //     }
                                        // }//end of if
                                    //}else{
                                        if(locallySavedItems == null && this.panelList[i].childs[j].tag == 'CCR-1' ){
                                            this.panelList[i].childs[j].isChecked = true; 
                                        }

                                        if(locallySavedItems){
                                            for(let k=0; k<locallySavedItems.length; k++){
                                                if( locallySavedItems[k].tag=="CCR" && locallySavedItems[k].childs.length > 0){
                                                    for(let l=0; l<locallySavedItems[k].childs.length; l++){
                                                    if(locallySavedItems[k].childs[l].id == this.panelList[i].childs[j].id){
                                                            if( locallySavedItems[k].childs[l].tag=="CCR-2" && locallySavedItems[k].childs[l].isChecked ){
                                                                this.panelList[i].childs[j].isChecked = true;
                                                                isShow = true; 
                                                            }
                                                            
                                                            if(isShow && locallySavedItems[k].childs[l].tag == "CCR-1"){
                                                                this.panelList[i].childs[j].isChecked = false;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                   // }
                                }//end of for
                            }
                        }         
                    }                          
                }
            }
            if ( key === query ) {
                if(obj.tag=='WAL-CS'  && obj.isChecked) {                
                    this.activeCorrosion = true;

                    let objTraverse;
                    this.checkedItemArr = [];
                    objTraverse = obj;
                    if( this.selectedSeries900 = "WCT900P" ) {
                        for(let i=0; i<objTraverse.childs.length; i++){
                            if( objTraverse.childs[i].isChecked ){
                                if( objTraverse.childs[i].childs && objTraverse.childs[i].childs.length > 0 ){
                                    for(let j=0; j<objTraverse.childs[i].childs.length; j++){
                                        if( objTraverse.childs[i].childs[j].isChecked ){
                                            this.checkedItemArr.push(objTraverse.childs[i].childs[j]);
                                        }
                                    }
                                }else{
                                    this.checkedItemArr.push(objTraverse.childs[i]);
                                }
                            }
                        }
                     
                         let locallySavedItems = this.commonService.getCreateQuoteVo().selectedPanelOptions;
                        for ( let i = 0; i < this.panelList.length; i++ ) {
                            if(this.panelList[i].tag=="CCR" && this.checkedItemArr.length > 0) {
                                this.panelList[i].isChecked = true;
                                this.panelList[i].disabled = true;
                                let isShow = false;
                                for(let j=0; j<this.panelList[i].childs.length; j++){
                               
                                        if(locallySavedItems == null && this.panelList[i].childs[j].tag == 'CCR-1' ){
                                            this.panelList[i].childs[j].isChecked = true; 
                                        }

                                        if(locallySavedItems){
                                            for(let k=0; k<locallySavedItems.length; k++){
                                                if( locallySavedItems[k].tag=="CCR" && locallySavedItems[k].childs.length > 0){
                                                    for(let l=0; l<locallySavedItems[k].childs.length; l++){
                                                    if(locallySavedItems[k].childs[l].id == this.panelList[i].childs[j].id){
                                                            if( locallySavedItems[k].childs[l].tag=="CCR-2" && locallySavedItems[k].childs[l].isChecked ){
                                                                this.panelList[i].childs[j].isChecked = true;
                                                                isShow = true; 
                                                            }
                                                            
                                                            if(isShow && locallySavedItems[k].childs[l].tag == "CCR-1"){
                                                                this.panelList[i].childs[j].isChecked = false;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                   // }
                                }//end of for
                            }
                        }         
                    }                          
                }
            }
        }
    }
    

    /**
     * This function will be used to check invalid series recursively
     **/
    recursionFunction( item: any, isPanelCall: boolean ) {
        if ( isPanelCall ) {
            // This will hold panelItem and get pushed if panel options has invalid selection
            this.panelItemHolder = {
                'panelId': item.id,
                'panelName': item.name
            }
        }
        if ( item && item.childs && ( item.childs.length == 0 ) ) {
            if ( !item.isChecked ) {
                // Last child item, which is not selected, but parents are selected, show discard message
                this.isDiscard = true;
                this.invalidSelectionArray.push( this.panelItemHolder );
            }// else panel options last child is selected
        } else {
            if ( item.childs && item.childs.length > 0 ) {
                let isChildSelected: boolean = false;
                for ( let i = 0; i < item.childs.length; i++ ) {
                    if ( item.childs[i].isChecked ) {
                        isChildSelected = true;
                        break;
                    }
                }
                if ( isChildSelected ) {
                    for ( let k = 0; k < item.childs.length; k++ ) {
                        if ( item.childs[k].isChecked ) {
                            this.recursionFunction( item.childs[k], false );
                        }
                    }
                } else {
                    // My child not selected, discard message
                    this.isDiscard = true;
                    this.invalidSelectionArray.push( this.panelItemHolder );
                }
            } else {
                // Child not defined
                if ( !item.isChecked ) {
                    // Last child item, which is not selected, but parents are selected, show discard message
                    this.isDiscard = true;
                    this.invalidSelectionArray.push( this.panelItemHolder );
                }// else panel options last child is selected
            }
        }
    }



    /**
     * coming soon pop-up 
     **/
    commingSoonPopup() {
        this.commonService.showAlert( "Info", this.constants.COMMING_SOON_MSG, "OK", () => {
            // Ok click code will be here
        } );
    }

}
