const exec = require('sync-exec');
const config = require('/home/meca/Sencha/git-CMD/cmdTesting/test/config');
const path = require('path');
const fs = require('fs-extra');
const winston = require('winston');
const npmLogin = require('npm-cli-login');

class TestHelper {

    /**
     * Constructor prepares the logger
     */
    constructor(){
        winston.level = config.logLevel;
        this.log = winston.log;
    }


    /**
     * Detects the errors in the stdout string
     * @param data
     * @returns {{ok: boolean, error: Array}}
     */
    testStdoutForErrors(data) {
        let ok = true,
            error = [];

        let errors = ['ERR', 'Error', 'error', 'err', 'exception'];

        errors.map((err) => {
            if (data.includes(err)) {
                ok = false;
                // TODO: Add smart error extraction
                error.push(data);
            }
        });

        return {ok: ok, error: error};
    }


    /**
     *
     * @param data
     * @returns {{ok: boolean, error: Array}}
     */
    checkTheExecOutput(data) {
        if (!(data instanceof Object)) {
            this.log('error', `${data} should be object`);
            return {ok: false, error: []};
        }
        let ok = true,
            error = [],
            status = data.status,
            stderr = data.stderr,
            output = data.stdout;

        expect(data.stderr).toBe('');
        expect(status).toBe(0);

        if (status !== 0) {
            ok = false;
            this.log('debug', `The command failed, output: ${output}`);
        }

        if (stderr !== '') {
            error.push(stderr);
            ok = false;
        }

        /*
         All the errors should be detected by status code or in stderr,
         but we can extra test it just to be safe
         */
        let result = this.testStdoutForErrors(output);
        if (!result.ok) {
            ok = false;
            error.push(result.error);
        }
        return {ok: ok, error: error};
    }


    runExec(command, path, checkTheOutput = true) {
        this.log('info', `Running "${command}" in cwd "${path}"`);
        let result = exec(command, {cwd: path});
        this.log('debug', `The command output status: ${result.status}`);
        if(checkTheOutput){
            this.checkTheExecOutput(result);
        }
        return result;
    }

    runClean(path) {
       this.runExec('npm run clean', path);
    }

    extjsRegistryLogin(u = config.defaultUser.username, p = config.defaultUser.password, email = config.defaultUser.email){
        // TODO: Is this enough for cleaning the registry?
        // TODO: Fix the login
        //this.runExec('npm cache clean', config.pathToReactorProjects);
        //this.runExec('npm logout --registry=http://npm.sencha.com --scope=@extjs',  config.pathToReactorProjects);

        // This should log us into the registry without a need for STDIN
        // npm login --registry=http://npm.sencha.com --scope=@extjs
        //this.log('info', `Logging into the regisry as ${u}`);
        //npmLogin(u, p, email, 'http://npm.sencha.com', '@extjs');


        let result = this.runExec('npm whoami --registry=http://npm.sencha.com --scope=@extjs', config.pathToReactorProjects);
        this.log('info', `Logged in as "${result.stdout}"`);
        //TODO: Expect the user logged as the one we log in with
    }

    checkThePackageVersion(npmPackage, expectedVersion, path){
        this.log('info',`Checking the ${npmPackage} version which should be ${expectedVersion}`);
        let result = this.runExec(`npm list ${npmPackage}`, path);
        let haveIt = result.stdout.contains(`${npmPackage}@${expectedVersion}`);
        expect(haveIt).toBe(true);
        return haveIt;
    }

    checkTheReactVersion(path, expectedVersion = config.reactorVersion){
        let result = this.checkThePackageVersion('@extjs/reactor', expectedVersion, path);
        return result;
    }

    // TODO: Can't use monorepo install because can't update the reactor to the nightly version because of the symlink ?
    ensureMonoRepoInstall(wipeModules = false, logIn = true){
        if(wipeModules){
            this.runExec('npm uninstall *', config.pathToReactorProjects);
            fs.removeSync('node_modules');
        }
        if(logIn){
            this.extjsRegistryLogin();
        }


        this.runExec('npm install', config.pathToReactorProjects);
        this.runExec('npm install @extjs/reactor@next', config.pathToReactorProjects);
    }

    /**
     * This function should ensure that the package folder is correctly installed
     * @param projectPath
     * @param wipeModules
     * @param logIn
     */
    ensurePackageFolderInstall(projectPath, wipeModules = true, logIn = true){
        if(wipeModules){
            try{
                fs.removeSync(path.join(projectPath, 'node_modules'));
            }catch(err) {
                this.log('error', err);
            }
        }

        if(logIn){
            this.extjsRegistryLogin();
        }

        this.runExec('npm install', projectPath);
        this.runExec('npm install @extjs/reactor@next', projectPath);
    }

}

module.exports = TestHelper;
