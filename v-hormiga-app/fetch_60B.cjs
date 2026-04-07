
const http = require('http');
const fs = require('fs');

const folio = "60-B";
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
                let parsed = JSON.parse(data);
                if (typeof parsed === 'string') {
                    parsed = JSON.parse(parsed);
                }
                fs.writeFileSync('folio_60B.json', JSON.stringify(parsed, null, 2));
                console.log('Successfully saved to folio_60B.json');
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
                fs.writeFileSync('folio_60B_raw.txt', data);
            }
        } else {
            console.error(`Failed to fetch data. Status code: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
