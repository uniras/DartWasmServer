// ignore_for_file: avoid_web_libraries_in_flutter, unused_import, unused_element
import 'dart:js_util';
import '../jsproxy/jsproxy.dart';

class HttpRequest {
  HttpRequest._(this._obj);
  late Object _obj;
  dynamic _headerObj;
  dynamic _queryObj;

  String get url {
    return getProperty<String>(_obj, 'url');
  }

  String get method {
    return getProperty<String>(_obj, 'method');
  }

  String get body {
    return getProperty<String>(_obj, 'body');
  }

  String getHeader(String key) {
    if (_headerObj == null) _headerObj = getProperty(_obj, 'headers');
    if (hasProperty(_headerObj, key)) {
      return getProperty(_headerObj, key);
    } else {
      return '';
    }
  }

  Object getQuery(String key) {
    if (_queryObj == null) _queryObj = getProperty(_obj, 'query');
    if (hasProperty(_queryObj, key)) {
      return getProperty(_queryObj, key);
    } else {
      return '';
    }
  }

  Map<String, String> get headers {
    dynamic data = getProperty(_obj, 'headers');
    return Map<String, String>.from(data);
  }
}

class HttpResponse {
  HttpResponse._(this._obj);
  late Object _obj;
  dynamic _headerObj;

  double get statusCode {
    return getProperty<double>(_obj, 'statusCode');
  }

  set statusCode(double data) {
    setProperty<double>(_obj, 'statusCode', data);
  }

  String getHeader(String key) {
    if (_headerObj == null) _headerObj = getProperty(_obj, 'headers');
    if (hasProperty(_headerObj, key)) {
      return getProperty(_headerObj, key);
    } else {
      return '';
    }
  }

  void setHeader(String key, String data) {
    if (_headerObj == null) _headerObj = getProperty(_obj, 'headers');
    setProperty(_headerObj!, key, data);
  }

  String get body {
    return getProperty<String>(_obj, 'body');
  }

  set body(String data) {
    setProperty<String>(_obj, 'body', data);
  }
}

Function(HttpRequest, HttpResponse)? _requestCallback;

@pragma('wasm:export', 'httpServerStub')
void _httpServerStub(Object req, Object res) {
  var creq = HttpRequest._(req);
  var cres = HttpResponse._(res);
  if (_requestCallback != null) _requestCallback!(creq, cres);
}

void setHttpCallback(Function(HttpRequest, HttpResponse) callback) {
  _requestCallback = callback;
}
