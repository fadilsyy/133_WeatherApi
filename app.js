const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

const apiKey = "RfeSvZV3KiNjRTZiQ1Tc";

app.use(express.static(path.join(__dirname, 'public')));

function ambilWilayah(feature, tipeList) {
    for (const tipe of tipeList) {
        if (feature.id && feature.id.startsWith(tipe + '.')) {
            return feature.text;
        }
    }
    const context = feature.context || [];
    for (const tipe of tipeList) {
        const item = context.find(c => c.id && c.id.startsWith(tipe + '.'));
        if (item) return item.text;
    }
    return null;
}

app.get('/api/lokasi', async (req, res) => {
    const lokasi = (req.query.lokasi || "").trim();

    if (!lokasi) {
        return res.status(400).json({ message: "Parameter 'lokasi' wajib diisi" });
    }

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(lokasi)}.json?key=${apiKey}&language=id&limit=1`;

    try {
        const response = await axios.get(url);
        const features = response.data.features;

        if (!features || features.length === 0) {
            return res.status(404).json({ message: `Lokasi "${lokasi}" tidak ditemukan` });
        }

        const hasil = features[0];
        const [longitude, latitude] = hasil.geometry.coordinates;

        res.json({
            lokasi: lokasi,
            negara: ambilWilayah(hasil, ['country']),
            provinsi: ambilWilayah(hasil, ['region']),
            kecamatan: ambilWilayah(hasil, ['municipal_district', 'locality']),
            longitude: longitude,
            latitude: latitude
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});