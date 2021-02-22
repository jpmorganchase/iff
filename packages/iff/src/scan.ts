import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as path from 'path';
import * as fs from 'fs-extra';

const extensions = ['.js', '.ts', '.tsx'];
const ignoreFiles = ['node_modules'];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);
  files.forEach(function (file: string) {
    const pathToCheck = path.join(dirPath, file);
    if (ignoreFiles.includes(path.basename(pathToCheck))) {
      return;
    }
    if (fs.statSync(pathToCheck).isDirectory()) {
      arrayOfFiles = getAllFiles(pathToCheck, arrayOfFiles);
    } else {
      if (extensions.includes(path.extname(pathToCheck))) {
        arrayOfFiles.push(pathToCheck);
      }
    }
  });
  return arrayOfFiles;
}

export default function scan(destination: string): void {
  const files: string[] = getAllFiles(destination);
  const keys: Set<string> = new Set();
  files.forEach(function (file: string) {
    const code = fs.readFileSync(file, 'utf-8');
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    let importVar: string = '';
    traverse(ast, {
      ImportDeclaration: function (path: { [key: string]: any }) {
        if (path.node.source.value !== 'iff') {
          return;
        }
        const defaultImport = path.node.specifiers.find(
          (node: { type: string }) => node.type === 'ImportDefaultSpecifier',
        );
        importVar = defaultImport?.local.name;
      },
      CallExpression: function (path: { [key: string]: any }) {
        if (path.node.callee.name === importVar) {
          keys.add(path.node.arguments[0].value);
        }
      },
    });
  });
  console.log('Feature flag keys: ', keys);
}

if (require.main === module) {
  const dir: string = process.argv[2] || '.';
  scan(dir);
}
