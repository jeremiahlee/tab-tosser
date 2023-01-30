const colors = require("tailwindcss/colors");

module.exports = {
	content: ["src/lib/**/*.{html,js}"],
	theme: {
		colors: {
			purple: "#50256f",
			white: colors.white
		}
	},
	variants: {
		extend: {}
	},
	plugins: []
};
