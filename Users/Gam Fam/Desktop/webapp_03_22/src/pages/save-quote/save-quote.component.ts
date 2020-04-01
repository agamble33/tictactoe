import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterStateSnapshot } from '@angular/router';

import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { UserService } from '../../providers/user-service/user.service';
import { QuoteService } from '../../providers/quote-service/quote-service.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';
import { PaginationService } from '../../providers/pagination-service/pagination.service';
import { AppSettings } from '../../providers/app-settings-service/app-settings.service';
import { Broadcaster } from "../../providers/broadcast-service/broadcast.service";
import { ChangeProjectDetailsComponent } from '../change-project-details/change-project-details.component';

@Component( {
    selector: 'app-save-quote',
    templateUrl: './save-quote.component.html',
    styleUrls: ['./save-quote.component.scss'],
    encapsulation: ViewEncapsulation.None
} )
export class SaveQuoteComponent implements OnInit {

    public headerHeight;
    public pageHeight;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public savedQuoteData: any = this.paginationService.getDefaultPaginationVo();
    public webServiceError : string;
    public selectedAll;
    public search;
    public IdArr = [];
    
    public disclaimerAndNotes = {
        note : '',
        disclaimer : ''
    }

    constructor(private locstr: LocalStorageService, public sidebar: SidebarService,
        private commonService: CommonService,
            private userService: UserService, private quoteService: QuoteService,
            private constants: Constants, private toastService: ToastService, 
            private router: Router,  private paginationService: PaginationService,
            private broadcaster: Broadcaster ) {
        let windowInnerHeight = window.innerHeight;
        let windowHeight = this.locstr.getObj( 'windowInnerHeight' );
        this.headerHeight = ( 98 * windowHeight ) / 900;
        this.pageHeight = windowHeight - 69;
    }

    ngOnInit() {
        this.sidebar.show();
        this.isLoadFailed = false;
        this.locstr.set('fromViewQuoteOnlyView', false);

        //Get saved quotes list
        this.getListOfSavedQuote();
    }
    
    /**
     * Function to get list of saved quotes
     **/
    getListOfSavedQuote(){
        this.commonService.showLoading('Please Wait');
        this.userService.getSavedQuoteList().subscribe(
            res => {
                if( res.status == "success" ){
                    this.savedQuoteData = res;
                    this.locstr.setObj( 'savedQuoteObj', this.savedQuoteData);
                    this.loadSavedQuotes( this.savedQuoteData, false );
                 }else {
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
                   this.webServiceError = 'Create quote failed. Please try again.';
                   this.toastService.popToast( "error", this.webServiceError );
               }
           }
        );
  }

    /**
     * This function will perform pagination search
     **/
     onSavedQuoteSearch( searchValue: string ) {
       this.savedQuoteData.data = [];
       this.savedQuoteData.pageNumber = 0;
       this.savedQuoteData.isLoadMore = false;
       let savedQuoteObj = this.locstr.getObj( 'savedQuoteObj' );
       this.loadSavedQuotes( savedQuoteObj, true );
    }
     
     /**
      * This function will be called to load first time data of user list
      * */
     loadSavedQuotes( savedQuoteVo: any, isSearch: boolean ) {
         if ( !isSearch ) {
             this.savedQuoteData = this.paginationService.getDefaultPaginationVo();
             this.savedQuoteData.url = AppSettings.SAVED_QUOTE_LIST;
             this.savedQuoteData.organization_id = savedQuoteVo.id;
         }
         this.savedQuoteData.isLoading = true;
         this.savedQuoteData.isLoadFailed = false;
         this.paginationService.getPaginationData( this.savedQuoteData, true ).subscribe(
             res => {
                 if ( res.status == "success" ) {
                     this.broadcaster.broadcast('SAVE_QUOTE_COUNT',res.data.count);
                     this.locstr.set('savedQuoteCount', res.data.count);
                     this.savedQuoteData.data = res.data['rows'] ? res.data['rows'] : [];
                     this.dateCalculation(this.savedQuoteData.data);
                     if ( this.savedQuoteData && this.savedQuoteData.data && ( this.savedQuoteData.data.length < res.data.count ) ) {
                         this.savedQuoteData.isLoadMore = true;
                     } else {
                         this.savedQuoteData.isLoadMore = false;
                         this.savedQuoteData.isEOL = true;
                     }
                     this.savedQuoteData.isLoadFailed = false;                     
                 } else {
                     this.savedQuoteData.isLoadFailed = true;
                 }
                 this.savedQuoteData.isLoading = false;
             },
             error => {
                 // Failed to load draft quote
                 this.savedQuoteData.isLoadFailed = true;
                 this.savedQuoteData.isLoading = false;
             } );
     }

    dateCalculation(savedQuoteData){
        let releaseDate = this.constants.PRODUCTION_RELEASE_DATE;
        //console.log("releaseDate........", releaseDate);
        var milisecReleaseDate = releaseDate.getTime() + (releaseDate.getTimezoneOffset() * 60000);

        for(let i=0; i< savedQuoteData.length; i++){
            let lastUpdated = new Date(savedQuoteData[i].updated_at);
            let milisec = lastUpdated.getTime() + (lastUpdated.getTimezoneOffset() * 60000);
            if( milisec < milisecReleaseDate){
                savedQuoteData[i].isOldQuote = true;
            }else{
                savedQuoteData[i].isOldQuote = false;
            }
        }
    }
     
     /**
      * This function will be called on scroll of quote list to fetch more data 
      **/
     loadMoreSavedQuote() {
         if ( this.savedQuoteData && this.savedQuoteData.isLoadMore ) {
             this.savedQuoteData.isLoading = true;
             this.savedQuoteData.pageNumber = this.savedQuoteData.pageNumber + 1;
             this.paginationService.getPaginationData( this.savedQuoteData, true ).subscribe(
                 res => {
                     if ( res && res.data && res.data['rows'] ) {
                         this.savedQuoteData.data = this.savedQuoteData.data.concat( res.data['rows'] )
                         this.dateCalculation(this.savedQuoteData.data);
                     }
                     if ( this.savedQuoteData && this.savedQuoteData.data && ( this.savedQuoteData.data.length < res.data.count ) ) {
                         this.savedQuoteData.isLoadMore = true;
                     } else {
                         this.savedQuoteData.isLoadMore = false;
                         this.savedQuoteData.isEOL = true;
                     }
                     this.savedQuoteData.isLoading = false;
                 },
                 error => {
                     // Failed to load quote
                     this.savedQuoteData.pageNumber = this.savedQuoteData.pageNumber - 1;
                     this.savedQuoteData.isLoading = false;
                 } );
         }
     }
  
    /**
     * Function select item through checkbox
     **/
     selectAll() {
         this.IdArr = [];
         this.selectedAll = !this.selectedAll;
         if(this.selectedAll){
             for (var i = 0; i < this.savedQuoteData.data.length; i++) {
                 this.savedQuoteData.data[i].isSelected = true;
                 this.IdArr.push(this.savedQuoteData.data[i].id);
             }
         }else{
             for (var i = 0; i < this.savedQuoteData.data.length; i++) {
                 this.savedQuoteData.data[i].isSelected = false;
                 let index = this.savedQuoteData.data.indexOf( this.savedQuoteData.data[i] );
                 this.IdArr.splice(index,1);
             }
         }
      }
     
     /**
      * Function select item through checkbox
      **/
      selectQuote( selectedSavedQuote ){
          
          selectedSavedQuote.isSelected = !selectedSavedQuote.isSelected;
         // console.log('WHAT--------', selectedSavedQuote.id);
          if(this.selectedAll){
              if( this.IdArr.length > 0 ){
                  for(let j = 0; j < this.IdArr.length; j++){
                      if(this.IdArr[j] == selectedSavedQuote.id){
                        //console.log('WHAT--------', selectedSavedQuote.id);
                         
                          let index = this.IdArr.indexOf( this.IdArr[j] );
                          this.IdArr.splice(index,1);
                      }
                  }
                  this.selectedAll = false;
              }
          }else{
              if( selectedSavedQuote.isSelected ){
                  this.IdArr.push(selectedSavedQuote.id);
              }else{
                  for(let m = 0; m < this.IdArr.length; m++){
                      if(this.IdArr[m] == selectedSavedQuote.id){
                          let index = this.IdArr.indexOf( this.IdArr[m] );
                          this.IdArr.splice(index,1);
                      }
                  }
              }
          }
      }
      
     /**
      * Function to Delete saved Quote
      **/
     deleteSavedQuote( quote: any ){
         this.commonService.showConfirm( "", 'Are you sure you want to delete saved Quote?.', "Cancel", "Ok", () => {
             this.savedQuoteData.isLoading = true;
             this.userService.deleteSavedQuote( quote.id ).subscribe(
                 res => {
                     if ( res.status == "success" ) {
                         this.getListOfSavedQuote();
                         //delete quote success toast 
                         this.toastService.popToast( "success", res.message );
                         this.savedQuoteData.isLoading = false;
                         this.IdArr = [];
                     }
                 },
                 error => {
                     this.savedQuoteData.isLoading = false;
                     this.commonService.hideLoading();
                     let errorResponse; 
                     if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                         errorResponse = error;
                     } else {
                         errorResponse = error.json();
                     }               
                     if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                         this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                             this.commonService.logout();
                         } );
                     } else {
                         // Error message for back-end If data not matched                  
                            if ( error && error != undefined ) {
                                 this.toastService.popToast( "error", error.message );
                            }
                        }
                 } );
         } );
     }
     
     /**
      * Function to Delete Mulitple saved Quotes
      **/
     deleteMultipleSavedQuote( ){
        this.commonService.showConfirm( "", 'Are you sure you want to delete saved Quotes?.', "Cancel", "Ok", () => {
             this.savedQuoteData.isLoading = true;
             this.userService.deleteMultipleSavedQuote( this.IdArr ).subscribe(
                 res => {
                     if ( res.status == "success" ) {
                         this.getListOfSavedQuote();
                         //delete quote success toast 
                         this.toastService.popToast( "success", res.message );
                         this.savedQuoteData.isLoading = false;
                         this.IdArr = [];
                     }
                 },
                 error => {
                     this.savedQuoteData.isLoading = false;
                     this.commonService.hideLoading();
                     let errorResponse; 
                     if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                         errorResponse = error;
                     } else {
                         errorResponse = error.json();
                     }               
                     if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                         this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                             this.commonService.logout();
                         } );
                     } else {
                         // Error message for back-end If data not matched                  
                            if ( error && error != undefined ) {
                                 this.toastService.popToast( "error", error.message );
                            }
                        }
                 } );
         } );
     }
     
     /**
      * Function to edit saved quote
      **/
    editSavedQuote( savedQuote ){
         let editQuoteData;
         let createVo;
         editQuoteData = savedQuote.input.createQuoteVo;
         
         if( (savedQuote.input.customerName != editQuoteData.customerName) && ( savedQuote.input.projectName != editQuoteData.projectName ) ){
             editQuoteData.projectDetails.customerName = savedQuote.input.customerName;
             editQuoteData.projectDetails.projectName  = savedQuote.input.projectName;
         }
         
         editQuoteData.id = savedQuote.id;
         editQuoteData.isEditSavedQuote = true;
         editQuoteData.isEditDraftQuote = false;
         editQuoteData.quoteNo = savedQuote.quote_no;
         editQuoteData.draftPath = savedQuote.input.draftPath;
         editQuoteData.parts = savedQuote.input.parts;
         editQuoteData.note = savedQuote.input.note;
         editQuoteData.disclaimer = savedQuote.input.disclaimer;
         editQuoteData.isAccessories = savedQuote.input.isAccessories;

         this.locstr.set("isOldDraft", savedQuote.isOldQuote);

        // // this flag set to check navigation to accessories page from dashborad or create new quote
        // // set true in here and set false in flow-direction component.
        if (savedQuote.input.isAccessories) {
            this.locstr.setObj("isCreateNewAccessory", true);
        } else {
            this.locstr.setObj("isCreateNewAccessory", false);           
        }
        let copyofGetCreateQuoteVo;
        if(this.commonService.getCreateQuoteVo()) {
            copyofGetCreateQuoteVo = JSON.parse(JSON.stringify( this.commonService.getCreateQuoteVo() ));
        } else {
            copyofGetCreateQuoteVo = [];
        }         
         this.locstr.setObj('copyofGetCreateQuoteVo', copyofGetCreateQuoteVo);
         if( savedQuote ){
             this.commonService.setCreateQuoteVo(editQuoteData);
             this.broadcaster.broadcast('ON_EDIT_QUOTE',editQuoteData.projectDetails);
             this.locstr.set('saveQuoteFlag', true);
             this.router.navigate( [savedQuote.input.draftPath] );
         }
     }
    
    changeProjectDetails( copyQuoteData ){
        this.commonService.openComponentModal( ChangeProjectDetailsComponent, copyQuoteData, "Cancel", "Save", "customModal", ( data ) => {
            //Edit Admin success toast 
            if ( data.status == 'success' ) {
                this.getListOfSavedQuote();
                this.toastService.popToast( "success", data.message );
            }
        } );
    }
}
