const notificationMap = new Map();

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'fetchDataAlarm') {
        fetchData();
    }
});

async function fetchData() {
    chrome.storage.local.get(['chapterID'], async function (result) {
        const chapterID = result.chapterID;
        const fakeEndpoint = chrome.runtime.getURL('chapters/1904652438552449024.json')
        if (chapterID) {
            try {
                const response = await fetch(fakeEndpoint)//`https://vocapedia.space/api/v1/public/chapters/extension/${chapterID}`);
                const data = await response.json();
                showNotification(data);
            } catch (error) {
                console.error('ERR:', error);
            }
        }
    });
}

function showNotification(message) {
    const chapterID = BigInt(message.chapter_id).toString();
    const wordID = BigInt(message.word_id).toString();

    notificationMap.set(wordID, chapterID);

    chrome.notifications.create(wordID, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('logo.png'),
        title: message.main,
        message: message.second,
        priority: 2,
    });
}

chrome.notifications.onClicked.addListener((clickedNotificationId) => {
    const chapterID = notificationMap.get(clickedNotificationId);
    if (chapterID) {
        chrome.tabs.create({ url: 'https://vocapedia.space/l/' + chapterID });
        notificationMap.delete(clickedNotificationId);
    }
});
