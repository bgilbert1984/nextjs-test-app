import axios from 'axios';

const apiKey = 'YOUR_GOOGLE_CUSTOM_SEARCH_API_KEY';
const cx = 'YOUR_CUSTOM_SEARCH_ENGINE_ID'; // Your CSE ID
const query = 'Tesla';
const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&sort=date`; // sort by date for news

async function getNews() {
  try {
    const response = await axios.get(url);
    const results = response.data.items;
    results.forEach(item => {
      console.log(item.title);
      console.log(item.link);
      console.log(item.snippet); // Short description
    });
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

getNews();