define(["Instruction", "FunctionalUnit", "Dispatch", "ReOrderBuffer", "ReservationStation", "Stack"], function (Instruction, FuntionalUnit, Dispatch, Rob, ReservationStation, Stack) {
    'use strict';

    function Gestionator(stack, dispatchSize, rsSize, fu) {
        this.stack = stack;
        this.inOrderStack = [];
        for (var i = 0; i < this.stack.length; i++) {
            this.inOrderStack.push(this.stack[i].getId());
        }

        this.dispatch = [];
        for (var i = 0; i < dispatchSize; i++) {
            this.dispatch.push(new Dispatch());
        }

        this.functional_units = fu;

        this.reservation_station = [];
        for (var i = 0; i < rsSize; i++) {
            this.reservation_station.push(new ReservationStation());
        }

        console.log(rsSize + fu.length);

        this.rob = new Rob(rsSize + fu.length, this.inOrderStack, dispatchSize);
        this.currentCycle = 0;
        this.count = 0;
    }

    //
    //seguir aca, verificar si las unidades estan disponibles y son del mismo tipo que la instruccion
    var isExecutable = function (instruction, functional_units) {
        for (var index_fu = 0; index_fu < functional_units.length; index_fu++) {
            if (!functional_units[index_fu].isOccupied() && (functional_units[index_fu].getType() == instruction.getType() || functional_units[index_fu].getType() == "multi_type")) {
                //ahora verifico las dependencias
                var dependencias = instruction.getDependencies();
                for (var index_d = 0; index_d < dependencias.length; index_d++) {
                    if (!dependencias[index_d].isExecute()) {
                        //    console.log("la dependencia no la deja ejecutar");
                        return false;
                    }
                }
                return true;
            } else {
                // console.log("la unidad funcional esta ocupada.");
            }

        }
        return false; //todas las unidades funcionales estan ocupadas
    }

    var execute_cycle = function (functional_units) {
        for (var i = 0; i < functional_units.length; i++) {
            functional_units[i].nextCycle();
        }
    }

    var reservationStationsBusy = function (rs) {
        for (var i in rs) {
            if (!rs[i].isBusy()) {
                return false;
            }
        }
        return true;
    }

    var isEmpty = function (rs) {
        for (var i in rs) {
            if (rs[i].isBusy()) {
                return false;
            }
        }
        return true;
    }



    var getInstruction = function (ds) {

        var least = 10000;
        var index_l = -1;
        for (var i = 0; i < ds.length; i++) {
            if (ds[i].isBusy() && (ds[i].getPriority() < least)) {
                index_l = i;
                least = ds[i].getPriority();
            }
        }
        console.log("indice: " + index_l);
        return ds[index_l].getInstruction();
    }

    Gestionator.prototype = (function () {
        return {

            nextCycle: function () {
                this.rob.setCycle();

                //console.log(this.inOrderStack);

                console.log("ciclo: " + this.currentCycle);

                execute_cycle(this.functional_units);
                this.currentCycle += 1;

                //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO ROB
                //me fijo las instrucciones que se ejecutaron

                this.rob.removeStatesCompleted();

                for (var i = 0; i < this.functional_units.length; i++) {
                    if (!this.functional_units[i].isOccupied()) {
                        if (this.functional_units[i].hasInstruction()) {
                            var instrFinal = this.functional_units[i].getInstCompleted();
                            instrFinal.setExecute();
                            this.rob.setStateFinal(instrFinal.getId());
                        }
                    }
                }


                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO LAS ESTACIONES DE RESERVA
                while (!isEmpty(this.dispatch) && !reservationStationsBusy(this.reservation_station) && !this.rob.isBusy()) {
                    for (var index = 0; index < this.reservation_station.length; index++) {
                        if (!this.reservation_station[index].isBusy() && !isEmpty(this.dispatch)) {
                            if (!this.rob.isBusy()) {
                                var instruc = getInstruction(this.dispatch);
                                // console.log("agrego a " + instruc);
                                this.reservation_station[index].addInstruction(instruc);
                                this.rob.addInstruction(instruc);
                            }
                        }
                    }
                    console.log("me colgue1");
                }


                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO LAS UNIDADES FUNCIONALES 
                for (var index = 0; index < this.reservation_station.length; index++) {
                    if (this.reservation_station[index].isBusy()) {
                        //primero verifico las dependencias,
                        // y luego con la funcion isExecutable verifico si hay espacio en las unidades funcionales 
                        //console.log("Entre a mirar las estaciones de reserva");
                        var currentInstr = this.reservation_station[index].getInstruction();
                        console.log(currentInstr.getId() + " " + isExecutable(currentInstr, this.functional_units));
                        if (isExecutable(currentInstr, this.functional_units)) {
                            for (var index_fu = 0; index_fu < this.functional_units.length; index_fu++) {
                                if (!this.functional_units[index_fu].isOccupied()) {
                                    this.functional_units[index_fu].execute(currentInstr);
                                    this.rob.setStateExe(currentInstr.getId());
                                    break;
                                }
                            }

                        }
                        else {
                            this.reservation_station[index].addInstruction(currentInstr);
                        }

                    }
                }

                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO LAS ESTACIONES DE RESERVA
                while (!isEmpty(this.dispatch) && !reservationStationsBusy(this.reservation_station) && !this.rob.isBusy()) {
                    for (var index = 0; index < this.reservation_station.length; index++) {
                        if (!this.reservation_station[index].isBusy() && !isEmpty(this.dispatch)) {
                            if (!this.rob.isBusy()) {
                                var instruc = getInstruction(this.dispatch);
                                this.reservation_station[index].addInstruction(instruc);
                                this.rob.addInstruction(instruc);
                            }
                        }
                    }
                    console.log("me colgue2");
                }


                ///////////////////////////////////////////////////////////////////////////////////////////////////////////
                //ACTUALIZO DISPATCH
                //DISPATCH
                //si el dispath tiene algun espacio, lo lleno.
                for (var i = 0; i < this.dispatch.length && (this.stack.length > 0); i++) {
                    if (!this.dispatch[i].isBusy()) {
                        this.dispatch[i].addInstruction(this.stack.shift(), this.count);
                        this.count += 1;
                    }
                }




                console.log("Dispatch");
                for (var index = 0; index < this.dispatch.length; index++) {
                    console.log(this.dispatch[index].getId());
                }

                console.log("ER");
                //this.reservation_station.print();
                for (var index in this.reservation_station) {
                    // console.log(this.reservation_station[index].getInstructionsById());
                }

                console.log("FunctionalUnit");
                for (var i = 0; i < this.functional_units.length; i++) {
                    console.log(this.functional_units[i].getId());

                }

                console.log("ROB");
                this.rob.print();

            },
            getDispatcherState: function () {
                var state = [];
                for (var i in this.dispatch) {
                    state.push(this.dispatch[i].getId());
                }
                return state;
            },
            getCurrentCycle: function () {
                return this.currentCycle - 1;
            },
            getReservStationsState: function () {
                var state = [];
                for (var i in this.reservation_station) {
                    state.push(this.reservation_station[i].getInstructionsById());
                }
                return state;
            },
            getFunctionalUnitsState: function () {
                var state = [];
                for (var i = 0; i < this.functional_units.length; i++) {
                    state.push(this.functional_units[i].getId());
                }
                return state;
            },
            getRobInstructions: function () {
                return this.rob.getRobInstructions();
            },
            getRobStates: function () {
                return this.rob.getRobStates();
            },
            isFullyProcessed: function () {
                return this.rob.isComplete();
            }

        }




    })();

    return Gestionator;
});

