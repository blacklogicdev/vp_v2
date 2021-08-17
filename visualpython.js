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

/*------------------------------------------------------------------------*/
/* Load extension                                                         */
/*------------------------------------------------------------------------*/
define([
    'require',
    'jquery',
    'base/js/namespace',
    'base/js/events',
    'nbextensions/visualpython/src/vp', //FDNX: FIXME init_visualpython
    'nbextensions/visualpython/src/common/constant'  //FDNX: FIXME constant
], function (requirejs, $, Jupyter, events, vp, vpConst) {
    "use strict";

    /*--------------------------------------------------------------------*/
    /* Global variable                                                    */
    /*--------------------------------------------------------------------*/
    // constant
    const origin = window.location.origin;
    const connectorAddress = `${origin}` + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH;

    // import
    var IPython = Jupyter;
    var mode = 'dev';

    /*--------------------------------------------------------------------*/
    /* Function                                                           */
    /*--------------------------------------------------------------------*/
    /**
     * Load extenstion
     */
    var load_ipython_extension = function () {
        load_css();

        // Wait for the jupyter notebook to be fully loaded
        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
            // This tests if the notebook is fully loaded
            console.log("[vp] Notebook fully loaded -- vp initialized ")
            vp_init();
        } else {
            console.log("[vp] Waiting for notebook availability")
            events.on("notebook_loaded.Notebook", function () {
                console.log("[vp] vp initialized (via notebook_loaded)")
                vp_init();
            })
        }
    };

    /**
     * Load main style
     */
    var load_css = function () {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(connectorAddress + vpConst.STYLE_PATH + vpConst.MAIN_CSS_URL);
        document.getElementsByTagName("head")[0].appendChild(link);

        // root variables css
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(connectorAddress + vpConst.STYLE_PATH + 'root.css');
        document.getElementsByTagName("head")[0].appendChild(link);

        // common component css
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(connectorAddress + vpConst.STYLE_PATH + 'component/common.css');
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    /**
     * Initialize Visual Python
     */
    var vp_init = function () {
        if (mode === 'new') {
            IPython.notebook.config.loaded.then(function() {
                var vp_new = requirejs(['../new/vp']);
                var cfg = vp_new.readConfig();
                vp_new.vpInit(cfg);
            });
        } else {
            // Read configuration, then call vp
            IPython.notebook.config.loaded.then(function () {
                var cfg = vp.readConfig();
                vp.vpInit(cfg);
            });
        }
    };

    return { load_ipython_extension: load_ipython_extension };

}); /* function, define */

/* End of file */
