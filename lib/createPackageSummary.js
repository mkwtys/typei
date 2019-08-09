"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_1 = __importDefault(require("module"));
const package_json_1 = __importDefault(require("package-json"));
const path_1 = __importDefault(require("path"));
const path_exists_1 = __importDefault(require("path-exists"));
const read_pkg_1 = __importDefault(require("read-pkg"));
const semver_1 = __importDefault(require("semver"));
function createPackageSummary(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { pkg } = options;
        const cwd = options.cwd ? options.cwd : process.cwd();
        const getPackagePath = (pkgName) => {
            // @ts-ignore - Module._nodeModulePaths
            const nodeModulesPaths = module_1.default._nodeModulePaths(cwd);
            const packagePath = path_1.default.join(nodeModulesPaths[0], pkgName);
            if (path_exists_1.default.sync(packagePath)) {
                return packagePath;
            }
        };
        const getPackageFromNodeModules = (pkgName) => __awaiter(this, void 0, void 0, function* () {
            const pkgPath = getPackagePath(pkgName);
            if (pkgPath) {
                return read_pkg_1.default({ cwd: pkgPath });
            }
        });
        const getPackageFromRegistry = (pkgName) => __awaiter(this, void 0, void 0, function* () {
            return package_json_1.default(pkgName);
        });
        const normalizePkgName = (pkgName) => {
            return /^@/.test(pkgName)
                ? pkgName
                    .slice(1)
                    .split('/')
                    .join('__')
                : pkgName;
        };
        const getTypesName = (pkgName) => {
            return `@types/${normalizePkgName(pkgName)}`;
        };
        const isTypesPkgName = (pkgName) => {
            return /^@types\//.test(pkgName);
        };
        const hasIndexTypes = (pkgName) => {
            const pkgPath = getPackagePath(pkgName);
            if (pkgPath) {
                return path_exists_1.default.sync(path_1.default.join(pkgPath, 'index.d.ts'));
            }
        };
        const summary = yield Promise.all(Object.keys(Object.assign({}, pkg.dependencies, pkg.devDependencies)).map((pkgName) => __awaiter(this, void 0, void 0, function* () {
            const isTypes = isTypesPkgName(pkgName);
            if (!isTypes) {
                const pkgFromNodeModules = yield getPackageFromNodeModules(pkgName);
                if (!pkgFromNodeModules || pkgFromNodeModules.types || pkgFromNodeModules.typings) {
                    return;
                }
                const hasTypes = hasIndexTypes(pkgName);
                if (hasTypes) {
                    return;
                }
            }
            const typesName = isTypes ? pkgName : getTypesName(pkgName);
            const typesPkgFromRegistry = yield getPackageFromRegistry(typesName);
            if (!typesPkgFromRegistry || typesPkgFromRegistry.deprecated) {
                return;
            }
            const typesPkgFromNodeModules = yield getPackageFromNodeModules(typesName);
            if (!isTypes && typesPkgFromNodeModules) {
                return;
            }
            const packageJsonVersion = (pkg.dependencies && pkg.dependencies[typesName]) || (pkg.devDependencies && pkg.devDependencies[typesName]);
            const latest = typesPkgFromRegistry.version;
            return {
                name: pkgName,
                typesName,
                installedVersion: typesPkgFromNodeModules && typesPkgFromNodeModules.version,
                packageJsonVersion,
                latest,
                satisfies: !!(packageJsonVersion && semver_1.default.satisfies(latest, packageJsonVersion)),
                deprecated: typesPkgFromNodeModules && typesPkgFromNodeModules['deprecated']
            };
        })));
        return summary.filter(Boolean);
    });
}
exports.createPackageSummary = createPackageSummary;
