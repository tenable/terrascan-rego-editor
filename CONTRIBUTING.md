# How to Contribute

We'd love to accept your documentation, blogs, bugs, and fixes as contributions to this project. There are
just a few small guidelines you need to follow.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Setting up Terrascan Rego Editor for local development

To develop `terrascan-rego-editor`, you'll need the following installed in your system: Node, NPM, VS Code, git.

Follow these steps after you install the required packages:
1. Fork the `terrascan-rego-editor` repo on GitHub.
2. Clone your fork locally
```
    $ git clone git@github.com:your_name_here/terrascan-rego-editor.git
```
3. Create a branch for local development:
```
    $ git checkout -b name-of-your-bugfix-or-feature
```
   Now you can make your changes locally.
4. Install the package dependencies by running `npm install`
5. Compile the code by running `tsc -p ./` or `npm run compile`
6. You can press F5 on VS Code to start debugging the extension
7. To create a VS Code .vsix package for the extension, run `npm install -g vsce` and then `vsce package`.

## Community Guidelines

This project follows the
[Terrascan Code of Conduct](https://github.com/accurics/terrascan/blob/master/code_of_conduct.md).
