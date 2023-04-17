import Cache from './cache.js';

// elements
const $request = document.getElementById('request');
const $clearCache = document.getElementById('clear-cache');
const $revalidate = document.getElementById('revalidate');
const $dateStart = document.getElementById('date-start');
const $dateEnd = document.getElementById('date-end');
const $requestData = document.getElementById('request-data');
const $from = document.getElementById('from');

// constants
const url = 'https://api.datacite.org/dois?query=created:[2010-01-01%20TO%202012-01-01]&page[number]=1&page[size]=5';

// cache
const cache = new Cache();

// fields value
const values = {
  get revalidate() {
    return +$revalidate.value;
  },
  get dateStart() {
    return $dateStart.value;
  },
  get dateEnd() {
    return $dateEnd.value;
  },
};

// functions
async function request(url, options) {
  try {
    const cacheKey = getCacheKey(url);

    const cacheData = cache.get(cacheKey);
  
    if (cacheData) {
      return {
        ...cacheData,
        _from: 'Cache',
      };
    }
  
    const response = await fetch(url, options);
    const data = await response.json();
  
    cache.set(cacheKey, data);

    cache.revalidate(cacheKey, async () => {
      const response = await fetch(url).then((response) => response.json());
    
      return response;
    }, values.revalidate);
  
    return {
      ...data,
      _from: 'Server',
    };
  } catch (e) {
    console.error('request', e);
  }
}

async function getData() {
  try {
    return request(url);
  } catch (e) {
    console.error('getData', e);
  }
}

function getCacheKey(url) {
  return `${url}_${values.dateStart}_${values.dateEnd}`;
}

// utils
function makeDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
}

// render
function renderRequestData(data) {
  $requestData.innerText = JSON.stringify(data, null, 2);
}

function renderFromData(from) {
  $from.innerText = `From: ${from}`;
}

function initializeDates() {
  const date = new Date();
  const dateString = makeDate(date);

  $dateStart.value = dateString;
  $dateEnd.value = dateString;
}

// listeners
$request.addEventListener('click', handleRequest);

$clearCache.addEventListener('click', handleClearCache);

// listener functions
async function handleRequest() {
  const data = await getData();
  renderRequestData(data);
  renderFromData(data._from);
}

function handleClearCache() {
  cache.clear();
}

initializeDates();
