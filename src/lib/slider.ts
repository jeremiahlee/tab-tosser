// TODO: Internationalize this
const hoursStr = "hours";
const daysStr = "days";
const weekStr = "week";
const weeksStr = "weeks";

const sliderMarks: Array<[number, string]> = [
	[1, "24 " + hoursStr],
	[2, "2 " + daysStr],
	[3, "3 " + daysStr],
	[4, "4 " + daysStr],
	[5, "5 " + daysStr],
	[6, "6 " + daysStr],
	[7, "1 " + weekStr],
	[14, "2 " + weeksStr],
	[21, "3 " + weeksStr]
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
