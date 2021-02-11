import { transform, BabelFileResult } from '@babel/core';
import path from 'path';
import fs from 'fs';

const pathToProjectRootFromHere = '../../../../';
const projectBabelConfig = path.join(
  __dirname,
  pathToProjectRootFromHere,
  'babel.config.json',
);

const outputSourceFileName = 'iffValues.json';
const outputSourceFilePath = path.join(
  __dirname,
  pathToProjectRootFromHere,
  outputSourceFileName,
);

const resetOutputSourceFile = () => {
  if (fs.existsSync(outputSourceFilePath)) {
    fs.rmSync(outputSourceFilePath);
  }
};

describe('iff scan babel plugin', () => {
  beforeAll(() => {
    if (fs.existsSync(path.join(__dirname, '__snapshots__'))) {
      fs.rmSync(path.join(__dirname, '__snapshots__'), { recursive: true });
    }
  });
  beforeEach(() => {
    resetOutputSourceFile();
  });
  afterEach(() => {
    resetOutputSourceFile();
  });
  it('should not change any code', () => {
    const filename = path.join(__dirname, 'fixtures', 'importIff.js');
    const source = fs.readFileSync(filename, 'utf8');

    const result: BabelFileResult | null = transform(source, {
      filename: 'babel-plugin.tests.ts',
      extends: projectBabelConfig,
    });
    expect(result?.code).toMatchSnapshot();
  });
  describe('when scanning files with an iff import and call', () => {
    it('should add the first argument of the iff call to iffValues.json', () => {
      const filename = path.join(__dirname, 'fixtures', 'importIff.js');
      const source = fs.readFileSync(filename, 'utf8');
      transform(source, {
        filename: 'babel-plugin.tests.ts',
        extends: projectBabelConfig,
      });
      const iffValues = JSON.parse(
        fs.readFileSync(outputSourceFilePath, 'utf8'),
      );
      expect(Object.keys(iffValues).includes('test-flag')).toBe(true);
    });
    it('should tally the number of times a flag name was used in a file', () => {
      const filename = path.join(__dirname, 'fixtures', 'importIff.js');
      const source = fs.readFileSync(filename, 'utf8');
      transform(source, {
        filename: 'babel-plugin.tests.ts',
        extends: projectBabelConfig,
      });
      const iffValues = JSON.parse(
        fs.readFileSync(outputSourceFilePath, 'utf8'),
      );
      expect(iffValues).toEqual({ 'test-flag': 2 });
    });
    it('should keep a running tally of every occurence of flag name after scanning all files', () => {
      const importIff = path.join(__dirname, 'fixtures', 'importIff.js');
      const importIffSource = fs.readFileSync(importIff, 'utf8');
      const importIffAlias = path.join(
        __dirname,
        'fixtures',
        'importIffAlias.js',
      );
      const importIffAliasSource = fs.readFileSync(importIffAlias, 'utf8');
      transform(importIffSource, {
        filename: 'babel-plugin.tests.ts',
        extends: projectBabelConfig,
      });
      transform(importIffAliasSource, {
        filename: 'babel-plugin.tests.ts',
        extends: projectBabelConfig,
      });
      const iffValues = JSON.parse(
        fs.readFileSync(outputSourceFilePath, 'utf8'),
      );
      const expcted = {
        'test-flag': 3,
        'cool-name': 1,
      };
      expect(iffValues).toMatchObject(expcted);
    });
  });
  describe('when there is no iff import', () => {
    beforeEach(() => {
      console.log = jest.fn();
    });
    it('should not continue in that file', () => {
      const filename = path.join(__dirname, 'fixtures', 'noIffImport.js');
      const source = fs.readFileSync(filename, 'utf8');
      transform(source, {
        filename: 'babel-plugin.tests.ts',
        extends: projectBabelConfig,
      });
      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });
});
