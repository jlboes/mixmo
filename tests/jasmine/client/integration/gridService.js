describe("GridService tests", function () {

    var table;
    var td;
    var emptyTd;
    var prevTd;
    var testGridService;

    beforeEach(function () {
        // SETUP
        table = jQuery('<table>' +
            '<tr><td></td><td>C</td><td></td></tr>' +
            '<tr><td class="selected">M</td><td id="elem">O</td><td>I</td></tr>' +
            '<tr><td></td><td>L</td><td></td></tr>' +
            '</table>');
        td = table.find('#elem');
        emptyTd = table.find('td').first();
        prevTd = table.find('.selected');

        testGridService = new GridService();
    });

    it("Get a horizontal word from td", function () {
        var check_result;

        var tds = testGridService.getHwordTds(td);
        check_result = testGridService.getWord(tds);

        expect(check_result).not.toBeUndefined();
        expect(check_result).toMatch("MOI");
    });

    it("Get a vetical word from td", function () {
        var check_result;

        var tds = testGridService.getVwordTds(td);
        check_result = testGridService.getWord(tds);

        expect(check_result).not.toBeUndefined();
        expect(check_result).toMatch("COL");
    });

    it("Mark a valid word", function () {
        var tds = testGridService.getVwordTds(td);
        testGridService.markValidWord(tds);
        var valid = false;
        jQuery.each(tds, function(index, value){
            valid = value.hasClass(testGridService.getValidClass()) && !value.hasClass(testGridService.getNotValidClass());
            if(!valid){
                return false;
            }
        });

        expect(valid).not.toBeUndefined();
        expect(valid).toBe(true);
    });

    it("Mark a not valid word", function () {
        var tds = testGridService.getVwordTds(td);
        testGridService.markNotValidWord(tds);
        var valid = false;
        jQuery.each(tds, function(index, value){
            valid = !value.hasClass(testGridService.getValidClass()) && value.hasClass(testGridService.getNotValidClass());
            if(!valid){
                return false;
            }
        });

        expect(valid).not.toBeUndefined();
        expect(valid).toBe(true);
    });

    it("Select a td", function () {
        testGridService.selectTd(td, prevTd);

        var valid = !prevTd.hasClass(testGridService.getSelectedClass()) && td.hasClass(testGridService.getSelectedClass());

        expect(valid).not.toBeUndefined();
        expect(valid).toBe(true);
    });

    it("Drop a td", function () {
        testGridService.dropSelectedTd(emptyTd, prevTd);

        var valid = !emptyTd.hasClass(testGridService.getSelectedClass()) && emptyTd.text() == "M" && prevTd.text() == "";

        expect(valid).not.toBeUndefined();
        expect(valid).toBe(true);
    });
});