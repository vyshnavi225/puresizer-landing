import { Subject } from 'rxjs';

import { HasDestroyable, mixinDestroyable } from './destroyable';

class TestClass {}

describe('MixinDestroyable', () => {
  let instance: HasDestroyable;

  beforeEach(() => {
    const destroyableClass = mixinDestroyable(TestClass);
    instance = new destroyableClass();
  });

  it('should augment an existing class with destroyable properties', done => {
    expect(instance._destroy).toBeDefined();
    expect(instance.ngOnDestroy).toBeDefined();

    // call done when _destroy emits to finish the test
    instance._destroy.subscribe(() => done());

    // call ngOndestroy to trigger _destroy
    instance.ngOnDestroy();
  });

  it('should use the until destroy pipe', () => {
    const subject = new Subject<any>();
    const subscription = subject.pipe(instance.untilDestroy()).subscribe();
    expect(subscription.closed).toBeFalsy();
    instance.cleanUpSubscriptions();
    expect(subscription.closed).toBeTruthy();
  });
});
