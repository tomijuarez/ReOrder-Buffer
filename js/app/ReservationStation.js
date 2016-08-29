define(function () {
    'use strict';

    function ReservationStation() {
        this.instructions = [];

    }


    //public methods.
    ReservationStation.prototype = (function () {

        return {

            addInstruction: function (instr) {
                this.instructions.unshift(instr);
            },

            isBusy: function () {
                if (this.instructions.length == 0){
                    return false;
                } else {
                    return true;
                }
            },
            getSize: function () {
                return this.instructions.length;
            },

            print: function () {
                for (var i = 0; i < this.instructions.length; i++) {
                    console.log(this.instructions[i].getId() + " dependencias: ");
                    console.log(this.instructions[i] != []);

                }
            },
            getInstruction: function () {
                return this.instructions.pop();
               
            },
            getInstructionsById: function () {
                if (this.instructions.length == 1) {
                    return this.instructions[0].getId();
                }
                else {
                    return "-";
                }
            }

        }
    })();

    return ReservationStation;

});