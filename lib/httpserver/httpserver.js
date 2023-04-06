import { HttpServerBase } from './httpserverbase.js';
import { JSProxyInstantiate, dartifyProxy } from '../jsproxy/jsproxy.js';

export async function createHttpServer(wasmModule, dart2wasm, importObject, port, host) {
  let DartInstance = await JSProxyInstantiate(wasmModule, dart2wasm, importObject);
  const server = new HttpServerBase(async (req, res) => {
    let dartreq = dartifyProxy(DartInstance, req);
    let dartres = dartifyProxy(DartInstance, res);
    DartInstance.exports.httpServerStub(dartreq, dartres);
  });
  await server.listen(port, host);
}
