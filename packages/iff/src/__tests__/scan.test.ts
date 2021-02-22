import scan from '../scan';
import * as path from 'path';
import * as fs from 'fs';

const fixturesPath = path.join(__dirname, 'fixtures');

describe('iff scan', () => {
  beforeEach(() => {
    console.log = jest.fn();
    scan(fixturesPath);
  });
  afterEach(() => {
    console.log.mockRestore();
  });
  it('should not change any code', () => {
    expect(fs.readdirSync(fixturesPath)).toMatchInlineSnapshot(`
      Array [
        "iffImportAliased.js",
        "importIff.js",
        "mispelledImport.js",
        "noIffImport.js",
      ]
    `);
  });
  describe('when scanning files with an iff import and call', () => {
    it('should add the first argument of the unique set of feature flag keys', () => {
      expect(console.log).toHaveBeenCalledWith(
        'Feature flag keys: ',
        new Set(['cool-name', 'test-flag']),
      );
    });
  });
  describe('when the imported module variable name is not iff', () => {
    it('should not change any code', () => {
      expect(
        fs
          .readFileSync(path.join(fixturesPath, 'iffImportAliased.js'), 'utf8')
          .toString(),
      ).toMatchInlineSnapshot(`
        "import fflags from 'iff';

        fflags('cool-name');
        "
      `);
    })
    it('should use the name declared and catch the flag names called with it', () => {
      expect(console.log.mock.calls[0][1].has('cool-name')).toBe(true);
    });
  });
  describe('when scanning files with an incorrectly spelled iff module', () => {
    it('should not change any code', () => {
      expect(
        fs
          .readFileSync(path.join(fixturesPath, 'mispelledImport.js'), 'utf8')
          .toString(),
      ).toMatchInlineSnapshot(`
        "import iff from 'iffy';

        iff('iffy');
        "
      `);
    });
    it('should not add those flag names to the set', () => {
      expect(console.log.mock.calls[0][1].has('iffy')).toBe(false);
    });
  });
  describe('when there is no iff import', () => {
    beforeEach(() => {
      console.warn = jest.fn();
    });
    afterEach(() => {
      console.warn.mockRestore();
    });
    it('should not change any code', () => {
      scan(fixturesPath);
      expect(
        fs
          .readFileSync(path.join(fixturesPath, 'noIffImport.js'), 'utf8')
          .toString(),
      ).toMatchInlineSnapshot(`
        "// eslint-disable-next-line no-unused-vars
        import fs from 'fs';

        console.warn('This is not the file you are looking for');
        "
      `);
    });
    it('should not continue in that file', () => {
      scan(fixturesPath);
      expect(console.warn).toHaveBeenCalledTimes(0);
    });
  });
});
