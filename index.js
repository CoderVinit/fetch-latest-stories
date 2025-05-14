import http from "http";
import https from "https";

let base_url = "https://time.com";

// fetch the html content of the page
function fetchHTML(callback) {
  https
    .get(base_url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => callback(null, data));
    })
    .on("error", (err) => callback(err));
}

function extractStories(html) {
  // created a data array where i will store the stories.
  const data = [];
  const startSection = html.indexOf(`<div class="partial latest-stories"`);
  const endSection = html.indexOf(`</ul>`, startSection);
  const sectionOfHTMLContent = html.slice(startSection, endSection);
  //   console.log(sectionOfHTMLContent)

  // index of li item start with 0
  let i = 0;

  // loop until the data length will less than 6
  while (data.length < 6) {
    const liStart = sectionOfHTMLContent.indexOf(
      '<li class="latest-stories__item"',
      i
    );
    if (liStart === -1) break;

    const liEnd = sectionOfHTMLContent.indexOf("</li>", liStart);
    // console.log(liStart,liEnd)
    const liContent = sectionOfHTMLContent.slice(liStart, liEnd);

    // Get URL
    const hrefMatch = liContent.match(/<a href="(.*?)"/);
    const url = hrefMatch ? "https://time.com" + hrefMatch[1] : "";

    // Get Title
    const titleMatch = liContent.match(
      /<h3 class="latest-stories__item-headline">(.*?)<\/h3>/
    );
    const title = titleMatch ? titleMatch[1].trim() : "";

    if (title && url) {
      data.push({ title, url });
    }
    i = liEnd + 5;
  }
  //   console.log(data.length)

  return data;
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/latest-stories") {
    fetchHTML((err, html) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to fetch HTML" }));
        return;
      }
      const stories = extractStories(html);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(stories));
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Hello World");
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
