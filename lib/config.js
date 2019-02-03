function enable() {
    return browser.storage.local.set({
        enabled: true,
        initDate: new Date()
    });
}

function disable() {
    return browser.storage.local.set({
        enabled: false
    });
}

async function isEnabled() {
    let storage = await browser.storage.local.get({enabled: false});
    return storage.enabled;
}

function setTtl(newTtl) {
    return browser.storage.local.set({ ttl: newTtl });
}

async function getTtl() {
    let storage = await browser.storage.local.get({ ttl: null });

    if (typeof storage.ttl !== "number") {
        throw new Error("`ttl` is not a number.");
    }

    return storage.ttl;
}

async function getLastCheck() {
    let storage = await browser.storage.local.get({lastCheck: new Date()});
    
    if (storage.lastCheck instanceof Date === true) {
        return storage.lastCheck;
    } else if (typeof storage.lastCheck === "string") {
        return new Date(storage.lastCheck);
    }
}

async function expirationDate() {
    // Update lastCheck to now
    let now = new Date();
    await browser.storage.local.set({ lastCheck: now });
    
    let ttl = await getTtl();
    
    return now.valueOf() - (ttl * 24 * 60 * 60 * 1000);
}

async function clearFromArchiveDate() {
    let lastCheck = await getLastCheck();
    let ttl = await getTtl();

    return lastCheck.valueOf() + (ttl * 24 * 60 * 60 * 1000);
}

// Pause Tab Tosser for 1 week
async function pause() {
    const ttl = await getTtl();
    
    let pausePeriod = 7;

    if (ttl <= 7) {
        pausePeriod = ttl - 1;
    }

    const pauseUntilDate = new Date().valueOf() + (pausePeriod * 24 * 60 * 60 * 1000);
    await browser.storage.local.set({ pauseUntil: pauseUntilDate });
}
async function resume() {
    await browser.storage.local.set({ pauseUntil: null });
}
async function isPaused() {
    const storage = await browser.storage.local.get({ pauseUntil: null });

    if (storage.pauseUntil !== null) {
        return true;
    } else {
        return false;
    }
}
async function isTimeToResume() {
    const storage = await browser.storage.local.get({ pauseUntil: null });

    if (typeof storage.pauseUntil !== "number") {
        return false;
    }

    if (new Date().valueOf() > storage.pauseUntil) {
        return true;
    } else {
        return false;
    }
}
async function backFromHiatus() {
    let lastCheck = await getLastCheck();
    let ttl = await getTtl();
    let now = new Date().valueOf();

    // If today is March 1 and the browser last ran on Jan 1 with a month TTL,
    // now would be greater than the last run + ttl
    // the user is back from a hiatus
    if (now > lastCheck.valueOf() + (ttl * 24 * 60 * 60 * 1000)) {
        return true;
    } else {
        return false;
    }
}

export {
    backFromHiatus,
    clearFromArchiveDate,
    disable,
    expirationDate,
    enable,
    getTtl,
    isEnabled,
    isPaused,
    isTimeToResume,
    pause,
    resume,
    setTtl
};