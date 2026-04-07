
const http = require('http');
const fs = require('fs');

const url = `http://localhost:5000/api/Cotizacion`;

console.log(`Fetching all quotations from: ${url}`);

http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                let parsed = JSON.parse(data);
                fs.writeFileSync('all_quotations.json', JSON.stringify(parsed, null, 2));
                console.log('Successfully saved to all_quotations.json');

                const folios = parsed.map(q => q.folio || q.id);
                console.log('Available folios:', folios);

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
