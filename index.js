var vm = require('vm');
var path = require('path');
// const matchesReq = require('match-requires');

// const requireRegexp = /(?:(?:\\['"`][\s\S])*?(['"`](?=[\s\S]*?require\s*\(['"`][^`"']+?[`'"]\)))(?:\\\1|[\s\S])*?\1|\s*(?:(?:var|const|let)?\s*([_.\w/$]+?)\s*=\s*)?require\s*\(([`'"])((?:@([^/]+?)\/([^/]*?)|[-.@\w/$]+?))\3(?:, ([`'"])([^\7]+?)\7)?\);?)/g;
const requireRegexp = /require\((?:\s+)?['"](?<requireRequest>.+)['"](?:\s+)?\)/g;


// Executes the given module's src in a fake context in order to get the resulting string.
async function requireLoader(content) {
  try {
    this.async();

    // var query = loaderUtils.getOptions(this) || {};
    // var nodeRequireRegex = query.resolve && new RegExp(query.resolve, 'i');
    if (!content) return this.callback(null, content);

    // let foundedResources = content.match(requireRegexp);

    let foundedResources = [];
    let match;

    while ((match = requireRegexp.exec(content))) {
      foundedResources.push({
        matchedString: match[0],
        requireRequest: match.groups.requireRequest,
      });
    }

    if (!foundedResources.length) return this.callback(null, content);

    foundedResources = await Promise.all(foundedResources.map((resource) => new Promise((resolve, reject) => {
      const { requireRequest } = resource;
      const __webpack_public_path__ = this._compilation.options.output.publicPath || '';
      // var absPath = path.resolve(path.dirname(this.resourcePath), resourceRequest);
      this.loadModule(requireRequest, function (err, jsCode) {
        if (err) return reject(err);
        try {
          // run the imported module to get its (string) export
          var extractedString = runScript(jsCode, requireRequest, {
            __webpack_public_path__
          });
          resolve({ ...resource, jsCode, extractedString });
        } catch (e) {
          reject(e);
        }
      });
    })));


    foundedResources.forEach((foundedResource) => {
      try {
        const { matchedString, extractedString } = foundedResource;
        const re = new RegExp(require('lodash/escapeRegExp')(matchedString), 'g')
        content = content.replace(re, extractedString);
      } catch (e) {
        this.emitError(e)
      }
    });

    this.callback(null, content);
  } catch (e) {
    this.callback(e);
  }
}

module.exports = requireLoader;

function runScript(src, filename, context) {

  src = src.replace('export default', 'module.exports=');

  var script = new vm.Script(src, {
    filename: filename,
    displayErrors: true
  });

  var sandbox = Object.assign({
    module: {},
    exports: {},
  }, context);
  sandbox.module.exports = sandbox.exports;

  script.runInNewContext(sandbox);

  return sandbox.module.exports.toString();
}
