const config = require('../config');
const path = require('path');
const TestHelper = require('../lib/functions');

let Th = new TestHelper();
let projectPath = path.join(config.pathToReactorProjects, '/packages/reactor-conference-app');

xdescribe('Test Conference app building', () => {

    beforeAll((done) => {
        Th.ensurePackageFolderInstall();
        done();
    });

    beforeEach((done)=>{
        Th.runClean(projectPath);
        done();
    });

    it('Run build', (done) => {
        let result = Th.runExec('npm run build', projectPath);
        result =  Th.checkTheExecOutput(result);
        expect(result.ok).toBe(true);
        done();
        Th.log('info','');
    });

    it('Run production', (done) => {
        let result = Th.runExec('npm run prod', projectPath);
        result = Th.checkTheExecOutput(result);
        expect(result.ok).toBe(true);
        done();
    });

});


