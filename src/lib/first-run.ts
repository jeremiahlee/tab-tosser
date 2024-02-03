import { getTtl, setTtl } from "./config.js";
import { sliderMarks } from "./slider.js";

async function ttlChange(): Promise<void> {
	await setTtl(Number((document.getElementById("settings") as HTMLFormElement).elements["ttl"].value));
}

async function populateSlider(): Promise<void> {
	let preselectedValue = await getTtl();

	let radioButtons:string = "";
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
