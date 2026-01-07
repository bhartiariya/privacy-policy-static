// Vercel Serverless Function for Content Pages
// This generates dynamic HTML pages with Open Graph tags for rich previews

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
  
  // Generate the custom scheme URL for fallback
  const schemeUrl = `bhajansarovar://${type}/${id}`;
  const webUrl = `https://bhajansarovar.com/${type}/${id}`;

  // HTML with Smart Detection to prevent app-web-app bounce
  const html = `
<!DOCTYPE html>
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
      font-size: 48px;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    p {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    
    /* Hidden by default - only shown if Universal Link fails */
    #app-fallback {
      display: none;
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .button {
      display: inline-block;
      padding: 16px 32px;
      margin: 10px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
      border: none;
    }
    
    .button:active {
      transform: scale(0.95);
    }
    
    .button-primary {
      background: white;
      color: #84090B;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .button-primary:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }
    
    .button-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }
    
    .button-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .loading {
      margin-top: 20px;
      font-size: 14px;
      opacity: 0.7;
    }
    
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎵</div>
    <h1>Bhajan Sarovar</h1>
    <p id="loading-text">
      <span class="spinner"></span>
      Opening in app...
    </p>
    
    <!-- Fallback UI - only shown if Universal Link fails (app not installed) -->
    <div id="app-fallback">
      <p>Tap below to open in the app</p>
      <button class="button button-primary" onclick="openApp()">Open in App</button>
      <a href="https://play.google.com/store/apps/details?id=com.dadiji.bhajansangrah" class="button button-secondary">Download App</a>
    </div>
  </div>

  <script>
    // SMART DETECTION: Only show fallback if Universal Link failed
    let appOpened = false;
    let detectionComplete = false;

    // Method 1: Page Visibility API
    // If Universal Link works, page becomes hidden immediately
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        appOpened = true;
        console.log('Page hidden - Universal Link worked!');
      }
    });

    // Method 2: Blur event (app opens, page loses focus)
    window.addEventListener('blur', function() {
      appOpened = true;
      console.log('Window blur - Universal Link worked!');
    });

    // Method 3: Timeout check
    // If page is still visible after 800ms, Universal Link probably failed
    setTimeout(function() {
      detectionComplete = true;
      
      if (!appOpened && document.visibilityState === 'visible') {
        console.log('Universal Link failed - showing fallback');
        // Universal Link didn't work, show fallback
        document.getElementById('loading-text').style.display = 'none';
        document.getElementById('app-fallback').style.display = 'block';
      } else {
        console.log('Universal Link succeeded - no fallback needed');
      }
    }, 800);

    // Function to open app via custom scheme (fallback only)
    function openApp() {
      window.location = '${schemeUrl}';
      
      // If still on page after 1.5s, redirect to Play Store
      setTimeout(function() {
        if (document.visibilityState === 'visible') {
          window.location = 'https://play.google.com/store/apps/details?id=com.dadiji.bhajansangrah';
        }
      }, 1500);
    }

    // Prevent back button issues
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) {
        // Page was loaded from cache, reset detection
        appOpened = false;
        detectionComplete = false;
      }
    });
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};
