import { Component, OnInit, Input, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SidebarService } from '../../providers/sidebar.service';
import { CommonService } from '../../providers/common-service/common.service';
import { UserService } from '../../providers/user-service/user.service';
import { Broadcaster } from '../../providers/broadcast-service/broadcast.service';
import { Router } from '@angular/router';
import { Constants } from '../../providers/app-settings-service/app-constant.service';
import { UploadAwsService } from '../../providers/uploadAwsService/uploadAwsService';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { ToastService } from '../../providers/common-service/toaster-service';

@Component({
    selector: 'app-my-profile',
    templateUrl: './my-profile.component.html',
    styleUrls: ['./my-profile.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MyProfileComponent implements OnInit {

    public profileData;
    public profileEditData;
    public editProfileFlag: boolean = false;
    public webServiceError;
    public countryCodes;
    public selectedCity;
    public phoneNumberData;
    public userData;
    public data: any;

    constructor(public constants: Constants, public uploadAwsService: UploadAwsService, public locstr: LocalStorageService, private commonService: CommonService, private router: Router, private broadcaster: Broadcaster, private userService: UserService, public sidebar: SidebarService, private toastService: ToastService) {

    }

    ngOnInit() {

        /* Following local storage used to maintain previuos data for view quote page 
            It will clear data once user redirect to this page
        */
        this.locstr.setObj('viweQuote', false);
        this.locstr.setObj('viweQuoteFilterData', {});

        this.sidebar.show();
        this.selectedCity = "+1";
        this.editProfileFlag = false;

        //get data of user
        this.userData = this.userService.getUser();

        //if profile image is null then assign default image
        if (this.userData && !this.userData.profileImageUrl) {
            this.userData.profileImageUrl = "https://configuratortestenv.s3.amazonaws.com/profile/user/34.jpeg%3F1537784892364";
        }

        //country codes array for dropdown selection
        this.countryCodes = [
            { code: '+1' },
            { code: '+91' },
            { code: '+52' },
            { code: '+49' }
        ];

        //binded userdata to edit profile data
        this.profileEditData = {
            name: this.userData.name,
            countryCode: this.userData.countryCode,
            contactNo: this.userData.contactNo,
            profileImageUrl: this.userData.profileImageUrl
        };

        if (this.profileEditData.contactNo) {
            let contactPhoneInfo = this.profileEditData.contactNo.split('(').join("").split(')').join("").replace(/\s/g, '');
            let phone = contactPhoneInfo;
            let firstPart = phone.slice(0, 3);
            let secondPart = phone.slice(3, 6);
            let lastPart = phone.slice(-phone.length + 6);
            this.phoneNumberData = "(" + firstPart + ")" + " " + secondPart + " " + lastPart;
        } else {
            this.phoneNumberData = "";
        }

        //binded user data to profile data
        this.profileData = {
            name: this.userData.name,
            email: this.userData.email,
            contactNo: this.phoneNumberData,
            countryCode: this.userData.countryCode,
            organizationName: this.userData.organizationName,
            profileImageUrl: this.userData.profileImageUrl,
            userId: this.userData.id
        };
    }

    /**
     * Function for Edit Profile
     * */
    editProfile() {
        this.editProfileFlag = true;
        let contactNoData = "";
        if (this.userData.contactNo) {
            contactNoData = this.userData.contactNo.split('(').join("").split(')').join("").replace(/\s/g, '');
        }
        this.profileEditData = {
            name: this.userData.name,
            countryCode: this.userData.countryCode,
            contactNo: contactNoData,
            profileImageUrl: this.userData.profileImageUrl
        };
    }

    /**
     * Function for Save Edit Profile
     * */
    save(form: NgForm) {
        if (form.valid) {
            this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);
            this.profileEditData.contactNo = '' + this.profileEditData.contactNo;
            //update profile service call
            this.userService.updateProfile(this.profileEditData).subscribe(
                res => {
                    this.profileData = res.data;
                    let phone = this.profileData.contactNo;
                    //console.log('FUNNYERROR####----------',res.data)

                    //phone number separated
                    let firstPart = phone.slice(0, 3);
                    let secondPart = phone.slice(3, 6);
                    let lastPart = phone.slice(-phone.length + 6);
                    this.profileData.contactNo = "(" + firstPart + ")" + " " + secondPart + " " + lastPart;
                    this.commonService.hideLoading();
                    this.editProfileFlag = true;

                    // after success response saved updated data to user data
                    this.userService.setUser(this.profileData);

                    //brodcasted updated data on header
                    this.broadcaster.broadcast('PROFILE_UPDATED', this.profileData);
                    //console.log('FUNNYERROR2####----------',this.profileData)
                    this.editProfileFlag = false;
                    //get update data on my profile screen
                    this.userData = this.userService.getIsUserLoggedIn();
                   // console.log('FUNNYERROR2####----------',this.userData)

                },
                error => {
                    this.commonService.hideLoading();
                    let errorResponse;
                    if (error.message == this.constants.ERROR_NETWORK_UNAVAILABLE) {
                        errorResponse = error;
                    } else {
                        errorResponse = error.json();
                    }
                    if (errorResponse && errorResponse != undefined && errorResponse.statusCode == 401) {
                        this.commonService.hideLoading();
                        this.commonService.showAlert("Error", errorResponse.error, "OK", () => {
                            this.commonService.logout();
                        });
                    } else {
                        // Error message for back-end If data not matched                  
                        if (error && error != undefined) {
                            this.webServiceError = error.message;
                            this.toastService.popToast("error", this.webServiceError);
                        }
                    }
                }
            );
        } else {
           // console.log("form not submitted");
        }
    }

    /**
     * Function for Cancel Edit Profile
     * */
    cancel() {
        this.editProfileFlag = false;

        var clearPhoneValue = (this.profileData.contactNo).replace(/\s/g, '').split('(').join("").split(')').join("");
        this.profileEditData = {
            name: this.profileData.userName,
            email: this.profileData.email,
            countryCode: this.profileData.countryCode,
            contactNo: clearPhoneValue,
            organizationName: this.profileData.organizationName
        };
    }

    /**
     * Function to upload a file on AWS
     * @param: files
     */
    protected getCroppedImg = () => {
        //on edit profile image click opened image-crop-modal 
        this.commonService.profileImageCrop("OK", (data) => {
            //get cropped image from local storage
            this.data = this.locstr.getObj('croppedImage');
            this.commonService.showLoading(this.constants.PLEASE_WAIT_TEXT);

            if (this.data) {
                //convert cropped base64 image to image
                var base64Blob = this.dataURItoBlob(this.data);
                //upload image to aws
                this.uploadAwsService.uploadFileAWSCognito(base64Blob, this.userData.id, (data) => {
                    // get cognito uploaded image path assign it to editable field
                    this.profileEditData.profileImageUrl = data.Location;
                    this.commonService.hideLoading();
                });
            }
        });
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

}

