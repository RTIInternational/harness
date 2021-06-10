# harness
harness is a plugin for the Vue.js framework for building dashboards. The harness plugin allows you to define pages in your app as simple Javascript classes, and uses those page definitions to programatically generate dashboards.

The harness plugin relies on the following libraries:
* [Vue](https://vuejs.org) (with [Vuex](https://vuex.vuejs.org) and [Vue Router](https://router.vuejs.org))
* [Vue CLI](https://cli.vuejs.org)

[![pipeline status](https://cds-mallard-web.rti.org/harness/harness/badges/master/pipeline.svg)](https://cds-mallard-web.rti.org/harness/harness/-/commits/master)


[![coverage report](https://cds-mallard-web.rti.org/harness/harness/badges/master/coverage.svg)](https://cds-mallard-web.rti.org/harness/harness/-/commits/master)



## Installation
Install via yarn. Make sure your project root has a `.yarnrc` file that contains the following line:
```
"@harness:registry" "http://verdaccio.cds-mallard.rtp.rti.org"
```

Then simply run:
```
yarn add @harness/harness
```
Add the plugin to your Vue instance in `main.js`:
```
import harness from '@harness/harness'

Vue.use(harness, {store, router})
```

Add a router view to your main app template:
```
    <router-view :key="$route.name"/>
```

Access each of your page files by their route. For example, given a page named `page1`, visiting `{{app_url}}/page1` would display that page in the `router-view` component.

Continue to the next section to see how to create your page files for use with this app.


## Tutorials and API Documentation
Located here: http://harness.sif.rtp.rti.org

## Contributor's Guide

### Local Development
For local development, please use the [harness starter template](http://gitlab.rtp.rti.org/harness/harness-starter-template). The starter template is a basic app with very simple filters and data. By checking out the `package-dev` branch and running the `dev-setup.sh` script, it will install harness and harness-ui locally so that your development changes are applied in realtime.

It is not recommended to use a local version of harness while developing a project, for two reasons. First, it is difficult to learn a tool when you have the option to change how a tool works. Often there is a simple way to make your feature work as-is, rather than change existing tooling to make your feature work. This is a core thought process in harness - keeping functionality project-agnostic. Second, developing features in harness locally in a project can lead to project-specific uses that may cause problems in other projects that use this plugin. For that reason, it is recommended to develop against the generic starter template and write good tests, rather than try it in an existing project and assume that it will work in others.

### Development Ideology
harness is driven by project-first development. Rather than develop new features for harness as we come up with ideas, new features should be created and polished in projects then proposed for inclusion in harness. This ensures that all features in harness are well-formed, have been targeted for inclusion across multiple projects and therefore don't bloat the plugin, and have been demonstrated working.

If a feature in your application seems like a good fit to add to harness, discuss it with the team prior to adding it to the plugin.

### Development Workflow
harness is adherent to [semvar 2.0](https://semver.org/). This is critical for the utility of the plugin, as it is in use across multiple projects that rebuild with CI over time, but may not have the hours to refactor and accomodate new changes. Currently, we use yarn/npm to manage versions.

New features and changes should be included in a merge request tagging Alex Harding, and should include new tests or alteration to existing tests to ensure that the new feature works as intended. All new functions added to the `hs` class should have documentation updated to include the new feature.

### CI, Deployment and Infrastructure
Gitlab CI runs linter and tests.

harness is installable via NPM using a public verdaccio registry hosted on mallard. This is available at http://verdaccio.cds-mallard.rtp.rti.org. While this is a public registry, mallard is only accessible within the RTI network - that means that in order to install harness via NPM/Yarn, you not only need a .npmrc or .yarnrc file with the redirect, but you also need to be on pulse secure or on campus.

To build a new version of harness, run `yarn run build-bundle`, which will create a new dir named `dist` that includes a fully packaged version of harness. 

Publishing new versions of that dist directory to the registry is handled using yarn - specifically `yarn publish --registry http://verdaccio.cds-mallard.rtp.rti.org` using either the `--major`, `--minor` or `--patch` flags. For help with choosing a flag, read about [semantic versioning](https://semver.org/#summary). These flags not only version the registry and the `package.json` file, they also commit a tag with the new version to git - so be sure to push that change once you publish.

Credentials for registry are the username `harness` with the typical cds password.

### Documentation and Documentation Hosting
harness uses [jsdoc3](https://jsdoc.app/) to automatically generate API documentation for the `hs` class, as well as tutorial content. The documentation contents are in this application under `/docs`. Running the `build-docs.sh` script in this directory will compile the HTML for the documentation in a directory named `out`, and compress it into a tarball to copy to sif.

The harness documentation is served on sif using [node http-server](https://www.npmjs.com/package/http-server) on port 5196, with a proxy in nginx mapping http://harness.sif.rtp.rti.org to http://sif.rtp.rti.org:5196. In order to update documentation, simply replace the `out` directory on sif located at `/home/alexharding/out` with the new output. For example, the following steps:

* run `build-docs.sh` under `/docs/` `bash docs/build-docs.sh`
* copy `docs.tar.gz` to sif `scp docs/docs.tar.gz <username>@sif.rtp.rti.org:/home/alexharding/docs.tar.gz`
* log in to sif `ssh <username>@sif.rtp.rti.org`
* navigate to directory `cd /home/alexharding`
* remove the old directory `rm -rf out`
* unpack the new directory `tar -xzvf docs.tar.gz`

To run the webserver if it is down, navigate to `/home/alexharding/out` and run `http-server . -p 5196 &`

### Overview For Adding a New Feature
1. Create changes (code, tests, documentation)
1. Create merge request tagging Alex Harding
1. After request gets merged into `master`, pull the latest from `master``
1. Run `yarn build-bundle`
1. Run `yarn publish` (with appropriate flag)
1. Push to `master`
1. Push update documentation to sif
