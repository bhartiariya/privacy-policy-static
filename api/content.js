// Vercel Serverless Function for Content Pages
// FIXED: Minimal response for mobile to let Universal Links work

module.exports = async (req, res) => {
    const { type, id } = req.query;

    if (!type || !id) {
        return res.status(400).send('Missing type or id parameter');
    }

    // Detect if request is from mobile app or social media crawler
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isCrawler = /facebookexternalhit|WhatsApp|Telegram|Slack|Twitter/i.test(userAgent);
    
    const webUrl = `https://bhajansarovar.com/${type}/${id}`;
    const schemeUrl = `bhajansarovar://${type}/${id}`;
    
    // Map content types to display names
    const typeNames = {
        'bhajan': 'Bhajan',
        'song': 'Song',
        'playlist': 'Playlist',
        'user-playlist': 'Playlist',
        'album': 'Album',
        'artist': 'Artist',
        'user': 'User Profile'
    };
    const contentName = typeNames[type] || 'Content';
    const contentDesc = `Listen to this ${contentName.toLowerCase()} on Bhajan Sarovar`;

    // CRITICAL: For social media crawlers, return full HTML with Open Graph tags
    // but NO redirect - just let them scrape the meta tags
    if (isCrawler) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bhajan Sarovar - ${contentName}</title>
  
  <!-- Open Graph tags for rich previews -->
  <meta property="og:title" content="Bhajan Sarovar - ${contentName}" />
  <meta property="og:description" content="${contentDesc}" />
  <meta property="og:image" content="https://bhajansarovar.com/og-image.png" />
  <meta property="og:url" content="${webUrl}" />
  <meta property="og:type" content="music.song" />
  <meta property="og:site_name" content="Bhajan Sarovar" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Bhajan Sarovar - ${contentName}" />
  <meta name="twitter:description" content="${contentDesc}" />
  <meta name="twitter:image" content="https://bhajansarovar.com/og-image.png" />
</head>
<body>
  <h1>Bhajan Sarovar - ${contentName}</h1>
  <p>${contentDesc}</p>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    }

    // CRITICAL FIX: For mobile browsers, return INSTANT redirect
    // This prevents HTML from loading and breaking Universal Links
    if (isMobile) {
        // 302 redirect instantly to custom scheme
        // Universal Links should intercept before this even executes,
        // but if they don't (e.g., Android), this will trigger the app
        res.setHeader('Location', schemeUrl);
        return res.status(302).send('Redirecting to app...');
    }

    // For desktop browsers, show full landing page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bhajan Sarovar - ${contentName}</title>
  
  <!-- Open Graph tags -->
  <meta property="og:title" content="Bhajan Sarovar - ${contentName}" />
  <meta property="og:description" content="${contentDesc}" />
  <meta property="og:image" content="https://bhajansarovar.com/og-image.png" />
  <meta property="og:url" content="${webUrl}" />
  <meta property="og:type" content="music.song" />
  <meta property="og:site_name" content="Bhajan Sarovar" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Bhajan Sarovar - ${contentName}" />
  <meta name="twitter:description" content="${contentDesc}" />
  <meta name="twitter:image" content="https://bhajansarovar.com/og-image.png" />
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #84090B 0%, #5a0607 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .container { text-align: center; max-width: 500px; }
    .logo { font-size: 64px; margin-bottom: 24px; animation: fadeIn 0.6s; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    h1 { font-size: 36px; margin-bottom: 12px; }
    p { font-size: 18px; opacity: 0.9; margin-bottom: 32px; line-height: 1.6; }
    .buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .button {
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      background: white;
      color: #84090B;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎵</div>
    <h1>Bhajan Sarovar</h1>
    <p>${contentName}<br>Download the app to listen to devotional music</p>
    <div class="buttons">
      <a href="https://apps.apple.com/app/id6738131733" class="button">App Store</a>
      <a href="https://play.google.com/store/apps/details?id=com.dadiji.bhajansangrah" class="button">Play Store</a>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
};
