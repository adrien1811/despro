const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Endpoint untuk menerima dan menyimpan gambar
app.post("/api/upload-photo", (req, res) => {
  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: "Image data is missing" });
  }

  // Hapus prefix Base64 jika ada
  const base64Data = imageData.replace(/^data:image\/(jpeg|png|jpg);base64,/, "");

  // Buat nama file otomatis
  const fileName = `image_${Date.now()}.jpg`;
  const filePath = path.join(__dirname, "images", fileName);

  // Pastikan folder "images" ada
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Simpan file
  fs.writeFile(filePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error saving image:", err);
      return res.status(500).json({ error: "Failed to save image" });
    }

    console.log(`Image saved successfully to: ${filePath}`);
    res.json({ message: "Image saved successfully", filePath });
  });
});
let currentPeopleData = 0; // Variable to store the current number of people

// Endpoint to receive the currentPeople data from ESP32
app.post('/api/current-people', (req, res) => {
  const { currentPeople } = req.body;

  if (currentPeople === undefined) {
    console.log('Invalid payload received:', req.body); // Log invalid payloads
    return res.status(400).json({ error: 'CurrentPeople data is missing' });
  }

  // Update the global variable with the latest value
  currentPeopleData = currentPeople;

  // Print received payload to terminal
  console.log(`Received payload: { currentPeople: ${currentPeopleData} }`);

  res.json({ message: 'CurrentPeople data received successfully', currentPeople: currentPeopleData });
});

// Endpoint to fetch the latest currentPeople data
app.get('/api/current-people', (req, res) => {
  res.json({ currentPeople: currentPeopleData });
});

// Serve the frontend (if needed, for example an HTML page)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Current People</title>
        <script>
          async function fetchCurrentPeople() {
            const response = await fetch('/api/current-people');
            const data = await response.json();
            document.getElementById('peopleCount').innerText = data.currentPeople;
          }

          setInterval(fetchCurrentPeople, 1000); // Refresh every 1 second
        </script>
      </head>
      <body onload="fetchCurrentPeople()">
        <h1>Current People Count</h1>
        <h2 id="peopleCount">Loading...</h2>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
