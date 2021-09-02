# Release Checklist

This file provides a guideline on steps to take when releasing a new version of this project.

## Update Changelog

Update the [CHANGELOG.md](CHANGELOG.md) with notes for the new version. Follow this format when updating the changelog:

```
		vX.X.X (YYYY-MM-DD)
		_______________________________________________________
		BUG FIXES:
            * List of all the bug fixes made in the release
		FEATURES:
            * List of all the new features added in the release
		ENHANCEMENTS:
            * List of all the enhancements done in the release
		UPDATES:
            * List of updates done in the release
```

## Update package.json

Bump version referenced in the [package.json](package.json#L5) file to match the version number about to be released.

## Push Tag

Create and push a new git tag. The tag name should follow the format: `vX.X.X` where `X.X.X` corresponds to the version number on the [package.json](package.json#L5) file.

```
git pull
git tag vX.X.X
git push --tags
```

After you push the git tag, the release GitHub workflow will automatically create a new GitHub release. This workflow publishes the source code and `vsix` package and adds the release to the VSCode marketplace.
