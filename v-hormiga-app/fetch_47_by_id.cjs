
const http = require('http');
const fs = require('fs');

const id = 47;
const url = `http://localhost:5000/api/Cotizacion/${id}`;

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
                fs.writeFileSync('folio_47C.json', JSON.stringify(parsed, null, 2));
                console.log('Successfully saved to folio_47C.json');
            } catch (e) {
                console.error('Error parsing JSON:', e.message);
            }
        } else {
            console.error(`Failed. Status code: ${res.statusCode}`);
            console.log('Response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error: ' + err.message);
});
