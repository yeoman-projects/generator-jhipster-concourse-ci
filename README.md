# generator-jhipster-concourse-ci
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> JHipster module, Generates concourse pipelines for a JHipster project

# Introduction

This is a [JHipster](http://jhipster.github.io/) module, that is meant to be used in a JHipster application to generate [concourse ci](https://concourse-ci.org/) configuration files.

# Prerequisites

As this is a [JHipster](http://jhipster.github.io/) module, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://jhipster.github.io/installation.html)

# Installation

## With Yarn

To install this module:

```bash
yarn global add generator-jhipster-concourse-ci
```

To update this module:

```bash
yarn global upgrade generator-jhipster-concourse-ci
```

## With NPM

To install this module:

```bash
npm install -g generator-jhipster-concourse-ci
```

To update this module:

```bash
npm update -g generator-jhipster-concourse-ci
```

# Usage

To generate the concourse ci pipeline and tasks for current JHipster project, just run the following command from the project folder. 

```bash
yo jhipster-concourse-ci
```
The expectation is that [the credential store(eg: credhub)](https://concourse-ci.org/creds.html) is populated with the following properties accessible to the pipeline:

1. Always:
    GIT_SSH_KEY to include the private key
1. If using semver:
    AWS_REGION
    AWS_ACCESS_KEY
    AWS_SECRET_ACCESS_KEY
1. If using slack:
    SLACK_WEBHOOK


# Testing

This generator was tested with a project generated using JHipster 5.0.0 and with concourse 4.3.1
To test your pipeline locally before pushing to your corporate concourse, you could test by installing
concourse and credhub locally on virtualbox using [bucc](https://concoursetutorial.com/basics/secret-parameters/). 
Set the appropriate credhub entries as follows:

```bash
credhub set -n /concourse/main/GIT_SSH_KEY --type=certificate -p <path to your git ssh private key>
credhub set -n /concourse/main/AWS_REGION --type=value <aws region>
credhub set -n /concourse/main/AWS_ACCESS_KEY --type=value <aws access key>
credhub set -n /concourse/main/AWS_SECRET_ACCESS_KEY --type=value <aws secrett>
credhub set -n /concourse/main/SLACK_WEBHOOK --type=value <slack webhook>
```
# License

Apache-2.0 © [Anoop Gopalakrishnan](www.github.com/anoop2811)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-concourse-ci.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-concourse-ci
[travis-image]: https://travis-ci.org/anoop2811/generator-jhipster-concourse-ci.svg?branch=master
[travis-url]: https://travis-ci.org/anoop2811/generator-jhipster-concourse-ci
[daviddm-image]: https://david-dm.org/anoop2811/generator-jhipster-concourse-ci.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/anoop2811/generator-jhipster-concourse-ci
