import { clearArchivedTabsHistory, getClosedTabs } from "./closed-tabs.js";
import { isPaused, resume } from "./config.js";
import { sliderMarks } from "./slider.js";
import { totalTabsClosedCount, totalTabsClosedCountSince } from "./stats.js";

function saveOptions(): void {
	browser.storage.local.set({
		ttl: Number((document.querySelector("#ttl") as HTMLSelectElement).value)
	});
}

async function restoreOptions(): Promise<void> {
	const options = await browser.storage.local.get(["ttl"]);

	if (typeof options.ttl !== "undefined") {
		(document.querySelector("#ttl") as HTMLSelectElement).value = options.ttl;
	}
}

function populateSlider(): void {
	const select = document.querySelector("#ttl")!;

	for (const sliderMark of sliderMarks) {
		select.appendChild(new Option(sliderMark[1], `${sliderMark[0]}`));
	}
}

async function populateTossedTabs(): Promise<void> {
	const tossedTabsDiv = document.querySelector("#archivedTabsSection") as HTMLDivElement;
	const tossedTabsUl = document.querySelector("#archivedTabs") as HTMLUListElement;

	const tossedTabs = await getClosedTabs();
	tossedTabs.reverse();

	if (tossedTabs.length === 0) {
		tossedTabsDiv.style.display = "none";
		return;
	}

	let listHtml = "";

	for (const tossedTab of tossedTabs) {
		// [tab.url, tab.title, tab.lastAccessed, clearFromArchiveDateCache]
		listHtml += `<li><a rel="noopener noreferrer" target="_blank" href="${tossedTab[0]}">${tossedTab[1]}</a></li>`;
	}
	tossedTabsUl.innerHTML = listHtml;
}

async function populateStats(): Promise<void> {
	const tabsClosedCount = await totalTabsClosedCount();

	(document.getElementById("totalTabsClosedCount") as HTMLSpanElement).innerText = `${tabsClosedCount}`;

	const dateString = new Date(await totalTabsClosedCountSince()).toISOString().substring(0, 10);

	(document.getElementById("initDate") as HTMLSpanElement).innerText = dateString;
}

async function handlePausedState(): Promise<void> {
	if ((await isPaused()) === true) {
		document.getElementById("paused")!.style.display = "block";
	}
}

function resumeHandler(event: MouseEvent): void {
	event.preventDefault();
	resume();

	const pausedP = document.getElementById("paused")!;
	pausedP.style.display = "none";
}

async function clearHistoryHandler(event: MouseEvent): Promise<void> {
	event.preventDefault();

	if ((await clearArchivedTabsHistory()) === true) {
		const tossedTabsDiv = document.getElementById("archivedTabsSection")!;
		tossedTabsDiv.style.display = "none";
	}
}

async function openHistoryHandler(event: MouseEvent): Promise<void> {
	event.preventDefault();

	const tossedTabs = await getClosedTabs();
	tossedTabs.reverse();

	for (const tossedTab of tossedTabs) {
		await browser.tabs.create({
			url: tossedTab[0]
		});
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	populateSlider();
	restoreOptions();
	handlePausedState();
	await populateTossedTabs();
	await populateStats();
	document.getElementById("ttl")!.addEventListener("change", saveOptions);
	document.getElementById("resumeLink")!.addEventListener("click", resumeHandler);
	document.getElementById("clearHistoryLink")!.addEventListener("click", clearHistoryHandler);
	document.getElementById("openHistoryLink")!.addEventListener("click", openHistoryHandler);
});
