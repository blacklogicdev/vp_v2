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
    '../com/component/Component'
], function(Component) {
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
         * Render block
         */
        render() {
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