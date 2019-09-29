# unpkg-package-manager

> offline first, fast af, package manager for the web

## Principles

- no semantic versioning (all versions are exact always)
- no dependency resolution (add all your deps as top level deps)
- downloads minimal set of files, manually specify additional in `upm.yml` if needed

## Usage

### `init`

- creates `upm.yml` file with defaults
- reads dependencies from `package.json` if one exists

### `install`

- installs dependencies and creates `upm-lock.yml` file.
- just install dependencies if `upm-lock.yml` exists

### `update`

- update all dependencies to their latest version
- update one dependency if an argument is provided

## Contributing

Scaffolded using [`tslib-cli`](https://www.npmjs.com/package/tslib-cli).

Run `yarn` or `npm install` in root folder to setup your project.

### Available Commands:

```bash
yarn build # builds the package
yarn test # run tests for the package
yarn coverage # run tests and generate coverage reports
yarn pub # publish to NPM
yarn format # prettier format
yarn lint # lint pkg files
yarn setup # clean setup
```

## License

`**unpkg-package-manager**` is licensed under the [MIT License](http://opensource.org/licenses/MIT).<br>
Documentation is licensed under [Creative Common License](http://creativecommons.org/licenses/by/4.0/).<br>
Created with ♥ by [@osdevisnot](https://github.com/osdevisnot) and [all contributors](https://github.com/osdevisnot/unpkg-package-manager/graphs/contributors).
