const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

import { getEnhancedPromise } from '../../src/index';

const spy = chai.spy(() => {
  console.log('spy1');
});
const spy2 = chai.spy(() => {
  console.log('spy2');
});

describe('getEnhancedPromise', () => {
  it('should immediately stop promise execution after a rejectIf() triggers an error', () => {
    getEnhancedPromise(
      ({ rejectIf }) => {
        rejectIf(true, 'test');
        spy();
      },
      () => {
        spy2();
      },
    );

    expect(spy).to.not.have.been.called();
    expect(spy2).to.not.have.been.called();
  });
});
