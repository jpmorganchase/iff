var fs = require('fs');
module.exports = function iffScan() {
    return {
        pre: function () {
            this.importVar = '';
            this.cache = {};
        },
        visitor: {
            ImportDeclaration: function (path) {
                if (path.node.source.value !== 'iff') {
                    return;
                }
                // Depending on how iff is exported, we may need to change this
                var defaultImport = path.node.specifiers.find(function (node) { return node.type === 'ImportDefaultSpecifier'; });
                this.importVar = defaultImport.local.name;
            },
            // This section is for server side iff scan and won't be worked on in the initial design phase
            // VariableDeclarator(this: BabelScan, path: { [key: string]: any }) {
            //   if(path.node.init?.callee?.name !== 'require' && path.node.init?.arguments?[0]?.value !== 'iff') {
            //     return
            //   }
            //   this.importVar = path.node.id.name;
            // },
            CallExpression: function (path) {
                if (path.node.callee.name === this.importVar) {
                    if (this.cache[path.node.arguments[0].value]) {
                        this.cache[path.node.arguments[0].value]++;
                    }
                    else {
                        this.cache[path.node.arguments[0].value] = 1;
                    }
                }
            }
        },
        post: function () {
            var _this = this;
            var scannedKeys = Object.keys(this.cache);
            if (!scannedKeys.length) {
                return;
            }
            var currentValues = {};
            // we can either set the filename as a flag or give users the ability to set this in a config
            if (fs.existsSync('./iffValues.json')) {
                currentValues = JSON.parse(fs.readFileSync('./iffValues.json'));
            }
            scannedKeys.forEach(function (key) {
                return (currentValues[key] =
                    (currentValues[key] ? currentValues[key] : 0) + _this.cache[key]);
            });
            fs.writeFileSync('./iffValues.json', JSON.stringify(currentValues, null, 2));
        }
    };
};
