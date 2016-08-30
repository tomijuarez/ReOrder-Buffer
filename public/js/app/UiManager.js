define(["jquery"], function ($) {

    var 
        generateHead = function (head) {
            var headRow = "<tr>";
            for (var i = 0; i < head.length; i++)
                headRow += "<th>" + head[i] + "</th>";

            return headRow + "</tr>";
        },
        generateRow = function (arr) {
            var row = "<tr>";
            for (var i = 0; i < arr.length; i++)
                row += "<td>" + arr[i] + "</td>";

            return row + "</tr>";
        },

        getBodyTable = function (id) {
            return $(id).children()[0];
        };


    function UiManager(ciclesTbId, dpId, rsTbId, fuTbId, robTbId) {
        this.ciclesTableId = ciclesTbId;
        this.dispatcherTableId = dpId;
        this.reservStationsTableId = rsTbId;
        this.functionalUnitiesTableId = fuTbId;
        this.robTableId = robTbId;
    }

    var getRobAsArray = function (iterations) {
        var columns = [];
        for (var i = 0; i < iterations * 2; i++) {
            columns[i] = (i % 2 == 0) ? "I" : "S";
        }

        return columns;
    }

    UiManager.prototype.constructTables = function (dp, rs, fu) {
        this.dispatcher = dp;
        this.reservStations = rs;
        this.functionalUnities = fu;
        this.rob = rs.length + fu.length;

        $(getBodyTable(this.ciclesTableId)).html(generateHead(["Ciclos"]));
        $(getBodyTable(this.dispatcherTableId)).html(generateHead(this.dispatcher));
        $(getBodyTable(this.reservStationsTableId)).html(generateHead(this.reservStations));
        $(getBodyTable(this.functionalUnitiesTableId)).html(generateHead(this.functionalUnities));
        $(getBodyTable(this.robTableId)).html(generateHead(getRobAsArray(this.rob)));
    }

    var getState = function (index, object) {
        var counter = 0;
        for (o in object) {
            if (counter == index)
                return object[o];
            counter++;
        }
        return null;
    }

    var getRobRow = function (instructions, states) {
        var row = [];
        var counter = 0;
        for (var i = 0; i < instructions.length; i++) {
            console.log(counter + " " + (counter + 1));
            row[counter] = instructions[i];
            row[counter + 1] = getState(i, states);
            counter = counter + 2;
        }
        return row;
    };

    UiManager.prototype.addRows = function (cicle, dispatcherState, reservStationsQueue, functionalUnitiesCurrents, robInstructions, robStates) {
        $(getBodyTable(this.ciclesTableId)).append(generateRow([cicle]));

        $(getBodyTable(this.dispatcherTableId)).append(
            generateRow(dispatcherState)
        );

        $(getBodyTable(this.reservStationsTableId)).append(
            generateRow(reservStationsQueue)
        );

        $(getBodyTable(this.functionalUnitiesTableId)).append(
            generateRow(functionalUnitiesCurrents)
        );

        $(getBodyTable(this.robTableId)).append(
            generateRow(getRobRow(robInstructions, robStates))
        );
    }

    return UiManager;
});