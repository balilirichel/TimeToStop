document.addEventListener('DOMContentLoaded', function () {
    const toggleCheckbox = document.getElementById('toggle');
    const startTimerButton = document.getElementById('startTimer');
    const stopTimerButton = document.getElementById('stopTimer');
    const countdownTimer = document.getElementById('countdownTimer');

    let countdownInterval;
    let tabIds = [];
    let totalTime;
    let tabIdWithTimer;

    function updateCountdownDisplay(timeInSeconds) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
        countdownTimer.textContent = formattedTime;
    }

    function padZero(num) {
        return (num < 10) ? `0${num}` : num;
    }

    function startCountdown() {
        // Get user input for hours, minutes, and seconds
        const hours = parseInt(document.getElementById("hours").value) || 0;
        const minutes = parseInt(document.getElementById("minutes").value) || 0;
        const seconds = parseInt(document.getElementById("seconds").value) || 0;

        // Calculate the total time in seconds
        totalTime = hours * 3600 + minutes * 60 + seconds;

        // Determine which radio button is selected
        let closingTabs = "";
        if (document.getElementById("closeAllTabs").checked) {
            closingTabs = "all";
        } else if (document.getElementById("closeAllTabsCurrentWindow").checked) {
            closingTabs = "current";
        } else if (document.getElementById("closeThisTab").checked) {
            closingTabs = "this";
        }

        // Store the current tab ID as the one with the timer
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length > 0) {
                tabIdWithTimer = tabs[0].id;
            }

            // Send a message to the background script with the correct closingTabs value and tabIdWithTimer
            chrome.runtime.sendMessage({ startCountdown: true, totalTime, closingTabs, tabIdWithTimer }, function (response) {
                if (response && response.success) {
                    // Close the popup
                    //window.close();
                }
            });
        });

        // Update the countdown display
        updateCountdownDisplay(totalTime);

        // Start a real-time countdown
        countdownInterval = setInterval(function () {
            if (totalTime <= 0) {
                clearInterval(countdownInterval);
                return;
            }

            totalTime--;
            updateCountdownDisplay(totalTime);
        }, 1000);
    }

    // Function to stop the countdown timer
    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            notifyUser("Timer Stopped", "Your timer has been stopped");
            // Send a message to the background script to stop the countdown, including tabIdWithTimer
            chrome.runtime.sendMessage({ stopCountdown: true, tabIdWithTimer }, function (response) {
                if (response && response.success) {
                    // Close the popup
                    //window.close();
                }
            });
        }
    }

    // Function to display notifications
    function notifyUser(title, message) {
        const notificationOptions = {
            type: "basic",
            title,
            message,
            iconUrl: "images/icon16.png", // Replace with your extension's icon
        };

        chrome.notifications.create(null, notificationOptions, function (notificationId) {
            if (chrome.runtime.lastError) {
                console.error("Error creating notification:", chrome.runtime.lastError);
            } else {
                console.log("Notification created with ID:", notificationId);
            }
        });
    }

    // Add a click event listener to the "Start Timer" button
    startTimerButton.addEventListener("click", startCountdown);

    // Add a click event listener to the "Stop Timer" button
    stopTimerButton.addEventListener("click", stopCountdown);

    // Add the code below for the Tab Blocker toggle
    toggleCheckbox.addEventListener('change', function () {
        chrome.storage.sync.set({ tabBlockerEnabled: toggleCheckbox.checked });
    });

    chrome.storage.sync.get('tabBlockerEnabled', function (data) {
        toggleCheckbox.checked = data.tabBlockerEnabled || false;
    });

    const darkModeToggle = document.getElementById('modeToggle');
    const container = document.querySelector('.container');

    darkModeToggle.addEventListener('click', function () {
        if (container.classList.contains('dark-mode')) {
            container.classList.remove('dark-mode');
            darkModeToggle.textContent = 'Dark Mode';
            chrome.storage.sync.set({ darkMode: false });
        } else {
            container.classList.add('dark-mode');
            darkModeToggle.textContent = 'Light Mode';
            chrome.storage.sync.set({ darkMode: true });
        }
    });

    // Load the dark mode setting from storage
    chrome.storage.sync.get('darkMode', function (data) {
        if (data.darkMode) {
            container.classList.add('dark-mode');
            darkModeToggle.textContent = 'Light Mode';
        }
    });
});

/*
function getMostVisitedWebsites() {
    chrome.history.search({ text: '', maxResults: 10 }, function (historyItems) {
        const mostVisitedWebsites = historyItems.map(item => item.url);
        // Update the popup with the most visited websites
        updateMostVisitedWebsites(mostVisitedWebsites);
    });
}

function updateMostVisitedWebsites(websites) {
    const mostVisitedList = document.getElementById('mostVisitedList');

    for (const website of websites) {
        const listItem = document.createElement('li');
        listItem.textContent = website;
        mostVisitedList.appendChild(listItem);
    }
}

// Call the function to update most visited websites when the popup is opened
document.addEventListener('DOMContentLoaded', function () {
    getMostVisitedWebsites();
});

// JavaScript code in "popup.js"
document.querySelector('a').addEventListener('click', function () {
    // Check if the main interface tab is already open
    chrome.tabs.query({ url: "chrome-extension://YOUR_EXTENSION_ID/main_interface.html" }, function (tabs) {
        if (tabs.length > 0) {
            // Main interface tab is already open, activate it
            chrome.tabs.update(tabs[0].id, { active: true });
        } else {
            // Main interface tab is not open, open it in a new tab
            chrome.tabs.create({ url: "main_interface.html" });
        }
    });
}); */
