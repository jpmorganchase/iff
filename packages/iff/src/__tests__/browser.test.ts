/* eslint-disable no-native-reassign */
import iff from '../browser';

const originalWindow = window;

describe('iff browser', () => {
  const testFlag = 'feature-flagging-enable';
  describe('when flagName is not a string type', () => {
    it('should throw a type error', () => {
      // @ts-expect-error
      expect(() => iff({ [testFlag]: true })).toThrow(
        new TypeError('flagName must be a string'),
      );
    });
  });
  describe('when flagName is a string type', () => {
    describe('when window.__iff_VALUES__ exists', () => {
      beforeEach(() => {
        // @ts-expect-error
        window.__iff_VALUES__ = { [testFlag]: true };
      });
      afterEach(() => {
        window = originalWindow;
      });
      describe('when that flag name can be found in __iff_VALUES__', () => {
        it("should return that flag name's value", () => {
          expect(iff(testFlag)).toEqual(true);
        });
      });
      describe('when that flag name cannot be found in __iff_VALUES__', () => {
        it('should return null', () => {
          expect(iff('another-flag')).toEqual(null);
        });
      });
    });
    describe('when window.__iff_VALUES__ does not exist', () => {
      beforeEach(() => {
        // @ts-expect-error
        window.__iff_VALUES__ = undefined;
      });
      afterEach(() => {
        window = originalWindow;
      });
      it('should throw an error', () => {
        expect(() => iff(testFlag)).toThrow(
          new Error('feature flags were not populated'),
        );
      });
    });
  });
});
