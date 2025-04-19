const axios = require("axios");

module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Lütfen bir şarkı ismi girin." });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    // 🔐 Token alma
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const token = tokenResponse.data.access_token;

    // 🔍 Arama yap
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const tracks = searchResponse.data.tracks.items;

    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: "Şarkı bulunamadı." });
    }

    // 🔁 Liste olarak dön
    const result = tracks.map((track) => ({
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      image: track.album.images[0]?.url || '',
      external_url: track.external_urls.spotify,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Spotify API hatası:", error.response?.data || error.message);
    return res.status(500).json({ error: "Spotify API hatası." });
  }
};
