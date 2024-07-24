const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the server!' });
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
      url += `+after:${inicioano}-${iniciomes}-${iniciodia}+before:${fimano}-${fimmes}-${fimdia}`;
    }
    const rendertronUrl = `https://render-tron.appspot.com/render/${encodeURIComponent(url)}`;
    urls.push(rendertronUrl);
  }

  if (sources.includes('correiobraziliense')) {
    let url = `https://www.correiobraziliense.com.br/busca/?q=${keyword}`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `&from=${inicioano}-${iniciomes}-${iniciodia}&to=${fimano}-${fimmes}-${fimdia}`;
    }
    urls.push(url);
  }

  if (sources.includes('cnnbrasil')) { // New source
    let url = ` https://www.cnnbrasil.com.br/?s=${keyword}&orderby=date&order=desc`;
    if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
      url += `&from=${inicioano}-${iniciomes}-${iniciodia}&to=${fimano}-${fimmes}-${fimdia}`;
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
            results.push({ link, title, image, source: 'correiobraziliense' });
          });
        } else if (url.includes('cnnbrasil.com.br')) {
          $('.home__list__tag').each((i, element) => {
            const link = $(element).attr('href');
            const title = $(element).find('.news-item-header__title').text().trim();
            const image = $(element).find('img').attr('src');
            results.push({ link, title, image, source: 'cnnbrasil' });
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
