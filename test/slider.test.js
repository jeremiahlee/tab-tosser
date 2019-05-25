import {getLabelForValue} from "../dist/lib/slider.js";

QUnit.test("slider: days", function(assert) {
    assert.equal(getLabelForValue(3), "3 days");
});

QUnit.test("slider: week", function(assert) {
    assert.equal(getLabelForValue(7), "1 week");
});

QUnit.test("slider: weeks", function(assert) {
    assert.equal(getLabelForValue(14), "2 weeks");
});

QUnit.test("slider: month", function(assert) {
    assert.equal(getLabelForValue(30), "1 month");
});

QUnit.test("slider: months", function(assert) {
    assert.equal(getLabelForValue(60), "2 months");
});
