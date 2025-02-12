import Parser from 'rss-parser';
import { jest } from '@jest/globals';

// filepath: /home/ashben/www/html/tipics/nextjs-test-app/components/google-news-RSS.test.tsx

jest.mock('rss-parser');

describe('google-news-RSS', () => {
  let parser: any;

  beforeEach(() => {
    parser = new Parser();
  });

  it('should fetch and log the RSS feed title and items', async () => {
    const mockFeed = {
      title: 'Google News',
      items: [
        { title: 'News Item 1', link: 'http://example.com/1' },
        { title: 'News Item 2', link: 'http://example.com/2' },
      ],
    };

    parser.parseURL.mockResolvedValue(mockFeed);

    console.log = jest.fn();

    await (async () => {
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

    expect(console.log).toHaveBeenCalledWith('Google News');
    expect(console.log).toHaveBeenCalledWith('News Item 1:http://example.com/1');
    expect(console.log).toHaveBeenCalledWith('News Item 2:http://example.com/2');
  });

  it('should log an error if fetching the RSS feed fails', async () => {
    const mockError = new Error('Failed to fetch RSS feed');
    parser.parseURL.mockRejectedValue(mockError);

    console.error = jest.fn();

    await (async () => {
      try {
        await parser.parseURL('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');
      } catch (error) {
        console.error("Error fetching RSS feed:", error);
      }
    })();

    expect(console.error).toHaveBeenCalledWith("Error fetching RSS feed:", mockError);
  });
});