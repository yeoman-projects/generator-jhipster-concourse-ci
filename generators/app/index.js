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
                this.baseName = this.jhipsterAppConfig.baseName;
                this.applicationType = this.jhipsterAppConfig.applicationType;
                if (!this.jhipsterAppConfig) {
                    this.error('Missing .yo-rc.json or not a valid JHipster per data inside the .yo-rc.json.');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster Concourse CI')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
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

    get configuring() {
        return {
            setTemplateConstants() {
                if (this.abort) return;
                if (this.cicdIntegrations === undefined) {
                    this.cicdIntegrations = [];
                }
            }
        };
    }

    prompting() {
        const integrationPrompts = [
            {
                type: 'input',
                name: 'applicationGitBaseUrl',
                message: `${chalk.yellow('*Application Git Base URLe*')}: what is the base git url of your application ?`,
                default: ''
            },
            {
                type: 'checkbox',
                name: 'cicdIntegrations',
                message: 'What tasks/integrations do you want to include?',
                default: [],
                choices: [
                    { name: `Analyze your code with ${chalk.yellow('*Sonar*')} (requires SONAR_TOKEN set in credhub service)`, value: 'sonar' },
                    { name: 'Publish built docker image?', value: 'publishDocker' },
                    { name: `Deploy to ${chalk.yellow('*Kubernetes*')} for staging (requires KUBERNETES_TOKEN set in credhub service)`, value: 'kubernetes' },
                    { name: 'Run acceptance tests after deploy to staging?', value: 'acceptanceTest' },
                    { name: 'Do you want to include semver versioning ?', value: 'semver' },
                    { name: 'Do you want to include slack notification for build failures ?', value: 'slack' }
                ]

            },
            {
                when: response => response.cicdIntegrations.includes('acceptanceTest'),
                type: 'input',
                name: 'acceptanceTestGitUrl',
                message: `${chalk.yellow('*Acceptance Test Module*')}: what is the git url of acceptance test module ?`,
                default: ''
            },
            {
                when: response => this.pipeline === 'jenkins' && response.cicdIntegrations.includes('sonar'),
                type: 'input',
                name: 'sonarName',
                message: `${chalk.yellow('*Sonar*')}: what is the name of the Sonar server ?`,
                default: 'sonar'
            },
            {
                when: response => this.pipeline !== 'jenkins' && response.cicdIntegrations.includes('sonar'),
                type: 'input',
                name: 'sonarUrl',
                message: `${chalk.yellow('*Sonar*')}: what is the URL of the Sonar server ?`,
                default: 'https://sonarcloud.io'
            },
            {
                when: response => this.pipeline !== 'jenkins' && response.cicdIntegrations.includes('sonar'),
                type: 'input',
                name: 'sonarOrg',
                message: `${chalk.yellow('*Sonar*')}: what is the Organization of the Sonar server ?`,
                default: ''
            },
            {
                when: response => response.cicdIntegrations.includes('publishDocker'),
                type: 'input',
                name: 'dockerRegistryURL',
                message: `${chalk.yellow('*Docker*')}: what is the URL of the Docker registry ?`,
                default: 'https://registry.hub.docker.com'
            },
            {
                when: response => response.cicdIntegrations.includes('publishDocker'),
                type: 'input',
                name: 'dockerRegistryCredentialsId',
                message: `${chalk.yellow('*Docker*')}: what is the Concourse Credentials ID for the Docker registry ?`,
                default: 'docker-login'
            },
            {
                when: response => response.cicdIntegrations.includes('publishDocker'),
                type: 'input',
                name: 'dockerRegistryOrganizationName',
                message: `${chalk.yellow('*Docker*')}: what is the Organization Name for the Docker registry ?`,
                default: 'docker-login'
            },
        ];

        let overridePrompts = [];
        if (this.fs.exists(this.destinationPath('ci/concourse/pipeline.yml'))) {
            overridePrompts = [...overridePrompts,
                {
                    type: 'confirm',
                    name: 'overridePipeline',
                    message: 'Would you like to override existing Concourse CI pipeline file?',
                    default: true
                }
            ];
        }

        if (this.fs.exists(this.destinationPath('ci/concourse/tasks'))) {
            overridePrompts = [...overridePrompts,
                {
                    type: 'confirm',
                    name: 'overrideTask',
                    message: 'Would you like to override existing Concourse CI gradle task files?',
                    default: true
                }
            ];
        }
        const prompts = [...overridePrompts, ...integrationPrompts];
        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            this.applicationGitBaseUrl = props.applicationGitBaseUrl;
            this.cicdIntegrations = props.cicdIntegrations;
            this.sonarName = props.sonarName;
            this.sonarUrl = props.sonarUrl;
            this.sonarOrga = props.sonarOrg;

            this.publishDocker = props.publishDocker;
            this.dockerRegistryURL = props.dockerRegistryURL;
            this.dockerRegistryCredentialsId = props.dockerRegistryCredentialsId;
            this.dockerRegistryOrganizationName = props.dockerRegistryOrganizationName;
            this.acceptanceTestGitUrl = props.acceptanceTestGitUrl;

            done();
        });
    }

    writing() {
        if (!Object.prototype.hasOwnProperty.call(this.props, 'overridePipeline') || this.props.overridePipeline) {
            this.template('pipeline.yml.ejs', 'ci/concourse/pipeline.yml');
            this.log('Concourse CI pipeline file has been created successfully.');
        }
        if (!Object.prototype.hasOwnProperty.call(this.props, 'overrideTask') || this.props.overrideTask) {
            this.template('gradle-task.yml.ejs', 'ci/concourse/tasks/gradle-task.yml');
            this.template('gradle-task.sh.ejs', 'ci/concourse/tasks/gradle-task.sh');
            this.log('Concourse CI pipeline tasks have been created successfully.');
        }
    }

    end() {
        this.log('End of generator-jhipster-concourse-ci generator');
    }
};
