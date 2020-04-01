import { Injectable } from '@angular/core';
import * as aws from 'aws-sdk';
import AWS = require('aws-sdk');
import {Constants} from '../app-settings-service/app-constant.service';
import { AppSettings } from '../app-settings-service/app-settings.service';
import { LocalStorageService } from '../../providers/local-storage-service/local-storage.service';
import { UserService } from '../../providers/user-service/user.service';
import { CommonService } from '../../providers/common-service/common.service';

@Injectable()
export class UploadAwsService {
    s3: any;
    inProcess: boolean;
    private bucket;
    public cognitoCredentials: any;
    public amazonCognitoId;
    public amazonCognitoToken;
    public bucketName;
    public regionName;
    public IdentityPoolKey;
    
    constructor(private commonService: CommonService, 
            public locstr: LocalStorageService,  private userService: UserService) {
      
    }
    
    /**
     * function to initialize AWS
     **/
    initializeAWS() {
        if(Constants.CURRENT_ENVIRONMENT == 'production') {
            this.bucketName = 'h2panelbuilder';
            this.regionName = 'us-east-1';
            this.IdentityPoolKey = 'us-east-1:1eb056dd-5e59-4412-bd55-ff68cb14b9af';
        } else if (Constants.CURRENT_ENVIRONMENT == 'uat') {
            this.bucketName = 'configuratoruat';
            this.regionName = 'us-east-1';
            this.IdentityPoolKey = 'us-east-1:d3cbccc0-b9d6-40cf-839c-fff887d2afd3';
        } else {
           // console.log("qa environment running")
            this.bucketName = 'configuratortestenv';
            this.regionName = 'us-east-1';
            this.IdentityPoolKey = 'us-east-1:d3cbccc0-b9d6-40cf-839c-fff887d2afd3';
        }
        this.bucket = new aws.S3({params: {Bucket: this.bucketName} });  
    }
  
    
    /**
     * function to upload image through cognito
     **/
   public uploadFileAWSCognito(file: any, referenceId : any, callBack: any){  
       
      //get cognito credentials 
      this.userService.getCognitoId().subscribe(
              res => {
                  this.cognitoCredentials = res.data;
                  this.amazonCognitoId = this.cognitoCredentials.IdentityId;  
                  this.amazonCognitoToken = this.cognitoCredentials.Token;
                  
                  //upload image to cognito
                  return new Promise((resolve, reject) => {
                      aws.config.update({ 
                        region: this.regionName,
                        credentials: new aws.CognitoIdentityCredentials({
                           IdentityPoolId: this.IdentityPoolKey,
                           IdentityId : this.amazonCognitoId,  
                           Logins: {
                              'cognito-identity.amazonaws.com': this.amazonCognitoToken
                           }  
                                       
                        })
                      });
                      
                      let keyString;
                      if(referenceId.type && referenceId.type=='Panel') {
                          keyString = 'panel/' + referenceId.image + '.jpeg';
                      } else {
                          keyString = 'profile/user/'+referenceId +'.jpeg?' + new Date().getTime();
                      } 
                      
                      this.s3 = new AWS.S3({ apiVersion: '2006-03-01', params: { Bucket: this.bucketName } });
                      this.s3.upload({
                          Key: keyString,
                          Body: file,
                          StorageClass: 'STANDARD',
                          ACL: 'public-read'
                      }, (err: any, data: any) => {
                          if (err) {
                              //console.log('err', err);
                              //return;
                              reject({ errorMSG: 'errorm message' });
                          }
                          
                          //return uploaded image data
                          callBack(data);
                      });
                   
                  });
              },
              error => {
                  this.commonService.hideLoading();
                 // console.log(error);
              });
     
    }
}