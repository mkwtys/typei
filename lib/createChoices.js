"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const semver_1 = __importDefault(require("semver"));
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const text_table_1 = __importDefault(require("text-table"));
function createChoices({ packageSummary }) {
    const choices = packageSummary
        .filter(summary => !summary.deprecated)
        .filter(summary => {
        if (!summary.satisfies || !summary.installedVersion) {
            return true;
        }
        return semver_1.default.lt(summary.installedVersion, summary.latest);
    })
        .map(summary => ({
        name: [
            chalk_1.default.cyan(summary.typesName),
            summary.installedVersion ? chalk_1.default.white(summary.installedVersion) : chalk_1.default.white('missing'),
            chalk_1.default.white('❯'),
            chalk_1.default.white.bold(summary.latest)
        ],
        value: summary,
        short: `${summary.typesName}@${summary.latest}`
    }));
    if (!choices.length) {
        return [];
    }
    const choicesAsTable = text_table_1.default(choices.map(choice => choice.name), {
        align: ['l', 'r', 'l', 'l'],
        stringLength(str) {
            return strip_ansi_1.default(str).length;
        }
    }).split('\n');
    return [...choices.map((choice, i) => (Object.assign({}, choice, { name: choicesAsTable[i] })))];
}
exports.createChoices = createChoices;
