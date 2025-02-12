import Parser from 'rss-parser';
const parser = new Parser();

(async () => {
  try {
    const feed = await parser.parseURL('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');
    console.log(feed.title);

    feed.items.forEach(item => {
      console.log(item.title + ':' + item.link);
    });
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
  }
})();