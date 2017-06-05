var path = require('path')
  , Tree = require('./protractor-intellij-tree')
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , intellijUtil = require('./protractor-intellij-util');

var tree = new Tree(process.pid, process.stdout.write.bind(process.stdout));

var browserNode;
var processedConfig;

exports.setup = function() {
  var browser = protractor.browser;
  if (browser == null) {
    // In protractor@2, global.protractor doesn't have 'browser' property
    browser = global.browser;
  }
  return browser.getProcessedConfig().then(function (config) {
    processedConfig = config;
    var multi = config.multiCapabilities && config.multiCapabilities.length > 1;
    return browser.getCapabilities().then(function(capabilities) {
      var browserName = capabilities.get('browserName');
      var browserVersion = capabilities.get('version');
      var browserNameAndVersion = (browserName || 'unknown browser') + ' ' + (browserVersion || '');
      if (multi) {
        browserNode = tree.root.addTestSuiteChild(browserNameAndVersion, 'browser', null);
        browserNode.start();
      }
      else {
        var originalConfigFilePath = require('./protractor-intellij-cli').getConfigFile();
        tree.updateRootNode(path.basename(originalConfigFilePath), browserNameAndVersion, 'file://' + originalConfigFilePath);
        browserNode = tree.root;
      }
      browserNode.suiteMap = {};
    });
  });
};

var attachedToFramework = false;

exports.onPrepare = function() {
  if (processedConfig.framework === 'jasmine' || processedConfig.framework === 'jasmine2') {
    attachedToFramework = require('./protractor-intellij-jasmine-reporter').tryAttachReporter(browserNode);
  }
  else if (processedConfig.framework === 'mocha') {
    attachedToFramework = false;
  }
};

function getChildByName(obj, name) {
  return hasOwnProperty.call(obj, name) ? obj[name] : null;
}

exports.postTest = function(passed, testInfo) {
  if (attachedToFramework) return;
  var suiteName = testInfo.category;
  if (suiteName == null) return;
  var suiteNode = getChildByName(browserNode.suiteMap, suiteName);
  if (suiteNode == null) {
    suiteNode = browserNode.addTestSuiteChild(suiteName, 'suite', suiteName);
    browserNode.suiteMap[suiteName] = suiteNode;
    suiteNode.start();
    suiteNode.testMap = {};
  }
  var testName = testInfo.name;
  if (testName == null) return;
  var testNode = suiteNode.addTestChild(testName, 'test', intellijUtil.joinList([suiteName, testName], 0, 2, '.'));
  testNode.start();
  testNode.setOutcome(passed ? Tree.TestOutcome.SUCCESS : Tree.TestOutcome.FAILED,
                      testInfo.durationMillis, passed ? null : '', null, null, null, null, null);
  testNode.finish(false);
};

exports.teardown = function() {
  if (!attachedToFramework) {
    browserNode.children.forEach(function (suiteNode) {
      suiteNode.finish(false);
    });
  }
  browserNode.finish(true);
};
