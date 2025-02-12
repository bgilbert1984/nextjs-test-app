const express = require('express');
 const compression = require('compression');
 const path = require('path'); // Import the 'path' module

 const app = express();
 const port = 3000; // Or any port you prefer

 // Enable compression middleware
 app.use(compression());

 // Serve static files from the 'public' directory (or wherever your built files are)
 app.use(express.static(path.join(__dirname, 'public'))); // Use path.join for correct path

   // Serve static files from the 'out' directory
 app.use(express.static(path.join(__dirname, 'out')));
 // Handle all other requests with your Next.js app's HTML file
 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'out', 'index.html')); // Or the correct path
 });

 app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
 });