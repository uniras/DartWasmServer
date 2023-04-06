// ignore_for_file: avoid_web_libraries_in_flutter
import 'dart:async';
import 'dart:js_util';

class File {
  static dynamic _fileObj;

  static Future<dynamic> _callMethod(String method, List<dynamic> args) {
    if (_fileObj == null) {
      _fileObj = getProperty(globalThis, 'jsFileProxy');
    }
    var promise = callMethod(_fileObj, method, args);
    return promiseToFuture(promise);
  }

  static void writeFile(String path, String data) async {
    await _callMethod('writeFile', [path, data]);
  }

  static dynamic readFile(String path, [String encoding = '']) async {
    dynamic result = await _callMethod('readFile', [path, encoding]);
    return result;
  }

  static void copyFile(String src, String dest) async {
    await _callMethod('copyFile', [src, dest]);
  }

  static void removeFile(String path) async {
    await _callMethod('removeFile', [path]);
  }

  static dynamic existFile(String path) async {
    dynamic result = await _callMethod('existFile', [path]);
    return result;
  }
}
