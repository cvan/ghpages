# ghpages

A command-line tool to easily deploy your current working branch to GitHub Pages.


## CLI Usage

```
Usage
  $ ghpages

Options
  -p, --path    Path (directory to push; defaults to current directory)
  -r, --repo    Repository (GitHub username, GitHub username/repo, full repo URL)
  -d, --domain  Domain name (for `CNAME` to create in GitHub Pages branch)
  -p, --path    Path or directory to publish. Defaults to root directory of project.
  -h, --help    Show help

Examples
  $ ghpages
  $ ghpages cvan
  $ ghpages cvan/blog
  $ ghpages cvan/blog -p dist
  $ ghpages git@github.com:cvan/blog.git
  $ ghpages -r cvan/blog -d blog.cvan.io
```


## License

[MIT](LICENSE)


## Credits

This utility mostly wraps the fantastic [`gh-pages` package](https://github.com/tschaub/gh-pages).
