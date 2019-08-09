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
const execa_1 = __importDefault(require("execa"));
const ora_1 = __importDefault(require("ora"));
function installPackages({ cwd, packageSummary }) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = cwd ? `cd ${cwd} &&` : '';
        const packages = packageSummary.map(summary => `${summary.typesName}@${summary.latest}`).join(' ');
        const spinner = ora_1.default(`install types...`);
        spinner.start();
        return execa_1.default
            .command(`${dir} npm install --save-dev ${packages}`, { env: Object.assign({}, process.env), shell: true })
            .finally(() => {
            spinner.stop();
        });
    });
}
exports.installPackages = installPackages;
