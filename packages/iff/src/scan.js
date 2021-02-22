
exports.__esModule = true;
var parser_1 = require("@babel/parser");
var traverse_1 = require("@babel/traverse");
var path = require("path");
var fs = require("fs-extra");
var extensions = ['.js', '.ts', '.tsx'];
var ignoreFiles = ['node_modules'];
function getAllFiles(dirPath, arrayOfFiles) {
    if (arrayOfFiles === void 0) { arrayOfFiles = []; }
    var files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
        var pathToCheck = path.join(dirPath, file);
        if (ignoreFiles.includes(path.basename(pathToCheck))) {
            return;
        }
        if (fs.statSync(pathToCheck).isDirectory()) {
            arrayOfFiles = getAllFiles(pathToCheck, arrayOfFiles);
        }
        else {
            if (extensions.includes(path.extname(pathToCheck))) {
                arrayOfFiles.push(pathToCheck);
            }
        }
    });
    return arrayOfFiles;
}
function scan(destination) {
    var files = getAllFiles(destination);
    var keys = new Set();
    files.forEach(function (file) {
        var code = fs.readFileSync(file, 'utf-8');
        var ast = parser_1.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        var importVar = '';
        traverse_1["default"](ast, {
            ImportDeclaration: function (path) {
                if (path.node.source.value !== 'iff') {
                    return;
                }
                var defaultImport = path.node.specifiers.find(function (node) { return node.type === 'ImportDefaultSpecifier'; });
                importVar = defaultImport === null || defaultImport === void 0 ? void 0 : defaultImport.local.name;
            },
            CallExpression: function (path) {
                if (path.node.callee.name === importVar) {
                    keys.add(path.node.arguments[0].value);
                }
            }
        });
    });
    console.log('Feature flag keys: ', keys);
}
exports["default"] = scan;
if (require.main === module) {
    var dir = process.argv[2] || '.';
    scan(dir);
}
