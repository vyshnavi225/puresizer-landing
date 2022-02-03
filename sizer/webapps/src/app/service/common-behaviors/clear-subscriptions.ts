import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

/**
 * Helper class to manage subscriptions and automatically unsubscribe on
 *  component destroy.
 */
@Directive()
// tslint:disable-next-line: directive-class-suffix
export class ClearSubscriptions implements OnDestroy {
  /**
   * Maintain an array of current subscriptions to unsubscribe on component
   * destroy.
   */
  protected subscriptions: Subscription[] = [];

  /**
   * Component on destroy.
   */
  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  /**
   * Function to clear all subscriptions. If the component manually wants to
   * clear all subscriptions, this can be called directly from the component.
   */
  clearSubscriptions(): void {
    for (const subscription of this.subscriptions) {
      if (!subscription.closed) {
        subscription.unsubscribe();
      }
    }
  }
}
