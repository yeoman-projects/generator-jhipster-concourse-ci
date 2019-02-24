const chalk = require('chalk');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const packagejs = require('../../package.json');
// const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            //            init(args) {
            //                if (args === 'default') {
            //                    // do something when argument is 'default'
            //                }
            //            },
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterAppConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Missing .yo-rc.json or not a valid JHipster per data inside the .yo-rc.json.');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster concourse ci')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            }
        };
    }

    prompting() {
        this.props = {
            overridePipeline: true,
            overrideTask: true,
        };
        if (this.fs.exists(this.destinationPath('ci/concourse/pipeline.yml'))) {
            const prompts = [
                {
                    type: 'confirm',
                    name: 'overridePipeline',
                    message: 'Would you like to override existing Concourse CI pipeline file?',
                    default: true
                }
            ];

            const done = this.async();
            this.prompt(prompts).then((props) => {
                this.props = props;
                // To access props later use this.props.someOption;
                done();
            });
        }

        if (this.fs.exists(this.destinationPath('ci/concourse/tasks'))) {
            const prompts = [
                {
                    type: 'confirm',
                    name: 'overrideTask',
                    message: 'Would you like to override existing Concourse CI gradle task files?',
                    default: true
                }
            ];

            const done = this.async();
            this.prompt(prompts).then((props) => {
                this.props = props;
                done();
            });
        }
    }

    writing() {
        if (this.props.overridePipeline) {
            this.fs.copy(
                this.templatePath('pipeline.yml'),
                this.destinationPath('ci/concourse/pipeline.yml')
            );
            this.log('Concourse CI pipeline file has been created successfully.');
        }
        if (this.props.overrideTask) {
            this.fs.copy(
                this.templatePath('gradle-task.yml'),
                this.destinationPath('ci/concourse/tasks/gradle-task.yml')
            );
            this.fs.copy(
                this.templatePath('gradle-task.sh'),
                this.destinationPath('ci/concourse/tasks/gradle-task.sh')
            );

            this.log('Concourse CI pipeline tasks have been created successfully.');
        }
    }

    end() {
        this.log('End of generator-jhipster-concourse-ci generator');
    }
};
