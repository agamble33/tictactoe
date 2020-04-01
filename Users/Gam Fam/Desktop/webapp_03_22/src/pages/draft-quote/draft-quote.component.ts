import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';

/*-------------------- Providers --------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { UserService } from '../../providers/user-service/user.service';
import { QuoteService } from '../../providers/quote-service/quote-service.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';
import { PaginationService } from '../../providers/pagination-service/pagination.service';
import { AppSettings } from '../../providers/app-settings-service/app-settings.service';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';

@Component({
    selector: 'app-draft-quote',
    templateUrl: './draft-quote.component.html',
    styleUrls: ['./draft-quote.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DraftQuoteComponent implements OnInit {

    public headerHeight;
    public pageHeight;
    public webServiceError: string;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public draftData: any = this.paginationService.getDefaultPaginationVo();
    public selectedAll;
    public search;
    public IdArr = [];
    public disclaimerAndNotes = {
        note: '',
        disclaimer: ''
    }

    constructor(private locstr: LocalStorageService, public sidebar: SidebarService,
        private commonService: CommonService,
        private userService: UserService, private quoteService: QuoteService,
        public constants: Constants, private toastService: ToastService,
        private router: Router, private paginationService: PaginationService, private broadcaster: Broadcaster) {

        let windowInnerHeight = window.innerHeight;
        let windowHeight = this.locstr.getObj('windowInnerHeight');
        this.headerHeight = (98 * windowHeight) / 900;
        this.pageHeight = windowHeight - 69;
    }

    ngOnInit() {
        this.sidebar.show();
        this.isLoadFailed = false;
        this.selectedAll = false;
        this.locstr.set('fromViewQuoteOnlyView', false);
        //get draft quotes list
        this.getListOfDraftQuote();
    }

    getListOfDraftQuote() {
        this.commonService.showLoading('Please Wait');
        this.userService.getDraftQuoteList().subscribe(
            res => {
                if (res.status == "success") {
                    this.draftData = res;
                    this.locstr.setObj('draftObj', this.draftData);
                    this.loadDraftQuotes(this.draftData, false);
                   
                    //Added isSelected property to item for checkbox selection
                    if (this.draftData.data && this.draftData.data.length > 0) {
                        for (let i = 0; i < this.draftData.data.length; i++) {
                            this.draftData.data[i].isSelected = false;
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
     * This function will perform pagination search
     **/
    onDraftQuoteSearch(searchValue: string) {
        this.draftData.data = [];
        this.draftData.pageNumber = 0;
        this.draftData.isLoadMore = false;
        let draftObj = this.locstr.getObj('draftObj');
        this.loadDraftQuotes(draftObj, true);
    }

    /**
     * This function will be called to load first time data of user list
     **/
    loadDraftQuotes(draftVo: any, isSearch: boolean) {
        if (!isSearch) {
            this.draftData = this.paginationService.getDefaultPaginationVo();
            this.draftData.url = AppSettings.DRAFT_QUOTE_LIST;
            this.draftData.organization_id = draftVo.id;
           
        }
        this.draftData.isLoading = true;
        this.draftData.isLoadFailed = false;
        this.paginationService.getPaginationData(this.draftData, true).subscribe(
            res => {
                if (res.status == "success") {
                    this.broadcaster.broadcast('DRAFT_QUOTE_COUNT', res.data.count);
                    this.locstr.set('draftQuoteCount', res.data.count);
                    this.draftData.data = res.data['rows'] ? res.data['rows'] : [];
                    
                   // console.log('WHAT------------', this.draftData.data);

                    this.dateCalculation(this.draftData.data);
                    
                    if (this.draftData && this.draftData.data && (this.draftData.data.length < res.data.count)) {
                        this.draftData.isLoadMore = true;
                    } else {
                        this.draftData.isLoadMore = false;
                        this.draftData.isEOL = true;
                    }
                    this.draftData.isLoadFailed = false;
                } else {
                    this.draftData.isLoadFailed = true;
                }
                this.draftData.isLoading = false;
            },
            error => {
                // Failed to load draft quote
                this.draftData.isLoadFailed = true;
                this.draftData.isLoading = false;
            });
    }

    dateCalculation(draftData){
        let releaseDate = this.constants.PRODUCTION_RELEASE_DATE;
        //console.log("releaseDate........", releaseDate);
        var milisecReleaseDate = releaseDate.getTime() + (releaseDate.getTimezoneOffset() * 60000);

        for(let i=0; i< draftData.length; i++){
            let lastUpdated = new Date(draftData[i].updated_at);
            let milisec = lastUpdated.getTime() + (lastUpdated.getTimezoneOffset() * 60000);
            if( milisec < milisecReleaseDate){
                draftData[i].isOldQuote = true;
            }else{
                draftData[i].isOldQuote = false;
            }
            //console.log("lastUpdated........", lastUpdated);
           // console.log("milisec........", milisec);
        }
    }

    /**
     * This function will be called on scroll of quote list to fetch more data 
     **/
    loadMoreDraftQuote() {
        if (this.draftData && this.draftData.isLoadMore) {
            this.draftData.isLoading = true;
            this.draftData.pageNumber = this.draftData.pageNumber + 1;
            this.paginationService.getPaginationData(this.draftData, true).subscribe(
                res => {
                    if (res && res.data && res.data['rows']) {
                        this.draftData.data = this.draftData.data.concat(res.data['rows']);
                        this.dateCalculation(this.draftData.data);
                    }
                    if (this.draftData && this.draftData.data && (this.draftData.data.length < res.data.count)) {
                        this.draftData.isLoadMore = true;
                    } else {
                        this.draftData.isLoadMore = false;
                        this.draftData.isEOL = true;
                    }
                    this.draftData.isLoading = false;
                },
                error => {
                    // Failed to load quote
                    this.draftData.pageNumber = this.draftData.pageNumber - 1;
                    this.draftData.isLoading = false;
                });
        }
    }

    /**
     * Function select item through checkbox
     **/
    selectAll() {
        this.IdArr = [];
        this.selectedAll = !this.selectedAll;
        if (this.selectedAll) {
            for (var i = 0; i < this.draftData.data.length; i++) {
                this.draftData.data[i].isSelected = true;
                this.IdArr.push(this.draftData.data[i].id);
            }
        } else {
            for (var i = 0; i < this.draftData.data.length; i++) {
                this.draftData.data[i].isSelected = false;
                let index = this.draftData.data.indexOf(this.draftData.data[i]);
                this.IdArr.splice(index, 1);
            }
        }
    }

    /**
     * Function select item through checkbox
     **/
    selectQuote(selectedDraftQuote) {
        selectedDraftQuote.isSelected = !selectedDraftQuote.isSelected;
        
        if (this.selectedAll) {
            if (this.IdArr.length > 0 && this.IdArr) {
                for (let j = 0; j < this.IdArr.length; j++) {
                    if (this.IdArr[j] == selectedDraftQuote.id) {
                        let index = this.IdArr.indexOf(this.IdArr[j]);
                        this.IdArr.splice(index, 1);
                    }
                }
                this.selectedAll = false;
            }
        } else {
            if (selectedDraftQuote.isSelected) {
                this.IdArr.push(selectedDraftQuote.id);
            } else {
                for (let m = 0; m < this.IdArr.length; m++) {
                    if (this.IdArr[m] == selectedDraftQuote.id) {
                        let index = this.IdArr.indexOf(this.IdArr[m]);
                        this.IdArr.splice(index, 1);
                    }
                }
            }
        }
    }

    /**
     * Function to Delete Draft Quote
     **/
    deleteDraftQuote(quote: any) {
        this.commonService.showConfirm("", 'Are you sure you want to delete draft Quote?.', "Cancel", "Ok", () => {
            this.draftData.isLoading = true;
            this.userService.deleteDraftQuote(quote.id).subscribe(
                res => {
                    if (res.status == "success") {
                        this.getListOfDraftQuote();
                        //delete quote success toast 
                        this.toastService.popToast("success", res.message);
                        this.draftData.isLoading = false;
                        this.IdArr = [];
                    }
                },
                error => {
                    this.draftData.isLoading = false;
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
                });
        });
    }

    /**
     * Function to Delete Mulitple Draft Quotes
     **/
    deleteMultipleDraftQuote() {
        this.commonService.showConfirm("", 'Are you sure you want to delete draft Quotes?.', "Cancel", "Ok", () => {
            this.draftData.isLoading = true;
            this.userService.deleteMultipleDraftQuote(this.IdArr).subscribe(
                res => {
                    if (res.status == "success") {
                        this.getListOfDraftQuote();
                        //delete quote success toast 
                        this.toastService.popToast("success", res.message);
                        this.draftData.isLoading = false;
                        this.IdArr = [];
                    }
                },
                error => {
                    this.draftData.isLoading = false;
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
                });
        });
    }

    /**
     * Function to edit Draft quote
     **/
    editDraftQuote(draft) {
        let editQuoteData;
        let createVo;
        editQuoteData = draft.input.createQuoteVo;
        editQuoteData.id = draft.id;
        editQuoteData.isEditDraftQuote = true;
        editQuoteData.isEditSavedQuote = false;
        editQuoteData.quoteNo = draft.quote_no;
        editQuoteData.parts = draft.input.parts;
        editQuoteData.draftPath = draft.input.draftPath;
        editQuoteData.note = draft.input.note;
        editQuoteData.disclaimer = draft.input.disclaimer;
        editQuoteData.isAccessories = draft.input.isAccessories;

        //console.log("editQuoteData........", editQuoteData);
        this.locstr.set("isOldDraft", draft.isOldQuote);

        //this flag set to check navigation to accessories page from dashborad or create new quote
        // set true in here and set false in flow-direction component.
        if (draft.input.isAccessories) {
            this.locstr.setObj("isCreateNewAccessory", true);
        } else {
            this.locstr.setObj("isCreateNewAccessory", false);
        }

        let copyofGetCreateQuoteVo;
        if (this.commonService.getCreateQuoteVo()) {
            copyofGetCreateQuoteVo = JSON.parse(JSON.stringify(this.commonService.getCreateQuoteVo()));
        } else {
            copyofGetCreateQuoteVo = [];
        }

        this.locstr.setObj('copyofGetCreateQuoteVo', copyofGetCreateQuoteVo);
        if (draft) {
            this.commonService.setCreateQuoteVo(editQuoteData);
            this.broadcaster.broadcast('ON_EDIT_DRAFT', editQuoteData.projectDetails);
            this.locstr.set('saveQuoteFlag', true);
            this.router.navigate([draft.input.draftPath]);
        }
    }
}

