/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9583333333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Delete_studentsDetails-1"], "isController": false}, {"data": [1.0, 500, 1500, "Student_data_Update-1"], "isController": false}, {"data": [0.75, 500, 1500, "Add_new_Student"], "isController": false}, {"data": [1.0, 500, 1500, "Fetch_Student_Data-1"], "isController": false}, {"data": [1.0, 500, 1500, "Student_data_Update-0"], "isController": false}, {"data": [1.0, 500, 1500, "Fetch_Student_Data-0"], "isController": false}, {"data": [1.0, 500, 1500, "Delete_studentsDetails-0"], "isController": false}, {"data": [1.0, 500, 1500, "Fetch_Student_Data"], "isController": false}, {"data": [0.75, 500, 1500, "Add_new_Student-1"], "isController": false}, {"data": [1.0, 500, 1500, "Add_new_Student-0"], "isController": false}, {"data": [1.0, 500, 1500, "Student_data_Update"], "isController": false}, {"data": [1.0, 500, 1500, "Delete_studentsDetails"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24, 0, 0.0, 134.29166666666666, 46, 726, 71.5, 455.5, 692.75, 726.0, 23.55250245338567, 62.7606722276742, 6.478471540726202], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Delete_studentsDetails-1", 2, 0, 0.0, 48.0, 47, 49, 48.0, 49.0, 49.0, 49.0, 40.816326530612244, 16.10331632653061, 6.297831632653061], "isController": false}, {"data": ["Student_data_Update-1", 2, 0, 0.0, 47.0, 46, 48, 47.0, 48.0, 48.0, 48.0, 41.666666666666664, 13.387044270833334, 6.429036458333333], "isController": false}, {"data": ["Add_new_Student", 2, 0, 0.0, 522.0, 318, 726, 522.0, 726.0, 726.0, 726.0, 2.751031636863824, 37.12549432599725, 1.2841729711141678], "isController": false}, {"data": ["Fetch_Student_Data-1", 2, 0, 0.0, 47.5, 47, 48, 47.5, 48.0, 48.0, 48.0, 40.816326530612244, 16.10331632653061, 6.297831632653061], "isController": false}, {"data": ["Student_data_Update-0", 2, 0, 0.0, 47.5, 47, 48, 47.5, 48.0, 48.0, 48.0, 41.666666666666664, 19.205729166666668, 13.671875], "isController": false}, {"data": ["Fetch_Student_Data-0", 2, 0, 0.0, 46.5, 46, 47, 46.5, 47.0, 47.0, 47.0, 41.666666666666664, 19.205729166666668, 6.429036458333333], "isController": false}, {"data": ["Delete_studentsDetails-0", 2, 0, 0.0, 48.0, 47, 49, 48.0, 49.0, 49.0, 49.0, 40.816326530612244, 18.81377551020408, 9.72576530612245], "isController": false}, {"data": ["Fetch_Student_Data", 2, 0, 0.0, 94.0, 94, 94, 94.0, 94.0, 94.0, 94.0, 21.052631578947366, 18.00986842105263, 6.496710526315789], "isController": false}, {"data": ["Add_new_Student-1", 2, 0, 0.0, 405.5, 218, 593, 405.5, 593.0, 593.0, 593.0, 3.3670033670033668, 43.938736321548824, 0.49321338383838387], "isController": false}, {"data": ["Add_new_Student-0", 2, 0, 0.0, 113.5, 99, 128, 113.5, 128.0, 128.0, 128.0, 3.937007874015748, 1.7531988188976377, 1.2610728346456692], "isController": false}, {"data": ["Student_data_Update", 2, 0, 0.0, 95.0, 95, 95, 95.0, 95.0, 95.0, 95.0, 21.052631578947366, 16.46792763157895, 10.15625], "isController": false}, {"data": ["Delete_studentsDetails", 2, 0, 0.0, 97.0, 97, 97, 97.0, 97.0, 97.0, 97.0, 20.61855670103093, 17.638530927835053, 8.094394329896907], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
