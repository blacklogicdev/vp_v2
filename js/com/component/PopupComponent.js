/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PopupComponent.js
 *    Author          : Black Logic
 *    Note            : Popup Components for rendering objects
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] PopupComponent
//============================================================================
define([
    'text!vp_base/html/popupComponent.html!strip',
    'css!vp_base/css/popupComponent.css',
    '../com_util',
    '../com_Const',
    '../com_String',
    '../com_interface',
    './Component',

    /** codemirror */
    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh'
], function(popupComponentHtml, popupComponentCss
    , com_util, com_Const, com_String, com_interface, Component, codemirror
) {
    'use strict';

    //========================================================================
    // Declare class
    //========================================================================
    /**
     * Component
     */
    class PopupComponent extends Component {
        constructor(state={}, prop={}) {
            super($('#site'), state, prop);
        }

        _init() {
            this.id = this.state.config.id;
            this.name = this.state.config.name;
            this.path = this.state.config.path;


            this.config = {
                codeview: true, 
                dataview: true
            };

            this.cmReadonlyConfig = {
                mode: {
                    name: 'python',
                    version: 3,
                    singleLineStringErrors: false
                },  // text-cell(markdown cell) set to 'htmlmixed'
                height: '100%',
                width: '100%',
                indentUnit: 4,
                matchBrackets: true,
                readOnly: true,
                autoRefresh: true,
                theme: "ipython",
                extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
                scrollbarStyle: "null"
            };

            this.cmPythonConfig = {
                mode: {
                    name: 'python',
                    version: 3,
                    singleLineStringErrors: false
                },
                height: '100%',
                width: '100%',
                indentUnit: 4,
                lineNumbers: true,
                matchBrackets: true,
                autoRefresh: true,
                theme: "ipython",
                extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
            }

            this.cmCodeview = null;

            this.cmCodeList = [];
        }

        _addCodemirror(selector, readonly=false) {
            this.cmCodeList.push({ selector: selector, readonly: readonly, cm: null });
        }

        /**
         * bind codemirror
         * @param {string} selector 
         */
        _bindCodemirror() {
            // codemirror editor (if available)
            for (let i = 0; i < this.cmCodeList.length; i++) {
                let cmObj = this.cmCodeList[i];
                if (cmObj.cm == null) {
                    let targetTag = $(cmObj.selector);
                    let cmConfig = cmObj.readonly? this.cmReadonlyConfig: this.cmPythonConfig;
                    if (targetTag && targetTag.length > 0) {
                        let cmCode = codemirror.fromTextArea(targetTag[0], cmConfig);
                        if (cmCode) {
                            cmObj.cm = cmCode;
                        }
                        // add class on text area
                        $(cmObj.selector + ' + .CodeMirror').addClass('vp-writable-codemirror');
                        cmCode.on('focus', function() {
                            // disable other shortcuts
                            com_interface.disableOtherShortcut();
                        });
                        cmCode.on('blur', function(instance, evt) {
                            // enable other shortcuts
                            com_interface.enableOtherShortcut();
                            // instance = codemirror
                            // save its code to textarea component
                            instance.save();
                        });
                    } else { 
                        vpLog.display(VP_LOG_TYPE.ERROR, 'No text area to bind codemirror. (selector: '+cmObj.selector+')');
                    }
                }
            }

            // code view
            if (!this.cmCodeview) {
                // codemirror setting
                this.cmCodeview = codemirror.fromTextArea(
                    $(this.wrapSelector('.vp-popup-codeview-box textarea'))[0], this.cmReadonlyConfig);
            } else {
                this.cmCodeview.refresh();
            }
        }

        _bindEvent() {
            var that = this;
            // Close popup event
            $(this.wrapSelector('.vp-popup-close')).on('click', function(evt) {
                if (that.getTaskType() === 'task') {
                    $('#vp_wrapper').trigger({
                        type: 'close_option_page',
                        component: that
                    });
                } else {
                    // if it's block, just hide it
                    that.hide();
                    evt.stopPropagation();
                }
            });
            // Toggle operation (minimize)
            $(this.wrapSelector('.vp-popup-toggle')).on('click', function(evt) {
                // that.toggle();
                that.hide();
                evt.stopPropagation();
            });
            // Focus recognization
            $(this.wrapSelector()).on('click', function() {
                $('#vp_wrapper').trigger({
                    type: 'focus_option_page',
                    component: that
                });
            });

            // Click buttons
            $(this.wrapSelector('.vp-popup-button')).on('click', function(evt) {
                var btnType = $(this).data('type');
                switch(btnType) {
                    case 'code':
                        that.openView('code');
                        evt.stopPropagation();
                        break;
                    case 'data':
                        that.openView('data');
                        evt.stopPropagation();
                        break;
                    case 'cancel':
                        if (that.getTaskType() === 'task') {
                            $('#vp_wrapper').trigger({
                                type: 'close_option_page',
                                component: that
                            });
                        } else {
                            // if it's block, just hide it
                            that.hide();
                            evt.stopPropagation();
                        }
                        break;
                    case 'run':
                        $('#vp_wrapper').trigger({
                            type: 'apply_option_page', 
                            blockType: 'block',
                            component: that
                        });
                        that.run();
                        break;
                    case 'show-detail':
                        $(that.wrapSelector('.vp-popup-run-detailbox')).show();
                        evt.stopPropagation();
                        break;
                }
            });
            // Click detail buttons
            $(this.wrapSelector('.vp-popup-detail-button')).on('click', function(evt) {
                var btnType = $(this).data('type');
                switch(btnType) {
                    case 'apply':
                        $('#vp_wrapper').trigger({
                            type: 'apply_option_page', 
                            blockType: 'block',
                            component: that
                        });
                        break;
                    case 'add':
                        $('#vp_wrapper').trigger({
                            type: 'apply_option_page', 
                            blockType: 'block',
                            component: that
                        });
                        that.run(false);
                        break;
                }
            });
        }

        _bindDraggable() {
            var that = this;
            $(this.wrapSelector()).draggable({
                handle: '.vp-popup-title',
                containment: 'body',
                start: function(evt, ui) {
                    // check focused
                    $('#vp_wrapper').trigger({
                        type: 'focus_option_page',
                        component: that
                    });
                }
            });
        }

        _unbindResizable() {
            $(this.wrapSelector()).resizable('disable');
        }

        _bindResizable() {
            $(this.wrapSelector()).resizable();
        }

        _renderView() {

        }

        templateForBody() {
            /** Implementation needed */
            return '';
        }

        template() { 
            this.$pageDom = $(popupComponentHtml);
            // set title
            this.$pageDom.find('.vp-popup-title').text(this.state.config.name);
            // set body
            this.$pageDom.find('.vp-popup-body').html(this.templateForBody());
            return this.$pageDom;
        }

        /**
         * Render page
         * @param {Object} config configure whether to use buttons or not 
         */
        render(inplace=false) {
            super.render(inplace);

            if (!this.config.codeview) {
                $(this.wrapSelector('.vp-popup-button[data-type="code"]')).hide();
            }   
            if (!this.config.dataview) {
                $(this.wrapSelector('.vp-popup-button[data-type="data"]')).hide();
            }

            this._bindDraggable();
            this._bindResizable();
        }

        generateCode() {
            /** Implementation needed */
            return '';
        }

        run(execute=true) {
            com_interface.insertCell('code', this.generateCode(), execute);
        }

        /**
         * Open popup
         * - show popup
         * - focus popup
         * - bind codemirror
         */
        open() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'open popup', this);
            this.show();
            this.focus();
            this._bindCodemirror();
        }

        /**
         * Close popup
         * - remove popup
         * - unbind event
         */
        close() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'close popup', this);
            this.hide();
        }

        remove() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'remove popup', this);
            $(this.wrapSelector()).remove();
        }

        focus() {
            $('.vp-popup-frame').removeClass('vp-focused');
            $('.vp-popup-frame').css({ 'z-index': 200 });
            $(this.wrapSelector()).addClass('vp-focused');
            $(this.wrapSelector()).css({ 'z-index': 205 }); // move forward
        }

        blur() {
            $(this.wrapSelector()).removeClass('vp-focused');
        }

        show() {
            this.taskItem.focusItem();
            $(this.wrapSelector()).show();
        }

        hide() {
            this.taskItem.blurItem();
            $(this.wrapSelector()).hide();
        }

        isHidden() {
            return !$(this.wrapSelector()).is(':visible');
        }

        /**
         * minimize and maximize
         */
        toggle() {
            let $this = $(this.wrapSelector());
            let isClosed = $this.hasClass('vp-close');
            if (isClosed) {
                // show
                $this.removeClass('vp-close');
                $(this.wrapSelector('.vp-popup-toggle')).attr('src', '../../nbextensions/visualpython/img/tri_down_fill_dark.svg');
            } else {
                // hide
                $this.addClass('vp-close');
                $(this.wrapSelector('.vp-popup-toggle')).attr('src', '../../nbextensions/visualpython/img/tri_right_fill_dark.svg');
            }
        }

        /**
         * Open view
         * @param {*} viewType code / data
         */
        openView(viewType) {
            if (viewType == 'code') {
                var code = this.generateCode();
                this.cmCodeview.setValue(code);
                this.cmCodeview.save();
                
                var that = this;
                setTimeout(function() {
                    that.cmCodeview.refresh();
                }, 1);
            } else {
                // TODO: dataview

            }

            $(this.wrapSelector('.vp-popup-'+viewType+'view-box')).show();
        }

        closeView(viewType) {
            $(this.wrapSelector('.vp-popup-'+viewType+'view-box')).hide();
        }

        setTaskItem(taskItem) {
            this.taskItem = taskItem;
        }

        getTaskType() {
            if (this.taskItem.constructor.name == 'Block') {
                return 'block';
            }
            if (this.taskItem.constructor.name == 'Task') {
                return 'task';
            }
            return null;
        }

        removeBlock() {
            this.taskItem.removeItem();
        }
    }

    return PopupComponent;

});

/* End of file */