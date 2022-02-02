import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActiveAjaxLoadersService, XHR_REQUEST_STATE, IXHRStateChangeEventData } from '../active-ajax-loaders.service';
import { AjaxLoaderOptions } from '../ajax-loader.options';

@Component({
  selector: 'app-ajax-loader',
  templateUrl: './ajax-loader.component.html',
  styleUrls: ['./ajax-loader.component.css']
})
export class AjaxLoaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() loaderId: string;
  @Input() config?: AjaxLoaderOptions;

  defaultConfig: AjaxLoaderOptions = new AjaxLoaderOptions();
  canShow = false;
  currentState: XHR_REQUEST_STATE;
  statusMessage: string;
  requestStates = XHR_REQUEST_STATE;
  private loaderStateChangeSubscription: Subscription;


  constructor(private activeAjaxLoadersService: ActiveAjaxLoadersService) {
    this.config = this.defaultConfig;
  }

  ngOnInit() {
    this.loaderStateChangeSubscription = this.activeAjaxLoadersService.getXHRStateChangeEvent()
      .subscribe((loaderStateEvent: IXHRStateChangeEventData) => {
        if (this.loaderId === loaderStateEvent.id) {

          // this timeout is required to avoid "Expression has changed error" that may occur
          // we are giving a time delay so that it will update the values in next execution cycle
          setTimeout(() => {
            this.currentState = loaderStateEvent.state;
            this.update(loaderStateEvent.data);
          });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const configChange = changes.config;
    if (configChange) {
      this.config = {
        ...this.defaultConfig,
        ...this.config
      };
      this.update();
    }
  }

  ngOnDestroy() {
    if (this.loaderStateChangeSubscription) {
      this.loaderStateChangeSubscription.unsubscribe();
    }
  }

  close() {
    this.canShow = false;
  }

  private update(data = {}) {
    switch (this.currentState) {
      case XHR_REQUEST_STATE.PROGRESS: {
        this.canShow = !(this.config.hideOnProgress === true);
        break;
      }
      case XHR_REQUEST_STATE.ERROR: {
        this.canShow = !(this.config.hideOnError === true);
        this.statusMessage = this.getStatus(data);
        break;
      }
      case XHR_REQUEST_STATE.SUCCESS: {
        this.canShow = !(this.config.hideOnSuccess === true);
        break;
      }
      case XHR_REQUEST_STATE.CANCELED: {
        this.canShow = !(this.config.hideOnCanceled === true);
        this.statusMessage = this.getStatus(data);
        break;
      }
      default: {
        this.canShow = false;
      }
    }
  }

  private getStatus(xhrStatusData: any) {
    let status = '';
    if (xhrStatusData && typeof xhrStatusData === 'object') {
      if (xhrStatusData.error.split(':').length > 1) {
        if(JSON.parse(xhrStatusData.error).error_msg !== undefined || xhrStatusData.detail !== undefined) {
          status = JSON.parse(xhrStatusData.error).error_msg || xhrStatusData.detail || '';
        } else {
          status = JSON.parse(JSON.parse(xhrStatusData.error)).error_msg || xhrStatusData.detail || '';
        }        
      } else {
        status = xhrStatusData.error || xhrStatusData.detail || '';
      }
    }
    return status;
  }

}





