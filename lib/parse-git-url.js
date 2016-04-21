var findUp = require('find-up');
var ghUrl = require('parse-github-url');
var gitconfig = require('gitconfiglocal');
var Promise = require('pinkie-promise');

var CWD = process.cwd();

function gracefulRequire (module) {
  try {
    return require(module);
  } catch (e) {
    return {};
  }
}

function getDeepKey (key) {
  try {
    return key;
  } catch (e) {
  }
}

function getRepoUrl (opts) {
  var proms = [
    Promise.resolve(process.env.GHPAGES_REPO),
    Promise.resolve(opts.repo),
    new Promise(function (resolve) {
      // Find the closest `package.json` so we can use the `repository` key.
      findUp('package.json').then(function (pkgFn) {
        if (pkgFn === null) {
          console.warn(new Error('Expected to find a `package.json` in a parent directory.'));
          return;
        }

        opts.pkg = pkgFn;
        opts.root_path = path.dirname(pkgFn);
        var pkg = gracefulRequire(pkgFn);
        var pkgRepo = pkg.repository || '';
        if (pkgRepo) {
          console.warn(new Error('Expected a valid `repository` in the `package.json`.'));
        }
        resolve(typeof pkgRepo === 'string' ? pkgRepo : pkgRepo.url);
      });
    }),
    new Promise(function (resolve) {
      console.log('x1');
      setTimeout(function () {

      gitconfig(opts.root_path, function (err, config) {
        if (err) {
          console.warn('gitconfig error: ' + err);
          return;
        }

        var repoUrl = getDeepKey(config.remote.origin.url);
        if (repoUrl) {
          resolve(repoUrl);
          return;
        }

        console.warn(new Error('Expected a valid `remote.origin.url` in the Git repo.'));
      });

      }, 10);
    }),
    Promise.resolve(CWD)
  ];


  return new Promise(function (resolve, reject) {
    Promise.all(proms).then(function (value) {
      console.log('=> value', value);

      // Reconstruct the URL to the GitHub repo.
      // return parseRepo(repoURL);

      // if (value) {
      //   resolve(value);
      // }
    }).catch(function (err) {
      console.error(err.stack);
    }).then(function () {
      // TODO: TEST
      reject('Could not find any valid repo URLs.')
    });
  });
}

function parseRepo (repo) {
  var gh = ghUrl(repo);

  if (repo.indexOf('/') === -1) {
    // If it doesn't contain a `/` (e.g., `cvan/gh-pages`),
    // we assume it's a user's fork (e.g., `potato` -> `potato/gh-pages`).
    gh.user = repo;
    gh.repopath = gh.user + '/' + gh.repo;  // Patch.
  } else {
    // Otherwise, assume it's a parsable Git(Hub) URL.
  }

  gh.branch = 'gh-pages';
  gh.repoUrl = 'git@github.com:' + gh.repopath + '.git';
  gh.ghPagesUrl = 'https://' + gh.user + '.github.io/' + gh.repo + '/';

  gh.cloneUrl = getCacheDir(gh.user, gh.repo, gh.branch);

  return gh;
}
