const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

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

  let urls = [];
  if (sources.includes('folha')) {
    let url = `https://search.folha.uol.com.br/search?q=${keyword}`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `&periodo=personalizado&sd=${iniciodia}%2F${iniciomes}%2F${inicioano}&ed=${fimdia}%2F${fimmes}%2F${fimano}&site=todos`;
    }
    urls.push(url);
  }

  if (sources.includes('g1')) {
    let url = `https://g1.globo.com/busca/?q=${keyword}`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `&order=recent&from=${inicioano}-${iniciomes}-${iniciodia}T00%3A00%3A00-0300&to=${fimano}-${fimmes}-${fimdia}T23%3A59%3A59-0300`;
    }
    urls.push(url);
  }

  if (sources.includes('oglobo')) {
    let url = `https://oglobo.globo.com/busca/?q=${keyword}`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `&order=recent&from=${inicioano}-${iniciomes}-${iniciodia}T00%3A00%3A00-0300&to=${fimano}-${fimmes}-${fimdia}T23%3A59%3A59-0300`;
    }
    urls.push(url);
  }

  if (sources.includes('cse')) {
    let url = `https://cse.google.com/cse?oe=utf8&ie=utf8&source=uds&q=${keyword}`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `+after:${inicioano}-${iniciomes}-${iniciodia}+before:${fimano}-${fimmes}-${fimdia}&lr=&safe=off&filter=0&gl=&cr=&as_sitesearch=*.uol.com.br/*&as_oq=&cx=33c20c29942ff412b&start=0#gsc.tab=0&gsc.q=${keyword}%20after%3A${inicioano}-${iniciomes}-${iniciodia}%20before%3A${fimano}-${fimmes}-${fimdia}&gsc.sort=date`;
    }
    console.log(url);
    
    const rendertronUrl = `http://localhost:3000/render/${encodeURIComponent(url)}`;
    const pdfUrl = `http://localhost:3000/pdf/${encodeURIComponent(url)}`;
    const pdfDirectory = path.join(__dirname, 'server', 'pdfs');
  
    urls.push(rendertronUrl);
  
    // Generate PDF for the page
    try {
      const pdfBuffer = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
      const filePath = `./pdfs/page_${Date.now()}.pdf`;
  
      fs.writeFileSync(filePath, pdfBuffer.data);
      console.log(`PDF saved at ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate PDF for ${url}: ${error.message}`);
    }
  }

  if (sources.includes('correiobraziliense')) {
    let url = `https://www.correiobraziliense.com.br/busca/?q=${keyword}`;
    urls.push(url);
  }

  if (sources.includes('cnnbrasil')) {
    let url = ` https://www.cnnbrasil.com.br/?s=${keyword}&orderby=date&order=desc`;
    urls.push(url);
  }

  if (sources.includes('agenciabrasil')) {
    let url = `https://busca.ebc.com.br/nodes?q=${encodeURIComponent(keyword)}&site_id=agenciabrasil&utf8=%E2%9C%93`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      const startDate = `${iniciodia}%2F${iniciomes}%2F${inicioano}`;
      const endDate = `${fimdia}%2F${fimmes}%2F${fimano}`;
      url += `&start_date=${startDate}&end_date=${endDate}&commit=Aplicar`;
    }
    urls.push(url);
  }
  

  try {
    const results = [];
    for (const url of urls) {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Rendertron',
        },
      });
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        if (url.includes('folha.uol.com.br')) {
          $('ol.c-search .c-headline__wrapper').each((i, element) => {
            const link = $(element).find('a').attr('href');
            const title = $(element).find('.c-headline__title').text().trim();
            results.push({ link, title, source: 'folha' });
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
            results.push({ link, title, image, source: 'g1' });
          });
        } else if (url.includes('oglobo.globo.com')) {
          $('li.widget--card.widget--info').each((i, element) => {
            const link = $(element).find('a').attr('href');
            const title = $(element).find('.widget--info__title').text().trim();
            const image = $(element).find('img').attr('src');
            results.push({ link, title, image, source: 'oglobo' });
          });
        } else if (url.includes('cse.google.com')) {
          $('div.gsc-webResult.gsc-result').each((i, element) => {
            const link = $(element).find('a.gs-title').attr('href');
            const title = $(element).find('a.gs-title').text().trim();
            const image = $(element).find('img.gs-image').attr('src');
            results.push({ link, title, image, source: 'cse' });
          });
        } else if (url.includes('correiobraziliense.com.br')) {
          $('#search-results-item li').each((i, element) => {
            const link = $(element).find('a').attr('href');
            const title = $(element).find('h2').text().trim();
            const image = $(element).find('img').attr('src');
            const dateText = $(element).find('small').text().trim();

            // Extraindo a data e verificando o intervalo
            const dateMatch = dateText.match(/postado em \d{2}:\d{2} - (\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
              const date = moment(dateMatch[1], 'DD/MM/YYYY');
              const startDate = iniciodia && iniciomes && inicioano ? moment(`${inicioano}-${iniciomes}-${iniciodia}`, 'YYYY-MM-DD') : null;
              const endDate = fimdia && fimmes && fimano ? moment(`${fimano}-${fimmes}-${fimdia}`, 'YYYY-MM-DD') : null;

              if ((!startDate || date.isSameOrAfter(startDate)) && (!endDate || date.isSameOrBefore(endDate))) {
                results.push({ link, title, image, date: date.format('YYYY-MM-DD'), source: 'correiobraziliense' });
              }
            } else {
              // Sem filtro de data
              results.push({ link, title, image, source: 'correiobraziliense' });
            }
          });
        } else if (url.includes('cnnbrasil.com.br')) {
          $('.home__list__tag').each((i, element) => {
            const link = $(element).attr('href');
            const title = $(element).find('.news-item-header__title').text().trim();
            const image = $(element).find('img').attr('src');
            const dateText = $(element).find('.home__title__date').text().trim();

            // Extraindo a data e verificando o intervalo
            const dateMatch = dateText.match(/(\d{2}\/\d{2}\/\d{4}) às \d{2}:\d{2}/);
            if (dateMatch) {
              const date = moment(dateMatch[1], 'DD/MM/YYYY');
              const startDate = iniciodia && iniciomes && inicioano ? moment(`${inicioano}-${iniciomes}-${iniciodia}`, 'YYYY-MM-DD') : null;
              const endDate = fimdia && fimmes && fimano ? moment(`${fimano}-${fimmes}-${fimdia}`, 'YYYY-MM-DD') : null;

              if ((!startDate || date.isSameOrAfter(startDate)) && (!endDate || date.isSameOrBefore(endDate))) {
                results.push({ link, title, image, date: date.format('YYYY-MM-DD'), source: 'cnnbrasil' });
              }
            } else {
              // Sem filtro de data
              results.push({ link, title, image, source: 'cnnbrasil' });
            }
          });
        } else if (url.includes('busca.ebc.com.br')) {
          $('ul#results li').each((i, element) => {
            const link = $(element).find('.media-heading a').attr('href');
            const title = $(element).find('.media-heading a').text().trim();
            const image = 'https://public.ebc.com.br/templates/logos/v3/logo-ebc.svg';
            results.push({ link, title, image, source: 'ebc' });
          });
        }
      }
    }
    res.json(results);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(`Request failed with status code: ${error.response ? error.response.status : 'unknown'}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
