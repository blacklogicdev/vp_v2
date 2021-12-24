/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : LibraryComponent.js
 *    Author          : Black Logic
 *    Note            : Library Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] LibraryComponent
//============================================================================
define([
    'text!vp_base/html/m_library/libraryComponent.html!strip',
    'css!vp_base/css/m_library/libraryComponent.css',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/com_generator',
    'vp_base/data/m_library/pandasLibrary'
], function(libHtml, libCss, com_util, com_Const, com_String, com_interface, PopupComponent, com_generator, pandasLibrary) {

    /**
     * LibraryComponent
     */
    class LibraryComponent extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.packageId = this.state.config.id;
            // deep copy package info
            this.package = null;
            try {
                this.package = JSON.parse(JSON.stringify(pandasLibrary.PANDAS_FUNCTION[this.packageId]));
            } catch(err) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Cannot find package id from library: ' + this.packageId);
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            // save change of vp-state component
            $(this.wrapSelector('.vp-state')).on('change', function() {
                let id = $(this)[0].id;
                let val = $(this).val();
                that.state.id = val;
            });
        }

        loadState() {
            
        }

        templateForBody() {
            return libHtml;
        }

        render() {
            super.render();

            // show interface
            com_generator.vp_showInterfaceOnPage(this.wrapSelector(), this.package);
        }

        generateCode() {
            return com_generator.vp_codeGenerator(this.uuid, this.package);
        }

    }

    return LibraryComponent;
});