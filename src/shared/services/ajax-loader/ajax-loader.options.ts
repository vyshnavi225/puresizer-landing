export class AjaxLoaderOptions {
    inline: boolean = false;
    hideOnProgress: boolean = false;
    hideOnError: boolean = false;
    hideOnSuccess: boolean = true;
    hideOnCanceled: boolean = true;
    progressText: string = 'Please wait, request is in progress... ';
    successText: string = 'API Call is processed... ';
    errorText: string = 'Unknown Error in API call... ';
    classNames: string = '';
}
