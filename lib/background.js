import {removeExpiredTabs} from "./open-tabs.js";
import {isEnabled, backFromHiatus, pause, isPaused, isTimeToResume, resume} from "./config.js";
import {findExpiredTabs} from "./open-tabs.js";

// Open the explainer/initial settings page on first run
(async () => {
    if (await isEnabled() === false) {
        browser.tabs.create({
            active: true,
            url: "/lib/first-run.html"
        });
    }
})();

// Run in the background when the browser is chillin’
browser.idle.onStateChanged.addListener(
    async (state) => {
        if ((state === "idle") && (await isEnabled() === true)) {
            
            // Check if vacation mode is activated
            // If so, check if now is time to deactive vacation mode

            const pausedStatus = await isPaused();

            if (pausedStatus === true) {
                const isTimeToResumeCheck = await isTimeToResume();

                if (isTimeToResumeCheck === true) {
                    await resume();
                } else {
                    // Vacation mode still active, so don't do anything
                    return;
                }
            }

            // TODO? what happens in a check during a paused state
            // and the pause state should be extended

            // If vacation detected and there are tabs that will be closed,
            // don't close anything for 1 week
            // (findExpiredTabs updates lastCheck, causing backFromHiatus to return false on next run)
            // Otherwise, do the normal expired tab cleanup

            const backFromHiatusStatus = await backFromHiatus();
            const expiredTabs = await findExpiredTabs();

            if ((backFromHiatusStatus === true) && (expiredTabs.length > 0)) {
                await pause();
            } else {
                removeExpiredTabs();
            }
        }
    }
);

// When extension is re-enabled, clear pause state 
browser.management.onEnabled.addListener(async (info) => {
    // This listener will hear the enabling of any add-on
    // but we only care about the enabling of _this_ add-on

    let self = await browser.management.getSelf();

    if (info.id === self.id) {
        resume();
    }
});
