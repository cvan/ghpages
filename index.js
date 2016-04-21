'use strict';
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var ghpages = require('gh-pages');

var CWD = process.cwd();

function lower (str) {
  return (str || '').toLowerCase().trim();
}

function getCacheDir (ghUser, ghRepo, ghBranch) {
  var pathAbsolute = path.resolve(
    __dirname, '.cache', lower(ghUser), lower(ghRepo), lower(ghBranch));
  return path.relative(CWD, pathAbsolute);
}

module.exports = function (opts, cb) {
  getRepoUrl(opts).then(function (repoUrl) {
    console.log('Deploying %j', opts);
    deploy(repoUrl);
  });

  function deploy (repoUrl) {
    var promsWhenDone = [];

    var src = path.resolve(opts.root_path, opts.path);
    // TODO: Copy files over to a temp src directory.

    var cnamePath = path.join(src, 'CNAME');

    // Add a `CNAME` file in the directory before we push.
    if (opts.domain && !fs.existsSync(cnamePath)) {
      fs.writeFile(cnamePath, opts.domain, function (err) {
        if (err) { throw err; }
        console.log('wrote %s', cnamePath);
      });
      console.log('writing')
      promsWhenDone.push(new Promise(function (resolve, reject) {
        fs.unlinkSync(cnamePath);
      }));
    }

    console.log('Publishing from %s to %s', src, gh.repoUrl);

    if (opts.force) {
      // Wipe out the checkout from scratch every time.
      ghpages.clean();
    }

    ghpages.publish(src, {
      clone: gh.cloneUrl,
      repo: gh.repoUrl,
      dotfiles: false,
      logger: console.log.bind(console)
    }, function (err) {
      Promise.all(promsWhenDone).then(done).catch(done);
      function done () {
        cb(err, gh);
      }
    });
  }
};
