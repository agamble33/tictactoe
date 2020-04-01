
/**
 * This service will hold logged in user data and return if needed
 * */
import { Injectable, Inject } from '@angular/core';
import { Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

/*-------------------- Providers ----------------------------*/
import { AppSettings } from '../app-settings-service/app-settings.service';
import { Constants } from '../app-settings-service/app-constant.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { RestService } from '../rest-service/rest.service';
import { CommonService } from '../common-service/common.service';
import { UserService } from '..//user-service/user.service';
import { ToastService } from '../common-service/toaster-service';
import { Broadcaster } from '../broadcast-service/broadcast.service';

@Injectable()
export class QuoteService {

    public quoteData: any;
    public configureData: any;
    public selectedSensors;
    public selectedAccessory;
    public selectedPanel;
    public selectedDirections;
    public quoteId;
    public finalCost;
    public quoteNo;
    public editQuoteData;
    public webServiceError : string;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    isCreateNewAccessory :any;
    
    constructor( private restService: RestService, public locstr: LocalStorageService,
        private constants: Constants,
        private commonService: CommonService, private router: Router, 
        private broadcaster: Broadcaster, private userService: UserService, private toastService: ToastService) {
        this.quoteId = 0;
        this.finalCost = 0;
        this.isCreateNewAccessory =  this.locstr.getObj("isCreateNewAccessory");

    }

    configureQuoteVoFormation(){
       // console.log("LN 49 configureQuoteVoFormation");
      // For configure quote web service call object formation
        let data;
        let panelData;
        let price;
        let parts;
        let note;
        let disclaimer;
        
        if(this.locstr.get('quoteNo') && this.locstr.get('finalCost') && this.locstr.getObj('parts')){
            this.quoteNo = this.locstr.get('quoteNo');
            price = this.locstr.get('finalCost');
            parts = this.locstr.getObj('parts');
        }else{
            this.quoteNo = '';
            price = 0;
            parts = null;
        }
        
        if( this.commonService.getCreateQuoteVo() ){
            data = this.commonService.getCreateQuoteVo();
            // Flow direction merged into panel data for configure quote object formation
            panelData = data.selectedPanelOptions;
        }        
        
        this.selectedDirections = this.commonService.getCreateQuoteVo().selectedFlowDirections; 
        if ( this.selectedDirections && this.selectedDirections.length > 0){       
            for ( let i = 0; i < this.selectedDirections.length; i++ ) {
                this.selectedSensorsOnly( this.selectedDirections[i] );
            }
        } else {
            this.selectedDirections = [];
        }
          
        if (this.locstr.getObj('disclaimerAndNotes')) {
            let disclaimerAndNotes = this.locstr.getObj('disclaimerAndNotes');
            note = disclaimerAndNotes.note;
            disclaimer = disclaimerAndNotes.disclaimer;
        }

        // Code for only checked items array formation for backend(Controller sensor I/O)
        let copyOfSelectedSensors;
        this.selectedSensors = this.commonService.getCreateQuoteVo().selectedSensorList;
        if (this.selectedSensors) {
            copyOfSelectedSensors = JSON.parse(JSON.stringify( this.selectedSensors ));
            if ( copyOfSelectedSensors && copyOfSelectedSensors.length > 0){       
                for ( let i = 0; i < copyOfSelectedSensors.length; i++ ) {
                    this.selectedSensorsOnly( copyOfSelectedSensors[i] );
                }
            } else {
                copyOfSelectedSensors = [];
            }
        } else {
            copyOfSelectedSensors = [];
        }
                   
        // Code for only checked items array formation for backend(Accessories)
        this.selectedAccessory = this.commonService.getCreateQuoteVo().selectedAccessories; 
        if ( this.selectedAccessory && this.selectedAccessory.length > 0){   
            for ( let a = 0; a < this.selectedAccessory.length; a++ ) {
                this.selectedSensorsOnly( this.selectedAccessory[a] );
            }
        } else {
            this.selectedAccessory = [];
        }
        
        // Code for only checked items array formation for backend(Panels)
        this.selectedPanel = panelData;
        if( this.selectedPanel && this.selectedPanel.length > 0){   
            for ( let p = 0; p< this.selectedPanel.length; p++ ) {
                this.selectedSensorsOnly( this.selectedPanel[p] );
            }
        } else {
            this.selectedPanel = [];
        }
        
        if(this.commonService.getCreateQuoteVo().isEditDraftQuote || this.commonService.getCreateQuoteVo().isEditSavedQuote ){
           // console.log("this.commonService.getCreateQuoteVo().....ss......", this.commonService.getCreateQuoteVo());
            this.quoteId =  this.commonService.getCreateQuoteVo().id;
       }else if(JSON.parse(this.locstr.get('quoteId')) != null ){
           this.quoteId = this.locstr.get('quoteId');
           this.commonService.getCreateQuoteVo().isEditDraftQuote = false;
           this.commonService.getCreateQuoteVo().isEditSavedQuote = false;
       }else{
           this.quoteId = 0;
           this.commonService.getCreateQuoteVo().isEditDraftQuote = false;
           this.commonService.getCreateQuoteVo().isEditSavedQuote =false
       }


        // Post data for web service
         this.configureData = {
            "id": this.quoteId,
            "price": price,
            "parts": parts,
            "customerName": data.projectDetails.customerName,
            "projectName": data.projectDetails.projectName,
            "salesRep": data.projectDetails.salesRep,
            "controllerId": data.selectedController.id,
            "controllerSeriesId": data.selectedControllerSeries.id,
            "accessories": this.selectedAccessory,
            "panels": this.selectedPanel,
            "quoteNo": this.quoteNo,
            "controllerIoOptions": copyOfSelectedSensors,
            "flowDirection": this.selectedDirections,
            "selectedController": data.selectedController,
            "selectedControllerSeries": data.selectedControllerSeries,
            "createQuoteVo": data,
            "note": note,
            "disclaimer":disclaimer,
            "isAccessories":false,
            "QuotationType" : data.projectDetails.quoteType,
            "quotation_type_id" : data.projectDetails.quoteType.id
        }
        //console.log(" this.configureData", this.configureData);
        return this.configureData;
    }

    
    // ---------------------------------------------------------------------------------------
    configureQuoteVoFormationForAccessories(){
        this.quoteId = 0;
       // console.log("LN 150 configureQuoteVoFormationForAccessories");
        // For configure quote web service call object formation
        let data;
        let panelData = [];
        let price;
        let parts = [];
        let note;
        let disclaimer;
        this.selectedDirections = [];
        this.selectedSensors = []; 
        this.selectedPanel = [];
        let  copyOfSelectedSensors = [];
        
        if(this.locstr.get('quoteNo') && this.locstr.get('finalCost')){
            this.quoteNo = this.locstr.get('quoteNo');
            price = this.locstr.get('finalCost');
        }else{
            this.quoteNo = '';
            price = 0;
            parts = null;
        }
        
        if(this.locstr.getObj("disclaimerAndNotes")) {
            let disclaimerAndNotes = this.locstr.getObj("disclaimerAndNotes");
            note = disclaimerAndNotes.note;
            disclaimer = disclaimerAndNotes.disclaimer;
        }

        if( this.commonService.getCreateQuoteVo() ){
            data = this.commonService.getCreateQuoteVo();
        }        

        // Code for only checked items array formation for backend(Controller sensor I/O)
            
        // Code for only checked items array formation for backend(Accessories)
        this.selectedAccessory = this.commonService.getCreateQuoteVo().selectedAccessories; 
        if( this.selectedAccessory && this.selectedAccessory.length > 0){   
            for ( let a = 0; a < this.selectedAccessory.length; a++ ) {
                this.selectedSensorsOnly( this.selectedAccessory[a] );
            }
        } else {
            this.selectedAccessory = [];
        }

        if(this.commonService.getCreateQuoteVo().isEditDraftQuote || this.commonService.getCreateQuoteVo().isEditSavedQuote ){
           // console.log("this.commonService.getCreateQuoteVo().....ss......", this.commonService.getCreateQuoteVo());
            this.quoteId =  this.commonService.getCreateQuoteVo().id;
       } else if (JSON.parse(this.locstr.get('quoteId')) != null ){
           this.quoteId = this.locstr.get('quoteId');
           this.commonService.getCreateQuoteVo().isEditDraftQuote = false;
           this.commonService.getCreateQuoteVo().isEditSavedQuote = false;
       } else {
           this.quoteId = 0;
           this.commonService.getCreateQuoteVo().isEditDraftQuote = false;
           this.commonService.getCreateQuoteVo().isEditSavedQuote =false
       }
        
        // Post data for web service
        this.configureData = {
            "id": this.quoteId,
            "price": price,
            "parts": parts,
            "customerName": data.projectDetails.customerName,
            "projectName": data.projectDetails.projectName,
            "salesRep": data.projectDetails.salesRep,
            "controllerId": null,
            "controllerSeriesId": null,
            "accessories": this.selectedAccessory,
            "panels": this.selectedPanel,
            "quoteNo": this.quoteNo,
            "controllerIoOptions": copyOfSelectedSensors,
            "flowDirection": this.selectedDirections,
            "selectedController":[],
            "selectedControllerSeries": [],
            "createQuoteVo": data,
            "note": note,
            "disclaimer":disclaimer,
            "isAccessories":true,
            "QuotationType" : data.projectDetails.quoteType,
            "quotation_type_id" : data.projectDetails.quoteType.id
        }

        //console.log("LN 216 this.configureData", this.configureData);
        return this.configureData;
    }
    // -----------------------------------------------------------------------------------------



    /**
     * This function will be to create only selected controller sensor I/O array formation(not include unchecked items)
     **/
      selectedSensorsOnly( item ) {
          if(item && item.isChecked && item.childs){
               for( let c=item.childs.length-1; c>=0; c--){
                   if(!item.childs[c].isChecked){
                        item.childs.splice(c,1);
                   } else {
                       this.selectedSensorsOnly(item.childs[c]);
                   }
               }
          }
      }
            
   /**
    * Function To save quote 
    **/
    saveQuote( isDraft: boolean, draftPath?: string, isRouteChange?:boolean ){
       this.isLoading = true;
       this.isLoadFailed = false;
       this.isCreateNewAccessory =  this.locstr.getObj('isCreateNewAccessory');

       if (this.isCreateNewAccessory) {
            this.configureQuoteVoFormationForAccessories();
        } else {
            this.configureQuoteVoFormation();
       }
       //console.log('this.commonService.getCreateQuoteVo()....ss............', this.commonService.getCreateQuoteVo());

    //    if(this.commonService.getCreateQuoteVo().isEditDraftQuote || this.commonService.getCreateQuoteVo().isEditSavedQuote ){
    //         console.log("this.commonService.getCreateQuoteVo().....ss......", this.commonService.getCreateQuoteVo());
    //         this.quoteId =  this.commonService.getCreateQuoteVo().id;
    //    }else if(JSON.parse(this.locstr.get('quoteId')) != null ){
    //        this.quoteId = this.locstr.get('quoteId');
    //        this.commonService.getCreateQuoteVo().isEditDraftQuote = false;
    //        this.commonService.getCreateQuoteVo().isEditSavedQuote = false;
    //    }else{
    //        this.quoteId = 0;
    //        this.commonService.getCreateQuoteVo().isEditDraftQuote = false;
    //        this.commonService.getCreateQuoteVo().isEditSavedQuote =false
    //    }

       if( this.configureData ){
           this.configureData.is_draft = isDraft;
           this.configureData.id = this.quoteId;
           this.configureData.draftPath = draftPath;
       }

       this.commonService.showLoading( this.constants.PLEASE_WAIT_TEXT );
       this.userService.saveQuote(this.configureData).subscribe(
           res => {
              if( res.status == "success" ){
                  this.quoteData = res.data;
                  this.broadcaster.broadcast('QUOTE_NO_CHANGE', this.quoteData.quote_no);
                  
                  // Cleared customer name and project name on save draft or saved quote success
                  this.broadcaster.broadcast('CLEAR_PROJECT_DETAILS_ON_SAVE_QUOTE', res.status);
                  
                  // If quote is Draft quote
                  if(this.configureData.is_draft){
                      // on draft quote success change sidebar my draft quote count
                        this.locstr.set('draftQuoteCount',this.quoteData.draftQuoteCount);
                        this.locstr.set('savedQuoteCount', this.quoteData.savedQuoteCount);
                        
                        // Event on each save as draft quote success count changes
                        this.broadcaster.broadcast('ON_SAVED_QUOTE_SUCCESS', this.quoteData.savedQuoteCount);
                        this.broadcaster.broadcast('ON_SAVE_DRAFT_QUOTE_SUCCESS',this.quoteData.draftQuoteCount);
                        
                        // On save as draft success toast msg
                        this.toastService.popToast( 'success', res.message );
                        
                      // if we clicked my draft quote or my save quote tab(save as draft confirmation success event )
                      if( isRouteChange ) {
                          this.broadcaster.broadcast('ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS',isRouteChange);
                      }
                     
                      // If quote id present in local storage else set new id
                      if( JSON.parse(this.locstr.get('quoteId')) != null ){
                          this.quoteId = this.locstr.get('quoteId');
                      } else {
                          this.locstr.set('quoteId', this.quoteData.id);
                      }
                  }
                  
                  // If quote is Saved quote
                  if( !this.configureData.is_draft){
                      // on saved quote success change sidebar my saved quote count
                      this.locstr.set('draftQuoteCount',this.quoteData.draftQuoteCount);
                      this.locstr.set('savedQuoteCount', this.quoteData.savedQuoteCount);
                      
                      // Event on each saved quote success count changes
                      this.broadcaster.broadcast('ON_SAVE_DRAFT_QUOTE_SUCCESS',this.quoteData.draftQuoteCount);
                      this.broadcaster.broadcast('ON_SAVED_QUOTE_SUCCESS', this.quoteData.savedQuoteCount);
                      
                      // On save as final success toast msg
                      this.toastService.popToast( "success", res.message );
                      
                    // if we clicked my draft quote or my save quote tab(save as draft confirmation success event )
                      if( isRouteChange ){
                          this.broadcaster.broadcast('ON_ROUTE_CHANGE_SAVE_DRAFT_SUCCESS',isRouteChange);
                      }
                      // If quote id present in local storage else set new id
                      if( JSON.parse(this.locstr.get('quoteId')) != null && this.locstr.get('quoteNo') != '' ){
                          this.quoteId = this.locstr.get('quoteId');
                          this.quoteNo = this.locstr.get('quoteNo');
                          
                      } else {
                          this.locstr.set('quoteId', this.quoteData.id);
                          this.locstr.set('quoteNo', this.quoteData.quote_no);
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
              if ( error && error != undefined ) {
                if(error._body) {
                    let errorMsg = JSON.parse( error._body );
                    this.webServiceError = errorMsg.message;
                } else {
                    this.webServiceError = error.message;
                }
                  this.toastService.popToast( "error", this.webServiceError );
              } else {
                  this.webServiceError = 'Save quote failed. Please try again.';
                  this.toastService.popToast( "error", this.webServiceError );
              }
          }
       );
   }

}