const fs = require('fs');
const https = require('https');

https.get('https://www.picuki.com/profile/goldenpadelclubtanger', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = [...data.matchAll(/<img[^>]+src="([^">]+)"/g)];
    const urls = matches.map(m => m[1]).filter(url => url.includes('scontent') || url.includes('instagram'));
    console.log(JSON.stringify(urls, null, 2));
  });
}).on('error', err => console.log(err.message));
