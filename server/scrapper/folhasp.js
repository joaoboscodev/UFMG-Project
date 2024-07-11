// const axios = require('axios');
// const cheerio = require('cheerio');

// async function search(keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano) {
//     const url = `https://search.folha.uol.com.br/search?q=${keyword}&periodo=personalizado&sd=${iniciodia}%2F${iniciomes}%2F${inicioano}&ed=${fimdia}%2F${fimmes}%2F${inicioano}&site=todos`;
    
//     try {
//         const response = await axios.get(url);
//         if (response.status === 200) {
//             return response.data;
//         } else {
//             return `Request failed with status code: ${response.status}`;
//         }
//     } catch (error) {
//         return `Request failed with status code: ${error.response.status}`;
//     }
// }

// function extractLinks(html) {
//     const $ = cheerio.load(html);
//     const links = [];
    
//     $('ol.c-search .c-headline__content a').each((i, element) => {
//         const link = $(element).attr('href');
//         links.push(link);
//     });
    
//     return links;
// }

// const keyword = "Acessibilidade";  // substitua pela palavra-chave desejada
// const iniciodia = "05";
// const iniciomes = "07";
// const inicioano = "2024";
// const fimdia = "06";
// const fimmes = "07";
// const fimano = "2024";

// search(keyword, iniciodia, iniciomes, inicioano, fimdia, fimmes, fimano)
//     .then(html_content => {
//         const links = extractLinks(html_content);
//         console.log(links);
//     })
//     .catch(error => console.error(error));
