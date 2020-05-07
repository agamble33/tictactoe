import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";


/*-------------------------------- Providers ----------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { UserService } from '../../providers/user-service/user.service';
import { QuoteService } from '../../providers/quote-service/quote-service.service';
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { ToastService } from '../../providers/common-service/toaster-service';

/*------------------------------- pipe -------------------------------------*/
import { OrderByPipe } from '../../pipes/sort/sort';
import { from } from 'rxjs/observable/from';

@Component( {
    selector: 'app-accessories',
    templateUrl: './accessories.component.html',
    styleUrls: ['./accessories.component.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class AccessoriesComponent implements OnInit {
    @ViewChild( 'accessoryDesktopView' ) accessoryDesktopView: ElementRef;
    @ViewChild('accessoryBreadcrumbList') accessoryBreadcrumbList: ElementRef;
    @ViewChild('accessoryBtn') accessoryBtn: ElementRef;
    
    public accessoryHeight;
     public currentTag: string;
    // variable declaration
    selectedControllerTitle: string;
    selectedControllerSeries: any;
    
    public isTabSelected: boolean;
    list: Array<any> = [];
    invalidSelectionArray: Array<any> = [];
    accessoriesOptions: any;
    showItemOptions: boolean = false;
    selectedAccessoriesItem: any;
    previousAccessoriesItem: any;
    isLoading: boolean = false;
    isLoadFailed: boolean = false;
    pumpSelction: boolean = false;
    private accessoriesList = [];
    isDiscard: boolean = false;
    accessoriesItemHolder: any;
    public isValid;
    public isSaveDarftBtnClicked;
    public enableAccessories: boolean = false;
    public isLevelSensor: boolean = false;
    public selectedSeries900;
    // this flag set to check navigation to accessories page from dashboard or create new quote
    // set true in here and set false in flow-direction component.
    public isCreateNewAccessory:any;
    public topSectionHeight;
   // hide: boolean = true;
    

    

    constructor( private locstr: LocalStorageService, public sidebar: SidebarService,
        private commonService: CommonService, private router: Router,
        private userService: UserService, private broadcaster: Broadcaster,
        public constants: Constants, private quoteService: QuoteService,
        private toastService: ToastService, private cdr: ChangeDetectorRef, 
        public activatedRoute: ActivatedRoute ) {
    }

    ngOnInit() {
        this.sidebar.show();
        this.isValid = false;
        this.isSaveDarftBtnClicked = false;
    this.activatedRoute.params.subscribe(param=>{
        //console.log(param)
        this.currentTag = param.tag;
    })
        
       // this.locstr.set('saveQuoteFlag', false);

        this.isCreateNewAccessory = this.locstr.getObj("isCreateNewAccessory");
        if (!this.isCreateNewAccessory) {
            //breadcrumb : selected controller and series 
            this.selectedControllerTitle = this.commonService.getCreateQuoteVo().selectedController.name;
            this.selectedControllerSeries = this.commonService.getCreateQuoteVo().selectedControllerSeries;
            if(this.selectedControllerSeries.tag == 'WCT900P' || this.selectedControllerSeries.tag == 'WCT900H' || this.selectedControllerSeries.tag == 'WCT910H' || this.selectedControllerSeries.tag == 'WCT910P' || this.selectedControllerSeries.tag == 'WCT930P' || this.selectedControllerSeries.tag == 'WCT930H'){
                this.selectedSeries900 = "WCT900P";
            }
        }
        
        // If it is edit draft set new quoteId and quoteNo which is already saved as draft
        if( this.commonService.getCreateQuoteVo().draftPath == '/accessories' && this.commonService.getCreateQuoteVo().isEditDraftQuote){
            if( this.commonService.getCreateQuoteVo().isEditDraftQuote ){
                this.locstr.set('quoteId', this.commonService.getCreateQuoteVo().id);
                this.locstr.set('quoteNo', this.commonService.getCreateQuoteVo().quoteNo);
            }
         }

         // get accessories list
        this.getAccessoriesList();
    }
    
    ngAfterViewInit() {
        let height = this.accessoryDesktopView.nativeElement.offsetHeight;
        let topBottomSpace = 40;
        this.accessoryHeight = height - topBottomSpace;
        setTimeout( () => {
            let breadCrumbbtnHeight;
            let breadCrumbHeight;
            breadCrumbHeight = this.accessoryBreadcrumbList.nativeElement.offsetHeight;
            breadCrumbbtnHeight = this.accessoryBtn.nativeElement.offsetHeight;
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
    saveDraft( isDraft:boolean, draftPath: string, isRouteChange?:boolean ){
        this.accessoriesSelectionValidCheck();
        //get formatted configuredQuoteVo
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
    saveDarftBtnClicked(){
        this.isSaveDarftBtnClicked = true;
    }
    
    
    /**
     * This function of router guard, will check if state can be deactivated
     * */
    canDeactivate( currentState: RouterStateSnapshot, nextState: RouterStateSnapshot ) {
        if ( !this.commonService.isCreateQuoteRoute( nextState['url'] ) && !this.isSaveDarftBtnClicked ) {
            if ( nextState['url'] === "/" ) {
                // logout option selected
                return true;
            } else {
                return Observable.create(( observer: Observer<boolean> ) => {
                    if( (this.locstr.get('isEditViewedQuote') === 'false') && (this.locstr.get('fromViewQuoteOnlyView') === 'false' && this.locstr.get('shareQuoteFromViewQuote') === 'false') ){
                        this.commonService.showAccessoryDiscardConfirm(() => {
                            // yes callback -> save quote as draft
                            this.saveDraft( true,'/accessories', true );
                            this.broadcaster.on<any>( 'ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS' )
                            .subscribe( message => {
                                observer.next( true );
                                observer.complete();
                            } );
                        }, () => {
                            // Discard callback -> remove all locally stored create quote data
                            //this.commonService.clearCreateRouteData();
                            observer.next( true );
                            observer.complete();
                        }, () => {
                            // cross button callback -> stay on page
                            observer.next( false );
                            observer.complete();
                        } );
                    }else{
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



    /**
     * This function will fetch list of accessories from API
     * */
    getAccessoriesList() {
        this.isLoading = true;
        //this.hide = false;
        this.isLoadFailed = false;
        this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
    

        this.userService.getPanelAccessories().subscribe(
            res => {
                if ( res.status == "success" ) {
                    //console.log('HELLO-------------------------', res.data);
                    this.accessoriesList = res.data;
                    //console.log('FIND ME-------------------------', res.data);
                    //this.accessoriesList = res.data[0]

 ///////////////////////////////// TO FIND QUICK SHIP PANELS///////////////////////////////////////////////////////
                           this.accessoriesList = res.data.filter(item=>{
                            if(this.currentTag === 'QCKSHIP') {
                                return this.currentTag === item.tag;
                            }else if(item.tag === 'QCKSHIP'){
                                return false;
                            }
                            return true;
                        })
                        // const foundQuickShipTag = this.accessoriesList.find(accessoriesList => this.accessoriesList[0].tag == "QCKSHIP");
                    // if (foundQuickShipTag == "QCKSHIP") {
                    // this.hide = true;
                    //}
                     // show selected accessories
                    if ( this.commonService.getCreateQuoteVo() && this.commonService.getCreateQuoteVo().selectedAccessories ) {
                        let selectedAccessories: any = this.commonService.getCreateQuoteVo().selectedAccessories;
                        if ( ( this.accessoriesList && this.accessoriesList.length > 0 ) && ( selectedAccessories && selectedAccessories.length > 0 ) ) {
                            for ( let i = 0; i < selectedAccessories.length; i++ ) {
                                for ( let j = 0; j < this.accessoriesList.length; j++ ) {
                                    if ( selectedAccessories[i].id === this.accessoriesList[j].id ) {
                                        this.setAccessoriesSelection( this.accessoriesList[j], selectedAccessories[i] );
                                        for(let i=0;i<this.accessoriesList.length;i++) {
                                            // const foundQuickShipTag = this.accessoriesList.find(tag => this.accessoriesList[i].tag == "QCKSHIP");
                                            // if (foundQuickShipTag == "QCKSHIP") {
                                            //     this.hide = true;
                                            if(this.accessoriesList[i].tag=='LSN') {
                                                for(let j=0;j<this.accessoriesList[i].childs.length;j++) {                                
                                                    if(this.accessoriesList[i].childs[j].tag=="LS-5" && this.accessoriesList[i].childs[j].isChecked) {
                                                        this.enableAccessories = true;
                                                        }                 
                                                    }
                                                
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }                    
                    this.userService.getFormattedAccessoriesList( this.accessoriesList );
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
     * set accessories selection using locally saved item
     * */
    setAccessoriesSelection( accessoriesItem: any, localSavedItem: any ) {
        accessoriesItem.isChecked = localSavedItem.isChecked;
        if ( accessoriesItem.childs && accessoriesItem.childs.length > 0 ) {
            if ( localSavedItem.childs && localSavedItem.childs.length > 0 ) {
                for ( let i = 0; i < accessoriesItem.childs.length; i++ ) {
                    for ( let j = 0; j < localSavedItem.childs.length; j++ ) {
                        if ( accessoriesItem.childs[i].id == localSavedItem.childs[j].id ) {
                            this.setAccessoriesSelection( accessoriesItem.childs[i], localSavedItem.childs[j] );
                            break;
                        }
                    }
                }
            }
        }
    }
    /**
     * This function will be called on accessories select 
     * */
    selectAccessoriesItem( item: any ) {
        if(item.tag=='LSN') {
            this.isLevelSensor = true;
        } else {
            this.isLevelSensor = false;
        }
        
        this.list = [];

        if ( this.previousAccessoriesItem ) {
            this.previousAccessoriesItem.hide = true;
        }

        // If list has no childs check i
        if ( item && item.childs && ( item.childs.length == 0 ) ) {
            item.isChecked = !item.isChecked;
            item.hide = !item.hide;
        } else {
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

            if(activeChild) {
                this.isTabSelected = true;
                item.isSelectedTab = this.isTabSelected;
                item.isChecked = true;
                item.hide = false;
            }
        }
        this.previousAccessoriesItem = item;
      
    }
    
    /**
     * This function will be called on accessories child item select
     * */
    onItemSelect( item: any, list:any ) {
        if(item.childs) {
            let activeChild = false,
            listLength = item.childs.length;                            
            for(let i=0;i<listLength;i++) {
                if(item.childs[i].isChecked) {
                    activeChild = true;
                    i = listLength;
                }
            }
            if(activeChild) {
                item.isChecked = true;
            } else {
                item.isChecked = !item.isChecked;
            }
        } else {
            item.isChecked = !item.isChecked;
        }
        
            if(item.tag=="LS-5" && item.isChecked) {
                this.enableAccessories = true;
            } else if(item.tag=="LS-5" && !item.isChecked) {
                this.enableAccessories = false;
                for(let i=0;i<list.length;i++) {
                    if(list[i].tag=='LS-6' && list[i].isChecked) {
                        list[i].isChecked = false;
                        i = list.length;
                    }
                }
            }

        
    }
    
    /**
     * This function will be reset invalid accessories selection
     * */
    resetAccessoriesItem( item: any ) {
        if ( item && item.isChecked ) {
            item.isChecked = false;
            if ( item.childs && ( item.childs.length > 0 ) ) {
                for ( let i = 0; i < item.childs.length; i++ ) {
                    this.resetAccessoriesItem( item.childs[i] );
                }
            }
        }
    }
    
    /**
     * This function will be called on 'Next' button
     * */
    accessoriesSelectionValidCheck = () => {
        let accessoriesSelectionStatus = this.isAccessoriesSelectionValid();
        if (accessoriesSelectionStatus.isValid) {
            this.pumpSelction = false;
            var selectedAccessoriesList = this.accessoriesList.filter(( item ) => {
                if(item.isChecked) {
                    return item.isChecked;
                }                
            } );

            if (this.isCreateNewAccessory) {
                if (selectedAccessoriesList.length) {
                    this.isValid = false;
                    this.commonService.storeDataInCreateQuoteVo( 'selectedAccessories', selectedAccessoriesList );
                } else {
                    this.isValid = true;
                    this.commonService.showAlert("Alert", 'Please select accessories.', "OK", () => {
                        // Ok click code will be here
                    });
                }
            }else if(!this.isCreateNewAccessory) {
                if (selectedAccessoriesList.length) {
                    this.isValid = false;
                    this.commonService.storeDataInCreateQuoteVo( 'selectedAccessories', selectedAccessoriesList );
                } 
            }else {
                this.isValid = false;
            }
            
            //this.isValid = false;
         
            // 
            // for(let i=0;i<this.accessoriesList.length;i++) {
            //     if(this.accessoriesList[i].tag == "PMP" && this.accessoriesList[i].isChecked) {
            //         for(let j=0;j<this.accessoriesList[i].childs.length;j++) {
            //             if(this.accessoriesList[i].childs[j].isChecked) {
            //                 this.pumpSelction = true;
            //                 break;
            //             }
            //         }
            //      }
            //  }
            
            // let activeFlowDirection = this.commonService.getCreateQuoteVo().selectedFlowDirections[0].tag;
            // if(this.pumpSelction) {
            //     if(activeFlowDirection=='PP2') {
            //         this.isValid = true;
            //         this.commonService.showAlert( "Info", 'Pumps require Panel P3 or P4', "OK", () => {
            //             // Ok click code will be here
            //         } );
            //     }
            // } else if(activeFlowDirection=='PP4-A') {
            //     this.isValid = true;
            //     let message='Please select Pumps for Panel PP4-A';
            //     // if(activeFlowDirection=='PP4-A'){
            //     //     message = 'Please select Pumps for Panel PP4-A';
            //     // }else{
            //     //     message = 'Please select Pumps for Panel P3';
            //     // }
            //     this.commonService.showAlert( "Info", message, "OK", () => {
            //         // Ok click code will be here
            //     } );
            // } else {
            //     this.isValid = false;
            // }

        } else {
            this.isValid = true;
            // Invalid panel options selection, show message
            if ( accessoriesSelectionStatus.reason == 'Invalid Accessories Item selection' ) {
                // Invalid panel options selection, show discard message
                let invalidAccessories: string = '';
                for ( let k = 0; k < this.invalidSelectionArray.length; k++ ) {
                    if ( k == 0 ) {
                        invalidAccessories = this.invalidSelectionArray[k].accessoryName;
                    } else {
                        invalidAccessories = invalidAccessories + ', ' + this.invalidSelectionArray[k].accessoryName;
                    }
                }
                let messageText: string = 'You have incomplete accessories options selection for '+ '"' + invalidAccessories + '"' + ', Do you want to discard the selection?';
                this.showDiscardPrompt( messageText );
            }else{                
                if (this.isCreateNewAccessory) {
                    if(!this.isValid){
                        this.isValid = false;
                        this.commonService.storeDataInCreateQuoteVo( 'selectedAccessories', selectedAccessoriesList );
                    }else{
                        this.isValid = true;
                        this.commonService.showAlert("Alert", 'Please select accessories.', "OK", () => {});
                    }
                }else if(!this.isCreateNewAccessory){
                    if(!this.isValid){
                        this.isValid = false;
                        this.commonService.storeDataInCreateQuoteVo( 'selectedAccessories', selectedAccessoriesList );
                    }else{
                        this.isValid = false;
                       // this.commonService.showAlert("Alert", 'Please select accessories.', "OK", () => {});
                    }
                } else {
                    this.isValid = false;
                }
                if ( accessoriesSelectionStatus.reason == 'No accessory Item selected' ) {
                    this.commonService.storeDataInCreateQuoteVo( 'selectedAccessories', [] );
                }
            }
        }   
    }

    onNext(){
        this.accessoriesSelectionValidCheck();
        if( !this.isValid ){
        // Accessories selection valid, navigate to configured Quote screen
            this.router.navigate( ['/configuredQuote'] );
        }
    }
    
    /**
     * To show discard prompt
     * */
    showDiscardPrompt( messageText: string ) {
        let titleText: string = "Warning";
        let cancelText: string = "Cancel";
        let okText: string = "Ok";
        this.commonService.showConfirm( titleText, messageText, cancelText, okText, () => {
            // accessories discard code will be here
            let notSelectedItem = [];
            for ( let i = 0; i < this.accessoriesList.length; i++ ) {
                if ( this.invalidSelectionArray.length ) {
                    for ( let j = 0; j < this.invalidSelectionArray.length; j++ ) {
                        if ( this.accessoriesList[i].id == this.invalidSelectionArray[j].accessoryId ) {
                            this.resetAccessoriesItem( this.accessoriesList[i] );
                            this.isTabSelected = false;
                            this.accessoriesList[i].hide = true;
                        }else if(!this.accessoriesList[i].hide){
                            this.isTabSelected = true;
                        }
                    }
                }
            }
        });
    }

    /**
     * This function will be called to check if accessories selection invalid
     * */
    isAccessoriesSelectionValid = () => {
        this.isDiscard = false;
        this.invalidSelectionArray = [];

        if ( this.accessoriesList && this.accessoriesList.length > 0 ) {
            let isAccessoriesItemSelected: boolean = false;
            for ( let i = 0; i < this.accessoriesList.length; i++ ) {
                if ( this.accessoriesList[i].isChecked ) {
                    isAccessoriesItemSelected = true;
                    this.recursionFunction( this.accessoriesList[i], true );
                }
            }
            if(!isAccessoriesItemSelected){
                return {
                    'isValid': false,
                    'reason': 'No accessory Item selected'
                }
            }
            if ( this.isDiscard && ( this.invalidSelectionArray.length > 0 ) ) {
                return {
                    'isValid': false,
                    'reason': 'Invalid Accessories Item selection'
                }
            }
            return {
                'isValid': true,
                'reason': 'Valid Accessories Item selection'
            }
        }
    }

    /**
     * This function will be used to check invalid accessories recursivly
     * */
    recursionFunction( item: any, isAccessoriesCall: boolean ) {
        if ( isAccessoriesCall ) {
            // This will hold acceessoriesItem and get pushed if accessories has invalid selection
            this.accessoriesItemHolder = {
                'accessoryId': item.id,
                'accessoryName': item.name
            }
        }
        if ( item && item.childs && ( item.childs.length == 0 ) ) {
            if ( !item.isChecked ) {
                // Last child item, which is not selected, but parents are selected, show discard message
                this.isDiscard = true;
                this.invalidSelectionArray.push( this.accessoriesItemHolder );
            }// else accessories last child is selected
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
                    this.invalidSelectionArray.push( this.accessoriesItemHolder );
                }
            } else {
                // Child not defined
                if ( !item.isChecked ) {
                    // Last child item, which is not selected, but parents are selected, show discard message
                    this.isDiscard = true;
                    this.invalidSelectionArray.push( this.accessoriesItemHolder );
                }// else accessories last child is selected
            }
        }
    } 
    

}
