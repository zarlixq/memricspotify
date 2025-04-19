const axios = require("axios");

module.exports = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: "En az 2 harf girin." });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
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

    const searchResponse = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const results = searchResponse.data.artists.items.map(artist => ({
      name: artist.name,
      spotify_id: artist.id,
      image: artist.images?.[0]?.url || null,
      spotify_url: artist.external_urls?.spotify || null
    }));

    res.status(200).json({ results });
  } catch (error) {
    console.error("Spotify sanatçı arama hatası:", error.response?.data || error.message);
    res.status(500).json({ error: "Spotify sanatçı arama başarısız." });
  }
};
