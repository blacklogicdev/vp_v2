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
            this.config.sizeLevel = 1;
            
            this.packageId = this.state.config.id;
            // deep copy package info
            this.package = null;
            try {
                let findPackage = pandasLibrary.PANDAS_FUNCTION[this.packageId];
                if (findPackage) {
                    this.package = JSON.parse(JSON.stringify(findPackage)); // deep copy of package
                } else {
                    throw 'Cannot find package';
                }
            } catch(err) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Cannot find package id from library: ' + this.packageId);
                return;
            }

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'loading state', this.state);
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            // save change of vp-state component
            $(this.wrapSelector('.vp-state')).on('change', function() {
                let id = $(this)[0].id;
                let val = $(this).val();
                that.state[id] = val;
            });
        }

        loadState() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, this.state);   

            let that = this;
            Object.keys(this.state).forEach(key => {
                if (key !== 'config') {
                    let tag = $(that.wrapSelector('#' + key));
                    let tagName = $(tag).prop('tagName');
                    let savedValue = that.state[key];
                    switch(tagName) {
                        case 'INPUT':
                            let inputType = $(tag).prop('type');
                            if (inputType == 'text' || inputType == 'number') {
                                $(tag).val(savedValue);
                                break;
                            }
                            if (inputType == 'checkbox') {
                                $(tag).prop('checked', savedValue);
                                break;
                            }
                            break;
                        case 'TEXTAREA':
                        case 'SELECT':
                        default:
                            $(tag).val(savedValue);
                            break;
                    }
                }
            });
        }

        saveState() {
            let that = this;
            $(this.wrapSelector('.vp-state')).each((idx, tag) => {
                let id = tag.id;
                let tagName = $(tag).prop('tagName');
                let newValue = '';
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'text' || inputType == 'number') {
                            newValue = $(tag).val();
                            break;
                        }
                        if (inputType == 'checkbox') {
                            newValue = $(tag).prop('checked');
                            break;
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        newValue = $(tag).val();
                        break;
                }
                
                that.state[id] = newValue;
            }); 
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'savedState', that.state);   
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