import { setTtl } from "./config.js";
import { sliderMarks } from "./slider.js";

async function ttlChange() {
	await setTtl(Number((document.getElementById("settings") as HTMLFormElement).elements["ttl"].value));
}

async function populateSlider() {
	// Determine pre-selected value
	let preselectedValue = 0;

	// If user upgrading, check if existing value already set
	// Confirm previous ttl value is still among available options
	const { ttl } = await browser.storage.local.get(["ttl"]);
	if (typeof ttl !== "undefined") {
		const validValues = sliderMarks.map((option) => option[0]);
		if (validValues.includes(ttl)) {
			preselectedValue = ttl;
		}
	}

	// Add radio buttons to form
	// Set the initial selected option to manually
	let radioButtons = "";
	for (const sliderMark of sliderMarks) {
		radioButtons += `<div class="flex items-center"><input type="radio" id="option-${sliderMark[0]}" name="ttl" value="${sliderMark[0]}" class="h-4 w-4 border-gray-300 text-purple focus:ring-purple" ${(sliderMark[0] === preselectedValue)? "checked" : ""}><label for="option-${sliderMark[0]}" class="ml-3 block text-base font-normal text-gray-700">${sliderMark[1]}</label></div>`;
	}

	const form = document.getElementById("ttlOptions") as HTMLDivElement;
	form.innerHTML = radioButtons;
}

document.addEventListener("DOMContentLoaded", async () => {
	document.getElementById("settings")!.addEventListener("change", ttlChange);
	await populateSlider();
	await ttlChange();
});
