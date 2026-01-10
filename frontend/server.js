const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Servir les fichiers statiques du dossier dist
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: false
}));

// Pour toutes les routes, servir index.html (SPA fallback)
// Cela permet au React Router de gérer le routage côté client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading index.html');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
});
