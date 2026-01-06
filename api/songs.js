const fetch = require('node-fetch');
module.exports = async (req, res) => {
  const { id } = req.query;
  
  if (!id) return res.status(400).send('Song ID required');
  
  try {
    const url = `https://firestore.googleapis.com/v1/projects/dadiji-bhajan-sangrah-62543/databases/(default)/documents/songs/${id}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Song not found');
    
    const data = await response.json();
    const f = data.fields;
    
    const name = f.name?.stringValue || f.title?.stringValue || 'Bhajan';
    const artist = f.artists?.stringValue || f.artist?.stringValue || 'Unknown';
    const image = f.image?.stringValue || f.thumbnail?.stringValue || 'https://bhajansarovar.com/default.jpg';
    const desc = `Listen to ${name} by ${artist} on Bhajan Sarovar`;
    
    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="UTF-8">
<meta property="og:type" content="music.song">
<meta property="og:site_name" content="Bhajan Sarovar">
<meta property="og:title" content="${name}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="https://bhajansarovar.com/bhajan/${id}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${name}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">
<meta property="music:musician" content="${artist}">
<title>${name} - ${artist}</title>
<style>
body{font-family:sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0;padding:20px}
.c{background:#fff;border-radius:20px;padding:40px;max-width:500px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3)}
img{width:200px;height:200px;border-radius:15px;margin-bottom:20px;object-fit:cover}
h1{color:#333;margin:10px 0;font-size:24px}
p{color:#666;margin-bottom:20px}
.btn{display:inline-block;padding:15px 40px;background:linear-gradient(135deg,#84090B,#c41e3a);color:#fff;text-decoration:none;border-radius:30px;font-weight:700;margin:10px}
</style>
</head>
<body>
<div class="c">
<img src="${image}" alt="${name}">
<h1>${name}</h1>
<p>by ${artist}</p>
<p>Opening in app...</p>
<a href="bhajansarovar://bhajan/${id}" class="btn">Open in App</a>
</div>
<script>window.location.href='bhajansarovar://bhajan/${id}'</script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(html);
  } catch (e) {
    const fallback = '<html><body><script>window.location.href="bhajansarovar://bhajan/' + id + '"</script></body></html>';
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(fallback);
  }
};
