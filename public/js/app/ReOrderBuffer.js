define(['Instruction', 'RobColum'], function (Instruction, RobColum) {
    'use strict';

    function Rob(size, orderList, grade) {
        this.grade = grade;
        this.size = size;

        this.instructions = [];
        console.log("tamaño del rob:" + size);
        for (var i = 0; i < size; i++) {
            this.instructions.push(new RobColum());
        }

        this.states = inicialize(orderList);
        this.orderInstructions = orderList;

        this.instrucCompletedCurrentCycle = [];
        this.instrucFinalizedCurrentCycle = [];
        this.instrucIssuedCurrentCycle = [];
        this.instrucExeCurrentCycle = [];
    }


    var getPosInstr = function (id, orderInstructions) {
        for (var i = 0; i < orderInstructions.length; i++) {
            if (orderInstructions[i] == id) {
                return i;
            }
        }
        return null;
    }

    var isComplete = function (id, orderInstructions, states) {
        var posInstruc = getPosInstr(id, orderInstructions);
        for (var index = 0; index < posInstruc; index++) {
            if (states[orderInstructions[index]] != "c") {
                return false;
            }
        }
        return true;

    }

    var inicialize = function (orderList) {
        var states = [];
        for (var index = 0; index < orderList.length; index++) {
            states[orderList[index]] = "-";
        }
        return states;
    }

    //public methods.
    Rob.prototype = (function () {

        return {


            size: function () {
                return this.size;
            },

            addInstruction: function (instr) {
                this.states[instr.getId()] = "i";
                for (var i = 0; i < this.instructions.length; i++) {
                    if (!this.instructions[i].isBusy()) {
                        this.instructions[i].addInstruction(instr);
                        break;
                    }
                }

                this.instrucIssuedCurrentCycle.push(instr.getId());
            },

            isBusy: function () {
                for (var i = 0; i < this.instructions.length; i++) {
                    if (!this.instructions[i].isBusy()) {
                        return false;
                    }
                }
                return true;
            },

            getInstructions: function () {
                return this.instructions;
            },

            setStateExe: function (id) {
                this.states[id] = "x";
                this.instrucExeCurrentCycle.push(id);
            },
            setStateFinal: function (id) {
                this.states[id] = "f";
                this.instrucFinalizedCurrentCycle.push(id);
            },
            removeStatesCompleted: function () {
                console.log("grado: " + this.grade);
                var count = 0;
                for (var i = 0; (i < this.instructions.length) && (count < this.grade); i++) {
                    console.log("Estado completados: ");
                    console.log((this.states[this.instructions[i].getId()] == "f") + "  " + (isComplete(this.instructions[i].getId(), this.orderInstructions, this.states)))
                    if ((this.states[this.instructions[i].getId()] == "f") && (isComplete(this.instructions[i].getId(), this.orderInstructions, this.states))) {
                        this.states[this.instructions[i].getId()] = "c";
                        this.instrucCompletedCurrentCycle.push(this.instructions[i].getId());
                        var o = this.instructions[i].getInstruction();
                        o = null;
                        count += 1;
                    }
                }
            },
            setCycle: function () {
                this.instrucCompletedCurrentCycle = [];
                this.instrucFinalizedCurrentCycle = [];
                this.instrucIssuedCurrentCycle = [];
                this.instrucExeCurrentCycle = [];
            },

            print: function () {
                // console.log(this.instructions.length);
                for (var i in this.states) {
                    console.log(i + ": " + this.states[i]);
                }
            },

            getRobInstructions: function () {
                var state = [];
                for (var i = 0; i < this.instructions.length; i++)
                    state[i] = this.instructions[i].getId();
                return state;
            },

            getRobStates: function () {
                var state = [];
                for (var i = 0; i < this.instructions.length; i++)
                    if (this.instructions[i].getId() == "-") {
                        state[i] = "-";
                    } else {
                        state[i] = this.states[this.instructions[i].getId()];
                    }

                return state;
            },

            isComplete: function () {
                var state = [];
                for (var i = 0; i < this.orderInstructions.length; i++) {
                    if (this.states[this.orderInstructions[i]] != "c") {
                        return false;
                    }
                }
                return true;
            }




        }
    })();

    return Rob;

});