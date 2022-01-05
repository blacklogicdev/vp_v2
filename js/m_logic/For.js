/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : For.js
 *    Author          : Black Logic
 *    Note            : Logic > for
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] For
//============================================================================
define([
    'css!vp_base/css/m_logic/for.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector'
], function(forCss, com_String, com_util, PopupComponent, VarSelector) {

    /**
     * For
     */
    class For extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.saveOnly = true;

            this.state = {
                v1: '', // index
                v2: '', // item
                v3: 'range', // Type : range/variable/typing
                v4: '', // Range - start
                v5: '', //       - stop
                v6: '', //       - step
                v7: '', // Variable
                v8: '', // Typing
                ...this.state
            }
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            $(this.wrapSelector('#v3')).on('click', function() {
                let type = $(this).val();

                // show input
                if (type == 'range') {
                    $(that.wrapSelector('#v1')).hide();
                } else {
                    $(that.wrapSelector('#v1')).show();
                }
                // show sub box
                $('.vp-for-sub-box').hide();
                $('.vp-sub-'+type).show();
            });

            $(this.wrapSelector('#v7')).on('var_changed', function(evt) {
                let value = evt.value;
                that.state.v7 = value;
            });
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendLine('<div class="vp-grid-box">');
            page.appendLine('<label class="vp-orange-text vp-bold">For</label>');
            page.appendLine('<div>');
            page.appendFormatLine('<input type="text" id="v1" class="vp-input wp49 vp-state" value="{0}" placeholder="{1}" {2}>'
                                , this.state.v1, 'Index', this.state.v3 != 'range'?'':'style="display:none;"');
            page.appendFormatLine('<input type="text" id="v2" class="vp-input wp49 vp-state" value="{0}" placeholder="{1}">'
                                , this.state.v2, 'Item');
            page.appendLine('</div>');
            page.appendLine('</div>');
            page.appendLine('<div class="vp-grid-box">');
            page.appendLine('<label class="vp-orange-text vp-bold">In</label>');
            page.appendLine('<select class="vp-select vp-state" id="v3">');
            let types = ['Range', 'Variable', 'Typing'];
            types.forEach(type => {
                let val = type.toLowerCase();
                page.appendFormatLine('<option value="{0}" {1}>{2}</option>', val, val==this.state.v3?'selected':'', type);
            });
            page.appendLine('</select>');
            page.appendLine('</div>');
            page.appendLine(this.templateForRangeBox());
            page.appendLine(this.templateForVariableBox());
            page.appendLine(this.templateForTypingBox());
            return page.toString();
        }

        templateForRangeBox() {
            return `<div class="vp-for-sub-box vp-sub-range" ${this.state.v3=='range'?'':'style="display:none;"'}>
                <div></div>
                <div>
                <div class="vp-for-sub-header wp100">
                    <div class="vp-orange-text">Start</div>
                    <div>Stop</div>
                    <div>Step</div>
                </div>
                <div class="vp-for-sub-body wp100">
                    <input type="text" id="v4" class="vp-input w100 vp-state" value="${this.state.v4}" placeholder="Value">
                    <input type="text" id="v5" class="vp-input w100 vp-state" value="${this.state.v5}" placeholder="Value">
                    <input type="text" id="v6" class="vp-input w100 vp-state" value="${this.state.v6}" placeholder="Value">
                </div>
                </div>
            </div>`;
        }

        templateForVariableBox() {
            var dataTypes = ['DataFrame', 'Series', 'nparray', 'list', 'str'];
            var varSelector = new VarSelector(dataTypes, 'DataFrame', true, true);
            varSelector.setComponentId('v7');
            varSelector.addBoxClass('wp100');
            varSelector.addTypeClass('');
            varSelector.addVarClass('vp-state');
            varSelector.setValue(this.state.v7);
            
            return `<div class="vp-for-sub-box vp-sub-variable" ${this.state.v3=='variable'?'':'style="display:none;"'}>
                <div class="vp-for-sub-header">
                    <div class="vp-orange-text">Data Type</div>
                    <div class="vp-orange-text">Data</div>
                </div>
                <div class="vp-for-sub-body">
                    ${varSelector.render()}
                </div>
            </div>`;
        }

        templateForTypingBox() {
            return `<div class="vp-for-sub-box vp-sub-typing" ${this.state.v3=='typing'?'':'style="display:none;"'}>
                    <input type="text" id="v8" class="vp-input wp100 vp-state" value="${this.state.v8}" placeholder="User Input">
            </div>`;
        }

        generateCode() {
            let { v1, v2, v3, v4 ,v5, v6, v7, v8 } = this.state;
            let front = v2;
            if (v3 != 'range' && v1 != '') {
                front = v1 + ', ' + v2;
            }
            let back = '';
            if (v3 == 'range') {
                back = `range(${v4}${v5!=''?', '+v5:''}${v6!=''?', '+v6:''})`
            } else if (v3 == 'variable') {
                back = `(${v7})`;
            } else {
                back = v8;
            }

            return com_util.formatString('for {0} in {1}:', front, back);
        }

    }

    return For;
});