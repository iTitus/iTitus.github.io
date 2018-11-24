const CONFIG = {
    dynamicTyping: false,
    skipEmptyLines: true,
    header: false,
    worker: false,
    step: stepFn
};
let start, table, tableEmpty;

$(function () {
    table = $("#csv-table");
    const submit = $("#csv-submit");

    $("#csv-form").submit(function (e) {
        const fileInput = $("#csv-input");
        if (fileInput[0].files.length !== 1 || fileInput[0].files[0].size > 10 * 1024 * 1024) {
            alert("Must only select one file with maximum size 10MB");
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
    const row = results.data;

    const tr = $("<tr>");
    for (let i = 0; i < row.length; i++) {
        $(tableEmpty ? "<th>" : "<td>").text(row[i]).appendTo(tr);
    }
    tr.appendTo(table);

    tableEmpty = false;
}
