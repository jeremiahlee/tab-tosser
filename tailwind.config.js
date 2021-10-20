const colors = require("tailwindcss/colors");

module.exports = {
	mode: "jit",
	purge: ["./src/lib/*.html", "./src/lib/*.js"],
	darkMode: false, // or 'media' or 'class'
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
