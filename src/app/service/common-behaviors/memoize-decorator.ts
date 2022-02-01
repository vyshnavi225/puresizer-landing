/**
 * Memoizer from
 * https://github.com/darrylhodgins/typescript-memoize/blob/master/src/memoize-decorator.ts.
 * Pulled in like this because using the npm for it threw require errors.
 *
 * @example
 *   class Thing {
 *     @Memoize()
 *     get memeber1() {
 *       return expensive calculations
 *     }
 *
 *     @Memoize(() => 'member2')
 *     get memeber2() {
 *       return expensive calculations
 *     }
 *
 *     @Memoize()
 *     private doSoemthing() {
 *       return expensive calculations
 *     }
 *   }
 *
 * @param    [hashFunction]  Function to return the key for the memo cache.
 * @returns  Memoized version of the original function/method.
 */
export function Memoize(hashFunction?: (...args: any[]) => any) {
  return (target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    if (descriptor.value != null) {
      descriptor.value = getNewFunction(descriptor.value, hashFunction);
    } else if (descriptor.get != null) {
      descriptor.get = getNewFunction(descriptor.get, hashFunction);
    } else {
      throw new TypeError('Only put a Memoize() decorator on a method or get accessor.');
    }
  };
}

// Unique number to seen the cache property names.
let counter = 0;

/**
 * Generates a new memoized wrapped version of the original input function.
 *
 * @param    originalMethod   The function/method being memoized.
 * @param    [hashFunction]   Optional hashing function to determine the Memoized cache key.
 * @return   The new Memoized wrapped original function.
 */
function getNewFunction(originalMethod: () => void, hashFunction?: (...args: any[]) => any) {
  const identifier = ++counter;

  // The function returned here gets called instead of originalMethod.
  return function(...args: any[]): any {
    // Used as a cache key on methods/functions with no arguments.
    const propValName = `__memoized_value_${identifier}`;

    // Used as a cache Map name on methods/functions with 1+ arguments where the
    // 1st arg is the cache key for each function call.
    const propMapName = `__memoized_map_${identifier}`;

    let returnedValue: any;

    if (hashFunction || args.length > 0) {

      // Get or create map
      if (!this.hasOwnProperty(propMapName)) {
        Object.defineProperty(this, propMapName, {
          configurable: false,
          enumerable: false,
          writable: false,
          value: new Map<any, any>()
        });
      }
      const myMap: Map<any, any> = this[propMapName];

      let hashKey: any;

      if (hashFunction) {
        hashKey = hashFunction.apply(this, args);
      } else {
        hashKey = args[0];
      }

      if (myMap.has(hashKey)) {
        returnedValue = myMap.get(hashKey);
      } else {
        returnedValue = originalMethod.apply(this, args);
        myMap.set(hashKey, returnedValue);
      }

    } else {

      if (this.hasOwnProperty(propValName)) {
        returnedValue = this[propValName];
      } else {
        returnedValue = originalMethod.apply(this, args);
        Object.defineProperty(this, propValName, {
          configurable: false,
          enumerable: false,
          writable: false,
          value: returnedValue
        });
      }
    }

    return returnedValue;
  };
}
