  // `modulePromise` is a promise to the `WebAssembly.module` object to be
//   instantiated.
// `importObjectPromise` is a promise to an object that contains any additional
//   imports needed by the module that aren't provided by the standard runtime.
//   The fields on this object will be merged into the importObject with which
//   the module will be instantiated.
// This function returns a promise to the instantiated module.
export const instantiate = async (modulePromise, importObjectPromise) => {
    let asyncBridge;
    let dartInstance;
    function stringFromDartString(string) {
        const totalLength = dartInstance.exports.$stringLength(string);
        let result = '';
        let index = 0;
        while (index < totalLength) {
          let chunkLength = Math.min(totalLength - index, 0xFFFF);
          const array = new Array(chunkLength);
          for (let i = 0; i < chunkLength; i++) {
              array[i] = dartInstance.exports.$stringRead(string, index++);
          }
          result += String.fromCharCode(...array);
        }
        return result;
    }

    function stringToDartString(string) {
        const length = string.length;
        let range = 0;
        for (let i = 0; i < length; i++) {
            range |= string.codePointAt(i);
        }
        if (range < 256) {
            const dartString = dartInstance.exports.$stringAllocate1(length);
            for (let i = 0; i < length; i++) {
                dartInstance.exports.$stringWrite1(dartString, i, string.codePointAt(i));
            }
            return dartString;
        } else {
            const dartString = dartInstance.exports.$stringAllocate2(length);
            for (let i = 0; i < length; i++) {
                dartInstance.exports.$stringWrite2(dartString, i, string.charCodeAt(i));
            }
            return dartString;
        }
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
        const length = dartInstance.exports.$listLength(list);
        const array = new constructor(length);
        for (let i = 0; i < length; i++) {
            array[i] = dartInstance.exports.$listRead(list, i);
        }
        return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
        wrapped.dartFunction = dartFunction;
        wrapped[jsWrappedDartFunctionSymbol] = true;
        return wrapped;
    }

    // Imports
    const dart2wasm = {

  _112: (args, completer) => asyncBridge(args, completer),
_113: new WebAssembly.Function(
            {parameters: ['externref', 'anyref'], results: ['anyref']},
            function(future) {
                return new Promise(function (resolve, reject) {
                    dartInstance.exports.$awaitCallback(future, resolve);
                });
            },
            {suspending: 'first'}),
_114: (resolve, result) =>  resolve(result),
_109: (ms, c) =>
            setTimeout(
                () => dartInstance.exports.$invokeCallback(c),ms),
_110: s => stringToDartString(JSON.stringify(stringFromDartString(s))),
_111: s => console.log(stringFromDartString(s)),
_21: o => o === undefined,
_22: o => typeof o === 'boolean',
_23: o => typeof o === 'number',
_25: o => typeof o === 'string',
_28: o => o instanceof Int8Array,
_29: o => o instanceof Uint8Array,
_30: o => o instanceof Uint8ClampedArray,
_31: o => o instanceof Int16Array,
_32: o => o instanceof Uint16Array,
_33: o => o instanceof Int32Array,
_34: o => o instanceof Uint32Array,
_35: o => o instanceof Float32Array,
_36: o => o instanceof Float64Array,
_37: o => o instanceof ArrayBuffer,
_38: o => o instanceof DataView,
_39: o => o instanceof Array,
_40: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
_44: (l, r) => l === r,
_45: o => o,
_46: o => o,
_47: o => o,
_48: b => !!b,
_49: o => o.length,
_50: (o, i) => o[i],
_51: f => f.dartFunction,
_52: l => arrayFromDartList(Int8Array, l),
_53: l => arrayFromDartList(Uint8Array, l),
_54: l => arrayFromDartList(Uint8ClampedArray, l),
_55: l => arrayFromDartList(Int16Array, l),
_56: l => arrayFromDartList(Uint16Array, l),
_57: l => arrayFromDartList(Int32Array, l),
_58: l => arrayFromDartList(Uint32Array, l),
_59: l => arrayFromDartList(Float32Array, l),
_60: l => arrayFromDartList(Float64Array, l),
_61: (data, length) => {
          const view = new DataView(new ArrayBuffer(length));
          for (let i = 0; i < length; i++) {
              view.setUint8(i, dartInstance.exports.$byteDataGetUint8(data, i));
          }
          return view;
        },
_62: l => arrayFromDartList(Array, l),
_63: stringFromDartString,
_64: stringToDartString,
_67: () => globalThis,
_68: (constructor, args) => {
      const factoryFunction = constructor.bind.apply(
          constructor, [null, ...args]);
      return new factoryFunction();
    },
_70: (o, p) => o[p],
_71: (o, p, v) => o[p] = v,
_72: (o, m, a) => o[m].apply(o, a),
_73: o => stringToDartString(String(o)),
_85: v => stringToDartString(v.toString()),
_86: (d, digits) => stringToDartString(d.toFixed(digits)),
_100: () => {
          let stackString = new Error().stack.toString();
          let userStackString = stackString.split('\n').slice(3).join('\n');
          return stringToDartString(userStackString);
        }
      };

    const baseImports = {
        dart2wasm: dart2wasm,
        Math: Math,
        Date: Date,
        Object: Object,
        Array: Array,
        Reflect: Reflect,
    };
    dartInstance = await WebAssembly.instantiate(await modulePromise, {
        ...baseImports,
        ...(await importObjectPromise),
    });

    // Initialize async bridge.
    asyncBridge = new WebAssembly.Function(
        {parameters: ['anyref', 'anyref'], results: ['externref']},
        dartInstance.exports.$asyncBridge,
        {promising: 'first'});
    return dartInstance;
}

// Call the main function for the instantiated module
// `moduleInstance` is the instantiated dart2wasm module
// `args` are any arguments that should be passed into the main function.
export const invoke = async (moduleInstance, ...args) => {
    moduleInstance.exports.$invokeMain(moduleInstance.exports.$getMain());
}

