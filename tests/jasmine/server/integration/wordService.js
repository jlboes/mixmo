
describe("WordService test", function () {

    beforeEach(function () {
        // SETUP
        var testDico = new Mongo.Collection();
        testDico.remove();
        testDico.insert({word:"manger"});
        testDico.insert({word:"zoo"});
        this.wordService = new WordService(testDico)
    });

    it("check that word validation is working for a word that does not exist", function () {
        var word = "lsjdsfh";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(false);
    });

    it("check that word validation is working for a word that exist", function () {
        var word = "manger";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(true);
    });

    it("check that word validation is working for a word that exist with upper and lower case", function () {
        var word = "ManGer";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(true);
    });

    it("check that word validation is working for empty entry", function () {
        var word = "";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(false);
    });

    it("check that word validation is working for null entry", function () {
        var word = null;
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(false);

        var word = undefined;
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(false);
    });

    it("check that word validation is working for a word that exists and contains a wildcard", function () {
        var word = "man*er";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(true);
    });

    it("check that word validation is not working for a word that contains a wildcard", function () {
        var word = "zgfgfan*er";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(false);
    });

    it("check that word validation is working for a word that exists and contains a gangster", function () {
        var word = "$oo";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(true);
    });

    it("check that word validation is not working for a word that contains a gangster", function () {
        var word = "$oooo";
        var check_result = undefined;

        check_result = this.wordService.validate(word);
        expect(check_result).not.toBeUndefined();
        expect(check_result).toBe(false);
    });
});