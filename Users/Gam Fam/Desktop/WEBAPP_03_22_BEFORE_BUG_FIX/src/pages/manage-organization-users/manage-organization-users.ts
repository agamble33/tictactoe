import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';

/*-------------------------------- Components ----------------------------------*/
import { AddNewAdminComponent } from "../add-new-admin/add-new-admin.component";
import { AddNewSuperUserComponent } from "../add-new-super-user/add-new-super-user.component";
import { SetRoleBasedQuoteTypeComponent } from '../set-role-based-quote-type/set-role-based-quote-type.component';

/*-------------------------------- Providers ----------------------------------*/
import { SidebarService } from '../../providers/sidebar.service';
import { PaginationService } from "../../providers/pagination-service/pagination.service";
import { AppSettings } from "../../providers/app-settings-service/app-settings.service";
import { UserService } from "../../providers/user-service/user.service";
import { ToastService } from '../../providers/common-service/toaster-service';
import { CommonService } from "../../providers/common-service/common.service";
import { ManageOrgUserService } from "../../providers/manage-org-user-service/manage-org-user.service";
import { AddNewUserComponent } from "../add-new-user/add-new-user.component";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component( {
    selector: 'app-manage-organization-users',
    templateUrl: './manage-organization-users.html',
    styleUrls: ['./manage-organization-users.scss'],
    encapsulation: ViewEncapsulation.None
} )

export class ManageOrganizationUsers implements OnInit {
    @ViewChild( 'controllerSensorView' ) controllerSensorView: ElementRef;
    public orgUsersVo: any = this.paginationService.getDefaultPaginationVo();
    public orgAdminVo: any = this.paginationService.getDefaultPaginationVo();
    public orgSuperUsersVo: any = this.paginationService.getDefaultPaginationVo();
    public errorCount:number = 0;
    public loggedInUserData;
    public isSuperUserRole: boolean = false;
    isVisibleQuotes:boolean = false;
    public selectedAllUser;
    public userIdArr = [];
    public ownerOfQuotes;

    constructor( public sidebar: SidebarService, private paginationService: PaginationService,
        private userService: UserService, private toastService: ToastService,
        private commonService: CommonService, private manageOrgUserService: ManageOrgUserService,
        public activeModal: NgbActiveModal ) {

    }

    ngOnInit() {
        this.sidebar.show();
        if ( this.userService.getUser() && this.userService.getUser().organizationId ) {
            this.loggedInUserData = this.userService.getUser();
           // console.log("this.loggedInUserData.....", this.loggedInUserData);
            this.loadAdminsOfOrg( false );
            this.loadUsersOfOrg( false );
            this.loadSuperUsersOfOrg( false );
            if(this.loggedInUserData.role == 'SUPER_USER'){
                this.isSuperUserRole = true;
            }else{
                this.isSuperUserRole = false;
            }
        }
    }

    /*--------------------------------- START: Organization Admin Management -----------------------------------*/

    /**
     * This function will be used to clear search text and restore data for org admin & user
     * */
/*    clearSearch = (item, type) => {
        if(type=='user') {
            this.loadUsersOfOrg( false );
        } else {
            this.loadAdminsOfOrg( false );
        }
    }*/

    /**
     * This function will be called to load first time data of Admin list
     * */
    loadAdminsOfOrg( isSearch: boolean ) {
        if ( !isSearch ) {
            this.orgAdminVo = this.paginationService.getDefaultPaginationVo();
            this.orgAdminVo.url = AppSettings.GET_ORG_ADMINS;
            if ( this.loggedInUserData && this.loggedInUserData.organizationId ) {
                this.orgAdminVo.organization_id = this.loggedInUserData.organizationId;
                //console.log("organization_id...admin..", this.orgAdminVo.organization_id);
            }
        }

        this.orgAdminVo.isLoading = true;
        this.orgAdminVo.isLoadFailed = false;
        this.paginationService.getPaginationData( this.orgAdminVo, false ).subscribe(
            res => {
                this.orgAdminVo.isLoading = false;
                if ( res.status == "success" ) {
                    this.orgAdminVo.data = res.data['rows'] ? res.data['rows'] : [];
                    if ( this.orgAdminVo && this.orgAdminVo.data && ( this.orgAdminVo.data.length < res.data.count ) ) {
                        this.orgAdminVo.isLoadMore = true;
                    } else {
                        this.orgAdminVo.isLoadMore = false;
                        this.orgAdminVo.isEOL = true;
                    }

                    this.orgAdminVo.isLoadFailed = false;
                } else {
                    this.orgAdminVo.isLoadFailed = true;
                }
            },
            error => {
                // Failed to load users of organization
                this.orgAdminVo.isLoading = false;
                this.orgAdminVo.isLoadFailed = true;
                this.commonService.hideLoading();
              //  let errorResponse = error.json();
              let errorResponse = error;
                if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                    this.errorCount = this.errorCount+1;
                    if(this.errorCount==1) {
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    }
                } else {
                    if(errorResponse.error) {
                        this.toastService.popToast( "Error", errorResponse.error );
                    } else {
                        this.toastService.popToast( "error", errorResponse.message );
                    }
                }
            } );
    }

    /**
     * This function will be called on scroll of admin list to fetch more data
     * */
    loadMoreAdmins() {
        if ( this.orgAdminVo && this.orgAdminVo.isLoadMore ) {
            this.orgAdminVo.isLoading = true;
            this.orgAdminVo.pageNumber = this.orgAdminVo.pageNumber + 1;
            this.paginationService.getPaginationData( this.orgAdminVo, false ).subscribe(
                res => {
                    this.orgAdminVo.isLoading = false;
                    if ( res && res.data && res.data['rows'] ) {
                        this.orgAdminVo.data = this.orgAdminVo.data.concat( res.data['rows'] )
                    }
                    if ( this.orgAdminVo && this.orgAdminVo.data && ( this.orgAdminVo.data.length < res.data.count ) ) {
                        this.orgAdminVo.isLoadMore = true;
                    } else {
                        this.orgAdminVo.isLoadMore = false;
                        this.orgAdminVo.isEOL = true;
                    }
                },
                error => {
                    // Failed to load users of organization
                    this.orgAdminVo.pageNumber = this.orgAdminVo.pageNumber - 1;
                    this.orgAdminVo.isLoading = false;
                   // let errorResponse = error.json();
                    let errorResponse = error;
                    if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                        this.commonService.hideLoading();
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    }
                } );
        }
    }

    /**
     * This function will perform pagination search
     * */
    onOrgAdminSearch( searchValue: string ) {
        this.orgAdminVo.data = [];
        this.orgAdminVo.pageNumber = 0;
        this.orgAdminVo.isLoadMore = false;
        this.loadAdminsOfOrg( true );
    }

    /**
     * Function to add new organization admin
     **/
    addNewAdmin = () => {
        this.commonService.openComponentModal( AddNewAdminComponent, null, "Cancel", "Add", "customModal", ( data ) => {
            //Add New Admin success toast
            if ( data.status == 'success' ) {
                this.toastService.popToast( "success", data.message );
                this.loadAdminsOfOrg( false );
            }
        } );
    }

    /**
     * Function to edit organization admin
     **/
    editAdmin = ( adminData: any ) => {
        this.commonService.openComponentModal( AddNewAdminComponent, adminData, "Cancel", "Update", "customModal", ( data ) => {
            //Edit Admin success toast
            if ( data.status == 'success' ) {
                this.toastService.popToast( "success", data.message );
                this.loadAdminsOfOrg( false );
            }
        } );
    }

    /**
     * Function to delete organization admin
     **/
    deleteAdmin( adminVo: any ) {
        this.commonService.showConfirm( "", 'Are you sure, you want to delete this organization admin?', "Cancel", "Ok", () => {
            this.orgAdminVo.isLoading = true;
            this.manageOrgUserService.deleteUser( adminVo.Identity.id ).subscribe(
                res => {
                    this.orgAdminVo.isLoading = false;
                    if ( res.status == "success" ) {
                        //delete admin success toast
                        this.toastService.popToast( "success", res.message );
                        this.loadAdminsOfOrg( false );
                    }
                },
                error => {
                    this.orgAdminVo.isLoading = false;
                    this.commonService.hideLoading();
                //    let errorResponse = error.json();
                    let errorResponse = error;
                    if(errorResponse && errorResponse != undefined) {
                        if(errorResponse.statusCode==401) {
                            this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                                this.commonService.logout();
                            } );
                        } else {
                            this.toastService.popToast( "error", errorResponse.message );
                        }
                    }
                } );
        } );
    }
    /*--------------------------------- END: Organization Admin Management -------------------------------------*/

    loadSuperUsersOfOrg( isSearch: boolean ) {
        if ( !isSearch ) {
            this.orgSuperUsersVo = this.paginationService.getDefaultPaginationVo();
            this.orgSuperUsersVo.url = AppSettings.GET_ORG_SUPER_USERS;
            if ( this.loggedInUserData && this.loggedInUserData.organizationId ) {
                this.orgSuperUsersVo.organization_id = this.loggedInUserData.organizationId;
                //console.log("organization_id...admin..", this.orgAdminVo.organization_id);
            }
        }

        this.orgSuperUsersVo.isLoading = true;
        this.orgSuperUsersVo.isLoadFailed = false;
        this.paginationService.getPaginationData( this.orgSuperUsersVo, false ).subscribe(
            res => {
                this.orgSuperUsersVo.isLoading = false;
                if ( res.status == "success" ) {
                    this.orgSuperUsersVo.data = res.data['rows'] ? res.data['rows'] : [];
                    if ( this.orgSuperUsersVo && this.orgSuperUsersVo.data && ( this.orgSuperUsersVo.data.length < res.data.count ) ) {
                        this.orgSuperUsersVo.isLoadMore = true;
                    } else {
                        this.orgSuperUsersVo.isLoadMore = false;
                        this.orgSuperUsersVo.isEOL = true;
                    }

                    this.orgSuperUsersVo.isLoadFailed = false;
                } else {
                    this.orgSuperUsersVo.isLoadFailed = true;
                }
            },
            error => {
                // Failed to load users of organization
                this.orgSuperUsersVo.isLoading = false;
                this.orgSuperUsersVo.isLoadFailed = true;
                this.commonService.hideLoading();
              //  let errorResponse = error.json();
              let errorResponse = error;
                if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                    this.errorCount = this.errorCount+1;
                    if(this.errorCount==1) {
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    }
                } else {
                    if(errorResponse.error) {
                        this.toastService.popToast( "Error", errorResponse.error );
                    } else {
                        this.toastService.popToast( "error", errorResponse.message );
                    }
                }
            } );
    }

     /**
     * This function will be called on scroll of admin list to fetch more data
     * */
    loadMoreSuperUsers() {
        if ( this.orgSuperUsersVo && this.orgSuperUsersVo.isLoadMore ) {
            this.orgSuperUsersVo.isLoading = true;
            this.orgSuperUsersVo.pageNumber = this.orgSuperUsersVo.pageNumber + 1;
            this.paginationService.getPaginationData( this.orgSuperUsersVo, false ).subscribe(
                res => {
                    this.orgSuperUsersVo.isLoading = false;
                    if ( res && res.data && res.data['rows'] ) {
                        this.orgSuperUsersVo.data = this.orgSuperUsersVo.data.concat( res.data['rows'] )
                    }
                    if ( this.orgSuperUsersVo && this.orgSuperUsersVo.data && ( this.orgSuperUsersVo.data.length < res.data.count ) ) {
                        this.orgSuperUsersVo.isLoadMore = true;
                    } else {
                        this.orgSuperUsersVo.isLoadMore = false;
                        this.orgSuperUsersVo.isEOL = true;
                    }
                },
                error => {
                    // Failed to load users of organization
                    this.orgSuperUsersVo.pageNumber = this.orgSuperUsersVo.pageNumber - 1;
                    this.orgSuperUsersVo.isLoading = false;
                   // let errorResponse = error.json();
                    let errorResponse = error;
                    if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                        this.commonService.hideLoading();
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    }
                } );
        }
    }

    /**
     * This function will perform pagination search
     * */
    onOrgSuperUserSearch( searchValue: string ) {
        this.orgSuperUsersVo.data = [];
        this.orgSuperUsersVo.pageNumber = 0;
        this.orgSuperUsersVo.isLoadMore = false;
        this.loadSuperUsersOfOrg( true );
    }

    /**
     * Function to add new organization admin
     **/
    addNewSuperUser = () => {
        this.commonService.openComponentModal( AddNewSuperUserComponent, null, "Cancel", "Add", "customModal", ( data ) => {
            //Add New Admin success toast
            if ( data.status == 'success' ) {
                this.toastService.popToast( "success", data.message );
                this.loadSuperUsersOfOrg( false );
            }
        } );
    }

    /**
     * Function to edit organization admin
     **/
    editSuperUser = ( superUserData: any ) => {
        this.commonService.openComponentModal( AddNewSuperUserComponent, superUserData, "Cancel", "Update", "customModal", ( data ) => {
            //Edit Admin success toast
            if ( data.status == 'success' ) {
                this.toastService.popToast( "success", data.message );
                this.loadSuperUsersOfOrg( false );
            }
        } );
    }

    /**
     * Function to delete organization admin
     **/
    deleteSuperUser( superUserVo: any ) {
        this.commonService.showConfirm( "", 'Are you sure, you want to delete this organization super user?', "Cancel", "Ok", () => {
            this.orgSuperUsersVo.isLoading = true;
            this.manageOrgUserService.deleteUser( superUserVo.Identity.id ).subscribe(
                res => {
                    this.orgSuperUsersVo.isLoading = false;
                    if ( res.status == "success" ) {
                        //delete admin success toast
                        this.toastService.popToast( "success", res.message );
                        this.loadSuperUsersOfOrg( false );
                    }
                },
                error => {
                    this.orgSuperUsersVo.isLoading = false;
                    this.commonService.hideLoading();
                //    let errorResponse = error.json();
                    let errorResponse = error;
                    if(errorResponse && errorResponse != undefined) {
                        if(errorResponse.statusCode==401) {
                            this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                                this.commonService.logout();
                            } );
                        } else {
                            this.toastService.popToast( "error", errorResponse.message );
                        }
                    }
                } );
        } );
    }

    /*--------------------------------- START: Organization User Management ------------------------------------*/

    /**
     * This function will be called to load first time data of user list
     * */
    loadUsersOfOrg( isSearch: boolean ) {
        if ( !isSearch ) {
            this.orgUsersVo = this.paginationService.getDefaultPaginationVo();
            this.orgUsersVo.url = AppSettings.GET_ORG_USERS;
            if ( this.loggedInUserData && this.loggedInUserData.organizationId ) {
                this.orgUsersVo.organization_id = this.loggedInUserData.organizationId;
            }
        }
        this.orgUsersVo.isLoading = true;
        this.orgUsersVo.isLoadFailed = false;
        this.paginationService.getPaginationData( this.orgUsersVo, false ).subscribe(
            res => {
                this.orgUsersVo.isLoading = false;
                if ( res.status == "success" ) {
                    this.orgUsersVo.data = res.data['rows'] ? res.data['rows'] : [];
                    if ( this.orgUsersVo && this.orgUsersVo.data && ( this.orgUsersVo.data.length < res.data.count ) ) {
                        this.orgUsersVo.isLoadMore = true;
                    } else {
                        this.orgUsersVo.isLoadMore = false;
                        this.orgUsersVo.isEOL = true;
                    }
                    this.orgUsersVo.isLoadFailed = false;
                } else {
                    this.orgUsersVo.isLoadFailed = true;
                }
            },
            error => {
                // Failed to load users of organization
                this.orgUsersVo.isLoadFailed = true;
                this.orgUsersVo.isLoading = false;
                this.commonService.hideLoading();
               // let errorResponse = error.json();
               let errorResponse = error;
                if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                    this.errorCount = this.errorCount+1;
                    if(this.errorCount==1) {
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    }
                }
            } );
    }

    /**
     * This function will be called on scroll of user list to fetch more data
     * */
    loadMoreUsers() {
        if ( this.orgUsersVo && this.orgUsersVo.isLoadMore ) {
            this.orgUsersVo.isLoading = true;
            this.orgUsersVo.pageNumber = this.orgUsersVo.pageNumber + 1;
            this.paginationService.getPaginationData( this.orgUsersVo, false ).subscribe(
                res => {
                    this.orgUsersVo.isLoading = false;
                    if ( res && res.data && res.data['rows'] ) {
                        this.orgUsersVo.data = this.orgUsersVo.data.concat( res.data['rows'] )
                    }
                    if ( this.orgUsersVo && this.orgUsersVo.data && ( this.orgUsersVo.data.length < res.data.count ) ) {
                        this.orgUsersVo.isLoadMore = true;
                    } else {
                        this.orgUsersVo.isLoadMore = false;
                        this.orgUsersVo.isEOL = true;
                    }
                },
                error => {
                    // Failed to load users of organization
                    this.orgUsersVo.pageNumber = this.orgUsersVo.pageNumber - 1;
                    this.orgUsersVo.isLoading = false;
                  //  let errorResponse = error.json();
                  let errorResponse = error;
                    if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                        this.commonService.hideLoading();
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        } );
                    }
                } );
        }
    }

    /**
     * This function will perform pagination search
     * */
    onUserSearch( searchValue: string ) {
        this.orgUsersVo.data = [];
        this.orgUsersVo.pageNumber = 0;
        this.orgUsersVo.isLoadMore = false;
        this.loadUsersOfOrg( true );
    }

    /**
     * Function to add new user
     **/
    addNewUser = () => {
        this.commonService.openComponentModal( AddNewUserComponent, null, "Cancel", "Add", "customModal", ( data ) => {
            //Add New User success toast
            if ( data.status == 'success' ) {
                this.toastService.popToast( "success", data.message );
                //Refresh list after Add New User
                this.loadUsersOfOrg( false );
            }
        } );
    }    /**
     * Function to edit user
     **/
    editUser = ( userData: any ) => {
        this.commonService.openComponentModal( AddNewUserComponent, userData, "Cancel", "Update", "customModal", ( data ) => {
            //Edit User success toast
            if ( data.status == 'success' ) {
                this.toastService.popToast( "success", data.message );
                //Refresh list after Edit User
                this.loadUsersOfOrg( false );
            }
        } );
    }

    /**
     * Function to delete user
     **/
    deleteUser( userVo: any ) {
        this.commonService.showConfirm( "", 'Are you sure, you want to delete this organization user?', "Cancel", "Ok", () => {
            this.orgUsersVo.isLoading = true;
            this.manageOrgUserService.deleteUser( userVo.Identity.id ).subscribe(
                res => {
                    this.orgUsersVo.isLoading = false;
                    if ( res.status == "success" ) {
                        //delete user success toast
                        this.toastService.popToast( "success", res.message );
                        this.loadUsersOfOrg( false );
                    }
                },
                error => {
                    this.orgUsersVo.isLoading = false;
                   // let errorResponse = error.json();
                   let errorResponse = error;
                    if(errorResponse && errorResponse != undefined) {
                        if(errorResponse.statusCode==401) {
                            this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                                this.commonService.logout();
                            } );
                        } else {
                            this.toastService.popToast( "error", errorResponse.message );
                        }
                    }
                } );
        } );
    }
    /*--------------------------------- END: Organization User Management --------------------------------------*/

    setRoleWiseQuoteTypes(role){
        setTimeout(()=>{
            this.commonService.openComponentModal(SetRoleBasedQuoteTypeComponent, role, "Cancel", "Update", "customModal emailQuote", (res) => {
                if (res.status == 'success') {
                    this.toastService.popToast("success", res.message);
                } else {
                    this.toastService.popToast("Error", res.message);
                }
            });

         
        }, 1000);

    }


  

    /**
     * Function called on visible quote option click
     */
    visibleQuote(selectedUser, typeOfUser){
        this.ownerOfQuotes = selectedUser;
        if(typeOfUser == 'superUser'){
            this.ownerOfQuotes.isSuperUser = true;
            this.ownerOfQuotes.isSelected = true;
        }
        this.isVisibleQuotes = true;
        this.userIdArr = [];
        this.orgUsersVo.data.forEach(function(element) {
            element.isDisabled = false;
            element.isSelected = false;
        });
        this.ownerOfQuotes.isDisabled = true;
        this.getVisibleQuotesOfUser();
    }

    cancel(){
        this.isVisibleQuotes = false;
    }

  /**
   * Function select item through checkbox
   **/
   selectAll() {
        this.userIdArr = [];
        this.selectedAllUser = !this.selectedAllUser;
        if(this.selectedAllUser){
            for (var i = 0; i < this.orgUsersVo.data.length; i++) {
                this.orgUsersVo.data[i].isSelected = true;
                this.userIdArr.push(this.orgUsersVo.data[i].Identity.id);
            }
        }else{
            for (var i = 0; i < this.orgUsersVo.data.length; i++) {
                this.orgUsersVo.data[i].isSelected = false;
                let index = this.orgUsersVo.data.indexOf( this.orgUsersVo.data[i] );
                this.userIdArr.splice(index,1);
            }
        }
    }

   /**
    * Function select item through checkbox
    **/
    selectUser( selectedUser ){
        selectedUser.isSelected = !selectedUser.isSelected;
        if(this.selectedAllUser){
            if( this.userIdArr.length > 0 && this.userIdArr ){
                for(let j = 0; j < this.userIdArr.length; j++){
                    if(this.userIdArr[j] == selectedUser.Identity.id){
                        let index = this.userIdArr.indexOf( this.userIdArr[j] );
                        this.userIdArr.splice(index,1);
                    }
                }
                this.selectedAllUser = false;
            }
        }else{
            if( selectedUser.isSelected ){
                this.userIdArr.push(selectedUser.Identity.id);
            }else{
                for(let m = 0; m < this.userIdArr.length; m++){
                    if(this.userIdArr[m] == selectedUser.Identity.id){
                        let index = this.userIdArr.indexOf( this.userIdArr[m] );
                        this.userIdArr.splice(index,1);
                    }
                }
            }
        }
    }

    /**
     * Function to save/update visible quotes
     */
    updateVisibleQuote(){
        var salesRepArr = [];
        if(this.ownerOfQuotes.isSuperUser){
            salesRepArr.push(this.ownerOfQuotes.Identity.id);
        }
        this.userIdArr.forEach(function(element) {
            salesRepArr.push(element);
        });

        let payload = {
            "organization_id": this.loggedInUserData.organizationId,
            "identity_id": this.ownerOfQuotes.Identity.id,
            "sales_representative_id": salesRepArr
        }

        this.manageOrgUserService.updateVisibleQuotes( payload ).subscribe(
            res => {
                if ( res.status == "success" ) {
                    this.toastService.popToast( "success", res.message );
                    this.isVisibleQuotes = false;
                }
            },
            error => {
                // let errorResponse = error.json();
                let errorResponse = error;
                if(errorResponse && errorResponse != undefined) {
                    if(errorResponse.statusCode==401) {
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            //this.commonService.logout();
                        } );
                    } else {
                        this.toastService.popToast( "error", errorResponse.message );
                    }
                }
            } );
    }

    /**
     * Function to get previously saved quotation
     */
    getVisibleQuotesOfUser(){
        this.manageOrgUserService.getVisibleQuotes(this.ownerOfQuotes.Identity.id).subscribe(
            res => {
                if ( res.status == "success" ) {
                    this.toastService.popToast( "success", res.message );
                    this.userIdArr = [];
                    var self = this;
                    this.orgUsersVo.data.forEach(function(element) {
                        if( self.ownerOfQuotes.Identity.id != element.Identity.id ){
                            element.isSelected = false;
                        }else{
                            if( self.userIdArr && self.userIdArr.length == 0){
                                self.ownerOfQuotes.isSelected = true;
                                self.userIdArr.push(self.ownerOfQuotes.Identity.id)
                            }
                        }
                    });
                
                    for (var i = 0; i < res.data.length; i++) {
                        for (var j = 0; j < this.orgUsersVo.data.length; j++) {
                            if(res.data[i].id == this.orgUsersVo.data[j].Identity.id){
                                if( res.data[i].id != this.ownerOfQuotes.Identity.id ){
                                    this.orgUsersVo.data[j].isSelected = true;
                                    this.userIdArr.push(this.orgUsersVo.data[j].Identity.id);
                                }
                            }
                        }
                    }
                }
            },
            error => {
                // let errorResponse = error.json();
                let errorResponse = error;
                if(errorResponse && errorResponse != undefined) {
                    if(errorResponse.statusCode==401) {
                        this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            //this.commonService.logout();
                        } );
                    } else {
                        this.toastService.popToast( "error", errorResponse.message );
                    }
                }
            } );
    }
}



