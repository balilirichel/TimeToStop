// Initialize reminders with default times (12-hour format)
let reminders = {
    breakfast: '06:00',
    snacks: '10:00',
    lunch: '12:00',
    afternoonSnacks: '15:00',
    dinner: '18:00',
};

// Function to set a reminder for a specific type
function setReminder(reminderType, time) {
    // Update the reminder time
    reminders[reminderType] = time;

    // Show a notification confirming the reminder
    showNotification(`${capitalizeFirstLetter(reminderType)} Reminder Set`, `Reminder set at ${formatTime(time)}`);
}

// Function to show a notification
function showNotification(title, message) {
    const notificationOptions = {
        type: 'basic',
        title,
        message,
        iconUrl: 'images/food_icon.png',
    };

    chrome.notifications.create(null, notificationOptions, function (notificationId) {
        if (chrome.runtime.lastError) {
            console.error('Error creating notification:', chrome.runtime.lastError);
        } else {
            console.log('Notification created with ID:', notificationId);
        }
    });
}

// Function to format time in 12-hour format
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const period = parseInt(hours) < 12 ? 'AM' : 'PM';
    const formattedHours = parseInt(hours) % 12 || 12;
    return `${formattedHours}:${minutes} ${period}`;
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event listeners for setting reminders
document.getElementById('setBreakfastReminderButton').addEventListener('click', function () {
    const time = document.getElementById('breakfastTime').value;
    setReminder('breakfast', time);
});

document.getElementById('setSnacksReminderButton').addEventListener('click', function () {
    const time = document.getElementById('snacksTime').value;
    setReminder('snacks', time);
});

document.getElementById('setLunchReminderButton').addEventListener('click', function () {
    const time = document.getElementById('lunchTime').value;
    setReminder('lunch', time);
});

document.getElementById('setAfterSnacksReminderButton').addEventListener('click', function () {
    const time = document.getElementById('aftersnacksTime').value;
    setReminder('afternoonSnacks', time);
});

document.getElementById('setDinnerReminderButton').addEventListener('click', function () {
    const time = document.getElementById('dinnerTime').value;
    setReminder('dinner', time);
});

// Display initial reminder times
document.getElementById('breakfastTime').value = reminders.breakfast;
document.getElementById('snacksTime').value = reminders.snacks;
document.getElementById('lunchTime').value = reminders.lunch;
document.getElementById('aftersnacksTime').value = reminders.afternoonSnacks;
document.getElementById('dinnerTime').value = reminders.dinner;
