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
            
            this._bindDraggable();
            this._bindResizable();
        }

        _init() {
            this.id = this.state.config.id;
            this.name = this.state.config.name;


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

            this.cmCodeview = null;
        }

        wrapSelector(selector='') {
            var sbSelector = new com_String();
            var cnt = arguments.length;
            if (cnt < 2) {
                // if there's no more arguments
                sbSelector.appendFormat(".{0} {1}", this.uuid, selector);
            } else {
                // if there's more arguments
                sbSelector.appendFormat(".{0}", this.uuid);
                for (var idx = 0; idx < cnt; idx++) {
                    sbSelector.appendFormat(" {0}", arguments[idx]);
                }
            }
            return sbSelector.toString();
        }

        _bindEvent() {
            var that = this;
            // Close popup event
            $(this.wrapSelector('.vp-popup-close')).on('click', function() {
                $('#vp_wrapper').trigger({
                    type: 'close_option_page',
                    component: that
                });
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
                        $('#vp_wrapper').trigger({
                            type: 'close_option_page',
                            component: that
                        });
                        break;
                    case 'run':
                        $('#vp_wrapper').trigger({
                            type: 'open_option_page', 
                            blockType: 'block',
                            menuId: that.state.id,
                            menuState: {},
                            background: true
                        });
                        com_interface.insertCell('code', that.generateCode());
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
                        //TODO: apply to board (use com_Event)
                        $('#vp_wrapper').trigger({
                            type: 'open_option_page', 
                            blockType: 'block',
                            menuId: that.state.id,
                            menuState: {},
                            background: true
                        });
                    case 'add':
                        com_interface.insertCell('code', that.generateCode(), false);
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
        render() {
            super.render();

            if (!this.config.codeview) {
                $(this.wrapSelector('.vp-popup-button[data-type="code"]')).hide();
            }   
            if (!this.config.dataview) {
                $(this.wrapSelector('.vp-popup-button[data-type="data"]')).hide();
            }
        }

        generateCode() {
            /** Implementation needed */
            return '';
        }

        /**
         * Open popup
         */
        open() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'open popup', this);
            this.taskItem.focusItem();
            $(this.wrapSelector()).show();

            if (!this.cmCodeview) {
                // codemirror setting
                this.cmCodeview = codemirror.fromTextArea(
                    $(this.wrapSelector('.vp-popup-codeview-box textarea'))[0], this.cmReadonlyConfig);
            } else {
                this.cmCodeview.refresh();
            }
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

        hide() {
            this.taskItem.blurItem();
            $(this.wrapSelector()).hide();
        }

        /**
         * Close popup
         * - remove popup
         * - unbind event
         */
        close() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'close popup', this);
            $(this.wrapSelector()).remove();
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
            if (this.taskItem.constructor.name == 'Block') {
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