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
  const { keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano } = req.query;
  
  let url = `https://search.folha.uol.com.br/search?q=${keyword}`;
  if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
    url += `&periodo=personalizado&sd=${iniciodia}%2F${iniciomes}%2F${inicioano}&ed=${fimdia}%2F${fimmes}%2F${inicioano}&site=todos`;
  }

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const results = [];

      $('ol.c-search .c-headline__wrapper').each((i, element) => {
        const link = $(element).find('a').attr('href');
        const title = $(element).find('.c-headline__title').text().trim();
        results.push({ link, title });
      });

      $('ol.c-search .c-headline__media-wrapper').each((i, element) => {
        const image = $(element).find('img').attr('src');
        if (results[i]) {
          results[i].image = image;
        }
      });

      res.json(results);
    } else {
      res.status(response.status).send(`Request failed with status code: ${response.status}`);
    }
  } catch (error) {
    res.status(error.response ? error.response.status : 500).send(`Request failed with status code: ${error.response ? error.response.status : 'unknown'}`);
  }
});

// app.get('/api/search', async (req, res) => {
//   const { keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano } = req.query;
  
//   let url = `https://g1.globo.com/busca/?q=${keyword}`;
//   if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
//     url += `&order=recent&from=${inicioano}-${iniciomes}-${iniciodia}T00%3A00%3A00-0300&to=${fimano}-${fimmes}-${fimdia}T23%3A59%3A59-0300`;
//   }

//   try {
//     const response = await axios.get(url);
//     if (response.status === 200) {
//       const html = response.data;
//       const $ = cheerio.load(html);
//       const results = [];

//       $('li.widget--card.widget--info').each((i, element) => {
//         const link = $(element).find('a').attr('href');
//         const title = $(element).find('.widget--info__title').text().trim();
//         const image = $(element).find('img').attr('src');

//         results.push({ link, title, image });
//       });

//       res.json(results);
//     } else {
//       res.status(response.status).send(`Request failed with status code: ${response.status}`);
//     }
//   } catch (error) {
//     res.status(error.response ? error.response.status : 500).send(`Request failed with status code: ${error.response ? error.response.status : 'unknown'}`);
//   }
// });

// app.get('/api/search', async (req, res) => {
//   const { keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano } = req.query;
  
//   let url = `https://oglobo.globo.com/busca/?q=${keyword}`;
//   if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
//     url += `&order=recent&from=${inicioano}-${iniciomes}-${iniciodia}T00%3A00%3A00-0300&to=${fimano}-${fimmes}-${fimdia}T23%3A59%3A59-0300`;
//   }

//   try {
//     const response = await axios.get(url);
//     if (response.status === 200) {
//       const html = response.data;
//       const $ = cheerio.load(html);
//       const results = [];

//       $('li.widget--card.widget--info').each((i, element) => {
//         const link = $(element).find('a').attr('href');
//         const title = $(element).find('.widget--info__title').text().trim();
//         const image = $(element).find('img').attr('src');

//         results.push({ link, title, image });
//       });

//       res.json(results);
//     } else {
//       res.status(response.status).send(`Request failed with status code: ${response.status}`);
//     }
//   } catch (error) {
//     res.status(error.response ? error.response.status : 500).send(`Request failed with status code: ${error.response ? error.response.status : 'unknown'}`);
//   }
// });

// app.get('/api/search', async (req, res) => {
//   const { keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano } = req.query;
  
//   let url = `https://cse.google.com/cse?oe=utf8&ie=utf8&source=uds&q=${keyword}`;
//   if (iniciodia && iniciomes && inicioano && fimdia && fimmes && fimano) {
//     url += `+after:${inicioano}-${iniciomes}-${iniciodia}+before:${fimano}-${fimmes}-${fimdia}&lr=&safe=off&filter=0&gl=&cr=&as_sitesearch=*.uol.com.br/*&as_oq=&cx=33c20c29942ff412b&start=0#gsc.tab=0&gsc.q=biden after%3A2024-07-15 before%3A2024-07-20&gsc.page=1`;
//     console.log(url);
//   }

//   try {
//     const response = await axios.get(url);
//     if (response.status === 200) {
//       const html = response.data;
//       const $ = cheerio.load(html);
//       console.log(html);
//       const results = [];

//       $('div.gsc-webResult.gsc-result').each((i, element) => {
//         const link = $(element).find('a.gs-title').attr('href');
//         const title = $(element).find('a.gs-title').text().trim();
//         const image = $(element).find('img.gs-image').attr('src');
//         console.log(title);

//         results.push({ link, title, image });
//       });

//       res.json(results);
//     } else {
//       res.status(response.status).send(`Request failed with status code: ${response.status}`);
//     }
//   } catch (error) {
//     res.status(error.response ? error.response.status : 500).send(`Request failed with status code: ${error.response ? error.response.status : 'unknown'}`);
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
