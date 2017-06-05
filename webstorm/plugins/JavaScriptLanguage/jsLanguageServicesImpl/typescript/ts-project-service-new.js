"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var logger_impl_1 = require("./logger-impl");
function extendProjectServiceNew(TypeScriptProjectService, ts_impl, host, projectEmittedWithAllFiles) {
    if (!overrideParseJsonConfigFileContent(ts_impl)) {
        return;
    }
    util_1.extendEx(TypeScriptProjectService, "convertConfigFileContentToProjectOptions", function (oldFunction, args) {
        if (!oldFunction) {
            logger_impl_1.serverLogger("ERROR: method convertConfigFileContentToProjectOptions doesn't exist", true);
            return;
        }
        var options = oldFunction.apply(this, args);
        if (options) {
            if (options.projectOptions) {
                logger_impl_1.serverLogger("Updated compileOnSave");
                //By default ts service consider compileOnSave === undefined -> compileOnSave == false
                //we need override this behaviour
                if (options.projectOptions.compileOnSave == null) {
                    options.projectOptions.compileOnSave = true;
                }
                if (options.projectOptions.compilerOptions) {
                    options.projectOptions.compilerOptions.___processed_marker = true;
                }
            }
        }
        return options;
    });
}
exports.extendProjectServiceNew = extendProjectServiceNew;
function overrideParseJsonConfigFileContent(ts_impl) {
    var parseJsonConfigFileContentOld = ts_impl.parseJsonConfigFileContent;
    if (!parseJsonConfigFileContentOld) {
        return false;
    }
    ts_impl.parseJsonConfigFileContent = function () {
        var jsonOption = arguments[0];
        if (!ts_impl.hasProperty(jsonOption, ts_impl.compileOnSaveCommandLineOption.name)) {
            logger_impl_1.serverLogger("No compileOnSave — return true");
            jsonOption.compileOnSave = true;
        }
        return parseJsonConfigFileContentOld.apply(this, arguments);
    };
    return true;
}
