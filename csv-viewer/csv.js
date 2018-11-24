const CONFIG = {
    dynamicTyping: false,
    skipEmptyLines: true,
    header: false,
    worker: true,
    step: stepFn
};
let start, table, tableEmpty;

$(function () {
    table = $("#csv-table");
    const submit = $("#csv-submit");

    $("#csv-form").submit(function (e) {
        const fileInput = $("#csv-input");
        if (fileInput[0].files.length !== 1) {
            return false;
        }
        e.preventDefault();
        
        fileInput.parse({
            config: CONFIG,
            before: function (file, inputElem) {
                start = window.performance.now();
                console.log("Parsing file:", file, inputElem);
                submit.attr("disabled", true);
                table.empty();
                tableEmpty = true;
            },
            error: function (err, file, inputElem, reason) {
                console.log("ERROR:", err, file, inputElem, reason);
            },
            complete: function () {
                console.log("Done!");
                submit.attr("disabled", false);
                console.log("Time:", window.performance.now() - start);
            }
        });
    });
});

function stepFn(results) {
    // console.log("Step:", results);
    const data = results.data;
    for (let i = 0; i < data.length; i++) {
        const row = data[i];

        const tr = $("<tr>");
        for (let j = 0; j < row.length; j++) {
            $(tableEmpty ? "<th>" : "<td>").text(row[j]).appendTo(tr);
        }
        tr.appendTo(table);

        tableEmpty = false;
    }
}
