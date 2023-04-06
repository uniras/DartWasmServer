import * as dart2wasm from './servertest.mjs';
import { createHttpServer } from './lib/httpserver/httpserver.js';
import './lib/filebase/file.js';

let file = await Deno.readFile("servertest.wasm");
let bytes = new Uint8Array(file);
let module = new WebAssembly.Module(bytes);
let importObject = {}

createHttpServer(module, dart2wasm, importObject, 8080, 'localhost');