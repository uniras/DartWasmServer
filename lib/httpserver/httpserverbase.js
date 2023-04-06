export class HttpServerBase {
  constructor(requestHandler) {
    this.nodeServer = undefined;
    this.denoServer = undefined;
    this.requestHandler = requestHandler;
  }

  static errorResponse = { statusCode: 500, headers: { "content-type": "text/plain; charset=utf-8" }, body: 'Internal Server Error.' };

  async requestCallback(req, url, body) {
    try {
      let path = url.pathname;
      let query = url.searchParams;

      const request = {
        url: path,
        method: req.method,
        headers: req.headers,
        query: query,
        body: body,
      };

      const response = HttpServerBase.errorResponse;
      if (this.requestHandler) {
        await this.requestHandler(request, response);
      }
      return response;
    } catch (e) {
      console.log(e);
      return HttpServerBase.errorResponse;
    }
  }

  async listen(port, hostname) {
    try {
      if (typeof globalThis.Deno !== "undefined") {
        var { serve } = await import("https://deno.land/std/http/server.ts");
        this.denoServer = serve(async (req) => {
          let response;
          try {
            let body = await req.text();
            response = await this.requestCallback(req, new URL(req.url), body);
          } catch (e) {
            response = HttpServerBase.errorResponse;
          }
          return new globalThis.Response(response.body, {
            status: response.statusCode,
            headers: response.headers,
          });
        }, { port: port, hostname: hostname });
        console.log(`Server listening on http://${hostname}:${port}`);
      } else {
        const http = await import("http");
        this.nodeServer = http.createServer(async (req, res) => {
          let response;
          try {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });
            req.on("end", async () => {
              response = await this.requestCallback(req, new URL(`http://localhost${req.url}`), body);
              res.writeHead(response.statusCode, response.headers);
              res.end(response.body);
            });
          } catch (e) {
            console.log(e);
            response = HttpServerBase.errorResponse;
            res.writeHead(response.statusCode, response.headers);
            res.end(response.body);
          }
        });
        this.nodeServer.listen(port, hostname);
        console.log(`Server listening on http://${hostname}:${port}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
