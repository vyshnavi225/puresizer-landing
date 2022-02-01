import { Directive, OnDestroy } from '@angular/core';
import { Observable, pipe, Subject, UnaryFunction } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MixinConstructor } from './mixin-constructor';

/**
 * Mixin that can be used for components that can be instantied as a route or as a dialog.
 * When instantiated as a dialog, the 'is-dialog' class will be added to the component,
 * and the dialogRef and isDialog properties will be set.
 *
 * @example
 * export class ComponentBase { }
 * export const _ComponentBase: HasDestroyableCtor & typeof ComponentBase =
 * mixinDestroyable(ComponentBase);
 *
 * export class Component extends _ComponentBase implements HasDestroyable {
 *   constructor() {
 *    super();
 *   }
 * }
 */
export interface HasDestroyable extends OnDestroy {
  /**
   * Use takeUntil(this.destroy) to clean up subscriptions whenever this property
   * fires.
   */
  destroy: Subject<void>;

  /**
   * Further simplfies the use of the component.
   * Use stream.pipe(this.untilDestroy()) as the equivalent of
   * stream.pipe(takeUntil(this.destroy))
   */
  untilDestroy<O>(): UnaryFunction<Observable<O>, Observable<O>>;

  /**
   * Use this to manually trigger destroy and clean up all subscriptions.
   */
  cleanUpSubscriptions(): any;
}

export type HasDestroyableCtor = MixinConstructor<HasDestroyable>;

export function mixinDestroyable<T extends MixinConstructor<{}>>(base: T): HasDestroyableCtor & T {
  @Directive()
  // tslint:disable-next-line: directive-class-suffix
  class MixinClass extends base implements OnDestroy {
    destroy = new Subject<void>();

    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Further simplfies the use of the component.
     * Use stream.pipe(this.untilDestroy()) as the equivalent of
     * stream.pipe(takeUntil(this.destroy))
     */
    untilDestroy<O>(): UnaryFunction<Observable<O>, Observable<O>> {
      return pipe(takeUntil(this.destroy));
    }

    /**
     * Emit a new value on destroy to clean up subscriptions.
     * Note that destroy is NOT completed. That would close the subscription completely,
     * so if the component were added back to the dom and the subscriptions reinitialized,
     * the takeUntil method would no longer work.
     */
    cleanUpSubscriptions(): void {
      this.destroy.next();
    }

    /**
     * When ngOnDestroy executes, clean up the subscriptions
     */
    ngOnDestroy(): void {
      this.cleanUpSubscriptions();
    }
  }
  return MixinClass;
}
