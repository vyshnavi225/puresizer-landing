import { HasDestroyable, HasDestroyableCtor, mixinDestroyable } from './destroyable';
// import { HasFlexFlow, HasFlexFlowCtor, mixinFlexFlow } from './flex-flow';
// import { HasStateExitGuard, HasStateExitGuardCtor, mixinStateExitGuard } from './state-exit-guard';

/**
 * This file exports common behavior mixins and also creates several common classes
 * that can be easily reused in our components. Adding mixins to a class involves
 * several steps. This class also defines several classes that can be reused in order
 * to avoid writing too much boiler plate code.
 *
 * 1. Create a base class. It can usually be empty, but if one of the mixins requires
 *    a constructor argument, then the base class needs a construtor with arguments
 *    so that typescript will not complain.
 * 2. Create the mixin by applying the mixin(s) function to the base class. These
 *    can be chained together in any combination, ie: 'mixin1(mixin2(mixin3()))'
 *    The result of this is a new class containing augmented class. The class needs
 *    info for it, which can be set by combnining the mixinCtor types with the base class.
 * 3. Finally, create a component that extends the newly composed class and implements the
 *    interfaces for each mixin. Note - mixins are a not specific to angular. They can be
 *    applied to any class, not just classes with a @Component decorator.
 * @example
 *   class BaseComponent {}
 *   const _baseComponent: MixinCtor1 & MixinCtor2 & MixinCtor3 & typeof BaseComponent
 *     = mixin1(mixin2(mixin3(BaseComponent)));
 *   @Component(...)
 *   export class Component extends _baseComponent implements HasMixin1, HaxMixin2, HasMixin3 {
 *     // All mixin properties and behaviors are available on this class now.
 *   }
 */

/**
 * A base class to use for defining default classes composed of mixins.
 */
class BaseMixin {
  /**
   * The base class needs to have a constructor defined so that implementations
   * of the class can pass arguments to it.
   */
  constructor(...args: any[]) {}
}

// The base auto destroyable class with the applied mixin.
const autoDestroyableBase: HasDestroyableCtor & typeof BaseMixin = mixinDestroyable(BaseMixin);

/**
 * This is a convenience class based on the destroyable mixin to add a _destroy subject
 * that emits on ngOnDestroy to clean up a component's subscriptions. Classes
 * can extend this class and use pipe(takeUntil(this._destroy)) to automatically
 * clean up descriptions. This functionality is defined as a mixin, if a component
 * needs to inherit from a different class the mixin can be manually applied instead.
 *
 * @example
 *   class SomeComponent extends AutoDestroyable {
 *     constructor() {
 *       super();
 *     }
 *     ngOnInit() {
 *       this.observable.pipe(takeUntil(this._destroy)).subscribe(() => ...);
 *     }
 *   }
 */
export class AutoDestroyable extends autoDestroyableBase implements HasDestroyable {
  constructor(...args: any[]) {
    super(...args);
  }
}

// The base flex flow class with the applied mixin.
// const _FlexFlowBase: HasDestroyableCtor & HasFlexFlowCtor & typeof BaseMixin = mixinDestroyable(
//   mixinFlexFlow(BaseMixin)
// );

/**
 * This is a convenience class composed of the destroyable and flex flow
 * mixins. A class that can either be rendered directly in a page or created as
 * a dialog can extend this class. Has flex flow mixin will add a boolean property to
 * determine if the class is a dialog and also add a 'is-dialog' style to the host
 * component. For this mixin to work, the class needs set the dialogRef property
 * manually. The simplest way to do this is with the 'public' keyword in this class
 * constructor as shown below.
 *
 * @example
 *   class SomeComponent extends FlexFlow {
 *     constructor(@Optional() public dialogRef: MatDialogRef<RegisterComponent>) {
 *       super();
 *     }
 *   }
 */
// export class FlexFlow extends _FlexFlowBase implements HasDestroyable, HasFlexFlow {
//   constructor(...args: any[]) {
//     super(...args);
//   }
// }

// The base flex flow class with the applied mixin.
// const _StateExitGuardBase: HasDestroyableCtor & HasStateExitGuardCtor & typeof BaseMixin = mixinDestroyable(
//   mixinStateExitGuard(BaseMixin)
// );

/**
 * This is a convenience class composed of the destroyable and the exit guard mixins.
 * This can be used to simplify the logic around showing a confirmation prompt on
 * leaving a state.
 *
 * @example
 * export class Component extends StateExitGuard implements HasStateExitGuard {
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
// export class StateExitGuard extends _StateExitGuardBase implements HasDestroyable, HasStateExitGuard {
//   constructor(...args: any[]) {
//     super(...args);
//   }
// }
