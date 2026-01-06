const fetch = require('node-fetch');
module.exports = async (req, res) => {
  const { type, id } = req.query;
  
  if (!type || !id) {
    return res.status(400).send('Type and ID required');
  }
  
  try {
    // Determine Firestore collection and fetch data
    let collection, name, image, desc, ogType, scheme;
    const projectId = 'dadiji-bhajan-sangrah-62543';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${getCollection(type)}/${id}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Not found');
    
    const data = await response.json();
    const f = data.fields;
    
    // Extract data based on content type
    switch(type) {
      case 'bhajan':
      case 'song':
        collection = 'songs';
        name = f.name?.stringValue || f.title?.stringValue || 'Bhajan';
        const artist = f.artists?.stringValue || f.artist?.stringValue || 'Unknown';
        image = f.image?.stringValue || f.thumbnail?.stringValue || 'https://bhajansarovar.com/default.jpg';
        desc = `Listen to ${name} by ${artist} on Bhajan Sarovar`;
        ogType = 'music.song';
        scheme = `bhajansarovar://bhajan/${id}`;
        name = `${name} - ${artist}`;
        break;
        
      case 'playlist':
        collection = 'playlists';
        name = f.title?.stringValue || f.name?.stringValue || 'Playlist';
        image = f.imageUrl?.stringValue || f.image?.stringValue || 'https://bhajansarovar.com/default.jpg';
        const songCount = f.songCount?.integerValue || f.songs?.arrayValue?.values?.length || 0;
        desc = `${name} • ${songCount} songs on Bhajan Sarovar`;
        ogType = 'music.playlist';
        scheme = `bhajansarovar://playlist/${id}`;
        break;
        
      case 'user-playlist':
        collection = 'userPlaylists';
        name = f.title?.stringValue || f.name?.stringValue || 'Playlist';
        image = f.imageUrl?.stringValue || f.image?.stringValue || 'https://bhajansarovar.com/default.jpg';
        const upCount = f.songCount?.integerValue || f.songs?.arrayValue?.values?.length || 0;
        desc = `${name} • ${upCount} songs`;
        ogType = 'music.playlist';
        scheme = `bhajansarovar://user-playlist/${id}`;
        break;
        
      case 'album':
        collection = 'albums';
        name = f.title?.stringValue || f.name?.stringValue || 'Album';
        const albumArtist = f.artist?.stringValue || f.artists?.stringValue || 'Various';
        image = f.imageUrl?.stringValue || f.image?.stringValue || 'https://bhajansarovar.com/default.jpg';
        const albumCount = f.songCount?.integerValue || 0;
        desc = `${name} by ${albumArtist} • ${albumCount} songs`;
        ogType = 'music.album';
        scheme = `bhajansarovar://album/${id}`;
        name = `${name} - ${albumArtist}`;
        break;
        
      case 'artist':
        collection = 'artists';
        name = f.name?.stringValue || 'Artist';
        image = f.imageUrl?.stringValue || f.image?.stringValue || f.profileImage?.stringValue || 'https://bhajansarovar.com/default.jpg';
        const bio = f.bio?.stringValue || f.description?.stringValue || '';
        desc = bio ? bio.substring(0, 100) + '...' : `Listen to ${name} on Bhajan Sarovar`;
        ogType = 'profile';
        scheme = `bhajansarovar://artist/${id}`;
        break;
        
      case 'user':
        collection = 'users';
        name = f.displayName?.stringValue || f.name?.stringValue || 'User';
        image = f.profileImage?.stringValue || f.photoUrl?.stringValue || 'https://bhajansarovar.com/default-profile.jpg';
        const userBio = f.bio?.stringValue || '';
        desc = userBio || `${name}'s profile on Bhajan Sarovar`;
        ogType = 'profile';
        scheme = `bhajansarovar://user/${id}`;
        break;
        
      default:
        throw new Error('Invalid type');
    }
    
    // Generate HTML with Open Graph tags
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Bhajan Sarovar">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="https://bhajansarovar.com/${type}/${id}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${name}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">
<title>${name} | Bhajan Sarovar</title>
<style>
body{font-family:sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;padding:20px}
.c{background:#fff;border-radius:20px;padding:40px;max-width:500px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
img{width:200px;height:200px;border-radius:${ogType === 'profile' ? '50%' : '15px'};margin-bottom:20px;object-fit:cover}
h1{color:#333;margin:10px 0;font-size:24px}
p{color:#666;margin-bottom:20px}
.btn{display:inline-block;padding:15px 40px;background:linear-gradient(135deg,#84090B,#c41e3a);color:#fff;text-decoration:none;border-radius:30px;font-weight:700;margin:10px}
</style>
</head>
<body>
<div class="c">
<img src="${image}" alt="${name}">
<h1>${name}</h1>
<p>Opening in app...</p>
<a href="${scheme}" class="btn">Open in App</a>
</div>
<script>window.location.href='${scheme}'</script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(html);
    
  } catch (e) {
    console.error('Error:', e);
    const fallback = `<html><body><script>window.location.href='bhajansarovar://${type}/${id}'</script></body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(fallback);
  }
};
function getCollection(type) {
  const map = {
    'bhajan': 'songs',
    'song': 'songs',
    'playlist': 'playlists',
    'user-playlist': 'userPlaylists',
    'album': 'albums',
    'artist': 'artists',
    'user': 'users'
  };
  return map[type] || 'songs';
}
