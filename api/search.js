import axios from "axios";

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Şarkı ismi girilmedi." });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    // Access token al
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

    // Şarkı araması yap
    const searchResponse = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const track = searchResponse.data.tracks.items[0];

    if (!track) {
      return res.status(404).json({ error: "Şarkı bulunamadı." });
    }

    res.status(200).json({
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      image: track.album.images[0]?.url,
      external_url: track.external_urls.spotify,
    });

  } catch (error) {
    console.error("Spotify API hatası:", error.response?.data || error.message);
    res.status(500).json({ error: "Spotify verisi alınamadı." });
  }
}
