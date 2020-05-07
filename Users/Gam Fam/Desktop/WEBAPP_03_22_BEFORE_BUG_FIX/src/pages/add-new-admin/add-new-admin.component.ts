import { Component, OnInit, Input, Output, ViewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

import { ManageOrgUserService } from '../../providers/manage-org-user-service/manage-org-user.service';
import { CommonService } from '../../providers/common-service/common.service';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { UploadAwsService } from '../../providers/uploadAwsService/uploadAwsService';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';
import { UserService } from '../../providers/user-service/user.service';
import { ToastService } from '../../providers/common-service/toaster-service';



type roleObj = {value: string, display: string};

@Component( {
    selector: 'app-add-new-admin',
    templateUrl: './add-new-admin.component.html',
    styleUrls: ['./add-new-admin.component.scss']
} )
export class AddNewAdminComponent implements OnInit {

    @Input() selectedObj;
    @Input() message;
    @Output() okCall;
    @Output() callBack;

    //image cropper code
    @ViewChild( 'cropper', undefined )
    cropper: ImageCropperComponent;

    //used to show image crop view
    public isProfileBrowse: boolean;
    //used for image crop
    public isfileOpen: boolean;
    public croppedImg: any;
    public quotationType:any;
    public isQuoteSelected:boolean;

    public formSubmitted: boolean;
    isLoadFailed: boolean = false;
    isLoading: boolean = false;
    public webServiceError;
    public adminVo: any;
    public countryCodesList;
    isEditMode: boolean = false;
    organization_id;
    roleQuotationType: any;
    public roleChanges: roleObj[] = [
        {value : '4', display : 'SUPERUSER'},
        {value : '1', display : 'USER'},
         ];

    public newAdminVo = {
        name: "",
        email: "",
        role: "",
        contactNo: "",
        countryCode: "",
        organization_id: "",
        profileImageUrl: "",
        can_only_view_quote: false,
        user_id: '',
        identity_id: '',
        QuotationTypes: []
    }

    constructor( public activeModal: NgbActiveModal, private modalService: NgbModal,
        private commonService: CommonService, private manageOrgUserService: ManageOrgUserService,
        public constants: Constants, private locstr: LocalStorageService,
        private cropperSettings: CropperSettings, private toastService: ToastService,
        public uploadAwsService: UploadAwsService, private userService: UserService ) {
        //image cropper code
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.croppedImg = {};
    }

    ngOnInit() {
        this.isProfileBrowse = false;
        this.isfileOpen = false;
        this.formSubmitted = false;
        
        //country codes array for dropdown selection
        this.countryCodesList = [
            { code: '+1' },
            { code: '+91' },
            { code: '+52' },
            { code: '+49' }
        ];
        
        if ( this.userService.getUser() && this.userService.getUser().organizationId ) {
            this.organization_id = this.userService.getUser().organizationId;
        } else {
            this.organization_id = 1;
        }
        this.adminVo = this.selectedObj;
        this.getQuotationTypeByOrganization(this.organization_id);

        if ( this.adminVo && this.adminVo.id ) {
            this.newAdminVo = {
                name: this.adminVo.name,
                email: this.adminVo.email,
                role: this.adminVo.Identity.role_id,
                contactNo: this.adminVo.contactNo,
                countryCode: this.adminVo.countryCode,
                organization_id: this.organization_id,
                profileImageUrl: this.adminVo.profileImageUrl ? this.adminVo.profileImageUrl : "https://configuratortestenv.s3.amazonaws.com/profile/user/234.jpeg%3F1521172188270",
                can_only_view_quote: false,
                user_id: this.adminVo.id,
                identity_id: this.adminVo.Identity.id,
                QuotationTypes:  this.newAdminVo.QuotationTypes 
            };
            this.isEditMode = true;
        } else {
            this.getRoleBasedQuoteTypes();
            this.newAdminVo = {
                name: "",
                email: "",
                role: "ORG_ADMIN",
                contactNo: "",
                countryCode: this.countryCodesList[0].code,
                organization_id: this.organization_id,
                profileImageUrl: "https://configuratortestenv.s3.amazonaws.com/profile/user/234.jpeg%3F1521172188270",
                can_only_view_quote: false,
                user_id: '',
                identity_id: '',
                QuotationTypes: []
            };
        }

    }

    cancel() {
        this.activeModal.dismiss( 'Cross click' );
    }

    ok(callBack) {
        var amodel = this.activeModal;
        this.activeModal.close( 'Close click' );
        this.okCall(callBack);
    }


    onRoleChange(selectedValue) {
        const foundRole = this.roleChanges.find(roleChange => roleChange.value === selectedValue);
        
        if(foundRole) {
          console.log(foundRole)
            const selectedRole = { value: foundRole.value, display: foundRole.value, readonly: true }
            // this.newUserVo.role.to.splice(0, 1, selectedRole);
            this.newAdminVo.role = foundRole.value;
        }
      
      }

    /**
     * Function for Save Edit Admin
     * */
    saveUser( form: NgForm ) {
        this.formSubmitted = true;
        if (this.newAdminVo.QuotationTypes.length) {
            this.isQuoteSelected = true;
        }else{
            this.isQuoteSelected = false;
        }
        if ( form.valid ) {
            if (this.isQuoteSelected){
                this.isLoading = true;
                this.isLoadFailed = false;
                this.newAdminVo.contactNo = this.newAdminVo.contactNo.toString();
                if ( this.adminVo && this.adminVo.id ) {
                    this.manageOrgUserService.updateUser( this.newAdminVo ).subscribe(
                        res => {
                            this.isLoading = false;
                            this.ok(res);
                            this.formSubmitted = false;                    
                        },
                        error => {
                            this.isLoading = false;                        
                            // let errorResponse = error.json();                
                            // if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                            //     this.activeModal.close( 'Close click' );
                            //     this.commonService.hideLoading();
                            //     this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            //         this.commonService.logout();
                            //     } );
                            // } else {
                            // // Error message for back-end If data not matched                  
                            //     if ( error && error != undefined ) {
                            //         if(error._body) {
                            //             let errorMsg = JSON.parse( error._body );
                            //             this.webServiceError = errorMsg.message;
                            //         } else {
                            //             this.webServiceError = error.message;
                            //         }                                    
                            //     } else {
                            //         this.webServiceError = 'User update failed. Please try again.'
                            //     }
                            // }
                            
                        // Error message for back-end If data not matched                  
                        if ( error && error != undefined ) {
                            if(error._body) {
                                let errorMsg = JSON.parse( error._body );
                                this.webServiceError = errorMsg.message;
                            } else {
                                this.webServiceError = error.message;
                            }
                        } else {
                            this.webServiceError = 'User update failed. Please try again.'
                        }
                            
                        } );

                } else {
                    this.manageOrgUserService.createUser( this.newAdminVo ).subscribe(
                        res => {
                            this.isLoading = false;
                            this.ok(res);
                            this.formSubmitted = false;
                        },
                        error => {
                             this.isLoading = false;                        
                            // let errorResponse = error.json();                
                            // if(errorResponse && errorResponse != undefined && errorResponse.statusCode==401) {
                            //     this.activeModal.close( 'Close click' );
                            //     this.commonService.hideLoading();
                            //     this.commonService.showAlert( "Error", errorResponse.error, "OK", () => {
                            //         this.commonService.logout();
                            //     } );
                            // } else {
                            // // Error message for back-end If data not matched                  
                            //     if ( error && error != undefined ) {
                            //         if(error._body) {
                            //             let errorMsg = JSON.parse( error._body );
                            //             this.webServiceError = errorMsg.message;
                            //         } else {
                            //             this.webServiceError = error.message;
                            //         }
                            //     } else {
                            //         this.webServiceError = 'User add failed. Please try again.'
                            //     }
                            // }
                            
                        // Error message for back-end If data not matched                  
                        if ( error && error != undefined ) {
                            if(error._body) {
                                let errorMsg = JSON.parse( error._body );
                                this.webServiceError = errorMsg.message;
                            } else {
                                this.webServiceError = error.message;
                            }
                        } else {
                            this.webServiceError = 'User add failed. Please try again.'
                        }
                            
                            
                        }
                    );
                }

            }
        }
    }

    /**
     * Function to get cropped image view
     */
    protected getCroppedImg = () => {
        /**If user selected image 
         *without click on cancel button he/she again clicked on upload image then 
         *we set cropper obj as a new obj
         **/
        this.isfileOpen = false;
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.croppedImg = {};
        
      //on edit, profile image click opened image-crop-modal 
        this.isProfileBrowse = true;
    }

    /**
     * Function to upload image to cognito
     */
    uploadToCognito() {
        this.croppedImg = this.locstr.getObj( 'croppedImage' );

        //convert cropped base64 image to image
        var base64Blob = this.dataURItoBlob( this.croppedImg );

        //upload image to aws cognito
        if ( this.croppedImg ) {
            this.uploadAwsService.uploadFileAWSCognito( base64Blob, this.newAdminVo.user_id, ( data ) => {
                // get aws uploaded image path assign it to editable field
                this.newAdminVo.profileImageUrl = data.Location;
                this.isLoading = false;
            } );
        }
    }

    /**
     * Function to convert base64 image 
     * */
    dataURItoBlob = ( dataURI ) => {
        var binary = atob( dataURI.split( ',' )[1] );
        var array = [];
        for ( var i = 0; i < binary.length; i++ ) {
            array.push( binary.charCodeAt( i ) );
        }
        return new Blob( [new Uint8Array( array )], { type: 'image/jpeg' } );
    }

    /**
     * Function to browse image 
     **/
    fileChangeListener( $event ) {
        var image: any = new Image();
        var file: File = $event.target.files[0];
        var myReader: FileReader = new FileReader();
        var that = this;
        this.isfileOpen = true;
        myReader.onloadend = function( loadEvent: any ) {
            image.src = loadEvent.target.result;
            that.cropper.setImage( image );
        };
        myReader.readAsDataURL( file );
    }

    /**
     * Function called on image crop view ok button 
     **/
    OkImgCrop( file: any ) {
        this.isProfileBrowse = false;
        this.locstr.setObj( 'croppedImage', file );
        this.isLoading = true;
        this.uploadToCognito();
    }

    /**
     * Function  called on image crop view cancel button 
     **/
    cancelImgCrop() {
        this.isProfileBrowse = false;
    }


        /*
     * Function to get quotation types
     */
    getQuotationTypeByOrganization(organization_id:any){
        this.isLoading = true;
        this.manageOrgUserService.getQuotationTypeByOrganization(organization_id).subscribe(
            res => {
                this.isLoading = false;
                      if ( res.status == "success" ) {
                          this.quotationType = res.data;
                          // Add no price listed option
                          const foundItem = this.quotationType.find(quotation => quotation.type == 'q6');
                          if(!foundItem) {
                            this.quotationType.push({ name: "No Price Listed", type: "q6", id: 6, deleted_at: null, created_at: null, updated_at: null });
                          }
        
                    this.setQuoteCheckedInEditMode();
                      }
                  },
        error => {
            this.isLoading = false;
            // Error message for back-end If data not matched                  
            if ( error && error != undefined ) {                
                if(error._body) {
                    let errorMsg = JSON.parse( error._body );
                    this.webServiceError = errorMsg.message;
                } else {
                    this.webServiceError = error.message;
                }
            } else {
                this.webServiceError = 'get quotation type failed. Please try again.'
            }
        } );
    }

    /**
     * set checked quote type in edit mode
     */
    public setQuoteCheckedInEditMode() {
        if(this.quotationType && this.adminVo && this.adminVo.Identity && this.adminVo.Identity.QuotationTypes && this.adminVo.Identity.QuotationTypes.length > 0){
            this.quotationType.forEach((e1)=>this.adminVo.Identity.QuotationTypes.forEach((e2)=> {
                if(e1.id === e2.id){
                    e1.isChecked = true;
                    this.newAdminVo.QuotationTypes.push(e1);
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
        if (qtype.isChecked) {
            this.newAdminVo.QuotationTypes.push(qtype);
        } else {
            if ( this.newAdminVo.QuotationTypes &&  this.newAdminVo.QuotationTypes.length > 0) {
              for(let i=0; i< this.newAdminVo.QuotationTypes.length ; i++){
                if (this.newAdminVo.QuotationTypes[i].id == qtype.id) {
                    let index = this.newAdminVo.QuotationTypes.indexOf( this.newAdminVo.QuotationTypes[i] );
                    this.newAdminVo.QuotationTypes.splice(index,1);
                }               
              }  
            } 
        }
    }

  /**
   * Function to get selected quote types against role
   **/
  public getRoleBasedQuoteTypes(){
    this.manageOrgUserService.getQuotationTypeByRole(this.organization_id, 'ORG_ADMIN').subscribe(
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
                        this.commonService.logout();
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
    public setQuoteChecked() {
        if(this.quotationType && this.quotationType.length > 0 && this.roleQuotationType && this.roleQuotationType.length > 0){
            this.quotationType.forEach((e1)=>this.roleQuotationType.forEach((e2)=> {
                if(e1.id === e2.id){
                    e1.isChecked = true;
                    this.newAdminVo.QuotationTypes.push(e1);
                }
            }
         ));
        }    
    }

    identify(index, item){
        return item.name; 
     }
}

