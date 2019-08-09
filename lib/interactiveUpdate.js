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
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const read_pkg_1 = __importDefault(require("read-pkg"));
const createChoices_1 = require("./createChoices");
const createPackageSummary_1 = require("./createPackageSummary");
const installPackages_1 = require("./installPackages");
function interactiveUpdate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = options.cwd ? options.cwd : process.cwd();
        const pkg = yield read_pkg_1.default({ cwd });
        const packageSummary = yield createPackageSummary_1.createPackageSummary({ cwd, pkg });
        const choices = createChoices_1.createChoices({ packageSummary });
        if (!choices.length) {
            console.log(`${chalk_1.default.green(`❯`)} all of your types are up to date`);
            return;
        }
        let selectedPackageSummary = [];
        if (options.update) {
            selectedPackageSummary = packageSummary;
        }
        else {
            const answers = yield inquirer_1.default.prompt([
                {
                    name: 'types',
                    message: 'choose which types to update',
                    type: 'checkbox',
                    choices
                }
            ]);
            selectedPackageSummary = answers.types;
        }
        if (!selectedPackageSummary.length) {
            return;
        }
        yield installPackages_1.installPackages({ cwd, packageSummary: selectedPackageSummary }).then(output => {
            console.log(output.all);
            console.log(`${chalk_1.default.green(`❯`)} complete`);
        });
    });
}
exports.interactiveUpdate = interactiveUpdate;
