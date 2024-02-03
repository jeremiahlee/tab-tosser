const sliderMarks: Array<[number, string]> = [
	[0, "manually"],
	[1, "after 1 day"],
	[7, "after 1 week"],
	[31, "after 1 month"]
];

const sliderMarkTtls: Array<number> = sliderMarks.map((option) => option[0]);

export {
	sliderMarkTtls,
	sliderMarks
};
