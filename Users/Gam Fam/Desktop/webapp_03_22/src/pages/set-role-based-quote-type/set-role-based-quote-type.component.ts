import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

/*-------------------------------- Providers ---------------------------------*/
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { UserService } from "../../providers/user-service/user.service";
import { CommonService } from '../../providers/common-service/common.service';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { ToastService } from '../../providers/common-service/toaster-service';
import { ManageOrgUserService } from '../../providers/manage-org-user-service/manage-org-user.service';

@Component({
  selector: 'app-set-role-based-quote-type',
  templateUrl: './set-role-based-quote-type.component.html',
  styleUrls: ['./set-role-based-quote-type.component.scss']
})
export class SetRoleBasedQuoteTypeComponent implements OnInit {
  @Input() selectedObj;
  @Output() okCall;
  @Output() callBack;

  isLoadFailed: boolean = false;
  isLoading: boolean = false;
  public loggedinUserData: any;
  public quotationType: any;
  public orgQuotationType: any;
  public roleQuotationType: any;
  public selectedQuotationTypes = [];

  constructor( public activeModal: NgbActiveModal, private modalService: NgbModal,
    private locstr: LocalStorageService,
       private userService: UserService, private toastService: ToastService,
       private commonService: CommonService, private broadcaster: Broadcaster,
       public constants: Constants, private manageOrgUserService: ManageOrgUserService ) {
        this.loggedinUserData = this.userService.getUser();
        this.getQuoteTypeByOrganization();
  }
  ngOnInit() {

  }
  
  cancel() {
      this.activeModal.dismiss( 'Cross click' );
  }

  ok( callBack ) {
      var amodel = this.activeModal;
      this.activeModal.close( 'Close click' );
     // this.okCall( callBack );
  }

  /**
   * Function to copy saved quote
   **/
  public getQuoteTypeByOrganization(){
      this.manageOrgUserService.getQuotationTypeByOrganization(this.loggedinUserData.organizationId).subscribe(
          res => {
              if ( res.status == "success" ) {
                  this.quotationType = res.data;
                  // Add no price listed option
                  const foundItem = this.quotationType.find(quotation => quotation.type == 'q6');
                  if(!foundItem) {
                   
                    this.quotationType.push({ name: "No Price Listed", type: "q6", id: 6, deleted_at: null, created_at: null, updated_at: null });
                  }
                  
                  this.getRoleBasedQuoteTypes(); 
              }
          },
          error => {
              this.commonService.hideLoading();
            //  let errorResponse = error.json();                
              if(error && error != undefined) {                        
                  if(error.statusCode==401) {
                      this.commonService.showAlert( "Error", error.error, "OK", () => {
                         // this.commonService.logout();
                      } );
                  } else {
                      this.toastService.popToast( "error", error.message );
                  }
              }
      } );
  }

  /**
   * Function to get selected quote types against role
   **/
  public getRoleBasedQuoteTypes(){
    this.selectedQuotationTypes = [];
    this.manageOrgUserService.getQuotationTypeByRole(this.loggedinUserData.organizationId, this.selectedObj).subscribe(
        res => {
            if ( res.status == "success" ) {
                this.roleQuotationType = res.data;
                this.setQuoteCheckedInEditMode();
            }
        },
        error => {
            this.commonService.hideLoading();
          //  let errorResponse = error.json();                
            if(error && error != undefined) {                        
                if(error.statusCode==401) {
                    this.commonService.showAlert( "Error", error.error, "OK", () => {
                       // this.commonService.logout();
                    } );
                } else {
                    this.toastService.popToast( "error", error.message );
                }
            }
        } );
    }

  /**
   * Function to set selected quote types against role
   **/
    public setQuotationTypes(){
        let payload = {
            "role": this.selectedObj,
	        "organization_id": this.loggedinUserData.organizationId,
	        "QuotationTypes": this.selectedQuotationTypes
        }
        this.manageOrgUserService.setQuotationTypeByOrgRole(payload).subscribe(
            res => {
                if ( res.status == "success" ) {
                    this.quotationType = res.data;
                    // Add no price listed option
                    const foundItem = this.quotationType.find(quotation => quotation.type == 'q6');
                    if(!foundItem) {
                        this.quotationType.push({ name: "No Price Listed", type: "q6", id: 6, deleted_at: null, created_at: null, updated_at: null });
                    }
                    
                    this.toastService.popToast( "success", res.message );
                    this.activeModal.close();
                }
            },
        
            error => {
                this.commonService.hideLoading();
              //  let errorResponse = error.json();                
                if(error && error != undefined) {                        
                    if(error.statusCode== 401) {
                        this.commonService.showAlert( "Error", error.error, "OK", () => {
                           // this.commonService.logout();
                        } );
                    } else {
                        this.toastService.popToast( "error", error.message );
                    }
                }
            } );
    }

    /**
     * set checked quote type 
     */
    public setQuoteCheckedInEditMode() {
        if(this.quotationType && this.quotationType.length > 0 && this.roleQuotationType && this.roleQuotationType.length > 0){
            this.quotationType.forEach((e1)=>this.roleQuotationType.forEach((e2)=> {
                if(e1.id === e2.id){
                    e1.isChecked = true;
                    this.selectedQuotationTypes.push(e1);
                }
            }
         ));
        }    
    }

    /**
     * set checked quote type
     */
    public selectPanelItem(qtype:any){
        qtype.isChecked = !qtype.isChecked;
         if ( qtype.isChecked  ) {
            this.selectedQuotationTypes.push(qtype);
        }else{
            if ( this.selectedQuotationTypes &&  this.selectedQuotationTypes.length > 0) {
                for(let i=0; i< this.selectedQuotationTypes.length ; i++){
                  if (this.selectedQuotationTypes[i].id == qtype.id) {
                      let index = this.selectedQuotationTypes.indexOf( this.selectedQuotationTypes[i] );
                      this.selectedQuotationTypes.splice(index,1);
                  }               
                }  
            } 
        }
    }

}



