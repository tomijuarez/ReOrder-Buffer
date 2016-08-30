define(["Instruction", "Stack", "Processor", "FunctionalUnit", "Parser", "Graph", "UiManager", "jquery", "./libs/ace/ace", "./libs/ace/mode/assembly_x86", "./libs/ace/theme/tomorrow", "./libs/fullPage/jquery.fullPage", "./libs/notification/notification"], function (Instruction, stack, Processor, FunctionalUnit, Parser, Graph, UI, $, ace, mode, theme, fullpage, notification) {
    var editor = ace.edit("editor");
    editor.setTheme(theme);
    editor.getSession().setMode("./mode/assembly_x86");

    var UiManager = new UI("#cycle-counter-table", "#dispatcher-table", "#reserv-stations-table", "#functional-unities-table", "#rob-table");

    var reservationStationsSize = 0,
        dispatcherSize          = 0,
        functionalUnits         = [];

    function addFunctionalUnits(el) {
        for(var i = 0; i < parseInt($("#"+el).val()); i++)
            functionalUnits.push(new FunctionalUnit(parseInt($("#"+el+"_cycles").val()),el));
    }

    function generateTablesHeaders(str, number) {
        headers = [];
        for(var i = 0; i < number; i++)
            headers [i] = str + i;
        return headers;
    }

    function reset() {
        reservationStationsSize = 0;
        dispatcherSize = 0;
        functionalUnits = [];
        $('#keys-list').html('');
        $('#dependencies-list').html('');
    }

    function runParser(_parser, lines) {
        try {
            for (var i = 0; i < lines.length; i++)
                _parser.parse(lines[i]);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    $(document).ready(function () {

        $("#about").click(function(){
            $.notify({
                    message: "Trabajo final de cátedra de <i>Arquitectura de Computadoras y Técnicas Digitales</i>. Implementado por <strong>Tomás Juárez</strong> y <strong>Guillermo Pacheco</strong>, a cargo de los docentes <strong>Ing. Martín Menchón</strong> e <strong>Ing. Marcerlo Tosini</strong>." 
                },{                
                    type: 'success'
            });
        });

        $('#fullpage').fullpage({
            menu: '#header',
            anchors:['firstPage', 'secondPage', 'thirdPage'],
            scrollingSpeed: 1000
        });

        var cpu;
        var graph;

        $("#init").click(function(){

            var lines = editor.getSession().doc.getAllLines();
            Parser.clearStack();

            if (runParser(Parser, lines)) {

                reset();
                graph = new Graph();

                dispatcherSize = parseInt($("#dispatcherSize").val());
                reservationStationsSize = parseInt($("#reservationStationSize").val());

                addFunctionalUnits("multi_type");
                addFunctionalUnits("arith_int");
                addFunctionalUnits("arith_float");
                addFunctionalUnits("mem_int");
                addFunctionalUnits("mem_float");

                if(functionalUnits.length > 0) {

                    FUTableHeader = generateTablesHeaders("UF", functionalUnits.length);
                    dispatcherTableHeader = generateTablesHeaders("D", dispatcherSize);
                    rsTableHeader = generateTablesHeaders("ER",reservationStationsSize);

                    $("#non-tables").alert("close");

                    UiManager.constructTables(dispatcherTableHeader, rsTableHeader, FUTableHeader);

                    var instr = Parser.getStack().getInstructions();
                    cpu = new Processor(instr, dispatcherSize, reservationStationsSize, functionalUnits);

                    for (var i in instr) {
                        $("#keys-list").append("<li><pre>" + instr[i].getId() + ": " + instr[i].toString() + "</pre></li>");
                    }

                    for (var i in instr) {
                        graph.addNode(instr[i].getId(), i, instr.length);

                        var dependencies = instr[i].getDependencies();
                        for (var dependency in dependencies) {
                            $("#dependencies-list").append("<li><pre>" + instr[i].getId() + " depende de " + dependencies[dependency].getId() + " por " + dependencies[dependency].getWriteRegister() + "</pre></li>");
                            
                            graph.addEdge(instr[i].getId(), dependencies[dependency].getId());
                        }
                    }

                    graph.draw($);
                }
                else {
                     $.notify({
                        message: "Debes establecer al menos una unidad funcional para ejecutar las instrucciones." 
                    },{                
                        type: 'warning'
                    });
                }
            }
            else {
                $.notify({
                    message: "<strong>:'(</strong> ocurrió un error durante la etapa de parsing. Por favor, revisa tus instrucciones." 
                },{                
                    type: 'danger'
                });

            }
        });


        $("#nextCycle").click(function () {
            if(!cpu.isFullyProcessed()) {
                cpu.nextCycle();
                UiManager.addRows(cpu.getCurrentCycle(), cpu.getDispatcherState(), cpu.getReservStationsState(), cpu.getFunctionalUnitsState(), cpu.getRobInstructions(), cpu.getRobStates());
            }
            else {
                $.notify({
                    message: "<strong>:D</strong> La ejecución de las instrucciones fueron completadas con éxito." 
                },{                
                    type: 'success'
                });
            }

        });

    });
});