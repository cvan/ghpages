var path = require('path');
var spawn = require('child_process').spawn;

var ghpages = require('gh-pages');
var ghUrl = require('parse-github-url');

function lower (str) {
  return (str || '').toLowerCase().trim();
}

function getCacheDir (ghUser, ghRepo, ghBranch) {
  var pathAbsolute = path.resolve(
    __dirname, '.cache', lower(ghUser), lower(ghRepo), lower(ghBranch));
  return path.relative(process.cwd(), pathAbsolute);
}

module.exports = function (opts, cb) {
  var cwd = opts.dir || process.cwd();

  // Parse the project's `package.json` so we can use the `repository` key.
  var pkg = require(path.join(cwd, 'package.json'));
  var pkgRepo = pkg.repository || '';
  var pkgRepoUrl = typeof pkgRepo === 'string' ? pkgRepo : pkgRepo.url;
  if (!pkg || !pkgRepo) {
    return cb(new Error('Expected a valid `repository` in the `package.json`.'));
  }

  var gh = ghUrl(pkgRepoUrl);

  if (opts.repo) {
    if (opts.repo.indexOf('/') === -1) {
      // If it doesn't contain a `/`, we assume only the username is different.
      gh.user = opts.repo;
      gh.repopath = gh.user + '/' + gh.repo;
    } else {
      // Otherwise, assume it's a parsable Git(Hub) URL.
      gh = ghUrl(opts.repo);
    }
  }

  gh.branch = 'gh-pages';

  // TODO: Add a `CNAME` file in the directory before we push.
  // if (opts.domain) {
  //   fs.writeFileSync(path.join(opts.cwd, 'CNAME'), opts.domain);
  // }

  // Reconstruct the URL to the GitHub repo.
  gh.repoUrl = 'git@github.com:' + gh.repopath + '.git';
  gh.ghpagesUrl = 'https://' + gh.user + '.github.io/' + gh.repo + '/';

  var src = path.join(cwd, opts.path);

  console.log('Publishing from %s to %s', src, gh.repoUrl);

  ghpages.publish(path.join(cwd, opts.path), {
    clone: getCacheDir(gh.user, gh.repo),
    repo: gh.repoUrl,
    dotfiles: true,
    logger: console.log.bind(console)
  }, function (err) {
    cb(err, gh);
  });
};
