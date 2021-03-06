'use strict';


/**
 * <h1> Configuration file.</h1>
 *
 *
 * public configuration goes under "publicConfiguration" variable.
 * private configuration gets defaults at "privateConfiguration" variable.
 *
 * overrides are at me.conf.
 *
 * overriding logic is:
 *
 * <li> Public - looks for keys it has </li>
 * <li> Private - first we merge it with public (we assume no overrides here ) and then we meConf. We do not filter keys  </li>
 *
 *
 * <h1> Conventions</h1>
 * <p>
 *      null value means the property is optional
 * </p>
 * <p>
 *      undefined means the property is required
 * </p>
 *
 * <h1> meConf.js </h1>
 *
 * <p>
 *     The idea behind "meConf" is that your vcs ignores it.<br/>
 *     meConf should export a simple json with the key-values it wants to override.<br/>
 * </p>
 *
 * <h2> Serving the public configuration </h2>
 * <p>
 *     This module exposes a route to serve public configuration for the front-end. <br/>
 *     The name of the global variable is passed by the request. by default it is conf<br/>
 * </p>
 *
 */


var publicConfiguration = {
    widgetServer: "launch.cloudifysource.org",
    widgetServerProtocol:"http",
    widgetServerPort:null,
    mixpanelCode: null,
    googleAnalyticsCode: null,
    googleAnalyticsDomain: null
};

var privateConfiguration = {
    port:9001,
    authToken:undefined,
    userId:undefined,
    log4js:{
        appenders: [
            { "type":"console" },
            {
                "type": "file",
                "filename": "logs/application.log",
                "maxLogSize": 20480,
                "backups": 3
            }
        ],
        replaceConsole: true
    },
    feedbackMail: "example@domain.com",
    mailUser: 'my@email.com',
    mailPass: 'password123',
    useExpressLogger: true,
    cookieSecret: undefined,
    useVerboseErrors: true
};




/*************************************************************************************/
/*************************************************************************************/
/************************** Initialization Code - Don't Touch ************************/
/*************************************************************************************/
/*************************************************************************************/


var meConf = null;
try{
    meConf = require("../conf/dev/meConf");
}catch( e ) { console.log("meConf does not exist. ignoring.. " + e)}




var publicConfigurationInitialized = false;
var privateConfigurationInitialized = false;

function getPublicConfiguration(){
    if (!publicConfigurationInitialized) {
        publicConfigurationInitialized = true;
        if (meConf != null) {
            for (var i in publicConfiguration) {
                if (meConf.hasOwnProperty(i)) {
                    publicConfiguration[i] = meConf[i];
                }
            }
        }
    }
    return publicConfiguration;
}


function getPrivateConfiguration(){
    if ( !privateConfigurationInitialized ) {
        privateConfigurationInitialized = true;

        var pubConf = getPublicConfiguration();

        if ( pubConf != null ){
            for ( var j in pubConf ){
                privateConfiguration[j] = pubConf[j];
            }
        }
        if ( meConf != null ){
            for ( var i in meConf ){
                privateConfiguration[i] = meConf[i];
            }
        }
    }
    return privateConfiguration;

}


exports.sendPublicConfiguration = function( req, res ){
    var name = req.param("name") || "conf";

    res.send( "window." + name + " = " + JSON.stringify(getPublicConfiguration()) + ";");
};


var prConf = getPrivateConfiguration();
if ( prConf != null ){
    for ( var i in prConf ){
        if ( prConf[i] === undefined ){

            throw new Error("undefined configuration [" + i + "]");
        }
        exports[i] = prConf[i];
    }
}


return exports;


