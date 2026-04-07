
const http = require('http');
const fs = require('fs');

const folio = "47 C";
const url = `http://localhost:5000/api/Cotizacion/folio/${encodeURIComponent(folio)}`;

console.log(`Fetching data from: ${url}`);

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                // The API returns a string if it's the raw JSON from DB, or an object
                // Looking at CotizacionController, it returnsActionResult<string> for ObtenerCotizacionPorFolio
                // This usually means the JSON content.
                let parsed = JSON.parse(data);
                // Sometimes it's double serialized if it was stored as string
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                }
                fs.writeFileSync('folio_47C.json', JSON.stringify(parsed, null, 2));
                console.log('Successfully saved to folio_47C.json');
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                fs.writeFileSync('folio_47C_raw.txt', data);
            }
        } else {
            console.error(`Failed to fetch data. Status code: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
