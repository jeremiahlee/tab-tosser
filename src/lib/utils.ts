function formatPageTitle(str: string): string {
	// Truncate if necessary
	if (str.length > 40) {
		str = str.trim().slice(0, 39).trim() + "…";
	}

	// Sanitize HTML characters
	// http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
	const div = document.createElement("div");
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

// Only keep tabs that have a purge date in the future
function truncateLogs(logs: string[]): string[] {
	// Only keep last 2,000 logs
	if (logs.length > 2000) {
		logs.splice(0, logs.length - 2000);
	}

	return logs;
}

async function log(str: string): Promise<void> {
	// Get existing logs
	let { logs: existingLogs } : {logs?: string[]} = await browser.storage.local.get({ logs: [] });

	// Append the new log
	(existingLogs as string[]).push(`${new Date().toISOString()}: ${str}`);

	// Deal with storage limits, then save
	let trimmedLogs = truncateLogs(existingLogs!);

	return browser.storage.local.set({ logs: trimmedLogs });
}

async function clearLogs(): Promise<void> {
	return browser.storage.local.set({ logs: [] });
}

export {
	clearLogs,
	formatPageTitle,
	log
}
