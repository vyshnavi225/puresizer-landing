import { decorateInterface } from './interface-decorator';

interface BasicModel {
  prop1: string;
}

class DecoratedModel extends decorateInterface<BasicModel>() {
  property2: string;
  constructor(model: BasicModel) {
    super(model);
    this.property2 = 'prop2';
  }
}

describe('InterfaceDecorator', () => {
  it('should correctly decorate an interface', () => {
    const instance = new DecoratedModel({ prop1: 'prop1' });

    // should provide access to inherited properties.
    expect(instance.prop1).toEqual('prop1');

    // should provide access to new properties.
    expect(instance.property2).toEqual('prop2');
  });
});
