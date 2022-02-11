import { Directive, OnDestroy, OnInit } from '@angular/core';
import { HookResult, StateService, Transition, TransitionService } from '@uirouter/core';
import { Observable } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

import { MixinConstructor } from './mixin-constructor';

/**
 * This mixin can be applied to components or pages that need to show a confirmation
 * dialog whenever the user exits the page. This will automatically hook state
 * state transitions onExit. The component that uses this mixin should implement
 * the showExitPrompt callback to prompt the user whether to allow the state change
 * or not.
 *
 * @example
 * export class ComponentBase {
 *   constructor(...args: any[]) {}
 * }
 * export const _ComponentBase: HasStateExitGuardCtor & typeof ComponentBase =
 * mixinStateExitGuard(ComponentBase);
 *
 * export class Component extends _ComponentBase implements HasStateExitGuard {
 *   constructor(
 *     public transitionService: TransitionService,
 *     public stateService: StateService) {
 *     super();
 *   }
 *   showExitPrompt: () => Observable<boolean> = () =>  {
 *     ...show exit prompt
 *   }
 * }
 */
export interface HasStateExitGuard extends OnInit {
  /**
   * The UI Router transition service. This is used to add a hook to the onStart
   * transition.
   */
  transitionService: TransitionService;

  /**
   * The UI Router state service. This is used to configure the transition hook
   * to apply only to the current state.
   */
  stateService: StateService;

  /**
   * This is set to true if the exit prompt dialog is currently being shown. This
   * can be used to disable an action that would cause a state change while it is open.
   */
  readonly showingDialog: boolean;

  /**
   * This method should be implemented by the class using this mixin.
   * When called, it should show a dialog prompting the user whether to allow the
   * state change or not.
   *
   * This is marked as an optional property (rather than method), to allow the class
   * implementation to use it while still allowing the mixin base to implement the
   * interface.
   *
   * @return a boolean observable, true to allow the state change, false to cancel it.
   */
  showExitPrompt?: () => Observable<boolean>;

  /**
   * Enables the exit guard to show a prompt on exit. All state transitions away from
   * the current state will trigger an exit prompt.
   */
  enablePromptOnExit(): any;

  /**
   * Disables the exit guard. This can be used if a state transition needs to be forced,
   * such as falling back to previous state after displaying an error.
   */
  disablePromptOnExit(): any;

}

export type HasStateExitGuardCtor = MixinConstructor<HasStateExitGuard & OnInit & OnDestroy>;

export function mixinStateExitGuard<T extends MixinConstructor<{}>>(base: T): HasStateExitGuardCtor & T {
  @Directive()
  class MixinClass extends base implements HasStateExitGuard, OnInit, OnDestroy {
    /**
     * The UI Router transition service. This is used to add a hook to the onStart
     * transition. This will be set by the class using this mixin.
     */
    transitionService: TransitionService;

    /**
     * The UI Router state service. This is used to configure the transition hook
     * to apply only to the current state. This will be set by the class using this mixin.
     */
    stateService: StateService;

    /**
     * This is set to true if the exit prompt dialog is currently being shown. This
     * can be used to disable an action that would cause a state change while it is open.
     */
    showingDialog = false;

    /**
     * This method should be implemented by the class using this mixin.
     * When called, it should show a dialog prompting the user whether to allow the
     * state change or not.
     *
     * This is marked as an optional property (rather than method), to allow the class
     * implementation to use it while still allowing the mixin base to implement the
     * interface.
     *
     * This will be set by the class using this mixin.
     *
     * @return a boolean observable, true to allow the state change, false to cancel it.
     */
    showExitPrompt: () => Observable<boolean>;

    /**
     * True if the state guard is enabled and should prompt on exit, false if disabled.
     */
    private promptOnExit = true;

    /**
     * A reference to the transition hook created in ngOnInit that can be cleaned
     * up in ngOnDestroy.
     */
    private transitionHook: Function;

    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * Enables the exit guard to show a prompt on exit. All state transitions away from
     * the current state will trigger an exit prompt.
     */
    enablePromptOnExit(): void {
      this.promptOnExit = true;
    }

    /**
     * Disables the exit guard. This can be used if a state transition needs to be forced,
     * such as falling back to previous state after displaying an error.
     */
    disablePromptOnExit(): void {
      this.promptOnExit = false;
    }

    /**
     * Handle the state exit transition. If the prompt is enabled and a dialog is
     * not already showing, this will invoke showExitPrompt on the implementing class
     * to determine whether to allow the state transition to occur or not.
     *
     * @param    transition   The transition object passed from ui-router.
     * @return  A boolean or Promise<boolean>, true if the transition can occur and
     *          false if it should be canceled.
     */
    onExitState(transition: Transition): HookResult {
      // If the state is being reloaded, don't prompt
      if (transition.from() === transition.to()) {
        return true;
      }

      // Never allow the transition if the dialog is showing, even if the prompt
      // on exit is disabled.
      if (this.showingDialog) {
        return false;
      }

      if (!this.promptOnExit) {
        return true;
      }

      this.showingDialog = true;
      return this.showExitPrompt()
        .pipe(
          // Something the transition fires multiple times. If the user has
          // chosen to leave the state, disable the prompt so that it will flow
          // through without running the guard on the second time.
          tap(result => this.promptOnExit = !result),
          take(1),
          // Reset the showingDialog flat whenever the observable completes
          finalize(() => this.showingDialog = false)
        )
        .toPromise();
    }

    /**
     * Initializes the state guard, throws errors if it is not configured correctly,
     * listens to the state change and enables prompt on exit.
     */
    ngOnInit(): void {
      this.enablePromptOnExit();
      if (!this.showExitPrompt) {
        throw Error('show exit prompt must be defined');
      }

      if (!this.stateService) {
        throw Error('stateService must be defined');
      }

      if (!this.transitionService) {
        throw Error('transitionService must be defined');
      }

      if (this.transitionHook) {
        this.transitionHook();
      }

      this.transitionHook = this.transitionService.onExit({ exiting: this.stateService.current.name },
        (transition: Transition) => this.onExitState(transition));
    }

    /**
     * Unsubscribes from the transition hook when the component is destroyed.
     */
    ngOnDestroy(): void {
      if (this.transitionHook) {
        this.transitionHook();
      }
    }
  }
  return MixinClass;
}
