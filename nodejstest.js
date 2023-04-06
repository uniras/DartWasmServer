import { HttpServerBase } from './lib/httpserver/httpserverbase.js';

async function createHttpServer(port, host) {
  const server = new HttpServerBase(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.statusCode = 200;
      res.headers = { 'Content-Type': 'text/plain' };
      res.body = 'Hello, world!';
    } else if (req.method === 'POST' && req.url === '/') {
      res.statusCode = 200;
      res.headers = {
         'Content-Type': 'text/plain',
         'Access-Control-Allow-Origin': '*',
      };
      res.body = req.body;
    } else {
      res.statusCode = 404;
      res.headers = { 'Content-Type': 'text/plain' };
      res.body = 'Not Found';
    }
  });
  await server.listen(port, host);
}

await createHttpServer(8080, 'localhost');