#!/usr/bin/env node
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
const yargs_1 = __importDefault(require("yargs"));
const _1 = require("./");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const argv = yargs_1.default
            .usage(`Usage:
  $ typei`)
            .option({
            update: {
                alias: 'u',
                describe: 'Uninteractive update. Apply all updates without prompting',
                type: 'boolean'
            }
        })
            .example('$ typei -u', 'Uninteractive update')
            .locale('en')
            .help()
            .alias({
            h: 'help',
            v: 'version'
        }).argv;
        yield _1.interactiveUpdate({ update: argv.update });
    });
}
exports.run = run;
