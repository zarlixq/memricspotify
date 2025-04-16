const axios = require("axios");

module.exports = async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.TMDB_API_KEY;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: "Lütfen en az 2 harf girin." });
  }

  try {
    const tmdbUrl = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&language=tr-TR&api_key=${apiKey}`;

    const response = await axios.get(tmdbUrl);
    const results = response.data.results
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
        media_type: item.media_type,
        overview: item.overview,
      }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error("TMDB Arama Hatası:", err.response?.data || err.message);
    return res.status(500).json({ error: "TMDB'den veri alınamadı." });
  }
};
