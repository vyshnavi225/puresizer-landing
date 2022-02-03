/**
 * Defines a constructor for an interface.
 * Requires an instance of that interface as a parameter
 */
type DecoratorConstructor<T> = new (object: T) => T;

/**
 * This creates a class that implements a given interface without having to
 * manually define all of the properties from the interface. This makes it
 * easier to write decorator classes that augment an api object with additional
 * functionality.
 *
 * @example
 * class DecoratedClass extends decorateInterface<MyInterface>() {
 *   constructor(object: MyInterface) {
 *     super(object);
 *     // all of MyInterface's properties are now available on Decorated Class.
 *   }
 * }
 */
export function decorateInterface<T>(): DecoratorConstructor<T> & T {
  class DecoratedClass {
    constructor(object: T) {
      if (object) {
        Object.assign(this, object);
      }
    }
  }
  return DecoratedClass as DecoratorConstructor<T> & T;
}
