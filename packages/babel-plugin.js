const fs = require('fs');

module.exports = function({ types: t}) {
  return {
    pre(state) {
      this.importVar = ''
      this.cache = {}
    },
    visitor: {
      ImportDeclaration(path, state) {
        if(path.node.source.value !== 'iff'){
          return
        }
        // Depending on how iff is exported, we may need to change this
        const defaultImport= path.node.specifiers.find(
          ({ type }) => type === 'ImportDefaultSpecifier'
        );
        this.importVar = defaultImport.local.name;
      },
      // This section is for server side iff scan and won't be worked on in the initial design phase
      // VariableDeclarator(path, state) {
      //   if(path.node.init?.callee?.name !== 'require' && path.node.init?.arguments?[0]?.value !== 'iff') {
      //     return
      //   }
      //   this.importVar = path.node.id.name;
      // },
      CallExpression(path, state) {
        if (path.node.callee.name === this.importVar) {
          if (this.cache[path.node.arguments[0].value]) {
            this.cache[path.node.arguments[0].value]++;
          } else {
            this.cache[path.node.arguments[0].value] = 1;
          }
        }
      },
    },
    post(state) {
      let currentffValues = {};
      // we can either set the filename as a flag or give users the ability to set this in a config
      if (fs.existsSync('./iffValues.json')) {
        currentffValues = JSON.parse(fs.readFileSync('./iffValues.json'));
      }
      fs.writeFileSync(
        './iffValues.json',
        JSON.stringify({ ...currentffValues, ...this.cache }, null, 2)
      );
    },
  };
}