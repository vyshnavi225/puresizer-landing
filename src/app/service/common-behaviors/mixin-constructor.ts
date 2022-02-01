/**
 * This is a convenience type used to help define class mixins.
 * @example
 *
 * type HasBehaviorCtor = MixinConstructor<HasBehavior>;
 * function mixinBehabior<T extends MixinConstructor<{}>>(base: T): HasBehaviorCtor & T {
 *   return class extends base {
 *     constructor(...args: any[]) {
 *       super(...args);
 *     }
 *   }
 * }
 */
export type MixinConstructor<T> = new (...args: any[]) => T;
