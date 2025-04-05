<template>
  <div class="min-h-screen w-64 bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <div class="text-center mb-6">
        <img class="mx-auto" alt="Vocapedia logo" src="./assets/logo.png" width="125" height="125" />
        <h2 class="text-3xl font-semibold text-gray-800 mt-4">{{ $t('title') }}</h2>
      </div>

      <div>
        <label for="chapterID" class="block text-lg font-medium text-gray-700">{{ $t('search_placeholder') }}</label>
        <input id="chapterID" v-model="chapterID" type="text"
          class="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :placeholder="$t('search_placeholder')" />

        <label for="interval" class="block text-lg font-medium text-gray-700 mt-4">{{ $t('interval_placeholder')
          }}</label>
        <input id="interval" v-model.number="interval" type="number" min="1"
          class="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :placeholder="$t('interval_placeholder')" />

        <div class="flex justify-between gap-4 mt-6">
          <button
            class="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @click="start">
            {{ $t('fetchData') }}
          </button>
          <button
            class="w-1/2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            @click="stop">
            {{ $t('stopFetch') }}
          </button>
        </div>
      </div>

      <div v-if="response" class="mt-6 p-4 bg-green-100 text-green-800 rounded-lg">
        <p>{{ $t('chapter_id') }}: {{ response.chapter_id }}</p>
      </div>

      <div v-if="error" class="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
        <p>{{ $t('fetchError') }}: {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { i18n } from '@/i18n/i18n';

const chapterID = ref('');
const interval = ref(1);
const response = ref(null);
const error = ref(null);
const snowflakeRegex = /^\d{10,19}$/;

const start = () => {
  if (!chapterID.value.match(snowflakeRegex)) {
    alert(i18n.global.t('invalid_chapter_id'));
    return;
  }
  if (interval.value < 1) {
    alert(i18n.global.t('invalid_interval'));
    return;
  }

  chrome.storage.local.set({ chapterID: chapterID.value, interval: interval.value });

  chrome.alarms.clearAll(() => {
    chrome.notifications.create("startNotification", {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('logo.png'),
      title: i18n.global.t('start_notification_title'),
      message: i18n.global.t('start_notification_message'),
      priority: 2,
    });

    chrome.alarms.create('fetchDataAlarm', { periodInMinutes: interval.value });
  });
};

const stop = () => {
  chrome.alarms.clearAll(() => {
    chrome.storage.local.remove(['chapterID', 'interval']);
    chapterID.value = '';
    interval.value = 1;
    chrome.notifications.create("stopNotification", {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('logo.png'),
      title: i18n.global.t('start_notification_title'),
      message: i18n.global.t('stopped'),
      priority: 2,
    });
  });
};

onMounted(() => {
  chrome.storage.local.get(['chapterID', 'interval'], function (result) {
    chapterID.value = result.chapterID || '';
    interval.value = result.interval || 1;
  });
});
</script>
