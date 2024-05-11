document.addEventListener('DOMContentLoaded', function () {
    // Get references to the default content and menu links
    const defaultContent = document.getElementById('defaultContent');
    const menuLinks = document.querySelectorAll('.sidenav a');

    // Add a click event listener to each menu link
    menuLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            // Hide the default content
            defaultContent.style.display = 'none';
        });
    });
});


// Function to calculate total usage duration
function calculateTotalUsageDuration() {
    // Calculate the total duration based on when the browser was opened
    const now = new Date();
    const browserOpenTime = new Date(0); // Assuming the browser was open from 12:00 am
    const totalMilliseconds = now - browserOpenTime;

    // Convert total milliseconds to hours and minutes
    const totalHours = Math.floor(totalMilliseconds / 3600000);
    const totalMinutes = Math.floor((totalMilliseconds % 3600000) / 60000);

    // Display the duration
    const totalUsageDurationElement = document.getElementById('totalUsageDuration');
    totalUsageDurationElement.textContent = `${totalHours} hours ${totalMinutes} minutes`;
}

// Function to display the most visited sites
function displayMostVisitedSites() {
    // Get visited sites data from storage
    chrome.storage.local.get('visitedSites', function (data) {
        const visitedSites = data.visitedSites || [];

        // Sort the visited sites by time spent (most to least)
        visitedSites.sort((a, b) => b.timeSpent - a.timeSpent);

        // Display the top 10 most visited sites
        const mostVisitedSitesElement = document.getElementById('mostVisitedSites');
        mostVisitedSitesElement.innerHTML = ''; // Clear the previous list

        for (let i = 0; i < Math.min(visitedSites.length, 10); i++) {
            const site = visitedSites[i];
            const listItem = document.createElement('li');
            listItem.textContent = `${site.url} - Time Spent: ${formatMilliseconds(site.timeSpent)}, Visits: ${site.visits}`;
            mostVisitedSitesElement.appendChild(listItem);
        }
    });
}

// Function to format milliseconds into hours and minutes
function formatMilliseconds(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours} hours ${minutes} minutes`;
}

// Call the functions to calculate duration and display most visited sites
calculateTotalUsageDuration();
displayMostVisitedSites();