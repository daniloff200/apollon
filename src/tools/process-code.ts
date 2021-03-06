import * as path from 'path';
import { Uri } from 'vscode';
import * as vscode from 'vscode';
import * as _ from 'lodash';

import { getSourceFile } from '../lib/get-source-file';
import { processStringReplacements } from '../lib/process-string-replacements';
import { printString } from '../lib/pretty-print';
import { getOutputFilePath } from '../lib/get-output-file-path';

import { writeFile } from '../lib/write-file';
import { getFileContent } from '../lib/services/get-file-content';
import { genCode } from '../lib/gen-code';
import { FileContent } from '../lib/models/file-content';
import { saveCurrentFile } from '../lib/file-paths-storage';

export async function processServicesAndComponents(file: any, index: string): Promise<any> {
    saveCurrentFile(file);

    // Read and parse the file's code
    let ast = getSourceFile(file);
    const fileContent: FileContent | undefined = getFileContent(ast);

    if (!fileContent) {
      vscode.window.showErrorMessage(`(${index}): "${path.basename(file.path)}" has errors and was not migrated`); 
      return file;
    }

    // Now we are modifying the AST
    let code = genCode(fileContent);

    // Do a bunch of string replacements
    code = processStringReplacements(code);

    // Try and clean up the formatting some
    code = printString(code);

    // Write it out
    const outputFilePath = getOutputFilePath(file);
    writeFile(outputFilePath, code);

    console.log(`Converted: ${path.basename(file.path)}`);
    vscode.window.showInformationMessage(`(${index}): Finished processing the "${path.basename(file.path)}" file`);
  }

