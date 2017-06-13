const reporters = require('jasmine-reporters');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

// Do not run TC reporter if not run in TC.
if( process.env.TEAMCITY_VERSION ){
    jasmine.getEnv().addReporter(new reporters.TeamCityReporter());
}

jasmine.getEnv().addReporter( new reporters.TerminalReporter({
    consolidateAll: false,
    verbosity: 3,
    color: true
}));
