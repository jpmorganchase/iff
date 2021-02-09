import iff from '../browser';

const originalWindow = window;

describe('iff browser', () => {
  const testFlag = 'feature-flagging-enable';
  describe('when flagName is not a string type', () => {
    it('should throw a type error', () => {
      expect(() => iff({ [testFlag]: true })).toThrow(
        new TypeError('flagName must be a string'),
      );
    });
  });
  describe('when flagName is a string type', () => {
    describe('when window.__iff_VALUES__ exists', () => {
      beforeEach(() => {
        // eslint-disable-next-line no-native-reassign
        window.__iff_VALUES__ = { [testFlag]: true };
      });
      afterEach(() => {
        // eslint-disable-next-line no-native-reassign
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
        // eslint-disable-next-line no-native-reassign
        window.__iff_VALUES__ = undefined;
      });
      afterEach(() => {
        // eslint-disable-next-line no-native-reassign
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
