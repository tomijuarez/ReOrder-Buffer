define(['Instruction'], function (Instruction) {
    'use strict';

    function Dispatch(){
        this.currentCycle = 0;
        this.instructions = [];
        this.priority = -1;

    }


    //public methods.
    Dispatch.prototype = (function () {

        return {
            increaseCycle: function () {
                this.currentCycle += 1;
            },

            addInstruction: function (inst, priority) {
                console.log("agregue al DISPATCH: "+inst);
                this.instructions.push(inst);
                this.priority = priority;
            },

            isBusy: function () {
                if (this.instructions.length == 0) {
                    return false;
                }
                else {
                    return true;
                }
            },

            isEmpty: function () {
                if (this.instructions.length == 1) {
                    return false;
                }
                else {
                    return true;
                }
            },

            getInstruction: function () {
                return this.instructions.shift();
            },
            print: function () {
                // console.log(this.instructions.length);
                for (var i = 0; i < this.instructions.length; i++) {
                    console.log(this.instructions[i].getId());
                }
            },
            getGrade: function () {
                return this.size;
            },
            getId: function () {
                if (this.instructions.length == 1) {
                    return this.instructions[0].getId();
                }

                else {
                    return "-";
                }
            },
            getPriority: function () {
                return this.priority;
            }

        }
    })();

    return Dispatch;

});