chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'fetchDataAlarm') {
        fetchData();
    }
});

async function fetchData() {
    chrome.storage.local.get(['chapterID'], async function (result) {
        const chapterID = result.chapterID;
        if (chapterID) {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/public/chapters/extension?chapter_id=${chapterID}`);
                const data = await response.json();
                showNotification(data);
            } catch (error) {
                console.error('ERR:', error);
            }
        }
    });
}

function showNotification(message) {
    var chapterID = BigInt(message.chapter_id).toString();
    var wordID = BigInt(message.word_id).toString();
    chrome.notifications.create(wordID, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('logo.png'),
        title: message.main,
        message: message.second,
        priority: 2,
    });
    chrome.notifications.onClicked.addListener((clickedNotificationId) => {
        if (clickedNotificationId === wordID) {
            chrome.tabs.create({ url: 'https://vocapedia.space/l/' + chapterID });
        }
    });

}


