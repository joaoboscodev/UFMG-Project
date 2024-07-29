const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { google } = require('googleapis');
const readline = require('readline');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

app.get('/api/test', (req, res) => {
  console.log('Requisição recebida no backend');
  res.json({ message: 'Comunicação com o backend bem-sucedida!' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'user' && password === 'password') {
    res.json({ message: 'Login successful!' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/search', async (req, res) => {
  const { keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano, source } = req.query;
  const sources = source ? source.split(',') : [];
  const keywords = keyword ? keyword.split(',') : [];

  let resultsBySource = {};

  for (const source of sources) {
    resultsBySource[source] = {};
  }

  for (const kw of keywords) {
    let urls = [];
    if (sources.includes('folha')) {
      let url = `https://search.folha.uol.com.br/search?q=${kw}`;
      if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
        url += `&periodo=personalizado&sd=${iniciodia}%2F${iniciomes}%2F${inicioano}&ed=${fimdia}%2F${fimmes}%2F${fimano}&site=todos`;
      }
      urls.push({ url, source: 'folha', keyword: kw });
    }

    if (sources.includes('g1')) {
      let url = `https://g1.globo.com/busca/?q=${kw}`;
      if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
        url += `&order=recent&from=${inicioano}-${iniciomes}-${iniciodia}T00%3A00%3A00-0300&to=${fimano}-${fimmes}-${fimdia}T23%3A59%3A59-0300`;
      }
      urls.push({ url, source: 'g1', keyword: kw });
    }

    if (sources.includes('oglobo')) {
      let url = `https://oglobo.globo.com/busca/?q=${kw}`;
      if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
        url += `&order=recent&from=${inicioano}-${iniciomes}-${iniciodia}T00%3A00%3A00-0300&to=${fimano}-${fimmes}-${fimdia}T23%3A59%3A59-0300`;
      }
      urls.push({ url, source: 'oglobo', keyword: kw });
    }

    if (sources.includes('uol')) {
      let url = `https://cse.google.com/cse?oe=utf8&ie=utf8&source=uds&q=${kw}`;
      if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
        url += `+after:${inicioano}-${iniciomes}-${iniciodia}+before:${fimano}-${fimmes}-${fimdia}&lr=&safe=off&filter=0&gl=&cr=&as_sitesearch=*.uol.com.br/*&as_oq=&cx=33c20c29942ff412b&start=0#gsc.tab=0&gsc.q=${kw}%20after%3A${inicioano}-${iniciomes}-${iniciodia}%20before%3A${fimano}-${fimmes}-${fimdia}&gsc.sort=date`;
      }
      console.log(url);

      const rendertronUrl = `http://localhost:3000/render/${encodeURIComponent(url)}`;
      urls.push({ url: rendertronUrl, source: 'uol', keyword: kw });
    }

    if (sources.includes('correiobraziliense')) {
      let url = `https://www.correiobraziliense.com.br/busca/?q=${kw}`;
      urls.push({ url, source: 'correiobraziliense', keyword: kw });
    }

    if (sources.includes('cnnbrasil')) {
      let url = ` https://www.cnnbrasil.com.br/?s=${kw}&orderby=date&order=desc`;
      urls.push({ url, source: 'cnnbrasil', keyword: kw });
    }

    if (sources.includes('agenciabrasil')) {
      let url = `https://busca.ebc.com.br/nodes?q=${encodeURIComponent(kw)}&site_id=agenciabrasil&utf8=%E2%9C%93`;
      if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
        const startDate = `${iniciodia}%2F${iniciomes}%2F${inicioano}`;
        const endDate = `${fimdia}%2F${fimmes}%2F${fimano}`;
        url += `&start_date=${startDate}&end_date=${endDate}&commit=Aplicar`;
      }
      urls.push({ url, source: 'agenciabrasil', keyword: kw });
    }

    try {
      for (const { url, source, keyword } of urls) {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 7_6_5; en-US) AppleWebKit/600.40 (KHTML, like Gecko) Chrome/47.0.3795.304 Safari/601',
          },
        });

        if (response.status === 200) {
          const html = response.data;
          const $ = cheerio.load(html);
          const results = [];

          // Example parsing logic for 'folha'
          if (url.includes('folha.uol.com.br')) {
            $('ol.c-search .c-headline__wrapper').each((i, element) => {
              const link = $(element).find('a').attr('href');
              const title = $(element).find('.c-headline__title').text().trim();
              results.push({ link, title, source: 'folha', keyword });
            });
            $('ol.c-search .c-headline__media-wrapper').each((i, element) => {
              const image = $(element).find('img').attr('src');
              if (results[i]) {
                results[i].image = image;
              }
            });
          } else if (url.includes('g1.globo.com')) {
            $('li.widget--card.widget--info').each((i, element) => {
              const link = $(element).find('a').attr('href');
              const title = $(element).find('.widget--info__title').text().trim();
              const image = $(element).find('img').attr('src');
              results.push({ link, title, image, source: 'g1', keyword });
            });
          } else if (url.includes('oglobo.globo.com')) {
            $('li.widget--card.widget--info').each((i, element) => {
              const link = $(element).find('a').attr('href');
              const title = $(element).find('.widget--info__title').text().trim();
              const image = $(element).find('img').attr('src');
              results.push({ link, title, image, source: 'oglobo', keyword });
            });
          } else if (url.includes('cse.google.com')) {
            $('div.gsc-webResult.gsc-result').each((i, element) => {
              const link = $(element).find('a.gs-title').attr('href');
              const title = $(element).find('a.gs-title').text().trim();
              const image = $(element).find('img.gs-image').attr('src');
              results.push({ link, title, image, source: 'uol', keyword });
            });
          } else if (url.includes('correiobraziliense.com.br')) {
            $('#search-results-item li').each((i, element) => {
              const link = $(element).find('a').attr('href');
              const title = $(element).find('h2').text().trim();
              const image = $(element).find('img').attr('src');
              const dateText = $(element).find('small').text().trim();

              // Extracting the date and checking the range
              const dateMatch = dateText.match(/postado em \d{2}:\d{2} - (\d{2}\/\d{2}\/\d{4})/);
              if (dateMatch) {
                const date = moment(dateMatch[1], 'DD/MM/YYYY');
                const startDate = iniciodia && iniciomes && inicioano ? moment(`${inicioano}-${iniciomes}-${iniciodia}`, 'YYYY-MM-DD') : null;
                const endDate = fimdia && fimmes && fimano ? moment(`${fimano}-${fimmes}-${fimdia}`, 'YYYY-MM-DD') : null;

                if ((!startDate || date.isSameOrAfter(startDate)) && (!endDate || date.isSameOrBefore(endDate))) {
                  results.push({ link, title, image, date: date.format('YYYY-MM-DD'), source: 'correiobraziliense', keyword });
                }
              } else {
                results.push({ link, title, image, source: 'correiobraziliense', keyword });
              }
            });
          } else if (url.includes('cnnbrasil.com.br')) {
            $('.home__list__tag').each((i, element) => {
              const link = $(element).attr('href');
              const title = $(element).find('.news-item-header__title').text().trim();
              const image = $(element).find('img').attr('src');
              const dateText = $(element).find('.home__title__date').text().trim();

              // Extracting the date and checking the range
              const dateMatch = dateText.match(/(\d{2}\/\d{2}\/\d{4}) às \d{2}:\d{2}/);
              if (dateMatch) {
                const date = moment(dateMatch[1], 'DD/MM/YYYY');
                const startDate = iniciodia && iniciomes && inicioano ? moment(`${inicioano}-${iniciomes}-${iniciodia}`, 'YYYY-MM-DD') : null;
                const endDate = fimdia && fimmes && fimano ? moment(`${fimano}-${fimmes}-${fimdia}`, 'YYYY-MM-DD') : null;

                if ((!startDate || date.isSameOrAfter(startDate)) && (!endDate || date.isSameOrBefore(endDate))) {
                  results.push({ link, title, image, date: date.format('YYYY-MM-DD'), source: 'cnnbrasil', keyword });
                }
              } else {
                results.push({ link, title, image, source: 'cnnbrasil', keyword });
              }
            });
          } else if (url.includes('busca.ebc.com.br')) {
            $('ul#results li').each((i, element) => {
              const link = $(element).find('.media-heading a').attr('href');
              const title = $(element).find('.media-heading a').text().trim();
              const image = 'https://public.ebc.com.br/templates/logos/v3/logo-ebc.svg';
              results.push({ link, title, image, source: 'ebc', keyword });
            });
          }

          // Assign results to the source and keyword
          if (!resultsBySource[source]) resultsBySource[source] = {};
          resultsBySource[source][keyword] = results;
        }
      }
    } catch (error) {
      console.error(`Error fetching results for keyword: ${kw}, source: ${source}`, error);
      res.status(error.response ? error.response.status : 500).send(`Request failed with status code: ${error.response ? error.response.status : 'unknown'}`);
    }
  }

  res.json(resultsBySource);
});

app.post('/api/generate-pdf', async (req, res) => {
  const { articleUrl } = req.body;
  if (!articleUrl) {
    return res.status(400).send('Article URL is required');
  }

  try {
    console.log(articleUrl);
    const rendertronUrl = `http://localhost:3000/render/${encodeURIComponent(articleUrl)}`;
    const pdfUrl = `http://localhost:3000/pdf/${encodeURIComponent(articleUrl)}`;
    console.log(`Rendertron URL: ${rendertronUrl}`);
    console.log(`PDF URL: ${pdfUrl}`);

    // Gerar PDF usando Rendertron
    const pdfBuffer = await axios.get(pdfUrl, { responseType: 'arraybuffer' });

    // Salvar PDF no servidor
    const filePath = path.join(__dirname, 'rendertron', 'pdfs', `page_${Date.now()}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer.data);
    console.log(`PDF saved at ${filePath}`);

    res.json({ message: 'PDF generated successfully', filePath });
  } catch (error) {
    console.error(`Failed to generate PDF for ${articleUrl}: ${error.message}`);
    res.status(500).send(`Failed to generate PDF: ${error.message}`);
  }
});

const SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const PARENT_FOLDER_ID = '1tyeq5P_wMJSbjH33hW9pYB4DsTfNMKR1';

function authenticate() {
    console.log('Starting authentication process...');
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(TOKEN_PATH)) {
        console.log('Token found, using saved token.');
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
        return oAuth2Client;
    } else {
        return getAccessToken(oAuth2Client);
    }
}

function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.error('Error retrieving access token', err);
                    reject(err);
                }
                oAuth2Client.setCredentials(token);
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                console.log('Token stored to', TOKEN_PATH);
                resolve(oAuth2Client);
            });
        });
    });
}

async function saveUrlToDrive(url, keyword, source,) {
    const auth = await authenticate();
    console.log('Starting save process...');
    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');

    const sourceFolderId = await findOrCreateFolder(drive, source, PARENT_FOLDER_ID);
    const keywordFolderId = await findOrCreateFolder(drive, keyword, sourceFolderId);
    const dateFolderId = await findOrCreateFolder(drive, currentDate, keywordFolderId);

    await addUrlToSheet(sheets, drive, dateFolderId, currentDate, url);
}

async function findOrCreateFolder(drive, name, parentId,) {
    console.log(`Finding or creating folder: ${name}`);
    const res = await drive.files.list({
        q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (res.data.files.length) {
        console.log(`Folder ${name} exists with ID: ${res.data.files[0].id}`);
        return res.data.files[0].id;
    }

    console.log(`Folder ${name} does not exist. Creating new folder.`);
    const fileMetadata = {
        'name': name,
        'mimeType': 'application/vnd.google-apps.folder',
        parents: [parentId]
    };
    const folder = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
    });
    console.log(`Created folder ${name} with ID: ${folder.data.id}`);
    return folder.data.id;
}

async function addUrlToSheet(sheets, drive, folderId, sheetName, url) {
    console.log(`Adding URL to sheet: ${sheetName}`);
    let spreadsheetId = null;

    // Check if the spreadsheet already exists
    const res = await drive.files.list({
        q: `'${folderId}' in parents and name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (res.data.files.length > 0) {
        // Spreadsheet exists, use the existing one
        spreadsheetId = res.data.files[0].id;
        console.log(`Spreadsheet with ID ${spreadsheetId} already exists.`);
    } else {
        // Spreadsheet does not exist, create a new one
        const createResponse = await sheets.spreadsheets.create({
            resource: {
                properties: {
                    title: sheetName,
                },
                sheets: [{
                    properties: {
                        title: 'Data',
                    }
                }]
            }
        });

        spreadsheetId = createResponse.data.spreadsheetId;
        console.log(`Created sheet with ID: ${spreadsheetId}`);

        // Move the created spreadsheet to the correct folder
        await drive.files.update({
            fileId: spreadsheetId,
            addParents: folderId,
            removeParents: 'root', // Remove the default parent folder
            fields: 'id, parents'
        });
    }

    // Add URL to the sheet as a clickable link
    const range = 'Data!A:A';
    const values = [
        [`=HYPERLINK("${url}"; "${url}")`]
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values
        }
    });

    console.log(`URL added to the sheet: ${url}`);
}

app.post('/api/save-to-drive', async (req, res) => {
    const { url, keyword, source } = req.body;

    if (!url || !keyword || !source) {
        return res.status(400).json({ message: 'Missing required fields: url, keyword, source' });
    }

    try {
        await saveUrlToDrive(url, keyword, source);
        res.json({ message: 'URL successfully saved to Google Drive!' });
    } catch (error) {
        console.error('Error saving URL to Drive:', error);
        res.status(500).json({ message: 'Failed to save URL to Drive', error: error.message });
    }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
