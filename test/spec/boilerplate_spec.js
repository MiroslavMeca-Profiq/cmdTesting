const config = require('../config');
const path = require('path');
const TestHelper = require('../lib/functions');

let Th = new TestHelper();
let projectPath = path.join(config.pathToReactorProjects, '/packages/reactor-boilerplate');

describe('Test BoilerPlate Building', () => {

    beforeAll((done) =>{
        Th.ensurePackageFolderInstall(projectPath);
        Th.checkTheReactVersion(projectPath);
        done();
    });

    beforeEach((done)=>{
        Th.runClean(projectPath);
        done();
    });

    it('Run build', (done) => {
        Th.runExec('npm run build', projectPath);
        done();

    });

    xit('Run production', (done) => {
        Th.runExec('npm run prod', projectPath);
        done();
    });

});
