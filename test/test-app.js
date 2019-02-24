/* global describe, beforeEach, it */

const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const chaiAssert = require('chai').assert;


describe('JHipster generator generator-jhipster-concourse-ci', () => {
    describe('happy path', () => {
        beforeEach((done) => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withOptions({
                    testmode: true
                })
                .on('end', done);
        });

        it('generate concourse pipeline', () => {
            assert.file([
                'ci/concourse/pipeline.yml',
                'ci/concourse/tasks/gradle-task.yml',
                'ci/concourse/tasks/gradle-task.sh',
            ]);
        });
    });

    describe('missing .yo-rc.json', () => {
        it('throw error and recommend to run yarn manually', (done) => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/missing.yo-rc.json'), dir);
                })
                .on('error', (err) => {
                    chaiAssert.include(err.message, 'Missing .yo-rc.json');
                    done();
                });
        });
    });

    describe('already exist', () => {
        beforeEach(() => {
            this.concourseci = helpers
                .run(path.join(__dirname, '../generators/app'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/existing.pipeline.yml'), dir);
                });
        });

        describe('user choose to override existing files', () => {
            beforeEach((done) => {
                this.concourseci
                    .withPrompts({ overridePipeline: true, overrideTask: true })
                    .on('end', done);
            });

            it('override existing files', () => {
                assert.fileContent('ci/concourse/pipeline.yml', /resources/);
                assert.fileContent('ci/concourse/tasks/gradle-task.yml', /gradle/);
                assert.fileContent('ci/concourse/tasks/gradle-task.sh', /gradle/);
            });
        });
    });
});
