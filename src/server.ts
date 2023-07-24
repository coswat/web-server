import http from "http";
import fs from "fs";
import path from "path";
import url from "url";

type UrlType = url.UrlWithParsedQuery | url.UrlWithStringQuery | url.Url;

export class WebServer {
  // Content Type
  private contentType!: string;
  // Server Port
  private port: string | number;
  // Server
  private server: http.Server;
  /**
   * Creates an instance of Server.
   * @constructor
   */
  constructor() {
    this.port = process.argv[2] || 3000;
    this.server = http.createServer(this.reqHandler.bind(this));
  }
  /**
   * Handles incoming HTTP requests and sends the appropriate response based on the requested file's extension.
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   */
  public async reqHandler(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    let reqUrl: UrlType = url.parse(req.url || "/", true);
    const fileName: string = this.getFileName(reqUrl.pathname);
    if (this.isHTMLFile(fileName)) {
      this.contentType = "text/html";
      await this.sendFileContents(res, fileName);
    } else if (this.isCSSFile(fileName)) {
      this.contentType = "text/css";
      await this.sendFileContents(res, fileName);
    } else if (this.isJSFile(fileName)) {
      this.contentType = "application/javascript";
      await this.sendFileContents(res, fileName);
    } else {
      this.sendResponse(res, 404, `${fileName} Not Found`);
    }
  }
  /**
   * Sends an HTTP response with the given status code and content.
   * @param {Object} res - The HTTP response object.
   * @param {number} code - The HTTP status code.
   * @param {string} content - The response content.
   */
  private sendResponse(
    res: http.ServerResponse,
    code: number,
    content: string | Buffer
  ): void {
    if (this.contentType) {
      res.setHeader("Content-Type", this.contentType);
    }
    res.writeHead(code);
    res.end(content);
  }
  /**
   * Reads the content of the file and sends it as the response.
   * If the file is not found, sends a 404 response.
   * @param {Object} res - The HTTP response object.
   * @param {string} fileName - The name of the file to read and send.
   */
  private async sendFileContents(
    res: http.ServerResponse,
    fileName: string
  ): Promise<void> {
    fs.readFile(
      path.join(process.cwd(), fileName),
      (err: NodeJS.ErrnoException | null, content: Buffer) => {
        if (err) {
          this.sendResponse(res, 404, `${fileName} Not Found`);
        } else {
          this.sendResponse(res, 200, content);
        }
      }
    );
  }
  /**
   * Starts the HTTP server and listens on the specified port.
   */
  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
  /**
   * Close the server connection
   */
  public stop(): void {
    this.server.close(() => {
      console.log("Server Stopped");
    });
  }
  /**
   * Parses the requested URL and returns the filename to be served.
   * If the root URL is requested, returns "index.html".
   * @param {string} url - The requested URL.
   * @returns {string} - The filename to be served.
   */
  private getFileName(url: string | undefined | null): string {
    if (!url) {
      return "/";
    }
    if (url == "/") {
      return "index.html";
    }
    if (url.endsWith("/")) {
      return url + "index.html";
    }
    return url;
  }
  /**
   * Checks if the file has an HTML extension.
   * @param {string} file - The filename to be checked.
   * @returns {boolean} - True if the file has an HTML extension, otherwise false.
   */
  private isHTMLFile(file: string): boolean {
    return file.endsWith(".html");
  }
  /**
   * Checks if the file has a CSS extension.
   * @param {string} file - The filename to be checked.
   * @returns {boolean} - True if the file has a CSS extension, otherwise false.
   */
  private isCSSFile(file: string): boolean {
    return file.endsWith(".css");
  }
  /**
   * Checks if the file has a JavaScript extension.
   * @param {string} file - The filename to be checked.
   * @returns {boolean} - True if the file has a JavaScript extension, otherwise false.
   */
  private isJSFile(file: string): boolean {
    return file.endsWith(".js");
  }
}
