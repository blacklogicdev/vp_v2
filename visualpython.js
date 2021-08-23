/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : visualpython.js
 *    Author          : Black Logic
 *    Note            : Visual Python main module
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Set require.config
//============================================================================
require.config({
    paths: { 
        'vp_base': '../nbextensions/visualpython'
    }
});

//============================================================================
// Load extension
//============================================================================
define([
    'base/js/namespace',
    'base/js/events',
    'vp_base/js/loadVisualpython',
    'vp_base/js/com/com_const'
], function (Jupyter, events, loadVisualpython, com_const) {
    "use strict";

    //========================================================================
    // Define Variable
    //========================================================================
    // Constant
    const origin = window.location.origin;
    const connectorAddress = `${origin}` + com_const.PATH_SEPARATOR + com_const.BASE_PATH;

    //========================================================================
    // Internal call function
    //========================================================================
    /**
     * Load main style
     */
    var _load_css = function () {

        // main css
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl(connectorAddress + com_const.STYLE_PATH + 'main.css');
        document.getElementsByTagName("head")[0].appendChild(link);

        // root css
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl(connectorAddress + com_const.STYLE_PATH + 'root.css');
        document.getElementsByTagName("head")[0].appendChild(link);

        // common component css
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl(connectorAddress + com_const.STYLE_PATH + 'component/common.css');
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    /**
     * Initialize Visual Python
     */
    var _init_vp = function () {
        // Read configuration, then call Initialize Visual Python
        Jupyter.notebook.config.loaded.then( function () {
            var cfg = loadVisualpython.readConfig();
            loadVisualpython.initVisualpython(cfg);
        });
    };

    //========================================================================
    // External call function
    //========================================================================
    /**
     * Load jupyter extenstion
     */
    var load_ipython_extension = function () {

        _load_css();

        // Wait for the jupyter notebook to be fully loaded
        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
            // This tests if the notebook is fully loaded
            console.log("[vp] Notebook fully loaded -- vp initialized ")
            _init_vp();
        } else {
            console.log("[vp] Waiting for notebook availability")
            events.on("notebook_loaded.Notebook", function () {
                console.log("[vp] Visual Python initialized (via notebook_loaded)")
                _init_vp();
            })
        }
    };

    return { load_ipython_extension: load_ipython_extension };

}); /* function, define */

/* End of file */
