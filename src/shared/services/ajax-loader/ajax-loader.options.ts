/*
*  Copyright 2018-19, MapleLabs, All Rights Reserved.
*/


export class AjaxLoaderOptions {
    inline = false;
    hideOnProgress = false;
    hideOnError = false;
    hideOnSuccess = true;
    hideOnCanceled = true;
    progressText = 'Please wait, request is in progress... ';
    successText = 'API Call is processed... ';
    errorText = 'Unknown Error in API call... ';
    classNames = '';
}
