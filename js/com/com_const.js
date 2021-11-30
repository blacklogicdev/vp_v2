/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_const.js
 *    Author          : Black Logic
 *    Note            : Define constant value
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Define constant
//============================================================================
define ([
    '../com/com_Config',
], function(vpConfig) {
    "use strict";

    class Constants { }

    Constants.TOOLBAR_BTN_INFO = {
        HELP: "Visual Python 2.0.0"
        , ICON: "vp-main-icon"
        , ID: "vpBtnToggle"
        , NAME: "toggle-vp"
        , PREFIX: "vp"
        , ICON_CONTAINER: ""
    }

    //========================================================================
    // Base Path Constants
    //========================================================================
    Constants.PATH_SEPARATOR = "/";
    if (vpConfig.serverMode == vpConfig.MODE_TYPE.DEVELOP) {
        Constants.BASE_PATH = Constants.PATH_SEPARATOR;
    } else {
        Constants.BASE_PATH = "nbextensions" + Constants.PATH_SEPARATOR + "visualpython" + Constants.PATH_SEPARATOR;
    }
    Constants.SOURCE_PATH   = Constants.BASE_PATH + "js" + Constants.PATH_SEPARATOR;
    Constants.RESOURCE_PATH = Constants.BASE_PATH + "resource" + Constants.PATH_SEPARATOR;
    Constants.STYLE_PATH    = Constants.BASE_PATH + "css" + Constants.PATH_SEPARATOR;
    Constants.DATA_PATH     = Constants.BASE_PATH + "data" + Constants.PATH_SEPARATOR;

    Constants.MAIN_CSS_URL  = Constants.STYLE_PATH + "index.css";
    Constants.VP_LIBRARIES_JSON_URL = Constants.DATA_PATH + "libraries.json";

    //========================================================================
    // HTML selectors
    //========================================================================
    Constants.VP_CONTAINER_ID = 'vp_wrapper';
    Constants.JUPYTER_NOTEBOOK_ID = 'site';
    Constants.JUPYTER_HEADER_ID = 'header';

    return Constants;

});