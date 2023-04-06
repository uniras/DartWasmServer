import 'dart:wasm';
// ignore: avoid_web_libraries_in_flutter
import 'dart:js_util';

@pragma('wasm:import', 'JSProxy._setValueProxy')
external void _setValueProxy(WasmAnyRef? value);

@pragma('wasm:import', 'JSProxy._getReferenceProxy')
external WasmAnyRef? _getReferenceProxy();

//wasm:importプラグマで登録した関数の戻り値(WasmAnyRef?型)をDartオブジェクトに変換します。
///Converts the return value (WasmAnyRef? type) of a function registered with the wasm:import pragma into a Dart object.
@pragma('wasm:export', 'dartifyProxy')
Object dartifyProxy(WasmAnyRef? value) {
  _setValueProxy(value);
  return getProperty(globalThis, '__JSProxy_Value__');
}

//Dartオブジェクトをwasm:importプラグマで登録した関数に渡せるように(WasmAnyRef?型に)変換します。
///Convert the Dart object (to WasmAnyRef? type) so that it can be passed to a function registered with the wasm:import pragma.
WasmAnyRef? jsifyProxy(Object? obj) {
  callMethod(globalThis, '_JSProxySetReferenceData', [obj]);
  return _getReferenceProxy();
}
