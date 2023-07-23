const http = require("http");
const fs = require("fs");
const path = require("path");

const port: number | string = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
  const fileName = getFileName(req.url);
  // Set the content type to 'text/html' for HTML responses
  res.setHeader("Content-Type", "text/html");

  if (isHTMLFile(fileName)) {
    // Read and serve the HTML file
    fs.readFile(path.join(__dirname, fileName), (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end(`${fileName} Not Found`);
      } else {
        res.writeHead(200);
        res.end(content);
      }
    });
  } else if (isCssFile(fileName)) {
    // Set the content type to 'text/css' for CSS responses
    res.setHeader("Content-Type", "text/css");

    // Serve the css file
    fs.readFile(path.join(__dirname, fileName), (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end(`${fileName} Not Found`);
      } else {
        res.writeHead(200);
        res.end(content);
      }
    });
  } else {
    res.writeHead(404);
    res.end(`${fileName} Not Found`);
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Get the file name by uri
function getFileName(url: string): string {
  if (url == "/") {
    return "index.html";
  }
  return url.replace("/", "");
}

// Check the file is a css file
function isCssFile(file: string): boolean {
  return file.endsWith(".css");
}

// Check the file is a HTML file
function isHTMLFile(file: string): boolean {
  return file.endsWith(".html");
}
