import { OnDestroy } from '@angular/core';
import { HookResult, StateService, TransitionService } from '@uirouter/core';
import { Observable, Subject } from 'rxjs';

import { HasStateExitGuard, mixinStateExitGuard } from './state-exit-guard';

class TestClass {
  public dialogResult =  new Subject<boolean>();

  constructor(public stateService: StateService, public transitionService: TransitionService) {}

  showExitPrompt: () => Observable<boolean> = () => this.dialogResult;
}

const transition: any = {
  from: () => 'from',
  to: () => 'to',
};

describe('MixinStateExitGuard', () => {
  let exitGuardInstance: TestClass & HasStateExitGuard & OnDestroy;
  let stateService: StateService;
  let transitionService: TransitionService;
  let hook: Function;

  beforeEach(() => {
    const StateExitGuardClass = mixinStateExitGuard(TestClass);
    stateService = {
      current: {
        name: 'dummy-state',
      },
    } as any;

    transitionService = {
      onExit: (criteria, callback) => {
        hook = callback;
        return () => (hook = undefined);
      },
    } as any;

    exitGuardInstance = new StateExitGuardClass(stateService, transitionService);
  });

  it('should throw errors if it is not configured correctly', () => {
    // Errors if state service is not set
    let expectedError = false;
    try {
      exitGuardInstance.stateService = undefined;
      exitGuardInstance.ngOnInit();
    } catch (error) {
      expectedError = true;
    }
    expect(expectedError).toBeTruthy();

    // Errors if transition service is not set
    expectedError = false;
    try {
      exitGuardInstance.transitionService = undefined;
      exitGuardInstance.ngOnInit();
    } catch (error) {
      expectedError = true;
    }
    expect(expectedError).toBeTruthy();

    // Errors if showExitPrompt is not set
    expectedError = false;
    try {
      exitGuardInstance.showExitPrompt = undefined;
      exitGuardInstance.ngOnInit();
    } catch (error) {
      expectedError = true;
    }
    expect(expectedError).toBeTruthy();
  });

  it('should initialize and clean up as expected', () => {
    exitGuardInstance.ngOnInit();
    expect((exitGuardInstance as any).promptOnExit).toBeTruthy();
    expect(hook).toBeTruthy();
    exitGuardInstance.ngOnDestroy();
  });

  it('should work as expected when the transition is allowed', async () => {
    exitGuardInstance.ngOnInit();

    // Simulate the state change by invoking the hook
    const hookResult: HookResult = hook(transition);

    // Save the dialog result.
    let dialogResult;
    (hookResult as Promise<boolean>).then(result => dialogResult = result);

    expect(exitGuardInstance.showingDialog).toBeTruthy();

    // a second transition should return false since the dialog is open
    // Note that these check the specific value rather than truthy or falsy in
    // order to be more explicit about the expected values.
    expect(hook(transition)).toEqual(false);

    // Allow the transition.
    exitGuardInstance.dialogResult.next(true);
    await hookResult;
    expect(dialogResult).toEqual(true);

    // a third transition attempt to should go through since the user has already
    // allowed the transition.
    expect(hook(transition)).toEqual(true);
  });

  it('should work as expected when the transition is canceled', async () => {
    exitGuardInstance.ngOnInit();

    // Simulate the state change by invoking the hook
    const hookResult: HookResult = hook(transition);

    // Save the dialog result.
    let dialogResult;
    (hookResult as Promise<boolean>).then(result => dialogResult = result);

    expect(exitGuardInstance.showingDialog).toBeTruthy();

    // Allow the transition.
    exitGuardInstance.dialogResult.next(false);
    await hookResult;

    expect(dialogResult).toEqual(false);

    // A second transition attempt should return a promise
    expect(hook(transition) instanceof Promise).toBeTruthy();
  });
});
