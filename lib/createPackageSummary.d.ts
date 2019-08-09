import readPkg from 'read-pkg';
import { Summary } from './types';
export declare function createPackageSummary(options: {
    cwd?: string;
    pkg: readPkg.PackageJson;
}): Promise<Summary[]>;
