let countdownInterval;
let tabIds = [];
let totalTime;
let timerRunningNotificationShown = false;
let tabIdWithTimer;
let tabData = {};


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.startCountdown) {
        totalTime = message.totalTime;
        const closingTabs = message.closingTabs;
        tabIdWithTimer = message.tabIdWithTimer;

        if (totalTime > 0) {
            notifyUser("The countdown timer started", "Timer running");
            timerRunningNotificationShown = true;

            // Calculate half of the total time
            const halfTime = Math.ceil(totalTime / 2);

            countdownInterval = setInterval(function () {
                if (totalTime <= 0) {
                    clearInterval(countdownInterval);
                    if (!timerRunningNotificationShown) {
                        notifyUser("Time's Up!", "Your session has ended");
                    }
                    closeTabs(closingTabs);
                } else {
                    totalTime--;
                    if (totalTime <= halfTime && !timerRunningNotificationShown) {
                        notifyUser("Half Time", `You've reached the halfway point.`);
                        timerRunningNotificationShown = true; // Show this notification only once
                    }
                }
            }, 1000);

            sendResponse({ success: true });
        } else {
            sendResponse({ success: false });
        }

        sendResponse({ success: true, tabIdWithTimer });
    } else if (message.stopCountdown) {
        stopCountdown();
        sendResponse({ success: true });
    } else if (message.startIndividualCountdown) {
        startIndividualCountdown(message.tabId, message.totalTime);
        sendResponse({ success: true });
    }
});

function startIndividualCountdown(tabId, totalTime) {
    let tabCountdownInterval;

    notifyUser(tabId, "The countdown timer started", "Timer running");

    tabCountdownInterval = setInterval(function () {
        if (totalTime <= 0) {
            clearInterval(tabCountdownInterval);
            notifyUser(tabId, "Time's Up!", "Your session has ended");
            closeTab(tabId);
        } else {
            totalTime--;
            notifyUser(tabId, "Timer Running", `Time remaining: ${formatTime(totalTime)}`);
        }
    }, 1000);
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
}

function notifyUser(title, message) {
    const notificationOptions = {
        type: "basic",
        title,
        message,
        iconUrl: "images/icon16.png", 
    };

    chrome.notifications.create(null, notificationOptions, function (notificationId) {
        if (chrome.runtime.lastError) {
            console.error("Error creating notification:", chrome.runtime.lastError);
        } else {
            console.log("Notification created with ID:", notificationId);
        }
    });
}

function closeTabs(closingTabs) {
    if (closingTabs === "all") {
        closeAllTabs();
    } else if (closingTabs === "current") {
        closeAllTabsInCurrentWindow();
    } else if (closingTabs === "this") {
        closeCurrentTab();
    } else {
        closeRecentTabs();
    }
}

function closeAllTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (const tab of tabs) {
            tabIds.push(tab.id);
        }
        chrome.tabs.remove(tabIds);
        tabIds = [];
    });
}

function closeAllTabsInCurrentWindow() {
    chrome.windows.getCurrent({ populate: true }, function (currentWindow) {
        const currentWindowId = currentWindow.id;
        const tabsInCurrentWindow = currentWindow.tabs;

        for (const tab of tabsInCurrentWindow) {
            tabIds.push(tab.id);
        }

        chrome.tabs.query({}, function (allTabs) {
            for (const tab of allTabs) {
                if (tab.windowId === currentWindowId && !tabIds.includes(tab.id)) {
                    tabIds.push(tab.id);
                }
            }

            chrome.tabs.remove(tabIds);
            tabIds = [];
        });
    });
}

function closeCurrentTab() {
    console.log("Closing tab with ID: " + tabIdWithTimer);
    if (tabIdWithTimer) {
        chrome.tabs.remove(tabIdWithTimer, function () {
            console.log("Tab with ID " + tabIdWithTimer + " closed.");
        });
    }
}

function closeRecentTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (const tab of tabs) {
            if (!tabIds.includes(tab.id)) {
                tabIds.push(tab.id);
            }
        }
        chrome.tabs.remove(tabIds);
        tabIds = [];
    });
}

function stopCountdown() {
    console.log("Stop button clicked");
    if (countdownInterval) {
        clearInterval(countdownInterval);
        totalTime = 0;
        notifyUser("Timer Stopped", "Your timer has been stopped");
    }
}

chrome.tabs.onCreated.addListener(function (tab) {
    chrome.storage.sync.get('tabBlockerEnabled', function (data) {
        if (data.tabBlockerEnabled) {
             chrome.tabs.remove(tab.id);
        }
    });
});

chrome.webNavigation.onCompleted.addListener(function (details) {
    const url = details.url;
    const tabId = details.tabId;

    // Add your logic to track visited sites here
    // Ensure that this script can interact with storage or other parts of your extension as needed
     // Get the current date and time
     const currentTime = new Date();

     // Check if the site is not a Chrome-related URL (e.g., extensions, new tab)
     if (!url.includes('chrome://')) {
         // Get the data for visited sites from storage
         chrome.storage.local.get('visitedSites', function (data) {
             const visitedSites = data.visitedSites || [];
 
             // Check if the site is already in the list
             const siteIndex = visitedSites.findIndex((site) => site.url === url);
 
             if (siteIndex !== -1) {
                 // Update the existing site's data
                 visitedSites[siteIndex].timeSpent += 60000; // Assuming 1 minute per visit
                 visitedSites[siteIndex].visits += 1;
             } else {
                 // Add a new site to the list
                 visitedSites.push({ url, timeSpent: 60000, visits: 1 }); // Assuming 1 minute per visit
             }
 
             // Save the updated visited sites data
             chrome.storage.local.set({ visitedSites });
         });
     }
});
