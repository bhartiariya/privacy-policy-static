export default async function handler(req, res) {
  const { type, id } = req.query;
  
  if (!type || !id) {
    return res.status(400).send('Missing type or id parameter');
  }
  
  try {
    // Map URL type to Firestore collection
    const collectionMap = {
      'bhajan': 'songs',
      'song': 'songs',
      'playlist': 'playlists',
      'user-playlist': 'userPlaylists',
      'album': 'albums',
      'artist': 'artists',
      'user': 'users'
    };
    
    const collection = collectionMap[type];
    if (!collection) {
      throw new Error(`Invalid type: ${type}`);
    }
    
    // Fetch from Firestore
    const projectId = 'dadiji-bhajan-sangrah-62543';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${id}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Firestore returned ${response.status}`);
    }
    
    const data = await response.json();
    const f = data.fields;
    
    // Extract content data based on type
    let contentName, contentImage, contentDesc, ogType, schemeUrl;
    
    if (type === 'bhajan' || type === 'song') {
      const songName = f.name?.stringValue || f.title?.stringValue || 'Bhajan';
      const artist = f.artists?.stringValue || f.artist?.stringValue || 'Unknown Artist';
      contentImage = f.image?.stringValue || f.thumbnail?.stringValue || 'https://bhajansarovar.com/default.jpg';
      contentName = `${songName} - ${artist}`;
      contentDesc = `Listen to ${songName} by ${artist} on Bhajan Sarovar`;
      ogType = 'music.song';
      schemeUrl = `bhajansarovar://bhajan/${id}`;
      
    } else if (type === 'playlist' || type === 'user-playlist') {
      const playlistName = f.title?.stringValue || f.name?.stringValue || 'Playlist';
      const songCount = f.songCount?.integerValue || f.songs?.arrayValue?.values?.length || 0;
      contentImage = f.imageUrl?.stringValue || f.image?.stringValue || 'https://bhajansarovar.com/default.jpg';
      contentName = playlistName;
      contentDesc = `${playlistName} • ${songCount} songs on Bhajan Sarovar`;
      ogType = 'music.playlist';
      schemeUrl = `bhajansarovar://${type}/${id}`;
      
    } else if (type === 'album') {
      const albumName = f.title?.stringValue || f.name?.stringValue || 'Album';
      const albumArtist = f.artist?.stringValue || f.artists?.stringValue || 'Various Artists';
      const albumCount = f.songCount?.integerValue || 0;
      contentImage = f.imageUrl?.stringValue || f.image?.stringValue || 'https://bhajansarovar.com/default.jpg';
      contentName = `${albumName} - ${albumArtist}`;
      contentDesc = `${albumName} by ${albumArtist} • ${albumCount} songs`;
      ogType = 'music.album';
      schemeUrl = `bhajansarovar://album/${id}`;
      
    } else if (type === 'artist') {
      contentName = f.name?.stringValue || 'Artist';
      contentImage = f.imageUrl?.stringValue || f.image?.stringValue || f.profileImage?.stringValue || 'https://bhajansarovar.com/default.jpg';
      const bio = f.bio?.stringValue || f.description?.stringValue || '';
      contentDesc = bio ? bio.substring(0, 100) + '...' : `Listen to ${contentName} on Bhajan Sarovar`;
      ogType = 'profile';
      schemeUrl = `bhajansarovar://artist/${id}`;
      
    } else if (type === 'user') {
      contentName = f.displayName?.stringValue || f.name?.stringValue || 'User';
      contentImage = f.profileImage?.stringValue || f.photoUrl?.stringValue || 'https://bhajansarovar.com/default-profile.jpg';
      const userBio = f.bio?.stringValue || '';
      contentDesc = userBio || `${contentName}'s profile on Bhajan Sarovar`;
      ogType = 'profile';
      schemeUrl = `bhajansarovar://user/${id}`;
    }
    
    const borderRadius = ogType === 'profile' ? '50%' : '15px';
    
    // Generate HTML with Open Graph tags
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Bhajan Sarovar">
<meta property="og:title" content="${contentName}">
<meta property="og:description" content="${contentDesc}">
<meta property="og:image" content="${contentImage}">
<meta property="og:url" content="https://bhajansarovar.com/${type}/${id}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${contentName}">
<meta name="twitter:description" content="${contentDesc}">
<meta name="twitter:image" content="${contentImage}">
<title>${contentName} | Bhajan Sarovar</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.c{background:#fff;border-radius:20px;padding:40px;max-width:500px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
img{width:200px;height:200px;border-radius:${borderRadius};margin-bottom:20px;object-fit:cover;box-shadow:0 8px 32px rgba(0,0,0,.2)}
h1{color:#333;margin:10px 0;font-size:24px;font-weight:600}
p{color:#666;margin-bottom:20px;font-size:14px}
.btn{display:inline-block;padding:15px 40px;background:linear-gradient(135deg,#84090B,#c41e3a);color:#fff;text-decoration:none;border-radius:30px;font-weight:700;margin:10px;transition:transform .2s}
.btn:hover{transform:translateY(-2px)}
</style>
</head>
<body>
<div class="c">
<img src="${contentImage}" alt="${contentName}" onerror="this.src='https://bhajansarovar.com/default.jpg'">
<h1>${contentName}</h1>
<p>Opening in Bhajan Sarovar...</p>
<a href="${schemeUrl}" class="btn">Open in App</a>
</div>
<script>
window.location.href='${schemeUrl}';
setTimeout(function(){if(document.hasFocus()){console.log('App not detected')}},2000);
</script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('Error in content API:', error);
    
    // Fallback HTML that still redirects to app
    const fallbackScheme = `bhajansarovar://${type}/${id}`;
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:title" content="Bhajan Sarovar">
<meta property="og:description" content="Listen to devotional music">
<meta property="og:image" content="https://bhajansarovar.com/default.jpg">
<title>Bhajan Sarovar</title>
</head>
<body>
<p>Opening Bhajan Sarovar...</p>
<script>window.location.href='${fallbackScheme}'</script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(fallbackHtml);
  }
}
