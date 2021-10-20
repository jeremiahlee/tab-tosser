// TODO: Internationalize this
const daysStr = "days";
const weekStr = "week";
const weeksStr = "weeks";
const monthStr = "month";
const monthsStr = "months";

const sliderMarks: Array<[number, string]> = [
	[3, "3 " + daysStr],
	[4, "4 " + daysStr],
	[5, "5 " + daysStr],
	[6, "6 " + daysStr],
	[7, "1 " + weekStr],
	[14, "2 " + weeksStr],
	[21, "3 " + weeksStr],
	[30, "1 " + monthStr],
	[60, "2 " + monthsStr],
	[90, "3 " + monthsStr]
];

function getLabelForValue(value) {
	for (const mark of sliderMarks) {
		if (mark[0] === value) {
			return mark[1];
		}
	}
}

export {
	sliderMarks, //
	getLabelForValue
};
