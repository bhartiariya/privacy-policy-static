// Vercel Serverless Function for Content Pages
// This generates dynamic HTML pages with Open Graph tags for rich previews
// FIXED VERSION - Removed smart detection logic that caused app→web→app bounce

module.exports = async (req, res) => {
    const { type, id } = req.query;

    if (!type || !id) {
        return res.status(400).send('Missing type or id parameter');
    }

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

    // Generate the custom scheme URL for fallback (Android/manual trigger)
    const schemeUrl = `bhajansarovar://${type}/${id}`;
    const webUrl = `https://bhajansarovar.com/${type}/${id}`;

    // HTML with simplified fallback - NO smart detection
    // Universal Links handle app opening automatically; this is ONLY for users without the app
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bhajan Sarovar - ${contentName}</title>
  
  <!-- iOS Smart App Banner - Native iOS feature for "Open in App" -->
  <meta name="apple-itunes-app" content="app-id=6738131733">
  
  <!-- Open Graph tags for rich previews -->
  <meta property="og:title" content="Bhajan Sarovar - ${contentName}" />
  <meta property="og:description" content="${contentDesc}" />
  <meta property="og:image" content="https://bhajansarovar.com/og-image.png" />
  <meta property="og:url" content="${webUrl}" />
  <meta property="og:type" content="music.song" />
  <meta property="og:site_name" content="Bhajan Sarovar" />
  
  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Bhajan Sarovar - ${contentName}" />
  <meta name="twitter:description" content="${contentDesc}" />
  <meta name="twitter:image" content="https://bhajansarovar.com/og-image.png" />
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #84090B 0%, #5a0607 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    
    .logo {
      font-size: 64px;
      margin-bottom: 24px;
      animation: fadeInUp 0.6s ease-out;
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 12px;
      font-weight: 600;
      animation: fadeInUp 0.6s ease-out 0.1s both;
    }
    
    .content-type {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 32px;
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }
    
    p.message {
      font-size: 16px;
      opacity: 0.85;
      margin-bottom: 32px;
      line-height: 1.6;
      animation: fadeInUp 0.6s ease-out 0.3s both;
    }
    
    .buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      animation: fadeInUp 0.6s ease-out 0.4s both;
    }
    
    .button {
      display: inline-block;
      padding: 16px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      width: 100%;
    }
    
    .button:active {
      transform: scale(0.98);
    }
    
    .button-primary {
      background: white;
      color: #84090B;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .button-primary:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      transform: translateY(-2px);
    }
    
    .button-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.4);
    }
    
    .button-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.6);
    }
    
    .store-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      animation: fadeInUp 0.6s ease-out 0.5s both;
    }
    
    .store-button {
      flex: 1;
      padding: 12px 20px;
      font-size: 14px;
    }
    
    .note {
      margin-top: 32px;
      font-size: 14px;
      opacity: 0.7;
      animation: fadeInUp 0.6s ease-out 0.6s both;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎵</div>
    <h1>Bhajan Sarovar</h1>
    <p class="content-type">${contentName}</p>
    <p class="message">
      This content is best experienced in the Bhajan Sarovar app.<br>
      Download now to listen to devotional music anytime!
    </p>
    
    <div class="buttons">
      <!-- For users with app installed (Android fallback) -->
      <button class="button button-primary" onclick="openApp()">
        Open in App
      </button>
    </div>
    
    <!-- Download links -->
    <div class="store-buttons">
      <a href="https://apps.apple.com/app/id6738131733" class="button button-secondary store-button">
        App Store
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.bhajansarovar.app" class="button button-secondary store-button">
        Play Store
      </a>
    </div>
    
    <p class="note">
      📱 iOS users: If you have the app installed, it should have opened automatically via the Smart App Banner above.
    </p>
  </div>

  <script>
    // Simple fallback for Android or manual button tap
    // iOS Universal Links handle app opening automatically
    function openApp() {
      // Try custom scheme (works on Android if app installed)
      window.location = '${schemeUrl}';
      
      // After 1.5s, if still on page, they probably don't have the app
      setTimeout(function() {
        if (document.visibilityState === 'visible') {
          // Redirect to Play Store (default to Android since iOS handles via Universal Links)
          window.location = 'https://play.google.com/store/apps/details?id=com.bhajansarovar.app';
        }
      }, 1500);
    }
  </script>
</body>
</html>
  `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
};
