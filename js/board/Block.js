/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Block.js
 *    Author          : Black Logic
 *    Note            : Render block
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] Block
//============================================================================
define([
    '../com/component/Component',
    '../com/com_String'
], function(Component, com_String) {
	'use strict';
	
    /**
     * @class Block
     * @constructor
     */
     class Block extends Component {
        constructor($target, state, prop) {
            super($target, state, prop);

            // temporary state
            this.tmpState = {
                blockNumber: 0,
                depth: 0,
                leftHolderHeight: 0
            };
        }
        /**
         * Initialize block
         * @param {Object} state
         */
        init(state) {
            
        }
        /**
         * Generate template
         */
        template() {
            let { name, code, depth, index } = this.state;
            var page = new com_String();
            page.appendLine('<div class="vp-block">');
            page.appendFormatLine('<div class="vp-block-header">{0}</div>', name);
            page.appendFormatLine('<div class="vp-block-left-holder"></div>');
            page.appendFormatLine('<div class="vp-block-depth-info">{0}</div>', depth);
            page.appendFormatLine('<div class="vp-block-num-info">{0}</div>', index);
            page.appendLine('</div>');
            return page.toString();
        }

        //========================================================================
        // Block load/save
        //========================================================================
        toJson() {

        }

        fromJson(jsonObject) {

        }
    }






    return Block;
});