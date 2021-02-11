const fs = require('fs');

interface BabelScan {
  importVar: string;
  cache: { [key: string]: number };
}

module.exports = function iffScan(this: BabelScan) {
  return {
    pre(this: BabelScan) {
      this.importVar = '';
      this.cache = {};
    },
    visitor: {
      ImportDeclaration(this: BabelScan, path: { [key: string]: any }) {
        if (path.node.source.value !== 'iff') {
          return;
        }
        // Depending on how iff is exported, we may need to change this
        const defaultImport = path.node.specifiers.find(
          (node: { type: string }) => node.type === 'ImportDefaultSpecifier',
        );
        this.importVar = defaultImport.local.name;
      },
      // This section is for server side iff scan and won't be worked on in the initial design phase
      // VariableDeclarator(this: BabelScan, path: { [key: string]: any }) {
      //   if(path.node.init?.callee?.name !== 'require' && path.node.init?.arguments?[0]?.value !== 'iff') {
      //     return
      //   }
      //   this.importVar = path.node.id.name;
      // },
      CallExpression(this: BabelScan, path: { [key: string]: any }) {
        if (path.node.callee.name === this.importVar) {
          if (this.cache[path.node.arguments[0].value]) {
            this.cache[path.node.arguments[0].value]++;
          } else {
            this.cache[path.node.arguments[0].value] = 1;
          }
        }
      },
    },
    post(this: BabelScan) {
      const scannedKeys = Object.keys(this.cache);
      if (!scannedKeys.length) {
        return;
      }
      let currentValues: { [key: string]: number } = {};
      // we can either set the filename as a flag or give users the ability to set this in a config
      if (fs.existsSync('./iffValues.json')) {
        currentValues = JSON.parse(fs.readFileSync('./iffValues.json'));
      }
      scannedKeys.forEach(
        (key) =>
          (currentValues[key] =
            (currentValues[key] ? currentValues[key] : 0) + this.cache[key]),
      );
      fs.writeFileSync(
        './iffValues.json',
        JSON.stringify(currentValues, null, 2),
      );
    },
  };
};
