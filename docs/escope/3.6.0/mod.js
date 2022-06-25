var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from2, except, desc) => {
  if (from2 && typeof from2 === "object" || typeof from2 === "function") {
    for (let key of __getOwnPropNames(from2))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node-modules-polyfills:buffer
function init() {
  inited = true;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
}
function toByteArray(b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
  arr = new Arr(len * 3 / 4 - placeHolders);
  l = placeHolders > 0 ? len - 4 : len;
  var L = 0;
  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = tmp >> 16 & 255;
    arr[L++] = tmp >> 8 & 255;
    arr[L++] = tmp & 255;
  }
  if (placeHolders === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[L++] = tmp & 255;
  } else if (placeHolders === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[L++] = tmp >> 8 & 255;
    arr[L++] = tmp & 255;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var output = "";
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup[tmp >> 2];
    output += lookup[tmp << 4 & 63];
    output += "==";
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    output += lookup[tmp >> 10];
    output += lookup[tmp >> 4 & 63];
    output += lookup[tmp << 2 & 63];
    output += "=";
  }
  parts.push(output);
  return parts.join("");
}
function read(buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
  }
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
  }
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
  }
  buffer[offset + i - d] |= s * 128;
}
function kMaxLength() {
  return Buffer2.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function createBuffer(that, length) {
  if (kMaxLength() < length) {
    throw new RangeError("Invalid typed array length");
  }
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    that = new Uint8Array(length);
    that.__proto__ = Buffer2.prototype;
  } else {
    if (that === null) {
      that = new Buffer2(length);
    }
    that.length = length;
  }
  return that;
}
function Buffer2(arg, encodingOrOffset, length) {
  if (!Buffer2.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer2)) {
    return new Buffer2(arg, encodingOrOffset, length);
  }
  if (typeof arg === "number") {
    if (typeof encodingOrOffset === "string") {
      throw new Error("If encoding is specified then the first argument must be a string");
    }
    return allocUnsafe(this, arg);
  }
  return from(this, arg, encodingOrOffset, length);
}
function from(that, value, encodingOrOffset, length) {
  if (typeof value === "number") {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length);
  }
  if (typeof value === "string") {
    return fromString(that, value, encodingOrOffset);
  }
  return fromObject(that, value);
}
function assertSize(size) {
  if (typeof size !== "number") {
    throw new TypeError('"size" argument must be a number');
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative');
  }
}
function alloc(that, size, fill2, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size);
  }
  if (fill2 !== void 0) {
    return typeof encoding === "string" ? createBuffer(that, size).fill(fill2, encoding) : createBuffer(that, size).fill(fill2);
  }
  return createBuffer(that, size);
}
function allocUnsafe(that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer2.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that;
}
function fromString(that, string, encoding) {
  if (typeof encoding !== "string" || encoding === "") {
    encoding = "utf8";
  }
  if (!Buffer2.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding');
  }
  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);
  var actual = that.write(string, encoding);
  if (actual !== length) {
    that = that.slice(0, actual);
  }
  return that;
}
function fromArrayLike(that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}
function fromArrayBuffer(that, array, byteOffset, length) {
  array.byteLength;
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError("'offset' is out of bounds");
  }
  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError("'length' is out of bounds");
  }
  if (byteOffset === void 0 && length === void 0) {
    array = new Uint8Array(array);
  } else if (length === void 0) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }
  if (Buffer2.TYPED_ARRAY_SUPPORT) {
    that = array;
    that.__proto__ = Buffer2.prototype;
  } else {
    that = fromArrayLike(that, array);
  }
  return that;
}
function fromObject(that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);
    if (that.length === 0) {
      return that;
    }
    obj.copy(that, 0, 0, len);
    return that;
  }
  if (obj) {
    if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
      if (typeof obj.length !== "number" || isnan(obj.length)) {
        return createBuffer(that, 0);
      }
      return fromArrayLike(that, obj);
    }
    if (obj.type === "Buffer" && isArray(obj.data)) {
      return fromArrayLike(that, obj.data);
    }
  }
  throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}
function checked(length) {
  if (length >= kMaxLength()) {
    throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
  }
  return length | 0;
}
function internalIsBuffer(b) {
  return !!(b != null && b._isBuffer);
}
function byteLength(string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length;
  }
  if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength;
  }
  if (typeof string !== "string") {
    string = "" + string;
  }
  var len = string.length;
  if (len === 0)
    return 0;
  var loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len;
      case "utf8":
      case "utf-8":
      case void 0:
        return utf8ToBytes(string).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return len * 2;
      case "hex":
        return len >>> 1;
      case "base64":
        return base64ToBytes(string).length;
      default:
        if (loweredCase)
          return utf8ToBytes(string).length;
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
function slowToString(encoding, start, end) {
  var loweredCase = false;
  if (start === void 0 || start < 0) {
    start = 0;
  }
  if (start > this.length) {
    return "";
  }
  if (end === void 0 || end > this.length) {
    end = this.length;
  }
  if (end <= 0) {
    return "";
  }
  end >>>= 0;
  start >>>= 0;
  if (end <= start) {
    return "";
  }
  if (!encoding)
    encoding = "utf8";
  while (true) {
    switch (encoding) {
      case "hex":
        return hexSlice(this, start, end);
      case "utf8":
      case "utf-8":
        return utf8Slice(this, start, end);
      case "ascii":
        return asciiSlice(this, start, end);
      case "latin1":
      case "binary":
        return latin1Slice(this, start, end);
      case "base64":
        return base64Slice(this, start, end);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return utf16leSlice(this, start, end);
      default:
        if (loweredCase)
          throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase();
        loweredCase = true;
    }
  }
}
function swap(b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0)
    return -1;
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 2147483647) {
    byteOffset = 2147483647;
  } else if (byteOffset < -2147483648) {
    byteOffset = -2147483648;
  }
  byteOffset = +byteOffset;
  if (isNaN(byteOffset)) {
    byteOffset = dir ? 0 : buffer.length - 1;
  }
  if (byteOffset < 0)
    byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir)
      return -1;
    else
      byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir)
      byteOffset = 0;
    else
      return -1;
  }
  if (typeof val === "string") {
    val = Buffer2.from(val, encoding);
  }
  if (internalIsBuffer(val)) {
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === "number") {
    val = val & 255;
    if (Buffer2.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }
  throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;
  if (encoding !== void 0) {
    encoding = String(encoding).toLowerCase();
    if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }
  function read2(buf, i2) {
    if (indexSize === 1) {
      return buf[i2];
    } else {
      return buf.readUInt16BE(i2 * indexSize);
    }
  }
  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1)
          foundIndex = i;
        if (i - foundIndex + 1 === valLength)
          return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1)
          i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength)
      byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read2(arr, i + j) !== read2(val, j)) {
          found = false;
          break;
        }
      }
      if (found)
        return i;
    }
  }
  return -1;
}
function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }
  var strLen = string.length;
  if (strLen % 2 !== 0)
    throw new TypeError("Invalid hex string");
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed))
      return i;
    buf[offset + i] = parsed;
  }
  return i;
}
function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function latin1Write(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}
function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}
function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];
  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 128) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 192) === 128) {
            tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
            if (tempCodePoint > 127) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
            if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
            if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
              codePoint = tempCodePoint;
            }
          }
      }
    }
    if (codePoint === null) {
      codePoint = 65533;
      bytesPerSequence = 1;
    } else if (codePoint > 65535) {
      codePoint -= 65536;
      res.push(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    res.push(codePoint);
    i += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }
  var res = "";
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}
function asciiSlice(buf, start, end) {
  var ret = "";
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 127);
  }
  return ret;
}
function latin1Slice(buf, start, end) {
  var ret = "";
  end = Math.min(buf.length, end);
  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}
function hexSlice(buf, start, end) {
  var len = buf.length;
  if (!start || start < 0)
    start = 0;
  if (!end || end < 0 || end > len)
    end = len;
  var out = "";
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out;
}
function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = "";
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0)
    throw new RangeError("offset is not uint");
  if (offset + ext > length)
    throw new RangeError("Trying to access beyond buffer length");
}
function checkInt(buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf))
    throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min)
    throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
}
function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0)
    value = 65535 + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}
function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0)
    value = 4294967295 + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 255;
  }
}
function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length)
    throw new RangeError("Index out of range");
  if (offset < 0)
    throw new RangeError("Index out of range");
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}
function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}
function base64clean(str) {
  str = stringtrim(str).replace(INVALID_BASE64_RE, "");
  if (str.length < 2)
    return "";
  while (str.length % 4 !== 0) {
    str = str + "=";
  }
  return str;
}
function stringtrim(str) {
  if (str.trim)
    return str.trim();
  return str.replace(/^\s+|\s+$/g, "");
}
function toHex(n) {
  if (n < 16)
    return "0" + n.toString(16);
  return n.toString(16);
}
function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];
  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);
    if (codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1)
        bytes.push(239, 191, 189);
    }
    leadSurrogate = null;
    if (codePoint < 128) {
      if ((units -= 1) < 0)
        break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0)
        break;
      bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0)
        break;
      bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0)
        break;
      bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
    } else {
      throw new Error("Invalid code point");
    }
  }
  return bytes;
}
function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    byteArray.push(str.charCodeAt(i) & 255);
  }
  return byteArray;
}
function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0)
      break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }
  return byteArray;
}
function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length)
      break;
    dst[i + offset] = src[i];
  }
  return i;
}
function isnan(val) {
  return val !== val;
}
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj));
}
function isFastBuffer(obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function isSlowBuffer(obj) {
  return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer(obj.slice(0, 0));
}
var lookup, revLookup, Arr, inited, toString, isArray, INSPECT_MAX_BYTES, _kMaxLength, MAX_ARGUMENTS_LENGTH, INVALID_BASE64_RE;
var init_buffer = __esm({
  "node-modules-polyfills:buffer"() {
    lookup = [];
    revLookup = [];
    Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    inited = false;
    toString = {}.toString;
    isArray = Array.isArray || function(arr) {
      return toString.call(arr) == "[object Array]";
    };
    INSPECT_MAX_BYTES = 50;
    Buffer2.TYPED_ARRAY_SUPPORT = globalThis.TYPED_ARRAY_SUPPORT !== void 0 ? globalThis.TYPED_ARRAY_SUPPORT : true;
    _kMaxLength = kMaxLength();
    Buffer2.poolSize = 8192;
    Buffer2._augment = function(arr) {
      arr.__proto__ = Buffer2.prototype;
      return arr;
    };
    Buffer2.from = function(value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length);
    };
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
      Buffer2.prototype.__proto__ = Uint8Array.prototype;
      Buffer2.__proto__ = Uint8Array;
    }
    Buffer2.alloc = function(size, fill2, encoding) {
      return alloc(null, size, fill2, encoding);
    };
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(null, size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(null, size);
    };
    Buffer2.isBuffer = isBuffer;
    Buffer2.compare = function compare(a, b) {
      if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
        throw new TypeError("Arguments must be Buffers");
      }
      if (a === b)
        return 0;
      var x = a.length;
      var y = b.length;
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat(list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      var i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      var buffer = Buffer2.allocUnsafe(length);
      var pos = 0;
      for (i = 0; i < list.length; ++i) {
        var buf = list[i];
        if (!internalIsBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
      }
      return buffer;
    };
    Buffer2.byteLength = byteLength;
    Buffer2.prototype._isBuffer = true;
    Buffer2.prototype.swap16 = function swap16() {
      var len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      var len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      var len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString2() {
      var length = this.length | 0;
      if (length === 0)
        return "";
      if (arguments.length === 0)
        return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.equals = function equals(b) {
      if (!internalIsBuffer(b))
        throw new TypeError("Argument must be a Buffer");
      if (this === b)
        return true;
      return Buffer2.compare(this, b) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      var str = "";
      var max = INSPECT_MAX_BYTES;
      if (this.length > 0) {
        str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
        if (this.length > max)
          str += " ... ";
      }
      return "<Buffer " + str + ">";
    };
    Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
      if (!internalIsBuffer(target)) {
        throw new TypeError("Argument must be a Buffer");
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target)
        return 0;
      var x = thisEnd - thisStart;
      var y = end - start;
      var len = Math.min(x, y);
      var thisCopy = this.slice(thisStart, thisEnd);
      var targetCopy = target.slice(start, end);
      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    Buffer2.prototype.write = function write2(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset | 0;
        if (isFinite(length)) {
          length = length | 0;
          if (encoding === void 0)
            encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      }
      var remaining = this.length - offset;
      if (length === void 0 || length > remaining)
        length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding)
        encoding = "utf8";
      var loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
            return asciiWrite(this, string, offset, length);
          case "latin1":
          case "binary":
            return latin1Write(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    MAX_ARGUMENTS_LENGTH = 4096;
    Buffer2.prototype.slice = function slice(start, end) {
      var len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0)
          start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0)
          end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start)
        end = start;
      var newBuf;
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end);
        newBuf.__proto__ = Buffer2.prototype;
      } else {
        var sliceLen = end - start;
        newBuf = new Buffer2(sliceLen, void 0);
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start];
        }
      }
      return newBuf;
    };
    Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset | 0;
      byteLength2 = byteLength2 | 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset | 0;
      byteLength2 = byteLength2 | 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      var val = this[offset + --byteLength2];
      var mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset | 0;
      byteLength2 = byteLength2 | 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      var val = this[offset];
      var mul = 1;
      var i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset | 0;
      byteLength2 = byteLength2 | 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      var i = byteLength2;
      var mul = 1;
      var val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128))
        return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      var val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      var val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return read(this, offset, false, 52, 8);
    };
    Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength2 = byteLength2 | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      var mul = 1;
      var i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset | 0;
      byteLength2 = byteLength2 | 0;
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      var i = byteLength2 - 1;
      var mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 255, 0);
      if (!Buffer2.TYPED_ARRAY_SUPPORT)
        value = Math.floor(value);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2;
    };
    Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2;
    };
    Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4;
    };
    Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4;
    };
    Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      var i = 0;
      var mul = 1;
      var sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      var i = byteLength2 - 1;
      var mul = 1;
      var sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 127, -128);
      if (!Buffer2.TYPED_ARRAY_SUPPORT)
        value = Math.floor(value);
      if (value < 0)
        value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
      } else {
        objectWriteUInt16(this, value, offset, true);
      }
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
      } else {
        objectWriteUInt16(this, value, offset, false);
      }
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
      } else {
        objectWriteUInt32(this, value, offset, true);
      }
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset | 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0)
        value = 4294967295 + value + 1;
      if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
      } else {
        objectWriteUInt32(this, value, offset, false);
      }
      return offset + 4;
    };
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!start)
        start = 0;
      if (!end && end !== 0)
        end = this.length;
      if (targetStart >= target.length)
        targetStart = target.length;
      if (!targetStart)
        targetStart = 0;
      if (end > 0 && end < start)
        end = start;
      if (end === start)
        return 0;
      if (target.length === 0 || this.length === 0)
        return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length)
        throw new RangeError("sourceStart out of bounds");
      if (end < 0)
        throw new RangeError("sourceEnd out of bounds");
      if (end > this.length)
        end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      var len = end - start;
      var i;
      if (this === target && start < targetStart && targetStart < end) {
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start];
        }
      } else if (len < 1e3 || !Buffer2.TYPED_ARRAY_SUPPORT) {
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start];
        }
      } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
      }
      return len;
    };
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0);
          if (code < 256) {
            val = code;
          }
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
      } else if (typeof val === "number") {
        val = val & 255;
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val)
        val = 0;
      var i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        var bytes = internalIsBuffer(val) ? val : utf8ToBytes(new Buffer2(val, encoding).toString());
        var len = bytes.length;
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
  }
});

// node-modules-polyfills:process
function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}
var cachedSetTimeout, cachedClearTimeout, performance, performanceNow, startTime;
var init_process = __esm({
  "node-modules-polyfills:process"() {
    cachedSetTimeout = defaultSetTimout;
    cachedClearTimeout = defaultClearTimeout;
    if (typeof globalThis.setTimeout === "function") {
      cachedSetTimeout = setTimeout;
    }
    if (typeof globalThis.clearTimeout === "function") {
      cachedClearTimeout = clearTimeout;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    performance = globalThis.performance || {};
    performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
      return new Date().getTime();
    };
    startTime = new Date();
  }
});

// node_modules/.pnpm/rollup-plugin-node-polyfills@0.2.1/node_modules/rollup-plugin-node-polyfills/polyfills/inherits.js
var inherits, inherits_default;
var init_inherits = __esm({
  "node_modules/.pnpm/rollup-plugin-node-polyfills@0.2.1/node_modules/rollup-plugin-node-polyfills/polyfills/inherits.js"() {
    if (typeof Object.create === "function") {
      inherits = function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      };
    } else {
      inherits = function inherits2(ctor, superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function() {
        };
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      };
    }
    inherits_default = inherits;
  }
});

// node-modules-polyfills:util
function inspect2(obj, opts) {
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  if (arguments.length >= 3)
    ctx.depth = arguments[2];
  if (arguments.length >= 4)
    ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    ctx.showHidden = opts;
  } else if (opts) {
    _extend(ctx, opts);
  }
  if (isUndefined(ctx.showHidden))
    ctx.showHidden = false;
  if (isUndefined(ctx.depth))
    ctx.depth = 2;
  if (isUndefined(ctx.colors))
    ctx.colors = false;
  if (isUndefined(ctx.customInspect))
    ctx.customInspect = true;
  if (ctx.colors)
    ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
function stylizeWithColor(str, styleType) {
  var style = inspect2.styles[styleType];
  if (style) {
    return "\x1B[" + inspect2.colors[style][0] + "m" + str + "\x1B[" + inspect2.colors[style][1] + "m";
  } else {
    return str;
  }
}
function stylizeNoColor(str, styleType) {
  return str;
}
function arrayToHash(array) {
  var hash = {};
  array.forEach(function(val, idx) {
    hash[val] = true;
  });
  return hash;
}
function formatValue(ctx, value, recurseTimes) {
  if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== inspect2 && !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);
  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }
  if (isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
    return formatError(value);
  }
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ": " + value.name : "";
      return ctx.stylize("[Function" + name + "]", "special");
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), "date");
    }
    if (isError(value)) {
      return formatError(value);
    }
  }
  var base = "", array = false, braces = ["{", "}"];
  if (isArray2(value)) {
    array = true;
    braces = ["[", "]"];
  }
  if (isFunction(value)) {
    var n = value.name ? ": " + value.name : "";
    base = " [Function" + n + "]";
  }
  if (isRegExp(value)) {
    base = " " + RegExp.prototype.toString.call(value);
  }
  if (isDate(value)) {
    base = " " + Date.prototype.toUTCString.call(value);
  }
  if (isError(value)) {
    base = " " + formatError(value);
  }
  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }
  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
    } else {
      return ctx.stylize("[Object]", "special");
    }
  }
  ctx.seen.push(value);
  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }
  ctx.seen.pop();
  return reduceToSingleString(output, base, braces);
}
function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize("undefined", "undefined");
  if (isString(value)) {
    var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
    return ctx.stylize(simple, "string");
  }
  if (isNumber(value))
    return ctx.stylize("" + value, "number");
  if (isBoolean(value))
    return ctx.stylize("" + value, "boolean");
  if (isNull(value))
    return ctx.stylize("null", "null");
}
function formatError(value) {
  return "[" + Error.prototype.toString.call(value) + "]";
}
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty2(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push("");
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize("[Getter/Setter]", "special");
    } else {
      str = ctx.stylize("[Getter]", "special");
    }
  } else {
    if (desc.set) {
      str = ctx.stylize("[Setter]", "special");
    }
  }
  if (!hasOwnProperty2(visibleKeys, key)) {
    name = "[" + key + "]";
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf("\n") > -1) {
        if (array) {
          str = str.split("\n").map(function(line) {
            return "  " + line;
          }).join("\n").substr(2);
        } else {
          str = "\n" + str.split("\n").map(function(line) {
            return "   " + line;
          }).join("\n");
        }
      }
    } else {
      str = ctx.stylize("[Circular]", "special");
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify("" + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, "name");
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, "string");
    }
  }
  return name + ": " + str;
}
function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf("\n") >= 0)
      numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
  }, 0);
  if (length > 60) {
    return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
  }
  return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}
function isArray2(ar) {
  return Array.isArray(ar);
}
function isBoolean(arg) {
  return typeof arg === "boolean";
}
function isNull(arg) {
  return arg === null;
}
function isNumber(arg) {
  return typeof arg === "number";
}
function isString(arg) {
  return typeof arg === "string";
}
function isUndefined(arg) {
  return arg === void 0;
}
function isRegExp(re) {
  return isObject(re) && objectToString(re) === "[object RegExp]";
}
function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
function isDate(d) {
  return isObject(d) && objectToString(d) === "[object Date]";
}
function isError(e) {
  return isObject(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
}
function isFunction(arg) {
  return typeof arg === "function";
}
function isPrimitive(arg) {
  return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || typeof arg === "undefined";
}
function objectToString(o) {
  return Object.prototype.toString.call(o);
}
function _extend(origin, add) {
  if (!add || !isObject(add))
    return origin;
  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function hasOwnProperty2(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
var init_util = __esm({
  "node-modules-polyfills:util"() {
    init_process();
    init_inherits();
    inspect2.colors = {
      "bold": [1, 22],
      "italic": [3, 23],
      "underline": [4, 24],
      "inverse": [7, 27],
      "white": [37, 39],
      "grey": [90, 39],
      "black": [30, 39],
      "blue": [34, 39],
      "cyan": [36, 39],
      "green": [32, 39],
      "magenta": [35, 39],
      "red": [31, 39],
      "yellow": [33, 39]
    };
    inspect2.styles = {
      "special": "cyan",
      "number": "yellow",
      "boolean": "yellow",
      "undefined": "grey",
      "null": "bold",
      "string": "green",
      "date": "magenta",
      "regexp": "red"
    };
  }
});

// node-modules-polyfills:assert
var assert_exports = {};
__export(assert_exports, {
  AssertionError: () => AssertionError,
  assert: () => ok,
  deepEqual: () => deepEqual,
  deepStrictEqual: () => deepStrictEqual,
  default: () => assert_default,
  doesNotThrow: () => doesNotThrow,
  equal: () => equal,
  fail: () => fail,
  ifError: () => ifError,
  notDeepEqual: () => notDeepEqual,
  notDeepStrictEqual: () => notDeepStrictEqual,
  notEqual: () => notEqual,
  notStrictEqual: () => notStrictEqual,
  ok: () => ok,
  strictEqual: () => strictEqual,
  throws: () => throws
});
function compare3(a, b) {
  if (a === b) {
    return 0;
  }
  var x = a.length;
  var y = b.length;
  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function functionsHaveNames() {
  if (typeof _functionsHaveNames !== "undefined") {
    return _functionsHaveNames;
  }
  return _functionsHaveNames = function() {
    return function foo() {
    }.name === "foo";
  }();
}
function pToString(obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof globalThis.ArrayBuffer !== "function") {
    return false;
  }
  if (typeof ArrayBuffer.isView === "function") {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
function assert(value, message) {
  if (!value)
    fail(value, true, message, "==", ok);
}
function getName(func) {
  if (!isFunction(func)) {
    return;
  }
  if (functionsHaveNames()) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
function AssertionError(options) {
  this.name = "AssertionError";
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    var err = new Error();
    if (err.stack) {
      var out = err.stack;
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf("\n" + fn_name);
      if (idx >= 0) {
        var next_line = out.indexOf("\n", idx + 1);
        out = out.substring(next_line + 1);
      }
      this.stack = out;
    }
  }
}
function truncate(s, n) {
  if (typeof s === "string") {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect3(something) {
  if (functionsHaveNames() || !isFunction(something)) {
    return inspect2(something);
  }
  var rawname = getName(something);
  var name = rawname ? ": " + rawname : "";
  return "[Function" + name + "]";
}
function getMessage(self2) {
  return truncate(inspect3(self2.actual), 128) + " " + self2.operator + " " + truncate(inspect3(self2.expected), 128);
}
function fail(actual, expected, message, operator, stackStartFunction) {
  throw new AssertionError({
    message,
    actual,
    expected,
    operator,
    stackStartFunction
  });
}
function ok(value, message) {
  if (!value)
    fail(value, true, message, "==", ok);
}
function equal(actual, expected, message) {
  if (actual != expected)
    fail(actual, expected, message, "==", equal);
}
function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, "!=", notEqual);
  }
}
function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, "deepEqual", deepEqual);
  }
}
function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, "deepStrictEqual", deepStrictEqual);
  }
}
function _deepEqual(actual, expected, strict, memos) {
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare3(actual, expected) === 0;
  } else if (isDate(actual) && isDate(expected)) {
    return actual.getTime() === expected.getTime();
  } else if (isRegExp(actual) && isRegExp(expected)) {
    return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;
  } else if ((actual === null || typeof actual !== "object") && (expected === null || typeof expected !== "object")) {
    return strict ? actual === expected : actual == expected;
  } else if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array)) {
    return compare3(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer)) === 0;
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || { actual: [], expected: [] };
    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }
    memos.actual.push(actual);
    memos.expected.push(expected);
    return objEquiv(actual, expected, strict, memos);
  }
}
function isArguments(object) {
  return Object.prototype.toString.call(object) == "[object Arguments]";
}
function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === void 0 || b === null || b === void 0)
    return false;
  if (isPrimitive(a) || isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs)
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  if (ka.length !== kb.length)
    return false;
  ka.sort();
  kb.sort();
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}
function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, "notDeepEqual", notDeepEqual);
  }
}
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, "notDeepStrictEqual", notDeepStrictEqual);
  }
}
function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, "===", strictEqual);
  }
}
function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, "!==", notStrictEqual);
  }
}
function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }
  if (Object.prototype.toString.call(expected) == "[object RegExp]") {
    return expected.test(actual);
  }
  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
  }
  if (Error.isPrototypeOf(expected)) {
    return false;
  }
  return expected.call({}, actual) === true;
}
function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}
function _throws(shouldThrow, block, expected, message) {
  var actual;
  if (typeof block !== "function") {
    throw new TypeError('"block" argument must be a function');
  }
  if (typeof expected === "string") {
    message = expected;
    expected = null;
  }
  actual = _tryBlock(block);
  message = (expected && expected.name ? " (" + expected.name + ")." : ".") + (message ? " " + message : ".");
  if (shouldThrow && !actual) {
    fail(actual, expected, "Missing expected exception" + message);
  }
  var userProvidedMessage = typeof message === "string";
  var isUnwantedException = !shouldThrow && isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;
  if (isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) {
    fail(actual, expected, "Got unwanted exception" + message);
  }
  if (shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) {
    throw actual;
  }
}
function throws(block, error, message) {
  _throws(true, block, error, message);
}
function doesNotThrow(block, error, message) {
  _throws(false, block, error, message);
}
function ifError(err) {
  if (err)
    throw err;
}
var hasOwn, objectKeys, pSlice, _functionsHaveNames, assert_default, regex;
var init_assert = __esm({
  "node-modules-polyfills:assert"() {
    init_buffer();
    init_util();
    hasOwn = Object.prototype.hasOwnProperty;
    objectKeys = Object.keys || function(obj) {
      var keys = [];
      for (var key in obj) {
        if (hasOwn.call(obj, key))
          keys.push(key);
      }
      return keys;
    };
    pSlice = Array.prototype.slice;
    assert_default = assert;
    regex = /\s*function\s+([^\(\s]*)\s*/;
    assert.AssertionError = AssertionError;
    inherits_default(AssertionError, Error);
    assert.fail = fail;
    assert.ok = ok;
    assert.equal = equal;
    assert.notEqual = notEqual;
    assert.deepEqual = deepEqual;
    assert.deepStrictEqual = deepStrictEqual;
    assert.notDeepEqual = notDeepEqual;
    assert.notDeepStrictEqual = notDeepStrictEqual;
    assert.strictEqual = strictEqual;
    assert.notStrictEqual = notStrictEqual;
    assert.throws = throws;
    assert.doesNotThrow = doesNotThrow;
    assert.ifError = ifError;
  }
});

// node-modules-polyfills-commonjs:assert
var require_assert = __commonJS({
  "node-modules-polyfills-commonjs:assert"(exports, module) {
    var polyfill = (init_assert(), __toCommonJS(assert_exports));
    if (polyfill && polyfill.default) {
      module.exports = polyfill.default;
      for (let k in polyfill) {
        module.exports[k] = polyfill[k];
      }
    } else if (polyfill) {
      module.exports = polyfill;
    }
  }
});

// node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/is-implemented.js
var require_is_implemented = __commonJS({
  "node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      var weakMap, obj;
      if (typeof WeakMap !== "function")
        return false;
      try {
        weakMap = new WeakMap([[obj = {}, "one"], [{}, "two"], [{}, "three"]]);
      } catch (e) {
        return false;
      }
      if (String(weakMap) !== "[object WeakMap]")
        return false;
      if (typeof weakMap.set !== "function")
        return false;
      if (weakMap.set({}, 1) !== weakMap)
        return false;
      if (typeof weakMap.delete !== "function")
        return false;
      if (typeof weakMap.has !== "function")
        return false;
      if (weakMap.get(obj) !== "one")
        return false;
      return true;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/function/noop.js
var require_noop = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/function/noop.js"(exports, module) {
    "use strict";
    module.exports = function() {
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/is-value.js
var require_is_value = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/is-value.js"(exports, module) {
    "use strict";
    var _undefined = require_noop()();
    module.exports = function(val) {
      return val !== _undefined && val !== null;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/set-prototype-of/is-implemented.js
var require_is_implemented2 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/set-prototype-of/is-implemented.js"(exports, module) {
    "use strict";
    var create = Object.create;
    var getPrototypeOf = Object.getPrototypeOf;
    var plainObject = {};
    module.exports = function() {
      var setPrototypeOf = Object.setPrototypeOf, customCreate = arguments[0] || create;
      if (typeof setPrototypeOf !== "function")
        return false;
      return getPrototypeOf(setPrototypeOf(customCreate(null), plainObject)) === plainObject;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/is-object.js
var require_is_object = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/is-object.js"(exports, module) {
    "use strict";
    var isValue = require_is_value();
    var map = { function: true, object: true };
    module.exports = function(value) {
      return isValue(value) && map[typeof value] || false;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/valid-value.js
var require_valid_value = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/valid-value.js"(exports, module) {
    "use strict";
    var isValue = require_is_value();
    module.exports = function(value) {
      if (!isValue(value))
        throw new TypeError("Cannot use null or undefined");
      return value;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/create.js
var require_create = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/create.js"(exports, module) {
    "use strict";
    var create = Object.create;
    var shim;
    if (!require_is_implemented2()()) {
      shim = require_shim();
    }
    module.exports = function() {
      var nullObject, polyProps, desc;
      if (!shim)
        return create;
      if (shim.level !== 1)
        return create;
      nullObject = {};
      polyProps = {};
      desc = { configurable: false, enumerable: false, writable: true, value: void 0 };
      Object.getOwnPropertyNames(Object.prototype).forEach(function(name) {
        if (name === "__proto__") {
          polyProps[name] = {
            configurable: true,
            enumerable: false,
            writable: true,
            value: void 0
          };
          return;
        }
        polyProps[name] = desc;
      });
      Object.defineProperties(nullObject, polyProps);
      Object.defineProperty(shim, "nullPolyfill", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: nullObject
      });
      return function(prototype, props) {
        return create(prototype === null ? nullObject : prototype, props);
      };
    }();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/set-prototype-of/shim.js
var require_shim = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/set-prototype-of/shim.js"(exports, module) {
    "use strict";
    var isObject2 = require_is_object();
    var value = require_valid_value();
    var objIsPrototypeOf = Object.prototype.isPrototypeOf;
    var defineProperty = Object.defineProperty;
    var nullDesc = { configurable: true, enumerable: false, writable: true, value: void 0 };
    var validate;
    validate = function(obj, prototype) {
      value(obj);
      if (prototype === null || isObject2(prototype))
        return obj;
      throw new TypeError("Prototype must be null or an object");
    };
    module.exports = function(status) {
      var fn, set;
      if (!status)
        return null;
      if (status.level === 2) {
        if (status.set) {
          set = status.set;
          fn = function(obj, prototype) {
            set.call(validate(obj, prototype), prototype);
            return obj;
          };
        } else {
          fn = function(obj, prototype) {
            validate(obj, prototype).__proto__ = prototype;
            return obj;
          };
        }
      } else {
        fn = function self2(obj, prototype) {
          var isNullBase;
          validate(obj, prototype);
          isNullBase = objIsPrototypeOf.call(self2.nullPolyfill, obj);
          if (isNullBase)
            delete self2.nullPolyfill.__proto__;
          if (prototype === null)
            prototype = self2.nullPolyfill;
          obj.__proto__ = prototype;
          if (isNullBase)
            defineProperty(self2.nullPolyfill, "__proto__", nullDesc);
          return obj;
        };
      }
      return Object.defineProperty(fn, "level", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: status.level
      });
    }(function() {
      var tmpObj1 = /* @__PURE__ */ Object.create(null), tmpObj2 = {}, set, desc = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__");
      if (desc) {
        try {
          set = desc.set;
          set.call(tmpObj1, tmpObj2);
        } catch (ignore) {
        }
        if (Object.getPrototypeOf(tmpObj1) === tmpObj2)
          return { set, level: 2 };
      }
      tmpObj1.__proto__ = tmpObj2;
      if (Object.getPrototypeOf(tmpObj1) === tmpObj2)
        return { level: 2 };
      tmpObj1 = {};
      tmpObj1.__proto__ = tmpObj2;
      if (Object.getPrototypeOf(tmpObj1) === tmpObj2)
        return { level: 1 };
      return false;
    }());
    require_create();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/set-prototype-of/index.js
var require_set_prototype_of = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/set-prototype-of/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented2()() ? Object.setPrototypeOf : require_shim();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/valid-object.js
var require_valid_object = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/valid-object.js"(exports, module) {
    "use strict";
    var isObject2 = require_is_object();
    module.exports = function(value) {
      if (!isObject2(value))
        throw new TypeError(value + " is not an Object");
      return value;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/random-uniq.js
var require_random_uniq = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/random-uniq.js"(exports, module) {
    "use strict";
    var generated = /* @__PURE__ */ Object.create(null);
    var random = Math.random;
    module.exports = function() {
      var str;
      do {
        str = random().toString(36).slice(2);
      } while (generated[str]);
      return str;
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/value/is.js
var require_is = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/value/is.js"(exports, module) {
    "use strict";
    var _undefined = void 0;
    module.exports = function(value) {
      return value !== _undefined && value !== null;
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/object/is.js
var require_is2 = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/object/is.js"(exports, module) {
    "use strict";
    var isValue = require_is();
    var possibleTypes = { "object": true, "function": true, "undefined": true };
    module.exports = function(value) {
      if (!isValue(value))
        return false;
      return hasOwnProperty.call(possibleTypes, typeof value);
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/prototype/is.js
var require_is3 = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/prototype/is.js"(exports, module) {
    "use strict";
    var isObject2 = require_is2();
    module.exports = function(value) {
      if (!isObject2(value))
        return false;
      try {
        if (!value.constructor)
          return false;
        return value.constructor.prototype === value;
      } catch (error) {
        return false;
      }
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/function/is.js
var require_is4 = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/function/is.js"(exports, module) {
    "use strict";
    var isPrototype = require_is3();
    module.exports = function(value) {
      if (typeof value !== "function")
        return false;
      if (!hasOwnProperty.call(value, "length"))
        return false;
      try {
        if (typeof value.length !== "number")
          return false;
        if (typeof value.call !== "function")
          return false;
        if (typeof value.apply !== "function")
          return false;
      } catch (error) {
        return false;
      }
      return !isPrototype(value);
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/plain-function/is.js
var require_is5 = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/plain-function/is.js"(exports, module) {
    "use strict";
    var isFunction2 = require_is4();
    var classRe = /^\s*class[\s{/}]/;
    var functionToString = Function.prototype.toString;
    module.exports = function(value) {
      if (!isFunction2(value))
        return false;
      if (classRe.test(functionToString.call(value)))
        return false;
      return true;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/assign/is-implemented.js
var require_is_implemented3 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/assign/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      var assign = Object.assign, obj;
      if (typeof assign !== "function")
        return false;
      obj = { foo: "raz" };
      assign(obj, { bar: "dwa" }, { trzy: "trzy" });
      return obj.foo + obj.bar + obj.trzy === "razdwatrzy";
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/keys/is-implemented.js
var require_is_implemented4 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/keys/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      try {
        Object.keys("primitive");
        return true;
      } catch (e) {
        return false;
      }
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/keys/shim.js
var require_shim2 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/keys/shim.js"(exports, module) {
    "use strict";
    var isValue = require_is_value();
    var keys = Object.keys;
    module.exports = function(object) {
      return keys(isValue(object) ? Object(object) : object);
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/keys/index.js
var require_keys = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/keys/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented4()() ? Object.keys : require_shim2();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/assign/shim.js
var require_shim3 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/assign/shim.js"(exports, module) {
    "use strict";
    var keys = require_keys();
    var value = require_valid_value();
    var max = Math.max;
    module.exports = function(dest, src) {
      var error, i, length = max(arguments.length, 2), assign;
      dest = Object(value(dest));
      assign = function(key) {
        try {
          dest[key] = src[key];
        } catch (e) {
          if (!error)
            error = e;
        }
      };
      for (i = 1; i < length; ++i) {
        src = arguments[i];
        keys(src).forEach(assign);
      }
      if (error !== void 0)
        throw error;
      return dest;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/assign/index.js
var require_assign = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/assign/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented3()() ? Object.assign : require_shim3();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/normalize-options.js
var require_normalize_options = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/normalize-options.js"(exports, module) {
    "use strict";
    var isValue = require_is_value();
    var forEach = Array.prototype.forEach;
    var create = Object.create;
    var process = function(src, obj) {
      var key;
      for (key in src)
        obj[key] = src[key];
    };
    module.exports = function(opts1) {
      var result = create(null);
      forEach.call(arguments, function(options) {
        if (!isValue(options))
          return;
        process(Object(options), result);
      });
      return result;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/#/contains/is-implemented.js
var require_is_implemented5 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/#/contains/is-implemented.js"(exports, module) {
    "use strict";
    var str = "razdwatrzy";
    module.exports = function() {
      if (typeof str.contains !== "function")
        return false;
      return str.contains("dwa") === true && str.contains("foo") === false;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/#/contains/shim.js
var require_shim4 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/#/contains/shim.js"(exports, module) {
    "use strict";
    var indexOf2 = String.prototype.indexOf;
    module.exports = function(searchString) {
      return indexOf2.call(this, searchString, arguments[1]) > -1;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/#/contains/index.js
var require_contains = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/#/contains/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented5()() ? String.prototype.contains : require_shim4();
  }
});

// node_modules/.pnpm/d@1.0.1/node_modules/d/index.js
var require_d = __commonJS({
  "node_modules/.pnpm/d@1.0.1/node_modules/d/index.js"(exports, module) {
    "use strict";
    var isValue = require_is();
    var isPlainFunction = require_is5();
    var assign = require_assign();
    var normalizeOpts = require_normalize_options();
    var contains = require_contains();
    var d = module.exports = function(dscr, value) {
      var c, e, w, options, desc;
      if (arguments.length < 2 || typeof dscr !== "string") {
        options = value;
        value = dscr;
        dscr = null;
      } else {
        options = arguments[2];
      }
      if (isValue(dscr)) {
        c = contains.call(dscr, "c");
        e = contains.call(dscr, "e");
        w = contains.call(dscr, "w");
      } else {
        c = w = true;
        e = false;
      }
      desc = { value, configurable: c, enumerable: e, writable: w };
      return !options ? desc : assign(normalizeOpts(options), desc);
    };
    d.gs = function(dscr, get, set) {
      var c, e, options, desc;
      if (typeof dscr !== "string") {
        options = set;
        set = get;
        get = dscr;
        dscr = null;
      } else {
        options = arguments[3];
      }
      if (!isValue(get)) {
        get = void 0;
      } else if (!isPlainFunction(get)) {
        options = get;
        get = set = void 0;
      } else if (!isValue(set)) {
        set = void 0;
      } else if (!isPlainFunction(set)) {
        options = set;
        set = void 0;
      }
      if (isValue(dscr)) {
        c = contains.call(dscr, "c");
        e = contains.call(dscr, "e");
      } else {
        c = true;
        e = false;
      }
      desc = { get, set, configurable: c, enumerable: e };
      return !options ? desc : assign(normalizeOpts(options), desc);
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/function/is-arguments.js
var require_is_arguments = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/function/is-arguments.js"(exports, module) {
    "use strict";
    var objToString = Object.prototype.toString;
    var id = objToString.call(function() {
      return arguments;
    }());
    module.exports = function(value) {
      return objToString.call(value) === id;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/is-string.js
var require_is_string = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/string/is-string.js"(exports, module) {
    "use strict";
    var objToString = Object.prototype.toString;
    var id = objToString.call("");
    module.exports = function(value) {
      return typeof value === "string" || value && typeof value === "object" && (value instanceof String || objToString.call(value) === id) || false;
    };
  }
});

// node_modules/.pnpm/ext@1.6.0/node_modules/ext/global-this/is-implemented.js
var require_is_implemented6 = __commonJS({
  "node_modules/.pnpm/ext@1.6.0/node_modules/ext/global-this/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      if (typeof globalThis !== "object")
        return false;
      if (!globalThis)
        return false;
      return globalThis.Array === Array;
    };
  }
});

// node_modules/.pnpm/ext@1.6.0/node_modules/ext/global-this/implementation.js
var require_implementation = __commonJS({
  "node_modules/.pnpm/ext@1.6.0/node_modules/ext/global-this/implementation.js"(exports, module) {
    var naiveFallback = function() {
      if (typeof self === "object" && self)
        return self;
      if (typeof window === "object" && window)
        return window;
      throw new Error("Unable to resolve global `this`");
    };
    module.exports = function() {
      if (this)
        return this;
      try {
        Object.defineProperty(Object.prototype, "__global__", {
          get: function() {
            return this;
          },
          configurable: true
        });
      } catch (error) {
        return naiveFallback();
      }
      try {
        if (!__global__)
          return naiveFallback();
        return __global__;
      } finally {
        delete Object.prototype.__global__;
      }
    }();
  }
});

// node_modules/.pnpm/ext@1.6.0/node_modules/ext/global-this/index.js
var require_global_this = __commonJS({
  "node_modules/.pnpm/ext@1.6.0/node_modules/ext/global-this/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented6()() ? globalThis : require_implementation();
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/is-implemented.js
var require_is_implemented7 = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/is-implemented.js"(exports, module) {
    "use strict";
    var global2 = require_global_this();
    var validTypes = { object: true, symbol: true };
    module.exports = function() {
      var Symbol2 = global2.Symbol;
      var symbol;
      if (typeof Symbol2 !== "function")
        return false;
      symbol = Symbol2("test symbol");
      try {
        String(symbol);
      } catch (e) {
        return false;
      }
      if (!validTypes[typeof Symbol2.iterator])
        return false;
      if (!validTypes[typeof Symbol2.toPrimitive])
        return false;
      if (!validTypes[typeof Symbol2.toStringTag])
        return false;
      return true;
    };
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/is-symbol.js
var require_is_symbol = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/is-symbol.js"(exports, module) {
    "use strict";
    module.exports = function(value) {
      if (!value)
        return false;
      if (typeof value === "symbol")
        return true;
      if (!value.constructor)
        return false;
      if (value.constructor.name !== "Symbol")
        return false;
      return value[value.constructor.toStringTag] === "Symbol";
    };
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/validate-symbol.js
var require_validate_symbol = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/validate-symbol.js"(exports, module) {
    "use strict";
    var isSymbol = require_is_symbol();
    module.exports = function(value) {
      if (!isSymbol(value))
        throw new TypeError(value + " is not a symbol");
      return value;
    };
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/lib/private/generate-name.js
var require_generate_name = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/lib/private/generate-name.js"(exports, module) {
    "use strict";
    var d = require_d();
    var create = Object.create;
    var defineProperty = Object.defineProperty;
    var objPrototype = Object.prototype;
    var created = create(null);
    module.exports = function(desc) {
      var postfix = 0, name, ie11BugWorkaround;
      while (created[desc + (postfix || "")])
        ++postfix;
      desc += postfix || "";
      created[desc] = true;
      name = "@@" + desc;
      defineProperty(objPrototype, name, d.gs(null, function(value) {
        if (ie11BugWorkaround)
          return;
        ie11BugWorkaround = true;
        defineProperty(this, name, d(value));
        ie11BugWorkaround = false;
      }));
      return name;
    };
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/lib/private/setup/standard-symbols.js
var require_standard_symbols = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/lib/private/setup/standard-symbols.js"(exports, module) {
    "use strict";
    var d = require_d();
    var NativeSymbol = require_global_this().Symbol;
    module.exports = function(SymbolPolyfill) {
      return Object.defineProperties(SymbolPolyfill, {
        hasInstance: d("", NativeSymbol && NativeSymbol.hasInstance || SymbolPolyfill("hasInstance")),
        isConcatSpreadable: d("", NativeSymbol && NativeSymbol.isConcatSpreadable || SymbolPolyfill("isConcatSpreadable")),
        iterator: d("", NativeSymbol && NativeSymbol.iterator || SymbolPolyfill("iterator")),
        match: d("", NativeSymbol && NativeSymbol.match || SymbolPolyfill("match")),
        replace: d("", NativeSymbol && NativeSymbol.replace || SymbolPolyfill("replace")),
        search: d("", NativeSymbol && NativeSymbol.search || SymbolPolyfill("search")),
        species: d("", NativeSymbol && NativeSymbol.species || SymbolPolyfill("species")),
        split: d("", NativeSymbol && NativeSymbol.split || SymbolPolyfill("split")),
        toPrimitive: d("", NativeSymbol && NativeSymbol.toPrimitive || SymbolPolyfill("toPrimitive")),
        toStringTag: d("", NativeSymbol && NativeSymbol.toStringTag || SymbolPolyfill("toStringTag")),
        unscopables: d("", NativeSymbol && NativeSymbol.unscopables || SymbolPolyfill("unscopables"))
      });
    };
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/lib/private/setup/symbol-registry.js
var require_symbol_registry = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/lib/private/setup/symbol-registry.js"(exports, module) {
    "use strict";
    var d = require_d();
    var validateSymbol = require_validate_symbol();
    var registry = /* @__PURE__ */ Object.create(null);
    module.exports = function(SymbolPolyfill) {
      return Object.defineProperties(SymbolPolyfill, {
        for: d(function(key) {
          if (registry[key])
            return registry[key];
          return registry[key] = SymbolPolyfill(String(key));
        }),
        keyFor: d(function(symbol) {
          var key;
          validateSymbol(symbol);
          for (key in registry) {
            if (registry[key] === symbol)
              return key;
          }
          return void 0;
        })
      });
    };
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/polyfill.js
var require_polyfill = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/polyfill.js"(exports, module) {
    "use strict";
    var d = require_d();
    var validateSymbol = require_validate_symbol();
    var NativeSymbol = require_global_this().Symbol;
    var generateName = require_generate_name();
    var setupStandardSymbols = require_standard_symbols();
    var setupSymbolRegistry = require_symbol_registry();
    var create = Object.create;
    var defineProperties = Object.defineProperties;
    var defineProperty = Object.defineProperty;
    var SymbolPolyfill;
    var HiddenSymbol;
    var isNativeSafe;
    if (typeof NativeSymbol === "function") {
      try {
        String(NativeSymbol());
        isNativeSafe = true;
      } catch (ignore) {
      }
    } else {
      NativeSymbol = null;
    }
    HiddenSymbol = function Symbol2(description) {
      if (this instanceof HiddenSymbol)
        throw new TypeError("Symbol is not a constructor");
      return SymbolPolyfill(description);
    };
    module.exports = SymbolPolyfill = function Symbol2(description) {
      var symbol;
      if (this instanceof Symbol2)
        throw new TypeError("Symbol is not a constructor");
      if (isNativeSafe)
        return NativeSymbol(description);
      symbol = create(HiddenSymbol.prototype);
      description = description === void 0 ? "" : String(description);
      return defineProperties(symbol, {
        __description__: d("", description),
        __name__: d("", generateName(description))
      });
    };
    setupStandardSymbols(SymbolPolyfill);
    setupSymbolRegistry(SymbolPolyfill);
    defineProperties(HiddenSymbol.prototype, {
      constructor: d(SymbolPolyfill),
      toString: d("", function() {
        return this.__name__;
      })
    });
    defineProperties(SymbolPolyfill.prototype, {
      toString: d(function() {
        return "Symbol (" + validateSymbol(this).__description__ + ")";
      }),
      valueOf: d(function() {
        return validateSymbol(this);
      })
    });
    defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d("", function() {
      var symbol = validateSymbol(this);
      if (typeof symbol === "symbol")
        return symbol;
      return symbol.toString();
    }));
    defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol"));
    defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag, d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));
    defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive, d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));
  }
});

// node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/index.js
var require_es6_symbol = __commonJS({
  "node_modules/.pnpm/es6-symbol@3.1.3/node_modules/es6-symbol/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented7()() ? require_global_this().Symbol : require_polyfill();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/#/clear.js
var require_clear = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/#/clear.js"(exports, module) {
    "use strict";
    var value = require_valid_value();
    module.exports = function() {
      value(this).length = 0;
      return this;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/valid-callable.js
var require_valid_callable = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/valid-callable.js"(exports, module) {
    "use strict";
    module.exports = function(fn) {
      if (typeof fn !== "function")
        throw new TypeError(fn + " is not a function");
      return fn;
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/string/coerce.js
var require_coerce = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/string/coerce.js"(exports, module) {
    "use strict";
    var isValue = require_is();
    var isObject2 = require_is2();
    var objectToString2 = Object.prototype.toString;
    module.exports = function(value) {
      if (!isValue(value))
        return null;
      if (isObject2(value)) {
        var valueToString = value.toString;
        if (typeof valueToString !== "function")
          return null;
        if (valueToString === objectToString2)
          return null;
      }
      try {
        return "" + value;
      } catch (error) {
        return null;
      }
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/lib/safe-to-string.js
var require_safe_to_string = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/lib/safe-to-string.js"(exports, module) {
    "use strict";
    module.exports = function(value) {
      try {
        return value.toString();
      } catch (error) {
        try {
          return String(value);
        } catch (error2) {
          return null;
        }
      }
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/lib/to-short-string.js
var require_to_short_string = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/lib/to-short-string.js"(exports, module) {
    "use strict";
    var safeToString = require_safe_to_string();
    var reNewLine = /[\n\r\u2028\u2029]/g;
    module.exports = function(value) {
      var string = safeToString(value);
      if (string === null)
        return "<Non-coercible to string value>";
      if (string.length > 100)
        string = string.slice(0, 99) + "\u2026";
      string = string.replace(reNewLine, function(char) {
        switch (char) {
          case "\n":
            return "\\n";
          case "\r":
            return "\\r";
          case "\u2028":
            return "\\u2028";
          case "\u2029":
            return "\\u2029";
          default:
            throw new Error("Unexpected character");
        }
      });
      return string;
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/lib/resolve-exception.js
var require_resolve_exception = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/lib/resolve-exception.js"(exports, module) {
    "use strict";
    var isValue = require_is();
    var isObject2 = require_is2();
    var stringCoerce = require_coerce();
    var toShortString = require_to_short_string();
    var resolveMessage = function(message, value) {
      return message.replace("%v", toShortString(value));
    };
    module.exports = function(value, defaultMessage, inputOptions) {
      if (!isObject2(inputOptions))
        throw new TypeError(resolveMessage(defaultMessage, value));
      if (!isValue(value)) {
        if ("default" in inputOptions)
          return inputOptions["default"];
        if (inputOptions.isOptional)
          return null;
      }
      var errorMessage = stringCoerce(inputOptions.errorMessage);
      if (!isValue(errorMessage))
        errorMessage = defaultMessage;
      throw new TypeError(resolveMessage(errorMessage, value));
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/value/ensure.js
var require_ensure = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/value/ensure.js"(exports, module) {
    "use strict";
    var resolveException = require_resolve_exception();
    var is = require_is();
    module.exports = function(value) {
      if (is(value))
        return value;
      return resolveException(value, "Cannot use %v", arguments[1]);
    };
  }
});

// node_modules/.pnpm/type@1.2.0/node_modules/type/plain-function/ensure.js
var require_ensure2 = __commonJS({
  "node_modules/.pnpm/type@1.2.0/node_modules/type/plain-function/ensure.js"(exports, module) {
    "use strict";
    var resolveException = require_resolve_exception();
    var is = require_is5();
    module.exports = function(value) {
      if (is(value))
        return value;
      return resolveException(value, "%v is not a plain function", arguments[1]);
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/from/is-implemented.js
var require_is_implemented8 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/from/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      var from2 = Array.from, arr, result;
      if (typeof from2 !== "function")
        return false;
      arr = ["raz", "dwa"];
      result = from2(arr);
      return Boolean(result && result !== arr && result[1] === "dwa");
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/function/is-function.js
var require_is_function = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/function/is-function.js"(exports, module) {
    "use strict";
    var objToString = Object.prototype.toString;
    var isFunctionStringTag = RegExp.prototype.test.bind(/^[object [A-Za-z0-9]*Function]$/);
    module.exports = function(value) {
      return typeof value === "function" && isFunctionStringTag(objToString.call(value));
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/math/sign/is-implemented.js
var require_is_implemented9 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/math/sign/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      var sign = Math.sign;
      if (typeof sign !== "function")
        return false;
      return sign(10) === 1 && sign(-20) === -1;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/math/sign/shim.js
var require_shim5 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/math/sign/shim.js"(exports, module) {
    "use strict";
    module.exports = function(value) {
      value = Number(value);
      if (isNaN(value) || value === 0)
        return value;
      return value > 0 ? 1 : -1;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/math/sign/index.js
var require_sign = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/math/sign/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented9()() ? Math.sign : require_shim5();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/to-integer.js
var require_to_integer = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/to-integer.js"(exports, module) {
    "use strict";
    var sign = require_sign();
    var abs = Math.abs;
    var floor = Math.floor;
    module.exports = function(value) {
      if (isNaN(value))
        return 0;
      value = Number(value);
      if (value === 0 || !isFinite(value))
        return value;
      return sign(value) * floor(abs(value));
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/to-pos-integer.js
var require_to_pos_integer = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/to-pos-integer.js"(exports, module) {
    "use strict";
    var toInteger = require_to_integer();
    var max = Math.max;
    module.exports = function(value) {
      return max(0, toInteger(value));
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/from/shim.js
var require_shim6 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/from/shim.js"(exports, module) {
    "use strict";
    var iteratorSymbol = require_es6_symbol().iterator;
    var isArguments2 = require_is_arguments();
    var isFunction2 = require_is_function();
    var toPosInt = require_to_pos_integer();
    var callable = require_valid_callable();
    var validValue = require_valid_value();
    var isValue = require_is_value();
    var isString2 = require_is_string();
    var isArray3 = Array.isArray;
    var call = Function.prototype.call;
    var desc = { configurable: true, enumerable: true, writable: true, value: null };
    var defineProperty = Object.defineProperty;
    module.exports = function(arrayLike) {
      var mapFn = arguments[1], thisArg = arguments[2], Context, i, j, arr, length, code, iterator, result, getIterator, value;
      arrayLike = Object(validValue(arrayLike));
      if (isValue(mapFn))
        callable(mapFn);
      if (!this || this === Array || !isFunction2(this)) {
        if (!mapFn) {
          if (isArguments2(arrayLike)) {
            length = arrayLike.length;
            if (length !== 1)
              return Array.apply(null, arrayLike);
            arr = new Array(1);
            arr[0] = arrayLike[0];
            return arr;
          }
          if (isArray3(arrayLike)) {
            arr = new Array(length = arrayLike.length);
            for (i = 0; i < length; ++i)
              arr[i] = arrayLike[i];
            return arr;
          }
        }
        arr = [];
      } else {
        Context = this;
      }
      if (!isArray3(arrayLike)) {
        if ((getIterator = arrayLike[iteratorSymbol]) !== void 0) {
          iterator = callable(getIterator).call(arrayLike);
          if (Context)
            arr = new Context();
          result = iterator.next();
          i = 0;
          while (!result.done) {
            value = mapFn ? call.call(mapFn, thisArg, result.value, i) : result.value;
            if (Context) {
              desc.value = value;
              defineProperty(arr, i, desc);
            } else {
              arr[i] = value;
            }
            result = iterator.next();
            ++i;
          }
          length = i;
        } else if (isString2(arrayLike)) {
          length = arrayLike.length;
          if (Context)
            arr = new Context();
          for (i = 0, j = 0; i < length; ++i) {
            value = arrayLike[i];
            if (i + 1 < length) {
              code = value.charCodeAt(0);
              if (code >= 55296 && code <= 56319)
                value += arrayLike[++i];
            }
            value = mapFn ? call.call(mapFn, thisArg, value, j) : value;
            if (Context) {
              desc.value = value;
              defineProperty(arr, j, desc);
            } else {
              arr[j] = value;
            }
            ++j;
          }
          length = j;
        }
      }
      if (length === void 0) {
        length = toPosInt(arrayLike.length);
        if (Context)
          arr = new Context(length);
        for (i = 0; i < length; ++i) {
          value = mapFn ? call.call(mapFn, thisArg, arrayLike[i], i) : arrayLike[i];
          if (Context) {
            desc.value = value;
            defineProperty(arr, i, desc);
          } else {
            arr[i] = value;
          }
        }
      }
      if (Context) {
        desc.value = null;
        arr.length = length;
      }
      return arr;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/from/index.js
var require_from = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/from/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented8()() ? Array.from : require_shim6();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/copy.js
var require_copy = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/copy.js"(exports, module) {
    "use strict";
    var aFrom = require_from();
    var assign = require_assign();
    var value = require_valid_value();
    module.exports = function(obj) {
      var copy2 = Object(value(obj)), propertyNames = arguments[1], options = Object(arguments[2]);
      if (copy2 !== obj && !propertyNames)
        return copy2;
      var result = {};
      if (propertyNames) {
        aFrom(propertyNames, function(propertyName) {
          if (options.ensure || propertyName in obj)
            result[propertyName] = obj[propertyName];
        });
      } else {
        assign(result, obj);
      }
      return result;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/_iterate.js
var require_iterate = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/_iterate.js"(exports, module) {
    "use strict";
    var callable = require_valid_callable();
    var value = require_valid_value();
    var bind = Function.prototype.bind;
    var call = Function.prototype.call;
    var keys = Object.keys;
    var objPropertyIsEnumerable = Object.prototype.propertyIsEnumerable;
    module.exports = function(method, defVal) {
      return function(obj, cb) {
        var list, thisArg = arguments[2], compareFn = arguments[3];
        obj = Object(value(obj));
        callable(cb);
        list = keys(obj);
        if (compareFn) {
          list.sort(typeof compareFn === "function" ? bind.call(compareFn, obj) : void 0);
        }
        if (typeof method !== "function")
          method = list[method];
        return call.call(method, list, function(key, index) {
          if (!objPropertyIsEnumerable.call(obj, key))
            return defVal;
          return call.call(cb, thisArg, obj[key], key, obj, index);
        });
      };
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/for-each.js
var require_for_each = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/for-each.js"(exports, module) {
    "use strict";
    module.exports = require_iterate()("forEach");
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/map.js
var require_map = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/map.js"(exports, module) {
    "use strict";
    var callable = require_valid_callable();
    var forEach = require_for_each();
    var call = Function.prototype.call;
    module.exports = function(obj, cb) {
      var result = {}, thisArg = arguments[2];
      callable(cb);
      forEach(obj, function(value, key, targetObj, index) {
        result[key] = call.call(cb, thisArg, value, key, targetObj, index);
      });
      return result;
    };
  }
});

// node_modules/.pnpm/d@1.0.1/node_modules/d/auto-bind.js
var require_auto_bind = __commonJS({
  "node_modules/.pnpm/d@1.0.1/node_modules/d/auto-bind.js"(exports, module) {
    "use strict";
    var isValue = require_is();
    var ensureValue = require_ensure();
    var ensurePlainFunction = require_ensure2();
    var copy2 = require_copy();
    var normalizeOptions = require_normalize_options();
    var map = require_map();
    var bind = Function.prototype.bind;
    var defineProperty = Object.defineProperty;
    var hasOwnProperty3 = Object.prototype.hasOwnProperty;
    var define;
    define = function(name, desc, options) {
      var value = ensureValue(desc) && ensurePlainFunction(desc.value), dgs;
      dgs = copy2(desc);
      delete dgs.writable;
      delete dgs.value;
      dgs.get = function() {
        if (!options.overwriteDefinition && hasOwnProperty3.call(this, name))
          return value;
        desc.value = bind.call(value, options.resolveContext ? options.resolveContext(this) : this);
        defineProperty(this, name, desc);
        return this[name];
      };
      return dgs;
    };
    module.exports = function(props) {
      var options = normalizeOptions(arguments[1]);
      if (isValue(options.resolveContext))
        ensurePlainFunction(options.resolveContext);
      return map(props, function(desc, name) {
        return define(name, desc, options);
      });
    };
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/index.js
var require_es6_iterator = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/index.js"(exports, module) {
    "use strict";
    var clear = require_clear();
    var assign = require_assign();
    var callable = require_valid_callable();
    var value = require_valid_value();
    var d = require_d();
    var autoBind = require_auto_bind();
    var Symbol2 = require_es6_symbol();
    var defineProperty = Object.defineProperty;
    var defineProperties = Object.defineProperties;
    var Iterator;
    module.exports = Iterator = function(list, context) {
      if (!(this instanceof Iterator))
        throw new TypeError("Constructor requires 'new'");
      defineProperties(this, {
        __list__: d("w", value(list)),
        __context__: d("w", context),
        __nextIndex__: d("w", 0)
      });
      if (!context)
        return;
      callable(context.on);
      context.on("_add", this._onAdd);
      context.on("_delete", this._onDelete);
      context.on("_clear", this._onClear);
    };
    delete Iterator.prototype.constructor;
    defineProperties(Iterator.prototype, assign({
      _next: d(function() {
        var i;
        if (!this.__list__)
          return void 0;
        if (this.__redo__) {
          i = this.__redo__.shift();
          if (i !== void 0)
            return i;
        }
        if (this.__nextIndex__ < this.__list__.length)
          return this.__nextIndex__++;
        this._unBind();
        return void 0;
      }),
      next: d(function() {
        return this._createResult(this._next());
      }),
      _createResult: d(function(i) {
        if (i === void 0)
          return { done: true, value: void 0 };
        return { done: false, value: this._resolve(i) };
      }),
      _resolve: d(function(i) {
        return this.__list__[i];
      }),
      _unBind: d(function() {
        this.__list__ = null;
        delete this.__redo__;
        if (!this.__context__)
          return;
        this.__context__.off("_add", this._onAdd);
        this.__context__.off("_delete", this._onDelete);
        this.__context__.off("_clear", this._onClear);
        this.__context__ = null;
      }),
      toString: d(function() {
        return "[object " + (this[Symbol2.toStringTag] || "Object") + "]";
      })
    }, autoBind({
      _onAdd: d(function(index) {
        if (index >= this.__nextIndex__)
          return;
        ++this.__nextIndex__;
        if (!this.__redo__) {
          defineProperty(this, "__redo__", d("c", [index]));
          return;
        }
        this.__redo__.forEach(function(redo, i) {
          if (redo >= index)
            this.__redo__[i] = ++redo;
        }, this);
        this.__redo__.push(index);
      }),
      _onDelete: d(function(index) {
        var i;
        if (index >= this.__nextIndex__)
          return;
        --this.__nextIndex__;
        if (!this.__redo__)
          return;
        i = this.__redo__.indexOf(index);
        if (i !== -1)
          this.__redo__.splice(i, 1);
        this.__redo__.forEach(function(redo, j) {
          if (redo > index)
            this.__redo__[j] = --redo;
        }, this);
      }),
      _onClear: d(function() {
        if (this.__redo__)
          clear.call(this.__redo__);
        this.__nextIndex__ = 0;
      })
    })));
    defineProperty(Iterator.prototype, Symbol2.iterator, d(function() {
      return this;
    }));
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/array.js
var require_array = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/array.js"(exports, module) {
    "use strict";
    var setPrototypeOf = require_set_prototype_of();
    var contains = require_contains();
    var d = require_d();
    var Symbol2 = require_es6_symbol();
    var Iterator = require_es6_iterator();
    var defineProperty = Object.defineProperty;
    var ArrayIterator;
    ArrayIterator = module.exports = function(arr, kind) {
      if (!(this instanceof ArrayIterator))
        throw new TypeError("Constructor requires 'new'");
      Iterator.call(this, arr);
      if (!kind)
        kind = "value";
      else if (contains.call(kind, "key+value"))
        kind = "key+value";
      else if (contains.call(kind, "key"))
        kind = "key";
      else
        kind = "value";
      defineProperty(this, "__kind__", d("", kind));
    };
    if (setPrototypeOf)
      setPrototypeOf(ArrayIterator, Iterator);
    delete ArrayIterator.prototype.constructor;
    ArrayIterator.prototype = Object.create(Iterator.prototype, {
      _resolve: d(function(i) {
        if (this.__kind__ === "value")
          return this.__list__[i];
        if (this.__kind__ === "key+value")
          return [i, this.__list__[i]];
        return i;
      })
    });
    defineProperty(ArrayIterator.prototype, Symbol2.toStringTag, d("c", "Array Iterator"));
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/string.js
var require_string = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/string.js"(exports, module) {
    "use strict";
    var setPrototypeOf = require_set_prototype_of();
    var d = require_d();
    var Symbol2 = require_es6_symbol();
    var Iterator = require_es6_iterator();
    var defineProperty = Object.defineProperty;
    var StringIterator;
    StringIterator = module.exports = function(str) {
      if (!(this instanceof StringIterator))
        throw new TypeError("Constructor requires 'new'");
      str = String(str);
      Iterator.call(this, str);
      defineProperty(this, "__length__", d("", str.length));
    };
    if (setPrototypeOf)
      setPrototypeOf(StringIterator, Iterator);
    delete StringIterator.prototype.constructor;
    StringIterator.prototype = Object.create(Iterator.prototype, {
      _next: d(function() {
        if (!this.__list__)
          return void 0;
        if (this.__nextIndex__ < this.__length__)
          return this.__nextIndex__++;
        this._unBind();
        return void 0;
      }),
      _resolve: d(function(i) {
        var char = this.__list__[i], code;
        if (this.__nextIndex__ === this.__length__)
          return char;
        code = char.charCodeAt(0);
        if (code >= 55296 && code <= 56319)
          return char + this.__list__[this.__nextIndex__++];
        return char;
      })
    });
    defineProperty(StringIterator.prototype, Symbol2.toStringTag, d("c", "String Iterator"));
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/is-iterable.js
var require_is_iterable = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/is-iterable.js"(exports, module) {
    "use strict";
    var isArguments2 = require_is_arguments();
    var isValue = require_is_value();
    var isString2 = require_is_string();
    var iteratorSymbol = require_es6_symbol().iterator;
    var isArray3 = Array.isArray;
    module.exports = function(value) {
      if (!isValue(value))
        return false;
      if (isArray3(value))
        return true;
      if (isString2(value))
        return true;
      if (isArguments2(value))
        return true;
      return typeof value[iteratorSymbol] === "function";
    };
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/valid-iterable.js
var require_valid_iterable = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/valid-iterable.js"(exports, module) {
    "use strict";
    var isIterable = require_is_iterable();
    module.exports = function(value) {
      if (!isIterable(value))
        throw new TypeError(value + " is not iterable");
      return value;
    };
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/get.js
var require_get = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/get.js"(exports, module) {
    "use strict";
    var isArguments2 = require_is_arguments();
    var isString2 = require_is_string();
    var ArrayIterator = require_array();
    var StringIterator = require_string();
    var iterable = require_valid_iterable();
    var iteratorSymbol = require_es6_symbol().iterator;
    module.exports = function(obj) {
      if (typeof iterable(obj)[iteratorSymbol] === "function")
        return obj[iteratorSymbol]();
      if (isArguments2(obj))
        return new ArrayIterator(obj);
      if (isString2(obj))
        return new StringIterator(obj);
      return new ArrayIterator(obj);
    };
  }
});

// node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/for-of.js
var require_for_of = __commonJS({
  "node_modules/.pnpm/es6-iterator@2.0.3/node_modules/es6-iterator/for-of.js"(exports, module) {
    "use strict";
    var isArguments2 = require_is_arguments();
    var callable = require_valid_callable();
    var isString2 = require_is_string();
    var get = require_get();
    var isArray3 = Array.isArray;
    var call = Function.prototype.call;
    var some = Array.prototype.some;
    module.exports = function(iterable, cb) {
      var mode, thisArg = arguments[2], result, doBreak, broken, i, length, char, code;
      if (isArray3(iterable) || isArguments2(iterable))
        mode = "array";
      else if (isString2(iterable))
        mode = "string";
      else
        iterable = get(iterable);
      callable(cb);
      doBreak = function() {
        broken = true;
      };
      if (mode === "array") {
        some.call(iterable, function(value) {
          call.call(cb, thisArg, value, doBreak);
          return broken;
        });
        return;
      }
      if (mode === "string") {
        length = iterable.length;
        for (i = 0; i < length; ++i) {
          char = iterable[i];
          if (i + 1 < length) {
            code = char.charCodeAt(0);
            if (code >= 55296 && code <= 56319)
              char += iterable[++i];
          }
          call.call(cb, thisArg, char, doBreak);
          if (broken)
            break;
        }
        return;
      }
      result = iterable.next();
      while (!result.done) {
        call.call(cb, thisArg, result.value, doBreak);
        if (broken)
          return;
        result = iterable.next();
      }
    };
  }
});

// node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/is-native-implemented.js
var require_is_native_implemented = __commonJS({
  "node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/is-native-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      if (typeof WeakMap !== "function")
        return false;
      return Object.prototype.toString.call(/* @__PURE__ */ new WeakMap()) === "[object WeakMap]";
    }();
  }
});

// node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/polyfill.js
var require_polyfill2 = __commonJS({
  "node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/polyfill.js"(exports, module) {
    "use strict";
    var isValue = require_is_value();
    var setPrototypeOf = require_set_prototype_of();
    var object = require_valid_object();
    var ensureValue = require_valid_value();
    var randomUniq = require_random_uniq();
    var d = require_d();
    var getIterator = require_get();
    var forOf = require_for_of();
    var toStringTagSymbol = require_es6_symbol().toStringTag;
    var isNative = require_is_native_implemented();
    var isArray3 = Array.isArray;
    var defineProperty = Object.defineProperty;
    var objHasOwnProperty = Object.prototype.hasOwnProperty;
    var getPrototypeOf = Object.getPrototypeOf;
    var WeakMapPoly;
    module.exports = WeakMapPoly = function() {
      var iterable = arguments[0], self2;
      if (!(this instanceof WeakMapPoly))
        throw new TypeError("Constructor requires 'new'");
      self2 = isNative && setPrototypeOf && WeakMap !== WeakMapPoly ? setPrototypeOf(/* @__PURE__ */ new WeakMap(), getPrototypeOf(this)) : this;
      if (isValue(iterable)) {
        if (!isArray3(iterable))
          iterable = getIterator(iterable);
      }
      defineProperty(self2, "__weakMapData__", d("c", "$weakMap$" + randomUniq()));
      if (!iterable)
        return self2;
      forOf(iterable, function(val) {
        ensureValue(val);
        self2.set(val[0], val[1]);
      });
      return self2;
    };
    if (isNative) {
      if (setPrototypeOf)
        setPrototypeOf(WeakMapPoly, WeakMap);
      WeakMapPoly.prototype = Object.create(WeakMap.prototype, { constructor: d(WeakMapPoly) });
    }
    Object.defineProperties(WeakMapPoly.prototype, {
      delete: d(function(key) {
        if (objHasOwnProperty.call(object(key), this.__weakMapData__)) {
          delete key[this.__weakMapData__];
          return true;
        }
        return false;
      }),
      get: d(function(key) {
        if (!objHasOwnProperty.call(object(key), this.__weakMapData__))
          return void 0;
        return key[this.__weakMapData__];
      }),
      has: d(function(key) {
        return objHasOwnProperty.call(object(key), this.__weakMapData__);
      }),
      set: d(function(key, value) {
        defineProperty(object(key), this.__weakMapData__, d("c", value));
        return this;
      }),
      toString: d(function() {
        return "[object WeakMap]";
      })
    });
    defineProperty(WeakMapPoly.prototype, toStringTagSymbol, d("c", "WeakMap"));
  }
});

// node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/index.js
var require_es6_weak_map = __commonJS({
  "node_modules/.pnpm/es6-weak-map@2.0.3/node_modules/es6-weak-map/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented()() ? WeakMap : require_polyfill2();
  }
});

// node_modules/.pnpm/estraverse@4.3.0/node_modules/estraverse/package.json
var require_package = __commonJS({
  "node_modules/.pnpm/estraverse@4.3.0/node_modules/estraverse/package.json"(exports, module) {
    module.exports = {
      name: "estraverse",
      description: "ECMAScript JS AST traversal functions",
      homepage: "https://github.com/estools/estraverse",
      main: "estraverse.js",
      version: "4.3.0",
      engines: {
        node: ">=4.0"
      },
      maintainers: [
        {
          name: "Yusuke Suzuki",
          email: "utatane.tea@gmail.com",
          web: "http://github.com/Constellation"
        }
      ],
      repository: {
        type: "git",
        url: "http://github.com/estools/estraverse.git"
      },
      devDependencies: {
        "babel-preset-env": "^1.6.1",
        "babel-register": "^6.3.13",
        chai: "^2.1.1",
        espree: "^1.11.0",
        gulp: "^3.8.10",
        "gulp-bump": "^0.2.2",
        "gulp-filter": "^2.0.0",
        "gulp-git": "^1.0.1",
        "gulp-tag-version": "^1.3.0",
        jshint: "^2.5.6",
        mocha: "^2.1.0"
      },
      license: "BSD-2-Clause",
      scripts: {
        test: "npm run-script lint && npm run-script unit-test",
        lint: "jshint estraverse.js",
        "unit-test": "mocha --compilers js:babel-register"
      }
    };
  }
});

// node_modules/.pnpm/estraverse@4.3.0/node_modules/estraverse/estraverse.js
var require_estraverse = __commonJS({
  "node_modules/.pnpm/estraverse@4.3.0/node_modules/estraverse/estraverse.js"(exports) {
    (function clone(exports2) {
      "use strict";
      var Syntax, VisitorOption, VisitorKeys, BREAK, SKIP, REMOVE;
      function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === "object" && val !== null) {
              ret[key] = deepCopy(val);
            } else {
              ret[key] = val;
            }
          }
        }
        return ret;
      }
      function upperBound(array, func) {
        var diff, len, i, current;
        len = array.length;
        i = 0;
        while (len) {
          diff = len >>> 1;
          current = i + diff;
          if (func(array[current])) {
            len = diff;
          } else {
            i = current + 1;
            len -= diff + 1;
          }
        }
        return i;
      }
      Syntax = {
        AssignmentExpression: "AssignmentExpression",
        AssignmentPattern: "AssignmentPattern",
        ArrayExpression: "ArrayExpression",
        ArrayPattern: "ArrayPattern",
        ArrowFunctionExpression: "ArrowFunctionExpression",
        AwaitExpression: "AwaitExpression",
        BlockStatement: "BlockStatement",
        BinaryExpression: "BinaryExpression",
        BreakStatement: "BreakStatement",
        CallExpression: "CallExpression",
        CatchClause: "CatchClause",
        ClassBody: "ClassBody",
        ClassDeclaration: "ClassDeclaration",
        ClassExpression: "ClassExpression",
        ComprehensionBlock: "ComprehensionBlock",
        ComprehensionExpression: "ComprehensionExpression",
        ConditionalExpression: "ConditionalExpression",
        ContinueStatement: "ContinueStatement",
        DebuggerStatement: "DebuggerStatement",
        DirectiveStatement: "DirectiveStatement",
        DoWhileStatement: "DoWhileStatement",
        EmptyStatement: "EmptyStatement",
        ExportAllDeclaration: "ExportAllDeclaration",
        ExportDefaultDeclaration: "ExportDefaultDeclaration",
        ExportNamedDeclaration: "ExportNamedDeclaration",
        ExportSpecifier: "ExportSpecifier",
        ExpressionStatement: "ExpressionStatement",
        ForStatement: "ForStatement",
        ForInStatement: "ForInStatement",
        ForOfStatement: "ForOfStatement",
        FunctionDeclaration: "FunctionDeclaration",
        FunctionExpression: "FunctionExpression",
        GeneratorExpression: "GeneratorExpression",
        Identifier: "Identifier",
        IfStatement: "IfStatement",
        ImportExpression: "ImportExpression",
        ImportDeclaration: "ImportDeclaration",
        ImportDefaultSpecifier: "ImportDefaultSpecifier",
        ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
        ImportSpecifier: "ImportSpecifier",
        Literal: "Literal",
        LabeledStatement: "LabeledStatement",
        LogicalExpression: "LogicalExpression",
        MemberExpression: "MemberExpression",
        MetaProperty: "MetaProperty",
        MethodDefinition: "MethodDefinition",
        ModuleSpecifier: "ModuleSpecifier",
        NewExpression: "NewExpression",
        ObjectExpression: "ObjectExpression",
        ObjectPattern: "ObjectPattern",
        Program: "Program",
        Property: "Property",
        RestElement: "RestElement",
        ReturnStatement: "ReturnStatement",
        SequenceExpression: "SequenceExpression",
        SpreadElement: "SpreadElement",
        Super: "Super",
        SwitchStatement: "SwitchStatement",
        SwitchCase: "SwitchCase",
        TaggedTemplateExpression: "TaggedTemplateExpression",
        TemplateElement: "TemplateElement",
        TemplateLiteral: "TemplateLiteral",
        ThisExpression: "ThisExpression",
        ThrowStatement: "ThrowStatement",
        TryStatement: "TryStatement",
        UnaryExpression: "UnaryExpression",
        UpdateExpression: "UpdateExpression",
        VariableDeclaration: "VariableDeclaration",
        VariableDeclarator: "VariableDeclarator",
        WhileStatement: "WhileStatement",
        WithStatement: "WithStatement",
        YieldExpression: "YieldExpression"
      };
      VisitorKeys = {
        AssignmentExpression: ["left", "right"],
        AssignmentPattern: ["left", "right"],
        ArrayExpression: ["elements"],
        ArrayPattern: ["elements"],
        ArrowFunctionExpression: ["params", "body"],
        AwaitExpression: ["argument"],
        BlockStatement: ["body"],
        BinaryExpression: ["left", "right"],
        BreakStatement: ["label"],
        CallExpression: ["callee", "arguments"],
        CatchClause: ["param", "body"],
        ClassBody: ["body"],
        ClassDeclaration: ["id", "superClass", "body"],
        ClassExpression: ["id", "superClass", "body"],
        ComprehensionBlock: ["left", "right"],
        ComprehensionExpression: ["blocks", "filter", "body"],
        ConditionalExpression: ["test", "consequent", "alternate"],
        ContinueStatement: ["label"],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ["body", "test"],
        EmptyStatement: [],
        ExportAllDeclaration: ["source"],
        ExportDefaultDeclaration: ["declaration"],
        ExportNamedDeclaration: ["declaration", "specifiers", "source"],
        ExportSpecifier: ["exported", "local"],
        ExpressionStatement: ["expression"],
        ForStatement: ["init", "test", "update", "body"],
        ForInStatement: ["left", "right", "body"],
        ForOfStatement: ["left", "right", "body"],
        FunctionDeclaration: ["id", "params", "body"],
        FunctionExpression: ["id", "params", "body"],
        GeneratorExpression: ["blocks", "filter", "body"],
        Identifier: [],
        IfStatement: ["test", "consequent", "alternate"],
        ImportExpression: ["source"],
        ImportDeclaration: ["specifiers", "source"],
        ImportDefaultSpecifier: ["local"],
        ImportNamespaceSpecifier: ["local"],
        ImportSpecifier: ["imported", "local"],
        Literal: [],
        LabeledStatement: ["label", "body"],
        LogicalExpression: ["left", "right"],
        MemberExpression: ["object", "property"],
        MetaProperty: ["meta", "property"],
        MethodDefinition: ["key", "value"],
        ModuleSpecifier: [],
        NewExpression: ["callee", "arguments"],
        ObjectExpression: ["properties"],
        ObjectPattern: ["properties"],
        Program: ["body"],
        Property: ["key", "value"],
        RestElement: ["argument"],
        ReturnStatement: ["argument"],
        SequenceExpression: ["expressions"],
        SpreadElement: ["argument"],
        Super: [],
        SwitchStatement: ["discriminant", "cases"],
        SwitchCase: ["test", "consequent"],
        TaggedTemplateExpression: ["tag", "quasi"],
        TemplateElement: [],
        TemplateLiteral: ["quasis", "expressions"],
        ThisExpression: [],
        ThrowStatement: ["argument"],
        TryStatement: ["block", "handler", "finalizer"],
        UnaryExpression: ["argument"],
        UpdateExpression: ["argument"],
        VariableDeclaration: ["declarations"],
        VariableDeclarator: ["id", "init"],
        WhileStatement: ["test", "body"],
        WithStatement: ["object", "body"],
        YieldExpression: ["argument"]
      };
      BREAK = {};
      SKIP = {};
      REMOVE = {};
      VisitorOption = {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
      };
      function Reference3(parent, key) {
        this.parent = parent;
        this.key = key;
      }
      Reference3.prototype.replace = function replace2(node) {
        this.parent[this.key] = node;
      };
      Reference3.prototype.remove = function remove() {
        if (Array.isArray(this.parent)) {
          this.parent.splice(this.key, 1);
          return true;
        } else {
          this.replace(null);
          return false;
        }
      };
      function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
      }
      function Controller() {
      }
      Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;
        function addToPath(result2, path2) {
          if (Array.isArray(path2)) {
            for (j = 0, jz = path2.length; j < jz; ++j) {
              result2.push(path2[j]);
            }
          } else {
            result2.push(path2);
          }
        }
        if (!this.__current.path) {
          return null;
        }
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
          element = this.__leavelist[i];
          addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
      };
      Controller.prototype.type = function() {
        var node = this.current();
        return node.type || this.__current.wrap;
      };
      Controller.prototype.parents = function parents() {
        var i, iz, result;
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
          result.push(this.__leavelist[i].node);
        }
        return result;
      };
      Controller.prototype.current = function current() {
        return this.__current.node;
      };
      Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;
        result = void 0;
        previous = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
          result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;
        return result;
      };
      Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
      };
      Controller.prototype.skip = function() {
        this.notify(SKIP);
      };
      Controller.prototype["break"] = function() {
        this.notify(BREAK);
      };
      Controller.prototype.remove = function() {
        this.notify(REMOVE);
      };
      Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
        this.__fallback = null;
        if (visitor.fallback === "iteration") {
          this.__fallback = Object.keys;
        } else if (typeof visitor.fallback === "function") {
          this.__fallback = visitor.fallback;
        }
        this.__keys = VisitorKeys;
        if (visitor.keys) {
          this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
        }
      };
      function isNode(node) {
        if (node == null) {
          return false;
        }
        return typeof node === "object" && typeof node.type === "string";
      }
      function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === "properties";
      }
      Controller.prototype.traverse = function traverse2(root, visitor) {
        var worklist, leavelist, element, node, nodeType, ret, key, current, current2, candidates, candidate, sentinel;
        this.__initialize(root, visitor);
        sentinel = {};
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));
        while (worklist.length) {
          element = worklist.pop();
          if (element === sentinel) {
            element = leavelist.pop();
            ret = this.__execute(visitor.leave, element);
            if (this.__state === BREAK || ret === BREAK) {
              return;
            }
            continue;
          }
          if (element.node) {
            ret = this.__execute(visitor.enter, element);
            if (this.__state === BREAK || ret === BREAK) {
              return;
            }
            worklist.push(sentinel);
            leavelist.push(element);
            if (this.__state === SKIP || ret === SKIP) {
              continue;
            }
            node = element.node;
            nodeType = node.type || element.wrap;
            candidates = this.__keys[nodeType];
            if (!candidates) {
              if (this.__fallback) {
                candidates = this.__fallback(node);
              } else {
                throw new Error("Unknown node type " + nodeType + ".");
              }
            }
            current = candidates.length;
            while ((current -= 1) >= 0) {
              key = candidates[current];
              candidate = node[key];
              if (!candidate) {
                continue;
              }
              if (Array.isArray(candidate)) {
                current2 = candidate.length;
                while ((current2 -= 1) >= 0) {
                  if (!candidate[current2]) {
                    continue;
                  }
                  if (isProperty(nodeType, candidates[current])) {
                    element = new Element(candidate[current2], [key, current2], "Property", null);
                  } else if (isNode(candidate[current2])) {
                    element = new Element(candidate[current2], [key, current2], null, null);
                  } else {
                    continue;
                  }
                  worklist.push(element);
                }
              } else if (isNode(candidate)) {
                worklist.push(new Element(candidate, key, null, null));
              }
            }
          }
        }
      };
      Controller.prototype.replace = function replace2(root, visitor) {
        var worklist, leavelist, node, nodeType, target, element, current, current2, candidates, candidate, sentinel, outer, key;
        function removeElem(element2) {
          var i, key2, nextElem, parent;
          if (element2.ref.remove()) {
            key2 = element2.ref.key;
            parent = element2.ref.parent;
            i = worklist.length;
            while (i--) {
              nextElem = worklist[i];
              if (nextElem.ref && nextElem.ref.parent === parent) {
                if (nextElem.ref.key < key2) {
                  break;
                }
                --nextElem.ref.key;
              }
            }
          }
        }
        this.__initialize(root, visitor);
        sentinel = {};
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        outer = {
          root
        };
        element = new Element(root, null, null, new Reference3(outer, "root"));
        worklist.push(element);
        leavelist.push(element);
        while (worklist.length) {
          element = worklist.pop();
          if (element === sentinel) {
            element = leavelist.pop();
            target = this.__execute(visitor.leave, element);
            if (target !== void 0 && target !== BREAK && target !== SKIP && target !== REMOVE) {
              element.ref.replace(target);
            }
            if (this.__state === REMOVE || target === REMOVE) {
              removeElem(element);
            }
            if (this.__state === BREAK || target === BREAK) {
              return outer.root;
            }
            continue;
          }
          target = this.__execute(visitor.enter, element);
          if (target !== void 0 && target !== BREAK && target !== SKIP && target !== REMOVE) {
            element.ref.replace(target);
            element.node = target;
          }
          if (this.__state === REMOVE || target === REMOVE) {
            removeElem(element);
            element.node = null;
          }
          if (this.__state === BREAK || target === BREAK) {
            return outer.root;
          }
          node = element.node;
          if (!node) {
            continue;
          }
          worklist.push(sentinel);
          leavelist.push(element);
          if (this.__state === SKIP || target === SKIP) {
            continue;
          }
          nodeType = node.type || element.wrap;
          candidates = this.__keys[nodeType];
          if (!candidates) {
            if (this.__fallback) {
              candidates = this.__fallback(node);
            } else {
              throw new Error("Unknown node type " + nodeType + ".");
            }
          }
          current = candidates.length;
          while ((current -= 1) >= 0) {
            key = candidates[current];
            candidate = node[key];
            if (!candidate) {
              continue;
            }
            if (Array.isArray(candidate)) {
              current2 = candidate.length;
              while ((current2 -= 1) >= 0) {
                if (!candidate[current2]) {
                  continue;
                }
                if (isProperty(nodeType, candidates[current])) {
                  element = new Element(candidate[current2], [key, current2], "Property", new Reference3(candidate, current2));
                } else if (isNode(candidate[current2])) {
                  element = new Element(candidate[current2], [key, current2], null, new Reference3(candidate, current2));
                } else {
                  continue;
                }
                worklist.push(element);
              }
            } else if (isNode(candidate)) {
              worklist.push(new Element(candidate, key, null, new Reference3(node, key)));
            }
          }
        }
        return outer.root;
      };
      function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
      }
      function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
      }
      function extendCommentRange(comment, tokens) {
        var target;
        target = upperBound(tokens, function search(token) {
          return token.range[0] > comment.range[0];
        });
        comment.extendedRange = [comment.range[0], comment.range[1]];
        if (target !== tokens.length) {
          comment.extendedRange[1] = tokens[target].range[0];
        }
        target -= 1;
        if (target >= 0) {
          comment.extendedRange[0] = tokens[target].range[1];
        }
        return comment;
      }
      function attachComments(tree, providedComments, tokens) {
        var comments = [], comment, len, i, cursor;
        if (!tree.range) {
          throw new Error("attachComments needs range information");
        }
        if (!tokens.length) {
          if (providedComments.length) {
            for (i = 0, len = providedComments.length; i < len; i += 1) {
              comment = deepCopy(providedComments[i]);
              comment.extendedRange = [0, tree.range[0]];
              comments.push(comment);
            }
            tree.leadingComments = comments;
          }
          return tree;
        }
        for (i = 0, len = providedComments.length; i < len; i += 1) {
          comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }
        cursor = 0;
        traverse(tree, {
          enter: function(node) {
            var comment2;
            while (cursor < comments.length) {
              comment2 = comments[cursor];
              if (comment2.extendedRange[1] > node.range[0]) {
                break;
              }
              if (comment2.extendedRange[1] === node.range[0]) {
                if (!node.leadingComments) {
                  node.leadingComments = [];
                }
                node.leadingComments.push(comment2);
                comments.splice(cursor, 1);
              } else {
                cursor += 1;
              }
            }
            if (cursor === comments.length) {
              return VisitorOption.Break;
            }
            if (comments[cursor].extendedRange[0] > node.range[1]) {
              return VisitorOption.Skip;
            }
          }
        });
        cursor = 0;
        traverse(tree, {
          leave: function(node) {
            var comment2;
            while (cursor < comments.length) {
              comment2 = comments[cursor];
              if (node.range[1] < comment2.extendedRange[0]) {
                break;
              }
              if (node.range[1] === comment2.extendedRange[0]) {
                if (!node.trailingComments) {
                  node.trailingComments = [];
                }
                node.trailingComments.push(comment2);
                comments.splice(cursor, 1);
              } else {
                cursor += 1;
              }
            }
            if (cursor === comments.length) {
              return VisitorOption.Break;
            }
            if (comments[cursor].extendedRange[0] > node.range[1]) {
              return VisitorOption.Skip;
            }
          }
        });
        return tree;
      }
      exports2.version = require_package().version;
      exports2.Syntax = Syntax;
      exports2.traverse = traverse;
      exports2.replace = replace;
      exports2.attachComments = attachComments;
      exports2.VisitorKeys = VisitorKeys;
      exports2.VisitorOption = VisitorOption;
      exports2.Controller = Controller;
      exports2.cloneEnvironment = function() {
        return clone({});
      };
      return exports2;
    })(exports);
  }
});

// node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/is-implemented.js
var require_is_implemented10 = __commonJS({
  "node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      var map, iterator, result;
      if (typeof Map !== "function")
        return false;
      try {
        map = /* @__PURE__ */ new Map([["raz", "one"], ["dwa", "two"], ["trzy", "three"]]);
      } catch (e) {
        return false;
      }
      if (String(map) !== "[object Map]")
        return false;
      if (map.size !== 3)
        return false;
      if (typeof map.clear !== "function")
        return false;
      if (typeof map.delete !== "function")
        return false;
      if (typeof map.entries !== "function")
        return false;
      if (typeof map.forEach !== "function")
        return false;
      if (typeof map.get !== "function")
        return false;
      if (typeof map.has !== "function")
        return false;
      if (typeof map.keys !== "function")
        return false;
      if (typeof map.set !== "function")
        return false;
      if (typeof map.values !== "function")
        return false;
      iterator = map.entries();
      result = iterator.next();
      if (result.done !== false)
        return false;
      if (!result.value)
        return false;
      if (result.value[0] !== "raz")
        return false;
      if (result.value[1] !== "one")
        return false;
      return true;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/is-nan/is-implemented.js
var require_is_implemented11 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/is-nan/is-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      var numberIsNaN = Number.isNaN;
      if (typeof numberIsNaN !== "function")
        return false;
      return !numberIsNaN({}) && numberIsNaN(NaN) && !numberIsNaN(34);
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/is-nan/shim.js
var require_shim7 = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/is-nan/shim.js"(exports, module) {
    "use strict";
    module.exports = function(value) {
      return value !== value;
    };
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/is-nan/index.js
var require_is_nan = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/number/is-nan/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented11()() ? Number.isNaN : require_shim7();
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/#/e-index-of.js
var require_e_index_of = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/array/#/e-index-of.js"(exports, module) {
    "use strict";
    var numberIsNaN = require_is_nan();
    var toPosInt = require_to_pos_integer();
    var value = require_valid_value();
    var indexOf2 = Array.prototype.indexOf;
    var objHasOwnProperty = Object.prototype.hasOwnProperty;
    var abs = Math.abs;
    var floor = Math.floor;
    module.exports = function(searchElement) {
      var i, length, fromIndex, val;
      if (!numberIsNaN(searchElement))
        return indexOf2.apply(this, arguments);
      length = toPosInt(value(this).length);
      fromIndex = arguments[1];
      if (isNaN(fromIndex))
        fromIndex = 0;
      else if (fromIndex >= 0)
        fromIndex = floor(fromIndex);
      else
        fromIndex = toPosInt(this.length) - floor(abs(fromIndex));
      for (i = fromIndex; i < length; ++i) {
        if (objHasOwnProperty.call(this, i)) {
          val = this[i];
          if (numberIsNaN(val))
            return i;
        }
      }
      return -1;
    };
  }
});

// node_modules/.pnpm/event-emitter@0.3.5/node_modules/event-emitter/index.js
var require_event_emitter = __commonJS({
  "node_modules/.pnpm/event-emitter@0.3.5/node_modules/event-emitter/index.js"(exports, module) {
    "use strict";
    var d = require_d();
    var callable = require_valid_callable();
    var apply = Function.prototype.apply;
    var call = Function.prototype.call;
    var create = Object.create;
    var defineProperty = Object.defineProperty;
    var defineProperties = Object.defineProperties;
    var hasOwnProperty3 = Object.prototype.hasOwnProperty;
    var descriptor = { configurable: true, enumerable: false, writable: true };
    var on;
    var once;
    var off;
    var emit;
    var methods;
    var descriptors;
    var base;
    on = function(type, listener) {
      var data;
      callable(listener);
      if (!hasOwnProperty3.call(this, "__ee__")) {
        data = descriptor.value = create(null);
        defineProperty(this, "__ee__", descriptor);
        descriptor.value = null;
      } else {
        data = this.__ee__;
      }
      if (!data[type])
        data[type] = listener;
      else if (typeof data[type] === "object")
        data[type].push(listener);
      else
        data[type] = [data[type], listener];
      return this;
    };
    once = function(type, listener) {
      var once2, self2;
      callable(listener);
      self2 = this;
      on.call(this, type, once2 = function() {
        off.call(self2, type, once2);
        apply.call(listener, this, arguments);
      });
      once2.__eeOnceListener__ = listener;
      return this;
    };
    off = function(type, listener) {
      var data, listeners, candidate, i;
      callable(listener);
      if (!hasOwnProperty3.call(this, "__ee__"))
        return this;
      data = this.__ee__;
      if (!data[type])
        return this;
      listeners = data[type];
      if (typeof listeners === "object") {
        for (i = 0; candidate = listeners[i]; ++i) {
          if (candidate === listener || candidate.__eeOnceListener__ === listener) {
            if (listeners.length === 2)
              data[type] = listeners[i ? 0 : 1];
            else
              listeners.splice(i, 1);
          }
        }
      } else {
        if (listeners === listener || listeners.__eeOnceListener__ === listener) {
          delete data[type];
        }
      }
      return this;
    };
    emit = function(type) {
      var i, l, listener, listeners, args;
      if (!hasOwnProperty3.call(this, "__ee__"))
        return;
      listeners = this.__ee__[type];
      if (!listeners)
        return;
      if (typeof listeners === "object") {
        l = arguments.length;
        args = new Array(l - 1);
        for (i = 1; i < l; ++i)
          args[i - 1] = arguments[i];
        listeners = listeners.slice();
        for (i = 0; listener = listeners[i]; ++i) {
          apply.call(listener, this, args);
        }
      } else {
        switch (arguments.length) {
          case 1:
            call.call(listeners, this);
            break;
          case 2:
            call.call(listeners, this, arguments[1]);
            break;
          case 3:
            call.call(listeners, this, arguments[1], arguments[2]);
            break;
          default:
            l = arguments.length;
            args = new Array(l - 1);
            for (i = 1; i < l; ++i) {
              args[i - 1] = arguments[i];
            }
            apply.call(listeners, this, args);
        }
      }
    };
    methods = {
      on,
      once,
      off,
      emit
    };
    descriptors = {
      on: d(on),
      once: d(once),
      off: d(off),
      emit: d(emit)
    };
    base = defineProperties({}, descriptors);
    module.exports = exports = function(o) {
      return o == null ? create(base) : defineProperties(Object(o), descriptors);
    };
    exports.methods = methods;
  }
});

// node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/primitive-set.js
var require_primitive_set = __commonJS({
  "node_modules/.pnpm/es5-ext@0.10.61/node_modules/es5-ext/object/primitive-set.js"(exports, module) {
    "use strict";
    var forEach = Array.prototype.forEach;
    var create = Object.create;
    module.exports = function(arg) {
      var set = create(null);
      forEach.call(arguments, function(name) {
        set[name] = true;
      });
      return set;
    };
  }
});

// node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/lib/iterator-kinds.js
var require_iterator_kinds = __commonJS({
  "node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/lib/iterator-kinds.js"(exports, module) {
    "use strict";
    module.exports = require_primitive_set()("key", "value", "key+value");
  }
});

// node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/lib/iterator.js
var require_iterator = __commonJS({
  "node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/lib/iterator.js"(exports, module) {
    "use strict";
    var setPrototypeOf = require_set_prototype_of();
    var d = require_d();
    var Iterator = require_es6_iterator();
    var toStringTagSymbol = require_es6_symbol().toStringTag;
    var kinds = require_iterator_kinds();
    var defineProperties = Object.defineProperties;
    var unBind = Iterator.prototype._unBind;
    var MapIterator;
    MapIterator = module.exports = function(map, kind) {
      if (!(this instanceof MapIterator))
        return new MapIterator(map, kind);
      Iterator.call(this, map.__mapKeysData__, map);
      if (!kind || !kinds[kind])
        kind = "key+value";
      defineProperties(this, {
        __kind__: d("", kind),
        __values__: d("w", map.__mapValuesData__)
      });
    };
    if (setPrototypeOf)
      setPrototypeOf(MapIterator, Iterator);
    MapIterator.prototype = Object.create(Iterator.prototype, {
      constructor: d(MapIterator),
      _resolve: d(function(i) {
        if (this.__kind__ === "value")
          return this.__values__[i];
        if (this.__kind__ === "key")
          return this.__list__[i];
        return [this.__list__[i], this.__values__[i]];
      }),
      _unBind: d(function() {
        this.__values__ = null;
        unBind.call(this);
      }),
      toString: d(function() {
        return "[object Map Iterator]";
      })
    });
    Object.defineProperty(MapIterator.prototype, toStringTagSymbol, d("c", "Map Iterator"));
  }
});

// node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/is-native-implemented.js
var require_is_native_implemented2 = __commonJS({
  "node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/is-native-implemented.js"(exports, module) {
    "use strict";
    module.exports = function() {
      if (typeof Map === "undefined")
        return false;
      return Object.prototype.toString.call(/* @__PURE__ */ new Map()) === "[object Map]";
    }();
  }
});

// node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/polyfill.js
var require_polyfill3 = __commonJS({
  "node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/polyfill.js"(exports, module) {
    "use strict";
    var clear = require_clear();
    var eIndexOf = require_e_index_of();
    var setPrototypeOf = require_set_prototype_of();
    var callable = require_valid_callable();
    var validValue = require_valid_value();
    var d = require_d();
    var ee = require_event_emitter();
    var Symbol2 = require_es6_symbol();
    var iterator = require_valid_iterable();
    var forOf = require_for_of();
    var Iterator = require_iterator();
    var isNative = require_is_native_implemented2();
    var call = Function.prototype.call;
    var defineProperties = Object.defineProperties;
    var getPrototypeOf = Object.getPrototypeOf;
    var MapPoly;
    module.exports = MapPoly = function() {
      var iterable = arguments[0], keys, values, self2;
      if (!(this instanceof MapPoly))
        throw new TypeError("Constructor requires 'new'");
      if (isNative && setPrototypeOf && Map !== MapPoly) {
        self2 = setPrototypeOf(/* @__PURE__ */ new Map(), getPrototypeOf(this));
      } else {
        self2 = this;
      }
      if (iterable != null)
        iterator(iterable);
      defineProperties(self2, {
        __mapKeysData__: d("c", keys = []),
        __mapValuesData__: d("c", values = [])
      });
      if (!iterable)
        return self2;
      forOf(iterable, function(value) {
        var key = validValue(value)[0];
        value = value[1];
        if (eIndexOf.call(keys, key) !== -1)
          return;
        keys.push(key);
        values.push(value);
      }, self2);
      return self2;
    };
    if (isNative) {
      if (setPrototypeOf)
        setPrototypeOf(MapPoly, Map);
      MapPoly.prototype = Object.create(Map.prototype, {
        constructor: d(MapPoly)
      });
    }
    ee(defineProperties(MapPoly.prototype, {
      clear: d(function() {
        if (!this.__mapKeysData__.length)
          return;
        clear.call(this.__mapKeysData__);
        clear.call(this.__mapValuesData__);
        this.emit("_clear");
      }),
      delete: d(function(key) {
        var index = eIndexOf.call(this.__mapKeysData__, key);
        if (index === -1)
          return false;
        this.__mapKeysData__.splice(index, 1);
        this.__mapValuesData__.splice(index, 1);
        this.emit("_delete", index, key);
        return true;
      }),
      entries: d(function() {
        return new Iterator(this, "key+value");
      }),
      forEach: d(function(cb) {
        var thisArg = arguments[1], iterator2, result;
        callable(cb);
        iterator2 = this.entries();
        result = iterator2._next();
        while (result !== void 0) {
          call.call(cb, thisArg, this.__mapValuesData__[result], this.__mapKeysData__[result], this);
          result = iterator2._next();
        }
      }),
      get: d(function(key) {
        var index = eIndexOf.call(this.__mapKeysData__, key);
        if (index === -1)
          return;
        return this.__mapValuesData__[index];
      }),
      has: d(function(key) {
        return eIndexOf.call(this.__mapKeysData__, key) !== -1;
      }),
      keys: d(function() {
        return new Iterator(this, "key");
      }),
      set: d(function(key, value) {
        var index = eIndexOf.call(this.__mapKeysData__, key), emit;
        if (index === -1) {
          index = this.__mapKeysData__.push(key) - 1;
          emit = true;
        }
        this.__mapValuesData__[index] = value;
        if (emit)
          this.emit("_add", index, key);
        return this;
      }),
      size: d.gs(function() {
        return this.__mapKeysData__.length;
      }),
      values: d(function() {
        return new Iterator(this, "value");
      }),
      toString: d(function() {
        return "[object Map]";
      })
    }));
    Object.defineProperty(MapPoly.prototype, Symbol2.iterator, d(function() {
      return this.entries();
    }));
    Object.defineProperty(MapPoly.prototype, Symbol2.toStringTag, d("c", "Map"));
  }
});

// node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/index.js
var require_es6_map = __commonJS({
  "node_modules/.pnpm/es6-map@0.1.5/node_modules/es6-map/index.js"(exports, module) {
    "use strict";
    module.exports = require_is_implemented10()() ? Map : require_polyfill3();
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/reference.js
var require_reference = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/reference.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var READ = 1;
    var WRITE = 2;
    var RW = READ | WRITE;
    var Reference3 = function() {
      function Reference4(ident, scope, flag, writeExpr, maybeImplicitGlobal, partial, init2) {
        _classCallCheck(this, Reference4);
        this.identifier = ident;
        this.from = scope;
        this.tainted = false;
        this.resolved = null;
        this.flag = flag;
        if (this.isWrite()) {
          this.writeExpr = writeExpr;
          this.partial = partial;
          this.init = init2;
        }
        this.__maybeImplicitGlobal = maybeImplicitGlobal;
      }
      _createClass(Reference4, [{
        key: "isStatic",
        value: function isStatic() {
          return !this.tainted && this.resolved && this.resolved.scope.isStatic();
        }
      }, {
        key: "isWrite",
        value: function isWrite() {
          return !!(this.flag & Reference4.WRITE);
        }
      }, {
        key: "isRead",
        value: function isRead() {
          return !!(this.flag & Reference4.READ);
        }
      }, {
        key: "isReadOnly",
        value: function isReadOnly() {
          return this.flag === Reference4.READ;
        }
      }, {
        key: "isWriteOnly",
        value: function isWriteOnly() {
          return this.flag === Reference4.WRITE;
        }
      }, {
        key: "isReadWrite",
        value: function isReadWrite() {
          return this.flag === Reference4.RW;
        }
      }]);
      return Reference4;
    }();
    exports.default = Reference3;
    Reference3.READ = READ;
    Reference3.WRITE = WRITE;
    Reference3.RW = RW;
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/variable.js
var require_variable = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/variable.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Variable3 = function Variable4(name, scope) {
      _classCallCheck(this, Variable4);
      this.name = name;
      this.identifiers = [];
      this.references = [];
      this.defs = [];
      this.tainted = false;
      this.stack = true;
      this.scope = scope;
    };
    exports.default = Variable3;
    Variable3.CatchClause = "CatchClause";
    Variable3.Parameter = "Parameter";
    Variable3.FunctionName = "FunctionName";
    Variable3.ClassName = "ClassName";
    Variable3.Variable = "Variable";
    Variable3.ImportBinding = "ImportBinding";
    Variable3.TDZ = "TDZ";
    Variable3.ImplicitGlobalVariable = "ImplicitGlobalVariable";
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/definition.js
var require_definition = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/definition.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Definition = exports.ParameterDefinition = void 0;
    var _variable = require_variable();
    var _variable2 = _interopRequireDefault(_variable);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Definition = function Definition2(type, name, node, parent, index, kind) {
      _classCallCheck(this, Definition2);
      this.type = type;
      this.name = name;
      this.node = node;
      this.parent = parent;
      this.index = index;
      this.kind = kind;
    };
    exports.default = Definition;
    var ParameterDefinition = function(_Definition) {
      _inherits(ParameterDefinition2, _Definition);
      function ParameterDefinition2(name, node, index, rest) {
        _classCallCheck(this, ParameterDefinition2);
        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParameterDefinition2).call(this, _variable2.default.Parameter, name, node, null, index, null));
        _this.rest = rest;
        return _this;
      }
      return ParameterDefinition2;
    }(Definition);
    exports.ParameterDefinition = ParameterDefinition;
    exports.Definition = Definition;
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/scope.js
var require_scope = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/scope.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ClassScope = exports.ForScope = exports.FunctionScope = exports.SwitchScope = exports.BlockScope = exports.TDZScope = exports.WithScope = exports.CatchScope = exports.FunctionExpressionNameScope = exports.ModuleScope = exports.GlobalScope = void 0;
    var _get = function get(object, property, receiver) {
      if (object === null)
        object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
      if (desc === void 0) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return void 0;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === void 0) {
          return void 0;
        }
        return getter.call(receiver);
      }
    };
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _estraverse = require_estraverse();
    var _es6Map = require_es6_map();
    var _es6Map2 = _interopRequireDefault(_es6Map);
    var _reference = require_reference();
    var _reference2 = _interopRequireDefault(_reference);
    var _variable = require_variable();
    var _variable2 = _interopRequireDefault(_variable);
    var _definition = require_definition();
    var _definition2 = _interopRequireDefault(_definition);
    var _assert = require_assert();
    var _assert2 = _interopRequireDefault(_assert);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function isStrictScope(scope, block, isMethodDefinition, useDirective) {
      var body, i, iz, stmt, expr;
      if (scope.upper && scope.upper.isStrict) {
        return true;
      }
      if (block.type === _estraverse.Syntax.ArrowFunctionExpression) {
        return true;
      }
      if (isMethodDefinition) {
        return true;
      }
      if (scope.type === "class" || scope.type === "module") {
        return true;
      }
      if (scope.type === "block" || scope.type === "switch") {
        return false;
      }
      if (scope.type === "function") {
        if (block.type === _estraverse.Syntax.Program) {
          body = block;
        } else {
          body = block.body;
        }
      } else if (scope.type === "global") {
        body = block;
      } else {
        return false;
      }
      if (useDirective) {
        for (i = 0, iz = body.body.length; i < iz; ++i) {
          stmt = body.body[i];
          if (stmt.type !== _estraverse.Syntax.DirectiveStatement) {
            break;
          }
          if (stmt.raw === '"use strict"' || stmt.raw === "'use strict'") {
            return true;
          }
        }
      } else {
        for (i = 0, iz = body.body.length; i < iz; ++i) {
          stmt = body.body[i];
          if (stmt.type !== _estraverse.Syntax.ExpressionStatement) {
            break;
          }
          expr = stmt.expression;
          if (expr.type !== _estraverse.Syntax.Literal || typeof expr.value !== "string") {
            break;
          }
          if (expr.raw != null) {
            if (expr.raw === '"use strict"' || expr.raw === "'use strict'") {
              return true;
            }
          } else {
            if (expr.value === "use strict") {
              return true;
            }
          }
        }
      }
      return false;
    }
    function registerScope(scopeManager, scope) {
      var scopes;
      scopeManager.scopes.push(scope);
      scopes = scopeManager.__nodeToScope.get(scope.block);
      if (scopes) {
        scopes.push(scope);
      } else {
        scopeManager.__nodeToScope.set(scope.block, [scope]);
      }
    }
    function shouldBeStatically(def) {
      return def.type === _variable2.default.ClassName || def.type === _variable2.default.Variable && def.parent.kind !== "var";
    }
    var Scope3 = function() {
      function Scope4(scopeManager, type, upperScope, block, isMethodDefinition) {
        _classCallCheck(this, Scope4);
        this.type = type;
        this.set = new _es6Map2.default();
        this.taints = new _es6Map2.default();
        this.dynamic = this.type === "global" || this.type === "with";
        this.block = block;
        this.through = [];
        this.variables = [];
        this.references = [];
        this.variableScope = this.type === "global" || this.type === "function" || this.type === "module" ? this : upperScope.variableScope;
        this.functionExpressionScope = false;
        this.directCallToEvalScope = false;
        this.thisFound = false;
        this.__left = [];
        this.upper = upperScope;
        this.isStrict = isStrictScope(this, block, isMethodDefinition, scopeManager.__useDirective());
        this.childScopes = [];
        if (this.upper) {
          this.upper.childScopes.push(this);
        }
        this.__declaredVariables = scopeManager.__declaredVariables;
        registerScope(scopeManager, this);
      }
      _createClass(Scope4, [{
        key: "__shouldStaticallyClose",
        value: function __shouldStaticallyClose(scopeManager) {
          return !this.dynamic || scopeManager.__isOptimistic();
        }
      }, {
        key: "__shouldStaticallyCloseForGlobal",
        value: function __shouldStaticallyCloseForGlobal(ref) {
          var name = ref.identifier.name;
          if (!this.set.has(name)) {
            return false;
          }
          var variable = this.set.get(name);
          var defs = variable.defs;
          return defs.length > 0 && defs.every(shouldBeStatically);
        }
      }, {
        key: "__staticCloseRef",
        value: function __staticCloseRef(ref) {
          if (!this.__resolve(ref)) {
            this.__delegateToUpperScope(ref);
          }
        }
      }, {
        key: "__dynamicCloseRef",
        value: function __dynamicCloseRef(ref) {
          var current = this;
          do {
            current.through.push(ref);
            current = current.upper;
          } while (current);
        }
      }, {
        key: "__globalCloseRef",
        value: function __globalCloseRef(ref) {
          if (this.__shouldStaticallyCloseForGlobal(ref)) {
            this.__staticCloseRef(ref);
          } else {
            this.__dynamicCloseRef(ref);
          }
        }
      }, {
        key: "__close",
        value: function __close(scopeManager) {
          var closeRef;
          if (this.__shouldStaticallyClose(scopeManager)) {
            closeRef = this.__staticCloseRef;
          } else if (this.type !== "global") {
            closeRef = this.__dynamicCloseRef;
          } else {
            closeRef = this.__globalCloseRef;
          }
          for (var i = 0, iz = this.__left.length; i < iz; ++i) {
            var ref = this.__left[i];
            closeRef.call(this, ref);
          }
          this.__left = null;
          return this.upper;
        }
      }, {
        key: "__resolve",
        value: function __resolve(ref) {
          var variable, name;
          name = ref.identifier.name;
          if (this.set.has(name)) {
            variable = this.set.get(name);
            variable.references.push(ref);
            variable.stack = variable.stack && ref.from.variableScope === this.variableScope;
            if (ref.tainted) {
              variable.tainted = true;
              this.taints.set(variable.name, true);
            }
            ref.resolved = variable;
            return true;
          }
          return false;
        }
      }, {
        key: "__delegateToUpperScope",
        value: function __delegateToUpperScope(ref) {
          if (this.upper) {
            this.upper.__left.push(ref);
          }
          this.through.push(ref);
        }
      }, {
        key: "__addDeclaredVariablesOfNode",
        value: function __addDeclaredVariablesOfNode(variable, node) {
          if (node == null) {
            return;
          }
          var variables = this.__declaredVariables.get(node);
          if (variables == null) {
            variables = [];
            this.__declaredVariables.set(node, variables);
          }
          if (variables.indexOf(variable) === -1) {
            variables.push(variable);
          }
        }
      }, {
        key: "__defineGeneric",
        value: function __defineGeneric(name, set, variables, node, def) {
          var variable;
          variable = set.get(name);
          if (!variable) {
            variable = new _variable2.default(name, this);
            set.set(name, variable);
            variables.push(variable);
          }
          if (def) {
            variable.defs.push(def);
            if (def.type !== _variable2.default.TDZ) {
              this.__addDeclaredVariablesOfNode(variable, def.node);
              this.__addDeclaredVariablesOfNode(variable, def.parent);
            }
          }
          if (node) {
            variable.identifiers.push(node);
          }
        }
      }, {
        key: "__define",
        value: function __define(node, def) {
          if (node && node.type === _estraverse.Syntax.Identifier) {
            this.__defineGeneric(node.name, this.set, this.variables, node, def);
          }
        }
      }, {
        key: "__referencing",
        value: function __referencing(node, assign, writeExpr, maybeImplicitGlobal, partial, init2) {
          if (!node || node.type !== _estraverse.Syntax.Identifier) {
            return;
          }
          if (node.name === "super") {
            return;
          }
          var ref = new _reference2.default(node, this, assign || _reference2.default.READ, writeExpr, maybeImplicitGlobal, !!partial, !!init2);
          this.references.push(ref);
          this.__left.push(ref);
        }
      }, {
        key: "__detectEval",
        value: function __detectEval() {
          var current;
          current = this;
          this.directCallToEvalScope = true;
          do {
            current.dynamic = true;
            current = current.upper;
          } while (current);
        }
      }, {
        key: "__detectThis",
        value: function __detectThis() {
          this.thisFound = true;
        }
      }, {
        key: "__isClosed",
        value: function __isClosed() {
          return this.__left === null;
        }
      }, {
        key: "resolve",
        value: function resolve(ident) {
          var ref, i, iz;
          (0, _assert2.default)(this.__isClosed(), "Scope should be closed.");
          (0, _assert2.default)(ident.type === _estraverse.Syntax.Identifier, "Target should be identifier.");
          for (i = 0, iz = this.references.length; i < iz; ++i) {
            ref = this.references[i];
            if (ref.identifier === ident) {
              return ref;
            }
          }
          return null;
        }
      }, {
        key: "isStatic",
        value: function isStatic() {
          return !this.dynamic;
        }
      }, {
        key: "isArgumentsMaterialized",
        value: function isArgumentsMaterialized() {
          return true;
        }
      }, {
        key: "isThisMaterialized",
        value: function isThisMaterialized() {
          return true;
        }
      }, {
        key: "isUsedName",
        value: function isUsedName(name) {
          if (this.set.has(name)) {
            return true;
          }
          for (var i = 0, iz = this.through.length; i < iz; ++i) {
            if (this.through[i].identifier.name === name) {
              return true;
            }
          }
          return false;
        }
      }]);
      return Scope4;
    }();
    exports.default = Scope3;
    var GlobalScope = exports.GlobalScope = function(_Scope) {
      _inherits(GlobalScope2, _Scope);
      function GlobalScope2(scopeManager, block) {
        _classCallCheck(this, GlobalScope2);
        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GlobalScope2).call(this, scopeManager, "global", null, block, false));
        _this.implicit = {
          set: new _es6Map2.default(),
          variables: [],
          left: []
        };
        return _this;
      }
      _createClass(GlobalScope2, [{
        key: "__close",
        value: function __close(scopeManager) {
          var implicit = [];
          for (var i = 0, iz = this.__left.length; i < iz; ++i) {
            var ref = this.__left[i];
            if (ref.__maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
              implicit.push(ref.__maybeImplicitGlobal);
            }
          }
          for (var _i = 0, _iz = implicit.length; _i < _iz; ++_i) {
            var info = implicit[_i];
            this.__defineImplicit(info.pattern, new _definition2.default(_variable2.default.ImplicitGlobalVariable, info.pattern, info.node, null, null, null));
          }
          this.implicit.left = this.__left;
          return _get(Object.getPrototypeOf(GlobalScope2.prototype), "__close", this).call(this, scopeManager);
        }
      }, {
        key: "__defineImplicit",
        value: function __defineImplicit(node, def) {
          if (node && node.type === _estraverse.Syntax.Identifier) {
            this.__defineGeneric(node.name, this.implicit.set, this.implicit.variables, node, def);
          }
        }
      }]);
      return GlobalScope2;
    }(Scope3);
    var ModuleScope = exports.ModuleScope = function(_Scope2) {
      _inherits(ModuleScope2, _Scope2);
      function ModuleScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, ModuleScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(ModuleScope2).call(this, scopeManager, "module", upperScope, block, false));
      }
      return ModuleScope2;
    }(Scope3);
    var FunctionExpressionNameScope = exports.FunctionExpressionNameScope = function(_Scope3) {
      _inherits(FunctionExpressionNameScope2, _Scope3);
      function FunctionExpressionNameScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, FunctionExpressionNameScope2);
        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionExpressionNameScope2).call(this, scopeManager, "function-expression-name", upperScope, block, false));
        _this3.__define(block.id, new _definition2.default(_variable2.default.FunctionName, block.id, block, null, null, null));
        _this3.functionExpressionScope = true;
        return _this3;
      }
      return FunctionExpressionNameScope2;
    }(Scope3);
    var CatchScope = exports.CatchScope = function(_Scope4) {
      _inherits(CatchScope2, _Scope4);
      function CatchScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, CatchScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(CatchScope2).call(this, scopeManager, "catch", upperScope, block, false));
      }
      return CatchScope2;
    }(Scope3);
    var WithScope = exports.WithScope = function(_Scope5) {
      _inherits(WithScope2, _Scope5);
      function WithScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, WithScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(WithScope2).call(this, scopeManager, "with", upperScope, block, false));
      }
      _createClass(WithScope2, [{
        key: "__close",
        value: function __close(scopeManager) {
          if (this.__shouldStaticallyClose(scopeManager)) {
            return _get(Object.getPrototypeOf(WithScope2.prototype), "__close", this).call(this, scopeManager);
          }
          for (var i = 0, iz = this.__left.length; i < iz; ++i) {
            var ref = this.__left[i];
            ref.tainted = true;
            this.__delegateToUpperScope(ref);
          }
          this.__left = null;
          return this.upper;
        }
      }]);
      return WithScope2;
    }(Scope3);
    var TDZScope = exports.TDZScope = function(_Scope6) {
      _inherits(TDZScope2, _Scope6);
      function TDZScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, TDZScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(TDZScope2).call(this, scopeManager, "TDZ", upperScope, block, false));
      }
      return TDZScope2;
    }(Scope3);
    var BlockScope = exports.BlockScope = function(_Scope7) {
      _inherits(BlockScope2, _Scope7);
      function BlockScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, BlockScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(BlockScope2).call(this, scopeManager, "block", upperScope, block, false));
      }
      return BlockScope2;
    }(Scope3);
    var SwitchScope = exports.SwitchScope = function(_Scope8) {
      _inherits(SwitchScope2, _Scope8);
      function SwitchScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, SwitchScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(SwitchScope2).call(this, scopeManager, "switch", upperScope, block, false));
      }
      return SwitchScope2;
    }(Scope3);
    var FunctionScope = exports.FunctionScope = function(_Scope9) {
      _inherits(FunctionScope2, _Scope9);
      function FunctionScope2(scopeManager, upperScope, block, isMethodDefinition) {
        _classCallCheck(this, FunctionScope2);
        var _this9 = _possibleConstructorReturn(this, Object.getPrototypeOf(FunctionScope2).call(this, scopeManager, "function", upperScope, block, isMethodDefinition));
        if (_this9.block.type !== _estraverse.Syntax.ArrowFunctionExpression) {
          _this9.__defineArguments();
        }
        return _this9;
      }
      _createClass(FunctionScope2, [{
        key: "isArgumentsMaterialized",
        value: function isArgumentsMaterialized() {
          if (this.block.type === _estraverse.Syntax.ArrowFunctionExpression) {
            return false;
          }
          if (!this.isStatic()) {
            return true;
          }
          var variable = this.set.get("arguments");
          (0, _assert2.default)(variable, "Always have arguments variable.");
          return variable.tainted || variable.references.length !== 0;
        }
      }, {
        key: "isThisMaterialized",
        value: function isThisMaterialized() {
          if (!this.isStatic()) {
            return true;
          }
          return this.thisFound;
        }
      }, {
        key: "__defineArguments",
        value: function __defineArguments() {
          this.__defineGeneric("arguments", this.set, this.variables, null, null);
          this.taints.set("arguments", true);
        }
      }]);
      return FunctionScope2;
    }(Scope3);
    var ForScope = exports.ForScope = function(_Scope10) {
      _inherits(ForScope2, _Scope10);
      function ForScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, ForScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(ForScope2).call(this, scopeManager, "for", upperScope, block, false));
      }
      return ForScope2;
    }(Scope3);
    var ClassScope = exports.ClassScope = function(_Scope11) {
      _inherits(ClassScope2, _Scope11);
      function ClassScope2(scopeManager, upperScope, block) {
        _classCallCheck(this, ClassScope2);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(ClassScope2).call(this, scopeManager, "class", upperScope, block, false));
      }
      return ClassScope2;
    }(Scope3);
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/scope-manager.js
var require_scope_manager = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/scope-manager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _es6WeakMap = require_es6_weak_map();
    var _es6WeakMap2 = _interopRequireDefault(_es6WeakMap);
    var _scope = require_scope();
    var _scope2 = _interopRequireDefault(_scope);
    var _assert = require_assert();
    var _assert2 = _interopRequireDefault(_assert);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var ScopeManager3 = function() {
      function ScopeManager4(options) {
        _classCallCheck(this, ScopeManager4);
        this.scopes = [];
        this.globalScope = null;
        this.__nodeToScope = new _es6WeakMap2.default();
        this.__currentScope = null;
        this.__options = options;
        this.__declaredVariables = new _es6WeakMap2.default();
      }
      _createClass(ScopeManager4, [{
        key: "__useDirective",
        value: function __useDirective() {
          return this.__options.directive;
        }
      }, {
        key: "__isOptimistic",
        value: function __isOptimistic() {
          return this.__options.optimistic;
        }
      }, {
        key: "__ignoreEval",
        value: function __ignoreEval() {
          return this.__options.ignoreEval;
        }
      }, {
        key: "__isNodejsScope",
        value: function __isNodejsScope() {
          return this.__options.nodejsScope;
        }
      }, {
        key: "isModule",
        value: function isModule() {
          return this.__options.sourceType === "module";
        }
      }, {
        key: "isImpliedStrict",
        value: function isImpliedStrict() {
          return this.__options.impliedStrict;
        }
      }, {
        key: "isStrictModeSupported",
        value: function isStrictModeSupported() {
          return this.__options.ecmaVersion >= 5;
        }
      }, {
        key: "__get",
        value: function __get(node) {
          return this.__nodeToScope.get(node);
        }
      }, {
        key: "getDeclaredVariables",
        value: function getDeclaredVariables(node) {
          return this.__declaredVariables.get(node) || [];
        }
      }, {
        key: "acquire",
        value: function acquire(node, inner) {
          var scopes, scope, i, iz;
          function predicate(scope2) {
            if (scope2.type === "function" && scope2.functionExpressionScope) {
              return false;
            }
            if (scope2.type === "TDZ") {
              return false;
            }
            return true;
          }
          scopes = this.__get(node);
          if (!scopes || scopes.length === 0) {
            return null;
          }
          if (scopes.length === 1) {
            return scopes[0];
          }
          if (inner) {
            for (i = scopes.length - 1; i >= 0; --i) {
              scope = scopes[i];
              if (predicate(scope)) {
                return scope;
              }
            }
          } else {
            for (i = 0, iz = scopes.length; i < iz; ++i) {
              scope = scopes[i];
              if (predicate(scope)) {
                return scope;
              }
            }
          }
          return null;
        }
      }, {
        key: "acquireAll",
        value: function acquireAll(node) {
          return this.__get(node);
        }
      }, {
        key: "release",
        value: function release(node, inner) {
          var scopes, scope;
          scopes = this.__get(node);
          if (scopes && scopes.length) {
            scope = scopes[0].upper;
            if (!scope) {
              return null;
            }
            return this.acquire(scope.block, inner);
          }
          return null;
        }
      }, {
        key: "attach",
        value: function attach() {
        }
      }, {
        key: "detach",
        value: function detach() {
        }
      }, {
        key: "__nestScope",
        value: function __nestScope(scope) {
          if (scope instanceof _scope.GlobalScope) {
            (0, _assert2.default)(this.__currentScope === null);
            this.globalScope = scope;
          }
          this.__currentScope = scope;
          return scope;
        }
      }, {
        key: "__nestGlobalScope",
        value: function __nestGlobalScope(node) {
          return this.__nestScope(new _scope.GlobalScope(this, node));
        }
      }, {
        key: "__nestBlockScope",
        value: function __nestBlockScope(node, isMethodDefinition) {
          return this.__nestScope(new _scope.BlockScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestFunctionScope",
        value: function __nestFunctionScope(node, isMethodDefinition) {
          return this.__nestScope(new _scope.FunctionScope(this, this.__currentScope, node, isMethodDefinition));
        }
      }, {
        key: "__nestForScope",
        value: function __nestForScope(node) {
          return this.__nestScope(new _scope.ForScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestCatchScope",
        value: function __nestCatchScope(node) {
          return this.__nestScope(new _scope.CatchScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestWithScope",
        value: function __nestWithScope(node) {
          return this.__nestScope(new _scope.WithScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestClassScope",
        value: function __nestClassScope(node) {
          return this.__nestScope(new _scope.ClassScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestSwitchScope",
        value: function __nestSwitchScope(node) {
          return this.__nestScope(new _scope.SwitchScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestModuleScope",
        value: function __nestModuleScope(node) {
          return this.__nestScope(new _scope.ModuleScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestTDZScope",
        value: function __nestTDZScope(node) {
          return this.__nestScope(new _scope.TDZScope(this, this.__currentScope, node));
        }
      }, {
        key: "__nestFunctionExpressionNameScope",
        value: function __nestFunctionExpressionNameScope(node) {
          return this.__nestScope(new _scope.FunctionExpressionNameScope(this, this.__currentScope, node));
        }
      }, {
        key: "__isES6",
        value: function __isES6() {
          return this.__options.ecmaVersion >= 6;
        }
      }]);
      return ScopeManager4;
    }();
    exports.default = ScopeManager3;
  }
});

// node_modules/.pnpm/estraverse@5.3.0/node_modules/estraverse/estraverse.js
var require_estraverse2 = __commonJS({
  "node_modules/.pnpm/estraverse@5.3.0/node_modules/estraverse/estraverse.js"(exports) {
    (function clone(exports2) {
      "use strict";
      var Syntax, VisitorOption, VisitorKeys, BREAK, SKIP, REMOVE;
      function deepCopy(obj) {
        var ret = {}, key, val;
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            val = obj[key];
            if (typeof val === "object" && val !== null) {
              ret[key] = deepCopy(val);
            } else {
              ret[key] = val;
            }
          }
        }
        return ret;
      }
      function upperBound(array, func) {
        var diff, len, i, current;
        len = array.length;
        i = 0;
        while (len) {
          diff = len >>> 1;
          current = i + diff;
          if (func(array[current])) {
            len = diff;
          } else {
            i = current + 1;
            len -= diff + 1;
          }
        }
        return i;
      }
      Syntax = {
        AssignmentExpression: "AssignmentExpression",
        AssignmentPattern: "AssignmentPattern",
        ArrayExpression: "ArrayExpression",
        ArrayPattern: "ArrayPattern",
        ArrowFunctionExpression: "ArrowFunctionExpression",
        AwaitExpression: "AwaitExpression",
        BlockStatement: "BlockStatement",
        BinaryExpression: "BinaryExpression",
        BreakStatement: "BreakStatement",
        CallExpression: "CallExpression",
        CatchClause: "CatchClause",
        ChainExpression: "ChainExpression",
        ClassBody: "ClassBody",
        ClassDeclaration: "ClassDeclaration",
        ClassExpression: "ClassExpression",
        ComprehensionBlock: "ComprehensionBlock",
        ComprehensionExpression: "ComprehensionExpression",
        ConditionalExpression: "ConditionalExpression",
        ContinueStatement: "ContinueStatement",
        DebuggerStatement: "DebuggerStatement",
        DirectiveStatement: "DirectiveStatement",
        DoWhileStatement: "DoWhileStatement",
        EmptyStatement: "EmptyStatement",
        ExportAllDeclaration: "ExportAllDeclaration",
        ExportDefaultDeclaration: "ExportDefaultDeclaration",
        ExportNamedDeclaration: "ExportNamedDeclaration",
        ExportSpecifier: "ExportSpecifier",
        ExpressionStatement: "ExpressionStatement",
        ForStatement: "ForStatement",
        ForInStatement: "ForInStatement",
        ForOfStatement: "ForOfStatement",
        FunctionDeclaration: "FunctionDeclaration",
        FunctionExpression: "FunctionExpression",
        GeneratorExpression: "GeneratorExpression",
        Identifier: "Identifier",
        IfStatement: "IfStatement",
        ImportExpression: "ImportExpression",
        ImportDeclaration: "ImportDeclaration",
        ImportDefaultSpecifier: "ImportDefaultSpecifier",
        ImportNamespaceSpecifier: "ImportNamespaceSpecifier",
        ImportSpecifier: "ImportSpecifier",
        Literal: "Literal",
        LabeledStatement: "LabeledStatement",
        LogicalExpression: "LogicalExpression",
        MemberExpression: "MemberExpression",
        MetaProperty: "MetaProperty",
        MethodDefinition: "MethodDefinition",
        ModuleSpecifier: "ModuleSpecifier",
        NewExpression: "NewExpression",
        ObjectExpression: "ObjectExpression",
        ObjectPattern: "ObjectPattern",
        PrivateIdentifier: "PrivateIdentifier",
        Program: "Program",
        Property: "Property",
        PropertyDefinition: "PropertyDefinition",
        RestElement: "RestElement",
        ReturnStatement: "ReturnStatement",
        SequenceExpression: "SequenceExpression",
        SpreadElement: "SpreadElement",
        Super: "Super",
        SwitchStatement: "SwitchStatement",
        SwitchCase: "SwitchCase",
        TaggedTemplateExpression: "TaggedTemplateExpression",
        TemplateElement: "TemplateElement",
        TemplateLiteral: "TemplateLiteral",
        ThisExpression: "ThisExpression",
        ThrowStatement: "ThrowStatement",
        TryStatement: "TryStatement",
        UnaryExpression: "UnaryExpression",
        UpdateExpression: "UpdateExpression",
        VariableDeclaration: "VariableDeclaration",
        VariableDeclarator: "VariableDeclarator",
        WhileStatement: "WhileStatement",
        WithStatement: "WithStatement",
        YieldExpression: "YieldExpression"
      };
      VisitorKeys = {
        AssignmentExpression: ["left", "right"],
        AssignmentPattern: ["left", "right"],
        ArrayExpression: ["elements"],
        ArrayPattern: ["elements"],
        ArrowFunctionExpression: ["params", "body"],
        AwaitExpression: ["argument"],
        BlockStatement: ["body"],
        BinaryExpression: ["left", "right"],
        BreakStatement: ["label"],
        CallExpression: ["callee", "arguments"],
        CatchClause: ["param", "body"],
        ChainExpression: ["expression"],
        ClassBody: ["body"],
        ClassDeclaration: ["id", "superClass", "body"],
        ClassExpression: ["id", "superClass", "body"],
        ComprehensionBlock: ["left", "right"],
        ComprehensionExpression: ["blocks", "filter", "body"],
        ConditionalExpression: ["test", "consequent", "alternate"],
        ContinueStatement: ["label"],
        DebuggerStatement: [],
        DirectiveStatement: [],
        DoWhileStatement: ["body", "test"],
        EmptyStatement: [],
        ExportAllDeclaration: ["source"],
        ExportDefaultDeclaration: ["declaration"],
        ExportNamedDeclaration: ["declaration", "specifiers", "source"],
        ExportSpecifier: ["exported", "local"],
        ExpressionStatement: ["expression"],
        ForStatement: ["init", "test", "update", "body"],
        ForInStatement: ["left", "right", "body"],
        ForOfStatement: ["left", "right", "body"],
        FunctionDeclaration: ["id", "params", "body"],
        FunctionExpression: ["id", "params", "body"],
        GeneratorExpression: ["blocks", "filter", "body"],
        Identifier: [],
        IfStatement: ["test", "consequent", "alternate"],
        ImportExpression: ["source"],
        ImportDeclaration: ["specifiers", "source"],
        ImportDefaultSpecifier: ["local"],
        ImportNamespaceSpecifier: ["local"],
        ImportSpecifier: ["imported", "local"],
        Literal: [],
        LabeledStatement: ["label", "body"],
        LogicalExpression: ["left", "right"],
        MemberExpression: ["object", "property"],
        MetaProperty: ["meta", "property"],
        MethodDefinition: ["key", "value"],
        ModuleSpecifier: [],
        NewExpression: ["callee", "arguments"],
        ObjectExpression: ["properties"],
        ObjectPattern: ["properties"],
        PrivateIdentifier: [],
        Program: ["body"],
        Property: ["key", "value"],
        PropertyDefinition: ["key", "value"],
        RestElement: ["argument"],
        ReturnStatement: ["argument"],
        SequenceExpression: ["expressions"],
        SpreadElement: ["argument"],
        Super: [],
        SwitchStatement: ["discriminant", "cases"],
        SwitchCase: ["test", "consequent"],
        TaggedTemplateExpression: ["tag", "quasi"],
        TemplateElement: [],
        TemplateLiteral: ["quasis", "expressions"],
        ThisExpression: [],
        ThrowStatement: ["argument"],
        TryStatement: ["block", "handler", "finalizer"],
        UnaryExpression: ["argument"],
        UpdateExpression: ["argument"],
        VariableDeclaration: ["declarations"],
        VariableDeclarator: ["id", "init"],
        WhileStatement: ["test", "body"],
        WithStatement: ["object", "body"],
        YieldExpression: ["argument"]
      };
      BREAK = {};
      SKIP = {};
      REMOVE = {};
      VisitorOption = {
        Break: BREAK,
        Skip: SKIP,
        Remove: REMOVE
      };
      function Reference3(parent, key) {
        this.parent = parent;
        this.key = key;
      }
      Reference3.prototype.replace = function replace2(node) {
        this.parent[this.key] = node;
      };
      Reference3.prototype.remove = function remove() {
        if (Array.isArray(this.parent)) {
          this.parent.splice(this.key, 1);
          return true;
        } else {
          this.replace(null);
          return false;
        }
      };
      function Element(node, path, wrap, ref) {
        this.node = node;
        this.path = path;
        this.wrap = wrap;
        this.ref = ref;
      }
      function Controller() {
      }
      Controller.prototype.path = function path() {
        var i, iz, j, jz, result, element;
        function addToPath(result2, path2) {
          if (Array.isArray(path2)) {
            for (j = 0, jz = path2.length; j < jz; ++j) {
              result2.push(path2[j]);
            }
          } else {
            result2.push(path2);
          }
        }
        if (!this.__current.path) {
          return null;
        }
        result = [];
        for (i = 2, iz = this.__leavelist.length; i < iz; ++i) {
          element = this.__leavelist[i];
          addToPath(result, element.path);
        }
        addToPath(result, this.__current.path);
        return result;
      };
      Controller.prototype.type = function() {
        var node = this.current();
        return node.type || this.__current.wrap;
      };
      Controller.prototype.parents = function parents() {
        var i, iz, result;
        result = [];
        for (i = 1, iz = this.__leavelist.length; i < iz; ++i) {
          result.push(this.__leavelist[i].node);
        }
        return result;
      };
      Controller.prototype.current = function current() {
        return this.__current.node;
      };
      Controller.prototype.__execute = function __execute(callback, element) {
        var previous, result;
        result = void 0;
        previous = this.__current;
        this.__current = element;
        this.__state = null;
        if (callback) {
          result = callback.call(this, element.node, this.__leavelist[this.__leavelist.length - 1].node);
        }
        this.__current = previous;
        return result;
      };
      Controller.prototype.notify = function notify(flag) {
        this.__state = flag;
      };
      Controller.prototype.skip = function() {
        this.notify(SKIP);
      };
      Controller.prototype["break"] = function() {
        this.notify(BREAK);
      };
      Controller.prototype.remove = function() {
        this.notify(REMOVE);
      };
      Controller.prototype.__initialize = function(root, visitor) {
        this.visitor = visitor;
        this.root = root;
        this.__worklist = [];
        this.__leavelist = [];
        this.__current = null;
        this.__state = null;
        this.__fallback = null;
        if (visitor.fallback === "iteration") {
          this.__fallback = Object.keys;
        } else if (typeof visitor.fallback === "function") {
          this.__fallback = visitor.fallback;
        }
        this.__keys = VisitorKeys;
        if (visitor.keys) {
          this.__keys = Object.assign(Object.create(this.__keys), visitor.keys);
        }
      };
      function isNode(node) {
        if (node == null) {
          return false;
        }
        return typeof node === "object" && typeof node.type === "string";
      }
      function isProperty(nodeType, key) {
        return (nodeType === Syntax.ObjectExpression || nodeType === Syntax.ObjectPattern) && key === "properties";
      }
      function candidateExistsInLeaveList(leavelist, candidate) {
        for (var i = leavelist.length - 1; i >= 0; --i) {
          if (leavelist[i].node === candidate) {
            return true;
          }
        }
        return false;
      }
      Controller.prototype.traverse = function traverse2(root, visitor) {
        var worklist, leavelist, element, node, nodeType, ret, key, current, current2, candidates, candidate, sentinel;
        this.__initialize(root, visitor);
        sentinel = {};
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        worklist.push(new Element(root, null, null, null));
        leavelist.push(new Element(null, null, null, null));
        while (worklist.length) {
          element = worklist.pop();
          if (element === sentinel) {
            element = leavelist.pop();
            ret = this.__execute(visitor.leave, element);
            if (this.__state === BREAK || ret === BREAK) {
              return;
            }
            continue;
          }
          if (element.node) {
            ret = this.__execute(visitor.enter, element);
            if (this.__state === BREAK || ret === BREAK) {
              return;
            }
            worklist.push(sentinel);
            leavelist.push(element);
            if (this.__state === SKIP || ret === SKIP) {
              continue;
            }
            node = element.node;
            nodeType = node.type || element.wrap;
            candidates = this.__keys[nodeType];
            if (!candidates) {
              if (this.__fallback) {
                candidates = this.__fallback(node);
              } else {
                throw new Error("Unknown node type " + nodeType + ".");
              }
            }
            current = candidates.length;
            while ((current -= 1) >= 0) {
              key = candidates[current];
              candidate = node[key];
              if (!candidate) {
                continue;
              }
              if (Array.isArray(candidate)) {
                current2 = candidate.length;
                while ((current2 -= 1) >= 0) {
                  if (!candidate[current2]) {
                    continue;
                  }
                  if (candidateExistsInLeaveList(leavelist, candidate[current2])) {
                    continue;
                  }
                  if (isProperty(nodeType, candidates[current])) {
                    element = new Element(candidate[current2], [key, current2], "Property", null);
                  } else if (isNode(candidate[current2])) {
                    element = new Element(candidate[current2], [key, current2], null, null);
                  } else {
                    continue;
                  }
                  worklist.push(element);
                }
              } else if (isNode(candidate)) {
                if (candidateExistsInLeaveList(leavelist, candidate)) {
                  continue;
                }
                worklist.push(new Element(candidate, key, null, null));
              }
            }
          }
        }
      };
      Controller.prototype.replace = function replace2(root, visitor) {
        var worklist, leavelist, node, nodeType, target, element, current, current2, candidates, candidate, sentinel, outer, key;
        function removeElem(element2) {
          var i, key2, nextElem, parent;
          if (element2.ref.remove()) {
            key2 = element2.ref.key;
            parent = element2.ref.parent;
            i = worklist.length;
            while (i--) {
              nextElem = worklist[i];
              if (nextElem.ref && nextElem.ref.parent === parent) {
                if (nextElem.ref.key < key2) {
                  break;
                }
                --nextElem.ref.key;
              }
            }
          }
        }
        this.__initialize(root, visitor);
        sentinel = {};
        worklist = this.__worklist;
        leavelist = this.__leavelist;
        outer = {
          root
        };
        element = new Element(root, null, null, new Reference3(outer, "root"));
        worklist.push(element);
        leavelist.push(element);
        while (worklist.length) {
          element = worklist.pop();
          if (element === sentinel) {
            element = leavelist.pop();
            target = this.__execute(visitor.leave, element);
            if (target !== void 0 && target !== BREAK && target !== SKIP && target !== REMOVE) {
              element.ref.replace(target);
            }
            if (this.__state === REMOVE || target === REMOVE) {
              removeElem(element);
            }
            if (this.__state === BREAK || target === BREAK) {
              return outer.root;
            }
            continue;
          }
          target = this.__execute(visitor.enter, element);
          if (target !== void 0 && target !== BREAK && target !== SKIP && target !== REMOVE) {
            element.ref.replace(target);
            element.node = target;
          }
          if (this.__state === REMOVE || target === REMOVE) {
            removeElem(element);
            element.node = null;
          }
          if (this.__state === BREAK || target === BREAK) {
            return outer.root;
          }
          node = element.node;
          if (!node) {
            continue;
          }
          worklist.push(sentinel);
          leavelist.push(element);
          if (this.__state === SKIP || target === SKIP) {
            continue;
          }
          nodeType = node.type || element.wrap;
          candidates = this.__keys[nodeType];
          if (!candidates) {
            if (this.__fallback) {
              candidates = this.__fallback(node);
            } else {
              throw new Error("Unknown node type " + nodeType + ".");
            }
          }
          current = candidates.length;
          while ((current -= 1) >= 0) {
            key = candidates[current];
            candidate = node[key];
            if (!candidate) {
              continue;
            }
            if (Array.isArray(candidate)) {
              current2 = candidate.length;
              while ((current2 -= 1) >= 0) {
                if (!candidate[current2]) {
                  continue;
                }
                if (isProperty(nodeType, candidates[current])) {
                  element = new Element(candidate[current2], [key, current2], "Property", new Reference3(candidate, current2));
                } else if (isNode(candidate[current2])) {
                  element = new Element(candidate[current2], [key, current2], null, new Reference3(candidate, current2));
                } else {
                  continue;
                }
                worklist.push(element);
              }
            } else if (isNode(candidate)) {
              worklist.push(new Element(candidate, key, null, new Reference3(node, key)));
            }
          }
        }
        return outer.root;
      };
      function traverse(root, visitor) {
        var controller = new Controller();
        return controller.traverse(root, visitor);
      }
      function replace(root, visitor) {
        var controller = new Controller();
        return controller.replace(root, visitor);
      }
      function extendCommentRange(comment, tokens) {
        var target;
        target = upperBound(tokens, function search(token) {
          return token.range[0] > comment.range[0];
        });
        comment.extendedRange = [comment.range[0], comment.range[1]];
        if (target !== tokens.length) {
          comment.extendedRange[1] = tokens[target].range[0];
        }
        target -= 1;
        if (target >= 0) {
          comment.extendedRange[0] = tokens[target].range[1];
        }
        return comment;
      }
      function attachComments(tree, providedComments, tokens) {
        var comments = [], comment, len, i, cursor;
        if (!tree.range) {
          throw new Error("attachComments needs range information");
        }
        if (!tokens.length) {
          if (providedComments.length) {
            for (i = 0, len = providedComments.length; i < len; i += 1) {
              comment = deepCopy(providedComments[i]);
              comment.extendedRange = [0, tree.range[0]];
              comments.push(comment);
            }
            tree.leadingComments = comments;
          }
          return tree;
        }
        for (i = 0, len = providedComments.length; i < len; i += 1) {
          comments.push(extendCommentRange(deepCopy(providedComments[i]), tokens));
        }
        cursor = 0;
        traverse(tree, {
          enter: function(node) {
            var comment2;
            while (cursor < comments.length) {
              comment2 = comments[cursor];
              if (comment2.extendedRange[1] > node.range[0]) {
                break;
              }
              if (comment2.extendedRange[1] === node.range[0]) {
                if (!node.leadingComments) {
                  node.leadingComments = [];
                }
                node.leadingComments.push(comment2);
                comments.splice(cursor, 1);
              } else {
                cursor += 1;
              }
            }
            if (cursor === comments.length) {
              return VisitorOption.Break;
            }
            if (comments[cursor].extendedRange[0] > node.range[1]) {
              return VisitorOption.Skip;
            }
          }
        });
        cursor = 0;
        traverse(tree, {
          leave: function(node) {
            var comment2;
            while (cursor < comments.length) {
              comment2 = comments[cursor];
              if (node.range[1] < comment2.extendedRange[0]) {
                break;
              }
              if (node.range[1] === comment2.extendedRange[0]) {
                if (!node.trailingComments) {
                  node.trailingComments = [];
                }
                node.trailingComments.push(comment2);
                comments.splice(cursor, 1);
              } else {
                cursor += 1;
              }
            }
            if (cursor === comments.length) {
              return VisitorOption.Break;
            }
            if (comments[cursor].extendedRange[0] > node.range[1]) {
              return VisitorOption.Skip;
            }
          }
        });
        return tree;
      }
      exports2.Syntax = Syntax;
      exports2.traverse = traverse;
      exports2.replace = replace;
      exports2.attachComments = attachComments;
      exports2.VisitorKeys = VisitorKeys;
      exports2.VisitorOption = VisitorOption;
      exports2.Controller = Controller;
      exports2.cloneEnvironment = function() {
        return clone({});
      };
      return exports2;
    })(exports);
  }
});

// node_modules/.pnpm/esrecurse@4.3.0/node_modules/esrecurse/package.json
var require_package2 = __commonJS({
  "node_modules/.pnpm/esrecurse@4.3.0/node_modules/esrecurse/package.json"(exports, module) {
    module.exports = {
      name: "esrecurse",
      description: "ECMAScript AST recursive visitor",
      homepage: "https://github.com/estools/esrecurse",
      main: "esrecurse.js",
      version: "4.3.0",
      engines: {
        node: ">=4.0"
      },
      maintainers: [
        {
          name: "Yusuke Suzuki",
          email: "utatane.tea@gmail.com",
          web: "https://github.com/Constellation"
        }
      ],
      repository: {
        type: "git",
        url: "https://github.com/estools/esrecurse.git"
      },
      dependencies: {
        estraverse: "^5.2.0"
      },
      devDependencies: {
        "babel-cli": "^6.24.1",
        "babel-eslint": "^7.2.3",
        "babel-preset-es2015": "^6.24.1",
        "babel-register": "^6.24.1",
        chai: "^4.0.2",
        esprima: "^4.0.0",
        gulp: "^3.9.0",
        "gulp-bump": "^2.7.0",
        "gulp-eslint": "^4.0.0",
        "gulp-filter": "^5.0.0",
        "gulp-git": "^2.4.1",
        "gulp-mocha": "^4.3.1",
        "gulp-tag-version": "^1.2.1",
        jsdoc: "^3.3.0-alpha10",
        minimist: "^1.1.0"
      },
      license: "BSD-2-Clause",
      scripts: {
        test: "gulp travis",
        "unit-test": "gulp test",
        lint: "gulp lint"
      },
      babel: {
        presets: [
          "es2015"
        ]
      }
    };
  }
});

// node_modules/.pnpm/esrecurse@4.3.0/node_modules/esrecurse/esrecurse.js
var require_esrecurse = __commonJS({
  "node_modules/.pnpm/esrecurse@4.3.0/node_modules/esrecurse/esrecurse.js"(exports) {
    (function() {
      "use strict";
      var estraverse = require_estraverse2();
      function isNode(node) {
        if (node == null) {
          return false;
        }
        return typeof node === "object" && typeof node.type === "string";
      }
      function isProperty(nodeType, key) {
        return (nodeType === estraverse.Syntax.ObjectExpression || nodeType === estraverse.Syntax.ObjectPattern) && key === "properties";
      }
      function Visitor(visitor, options) {
        options = options || {};
        this.__visitor = visitor || this;
        this.__childVisitorKeys = options.childVisitorKeys ? Object.assign({}, estraverse.VisitorKeys, options.childVisitorKeys) : estraverse.VisitorKeys;
        if (options.fallback === "iteration") {
          this.__fallback = Object.keys;
        } else if (typeof options.fallback === "function") {
          this.__fallback = options.fallback;
        }
      }
      Visitor.prototype.visitChildren = function(node) {
        var type, children, i, iz, j, jz, child;
        if (node == null) {
          return;
        }
        type = node.type || estraverse.Syntax.Property;
        children = this.__childVisitorKeys[type];
        if (!children) {
          if (this.__fallback) {
            children = this.__fallback(node);
          } else {
            throw new Error("Unknown node type " + type + ".");
          }
        }
        for (i = 0, iz = children.length; i < iz; ++i) {
          child = node[children[i]];
          if (child) {
            if (Array.isArray(child)) {
              for (j = 0, jz = child.length; j < jz; ++j) {
                if (child[j]) {
                  if (isNode(child[j]) || isProperty(type, children[i])) {
                    this.visit(child[j]);
                  }
                }
              }
            } else if (isNode(child)) {
              this.visit(child);
            }
          }
        }
      };
      Visitor.prototype.visit = function(node) {
        var type;
        if (node == null) {
          return;
        }
        type = node.type || estraverse.Syntax.Property;
        if (this.__visitor[type]) {
          this.__visitor[type].call(this, node);
          return;
        }
        this.visitChildren(node);
      };
      exports.version = require_package2().version;
      exports.Visitor = Visitor;
      exports.visit = function(node, visitor, options) {
        var v = new Visitor(visitor, options);
        v.visit(node);
      };
    })();
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/pattern-visitor.js
var require_pattern_visitor = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/pattern-visitor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _estraverse = require_estraverse();
    var _esrecurse = require_esrecurse();
    var _esrecurse2 = _interopRequireDefault(_esrecurse);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    function getLast(xs) {
      return xs[xs.length - 1] || null;
    }
    var PatternVisitor = function(_esrecurse$Visitor) {
      _inherits(PatternVisitor2, _esrecurse$Visitor);
      _createClass(PatternVisitor2, null, [{
        key: "isPattern",
        value: function isPattern(node) {
          var nodeType = node.type;
          return nodeType === _estraverse.Syntax.Identifier || nodeType === _estraverse.Syntax.ObjectPattern || nodeType === _estraverse.Syntax.ArrayPattern || nodeType === _estraverse.Syntax.SpreadElement || nodeType === _estraverse.Syntax.RestElement || nodeType === _estraverse.Syntax.AssignmentPattern;
        }
      }]);
      function PatternVisitor2(options, rootPattern, callback) {
        _classCallCheck(this, PatternVisitor2);
        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PatternVisitor2).call(this, null, options));
        _this.rootPattern = rootPattern;
        _this.callback = callback;
        _this.assignments = [];
        _this.rightHandNodes = [];
        _this.restElements = [];
        return _this;
      }
      _createClass(PatternVisitor2, [{
        key: "Identifier",
        value: function Identifier(pattern) {
          var lastRestElement = getLast(this.restElements);
          this.callback(pattern, {
            topLevel: pattern === this.rootPattern,
            rest: lastRestElement != null && lastRestElement.argument === pattern,
            assignments: this.assignments
          });
        }
      }, {
        key: "Property",
        value: function Property(property) {
          if (property.computed) {
            this.rightHandNodes.push(property.key);
          }
          this.visit(property.value);
        }
      }, {
        key: "ArrayPattern",
        value: function ArrayPattern(pattern) {
          var i, iz, element;
          for (i = 0, iz = pattern.elements.length; i < iz; ++i) {
            element = pattern.elements[i];
            this.visit(element);
          }
        }
      }, {
        key: "AssignmentPattern",
        value: function AssignmentPattern(pattern) {
          this.assignments.push(pattern);
          this.visit(pattern.left);
          this.rightHandNodes.push(pattern.right);
          this.assignments.pop();
        }
      }, {
        key: "RestElement",
        value: function RestElement(pattern) {
          this.restElements.push(pattern);
          this.visit(pattern.argument);
          this.restElements.pop();
        }
      }, {
        key: "MemberExpression",
        value: function MemberExpression(node) {
          if (node.computed) {
            this.rightHandNodes.push(node.property);
          }
          this.rightHandNodes.push(node.object);
        }
      }, {
        key: "SpreadElement",
        value: function SpreadElement(node) {
          this.visit(node.argument);
        }
      }, {
        key: "ArrayExpression",
        value: function ArrayExpression(node) {
          node.elements.forEach(this.visit, this);
        }
      }, {
        key: "AssignmentExpression",
        value: function AssignmentExpression(node) {
          this.assignments.push(node);
          this.visit(node.left);
          this.rightHandNodes.push(node.right);
          this.assignments.pop();
        }
      }, {
        key: "CallExpression",
        value: function CallExpression(node) {
          var _this2 = this;
          node.arguments.forEach(function(a) {
            _this2.rightHandNodes.push(a);
          });
          this.visit(node.callee);
        }
      }]);
      return PatternVisitor2;
    }(_esrecurse2.default.Visitor);
    exports.default = PatternVisitor;
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/referencer.js
var require_referencer = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/referencer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps)
          defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    var _estraverse = require_estraverse();
    var _esrecurse = require_esrecurse();
    var _esrecurse2 = _interopRequireDefault(_esrecurse);
    var _reference = require_reference();
    var _reference2 = _interopRequireDefault(_reference);
    var _variable = require_variable();
    var _variable2 = _interopRequireDefault(_variable);
    var _patternVisitor = require_pattern_visitor();
    var _patternVisitor2 = _interopRequireDefault(_patternVisitor);
    var _definition = require_definition();
    var _assert = require_assert();
    var _assert2 = _interopRequireDefault(_assert);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self2, call) {
      if (!self2) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self2;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    function traverseIdentifierInPattern(options, rootPattern, referencer, callback) {
      var visitor = new _patternVisitor2.default(options, rootPattern, callback);
      visitor.visit(rootPattern);
      if (referencer != null) {
        visitor.rightHandNodes.forEach(referencer.visit, referencer);
      }
    }
    var Importer = function(_esrecurse$Visitor) {
      _inherits(Importer2, _esrecurse$Visitor);
      function Importer2(declaration, referencer) {
        _classCallCheck(this, Importer2);
        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Importer2).call(this, null, referencer.options));
        _this.declaration = declaration;
        _this.referencer = referencer;
        return _this;
      }
      _createClass(Importer2, [{
        key: "visitImport",
        value: function visitImport(id, specifier) {
          var _this2 = this;
          this.referencer.visitPattern(id, function(pattern) {
            _this2.referencer.currentScope().__define(pattern, new _definition.Definition(_variable2.default.ImportBinding, pattern, specifier, _this2.declaration, null, null));
          });
        }
      }, {
        key: "ImportNamespaceSpecifier",
        value: function ImportNamespaceSpecifier(node) {
          var local = node.local || node.id;
          if (local) {
            this.visitImport(local, node);
          }
        }
      }, {
        key: "ImportDefaultSpecifier",
        value: function ImportDefaultSpecifier(node) {
          var local = node.local || node.id;
          this.visitImport(local, node);
        }
      }, {
        key: "ImportSpecifier",
        value: function ImportSpecifier(node) {
          var local = node.local || node.id;
          if (node.name) {
            this.visitImport(node.name, node);
          } else {
            this.visitImport(local, node);
          }
        }
      }]);
      return Importer2;
    }(_esrecurse2.default.Visitor);
    var Referencer = function(_esrecurse$Visitor2) {
      _inherits(Referencer2, _esrecurse$Visitor2);
      function Referencer2(options, scopeManager) {
        _classCallCheck(this, Referencer2);
        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Referencer2).call(this, null, options));
        _this3.options = options;
        _this3.scopeManager = scopeManager;
        _this3.parent = null;
        _this3.isInnerMethodDefinition = false;
        return _this3;
      }
      _createClass(Referencer2, [{
        key: "currentScope",
        value: function currentScope() {
          return this.scopeManager.__currentScope;
        }
      }, {
        key: "close",
        value: function close(node) {
          while (this.currentScope() && node === this.currentScope().block) {
            this.scopeManager.__currentScope = this.currentScope().__close(this.scopeManager);
          }
        }
      }, {
        key: "pushInnerMethodDefinition",
        value: function pushInnerMethodDefinition(isInnerMethodDefinition) {
          var previous = this.isInnerMethodDefinition;
          this.isInnerMethodDefinition = isInnerMethodDefinition;
          return previous;
        }
      }, {
        key: "popInnerMethodDefinition",
        value: function popInnerMethodDefinition(isInnerMethodDefinition) {
          this.isInnerMethodDefinition = isInnerMethodDefinition;
        }
      }, {
        key: "materializeTDZScope",
        value: function materializeTDZScope(node, iterationNode) {
          this.scopeManager.__nestTDZScope(node, iterationNode);
          this.visitVariableDeclaration(this.currentScope(), _variable2.default.TDZ, iterationNode.left, 0, true);
        }
      }, {
        key: "materializeIterationScope",
        value: function materializeIterationScope(node) {
          var _this4 = this;
          var letOrConstDecl;
          this.scopeManager.__nestForScope(node);
          letOrConstDecl = node.left;
          this.visitVariableDeclaration(this.currentScope(), _variable2.default.Variable, letOrConstDecl, 0);
          this.visitPattern(letOrConstDecl.declarations[0].id, function(pattern) {
            _this4.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
          });
        }
      }, {
        key: "referencingDefaultValue",
        value: function referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init2) {
          var scope = this.currentScope();
          assignments.forEach(function(assignment) {
            scope.__referencing(pattern, _reference2.default.WRITE, assignment.right, maybeImplicitGlobal, pattern !== assignment.left, init2);
          });
        }
      }, {
        key: "visitPattern",
        value: function visitPattern(node, options, callback) {
          if (typeof options === "function") {
            callback = options;
            options = { processRightHandNodes: false };
          }
          traverseIdentifierInPattern(this.options, node, options.processRightHandNodes ? this : null, callback);
        }
      }, {
        key: "visitFunction",
        value: function visitFunction(node) {
          var _this5 = this;
          var i, iz;
          if (node.type === _estraverse.Syntax.FunctionDeclaration) {
            this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.FunctionName, node.id, node, null, null, null));
          }
          if (node.type === _estraverse.Syntax.FunctionExpression && node.id) {
            this.scopeManager.__nestFunctionExpressionNameScope(node);
          }
          this.scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);
          for (i = 0, iz = node.params.length; i < iz; ++i) {
            this.visitPattern(node.params[i], { processRightHandNodes: true }, function(pattern, info) {
              _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, i, info.rest));
              _this5.referencingDefaultValue(pattern, info.assignments, null, true);
            });
          }
          if (node.rest) {
            this.visitPattern({
              type: "RestElement",
              argument: node.rest
            }, function(pattern) {
              _this5.currentScope().__define(pattern, new _definition.ParameterDefinition(pattern, node, node.params.length, true));
            });
          }
          if (node.body.type === _estraverse.Syntax.BlockStatement) {
            this.visitChildren(node.body);
          } else {
            this.visit(node.body);
          }
          this.close(node);
        }
      }, {
        key: "visitClass",
        value: function visitClass(node) {
          if (node.type === _estraverse.Syntax.ClassDeclaration) {
            this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node, null, null, null));
          }
          this.visit(node.superClass);
          this.scopeManager.__nestClassScope(node);
          if (node.id) {
            this.currentScope().__define(node.id, new _definition.Definition(_variable2.default.ClassName, node.id, node));
          }
          this.visit(node.body);
          this.close(node);
        }
      }, {
        key: "visitProperty",
        value: function visitProperty(node) {
          var previous, isMethodDefinition;
          if (node.computed) {
            this.visit(node.key);
          }
          isMethodDefinition = node.type === _estraverse.Syntax.MethodDefinition;
          if (isMethodDefinition) {
            previous = this.pushInnerMethodDefinition(true);
          }
          this.visit(node.value);
          if (isMethodDefinition) {
            this.popInnerMethodDefinition(previous);
          }
        }
      }, {
        key: "visitForIn",
        value: function visitForIn(node) {
          var _this6 = this;
          if (node.left.type === _estraverse.Syntax.VariableDeclaration && node.left.kind !== "var") {
            this.materializeTDZScope(node.right, node);
            this.visit(node.right);
            this.close(node.right);
            this.materializeIterationScope(node);
            this.visit(node.body);
            this.close(node);
          } else {
            if (node.left.type === _estraverse.Syntax.VariableDeclaration) {
              this.visit(node.left);
              this.visitPattern(node.left.declarations[0].id, function(pattern) {
                _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, null, true, true);
              });
            } else {
              this.visitPattern(node.left, { processRightHandNodes: true }, function(pattern, info) {
                var maybeImplicitGlobal = null;
                if (!_this6.currentScope().isStrict) {
                  maybeImplicitGlobal = {
                    pattern,
                    node
                  };
                }
                _this6.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                _this6.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, true, false);
              });
            }
            this.visit(node.right);
            this.visit(node.body);
          }
        }
      }, {
        key: "visitVariableDeclaration",
        value: function visitVariableDeclaration(variableTargetScope, type, node, index, fromTDZ) {
          var _this7 = this;
          var decl, init2;
          decl = node.declarations[index];
          init2 = decl.init;
          this.visitPattern(decl.id, { processRightHandNodes: !fromTDZ }, function(pattern, info) {
            variableTargetScope.__define(pattern, new _definition.Definition(type, pattern, decl, node, index, node.kind));
            if (!fromTDZ) {
              _this7.referencingDefaultValue(pattern, info.assignments, null, true);
            }
            if (init2) {
              _this7.currentScope().__referencing(pattern, _reference2.default.WRITE, init2, null, !info.topLevel, true);
            }
          });
        }
      }, {
        key: "AssignmentExpression",
        value: function AssignmentExpression(node) {
          var _this8 = this;
          if (_patternVisitor2.default.isPattern(node.left)) {
            if (node.operator === "=") {
              this.visitPattern(node.left, { processRightHandNodes: true }, function(pattern, info) {
                var maybeImplicitGlobal = null;
                if (!_this8.currentScope().isStrict) {
                  maybeImplicitGlobal = {
                    pattern,
                    node
                  };
                }
                _this8.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                _this8.currentScope().__referencing(pattern, _reference2.default.WRITE, node.right, maybeImplicitGlobal, !info.topLevel, false);
              });
            } else {
              this.currentScope().__referencing(node.left, _reference2.default.RW, node.right);
            }
          } else {
            this.visit(node.left);
          }
          this.visit(node.right);
        }
      }, {
        key: "CatchClause",
        value: function CatchClause(node) {
          var _this9 = this;
          this.scopeManager.__nestCatchScope(node);
          this.visitPattern(node.param, { processRightHandNodes: true }, function(pattern, info) {
            _this9.currentScope().__define(pattern, new _definition.Definition(_variable2.default.CatchClause, node.param, node, null, null, null));
            _this9.referencingDefaultValue(pattern, info.assignments, null, true);
          });
          this.visit(node.body);
          this.close(node);
        }
      }, {
        key: "Program",
        value: function Program(node) {
          this.scopeManager.__nestGlobalScope(node);
          if (this.scopeManager.__isNodejsScope()) {
            this.currentScope().isStrict = false;
            this.scopeManager.__nestFunctionScope(node, false);
          }
          if (this.scopeManager.__isES6() && this.scopeManager.isModule()) {
            this.scopeManager.__nestModuleScope(node);
          }
          if (this.scopeManager.isStrictModeSupported() && this.scopeManager.isImpliedStrict()) {
            this.currentScope().isStrict = true;
          }
          this.visitChildren(node);
          this.close(node);
        }
      }, {
        key: "Identifier",
        value: function Identifier(node) {
          this.currentScope().__referencing(node);
        }
      }, {
        key: "UpdateExpression",
        value: function UpdateExpression(node) {
          if (_patternVisitor2.default.isPattern(node.argument)) {
            this.currentScope().__referencing(node.argument, _reference2.default.RW, null);
          } else {
            this.visitChildren(node);
          }
        }
      }, {
        key: "MemberExpression",
        value: function MemberExpression(node) {
          this.visit(node.object);
          if (node.computed) {
            this.visit(node.property);
          }
        }
      }, {
        key: "Property",
        value: function Property(node) {
          this.visitProperty(node);
        }
      }, {
        key: "MethodDefinition",
        value: function MethodDefinition(node) {
          this.visitProperty(node);
        }
      }, {
        key: "BreakStatement",
        value: function BreakStatement() {
        }
      }, {
        key: "ContinueStatement",
        value: function ContinueStatement() {
        }
      }, {
        key: "LabeledStatement",
        value: function LabeledStatement(node) {
          this.visit(node.body);
        }
      }, {
        key: "ForStatement",
        value: function ForStatement(node) {
          if (node.init && node.init.type === _estraverse.Syntax.VariableDeclaration && node.init.kind !== "var") {
            this.scopeManager.__nestForScope(node);
          }
          this.visitChildren(node);
          this.close(node);
        }
      }, {
        key: "ClassExpression",
        value: function ClassExpression(node) {
          this.visitClass(node);
        }
      }, {
        key: "ClassDeclaration",
        value: function ClassDeclaration(node) {
          this.visitClass(node);
        }
      }, {
        key: "CallExpression",
        value: function CallExpression(node) {
          if (!this.scopeManager.__ignoreEval() && node.callee.type === _estraverse.Syntax.Identifier && node.callee.name === "eval") {
            this.currentScope().variableScope.__detectEval();
          }
          this.visitChildren(node);
        }
      }, {
        key: "BlockStatement",
        value: function BlockStatement(node) {
          if (this.scopeManager.__isES6()) {
            this.scopeManager.__nestBlockScope(node);
          }
          this.visitChildren(node);
          this.close(node);
        }
      }, {
        key: "ThisExpression",
        value: function ThisExpression() {
          this.currentScope().variableScope.__detectThis();
        }
      }, {
        key: "WithStatement",
        value: function WithStatement(node) {
          this.visit(node.object);
          this.scopeManager.__nestWithScope(node);
          this.visit(node.body);
          this.close(node);
        }
      }, {
        key: "VariableDeclaration",
        value: function VariableDeclaration(node) {
          var variableTargetScope, i, iz, decl;
          variableTargetScope = node.kind === "var" ? this.currentScope().variableScope : this.currentScope();
          for (i = 0, iz = node.declarations.length; i < iz; ++i) {
            decl = node.declarations[i];
            this.visitVariableDeclaration(variableTargetScope, _variable2.default.Variable, node, i);
            if (decl.init) {
              this.visit(decl.init);
            }
          }
        }
      }, {
        key: "SwitchStatement",
        value: function SwitchStatement(node) {
          var i, iz;
          this.visit(node.discriminant);
          if (this.scopeManager.__isES6()) {
            this.scopeManager.__nestSwitchScope(node);
          }
          for (i = 0, iz = node.cases.length; i < iz; ++i) {
            this.visit(node.cases[i]);
          }
          this.close(node);
        }
      }, {
        key: "FunctionDeclaration",
        value: function FunctionDeclaration(node) {
          this.visitFunction(node);
        }
      }, {
        key: "FunctionExpression",
        value: function FunctionExpression(node) {
          this.visitFunction(node);
        }
      }, {
        key: "ForOfStatement",
        value: function ForOfStatement(node) {
          this.visitForIn(node);
        }
      }, {
        key: "ForInStatement",
        value: function ForInStatement(node) {
          this.visitForIn(node);
        }
      }, {
        key: "ArrowFunctionExpression",
        value: function ArrowFunctionExpression(node) {
          this.visitFunction(node);
        }
      }, {
        key: "ImportDeclaration",
        value: function ImportDeclaration(node) {
          var importer;
          (0, _assert2.default)(this.scopeManager.__isES6() && this.scopeManager.isModule(), "ImportDeclaration should appear when the mode is ES6 and in the module context.");
          importer = new Importer(node, this);
          importer.visit(node);
        }
      }, {
        key: "visitExportDeclaration",
        value: function visitExportDeclaration(node) {
          if (node.source) {
            return;
          }
          if (node.declaration) {
            this.visit(node.declaration);
            return;
          }
          this.visitChildren(node);
        }
      }, {
        key: "ExportDeclaration",
        value: function ExportDeclaration(node) {
          this.visitExportDeclaration(node);
        }
      }, {
        key: "ExportNamedDeclaration",
        value: function ExportNamedDeclaration(node) {
          this.visitExportDeclaration(node);
        }
      }, {
        key: "ExportSpecifier",
        value: function ExportSpecifier(node) {
          var local = node.id || node.local;
          this.visit(local);
        }
      }, {
        key: "MetaProperty",
        value: function MetaProperty() {
        }
      }]);
      return Referencer2;
    }(_esrecurse2.default.Visitor);
    exports.default = Referencer;
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/package.json
var require_package3 = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/package.json"(exports, module) {
    module.exports = {
      name: "escope",
      description: "ECMAScript scope analyzer",
      homepage: "http://github.com/estools/escope",
      main: "lib/index.js",
      version: "3.6.0",
      engines: {
        node: ">=0.4.0"
      },
      maintainers: [
        {
          name: "Yusuke Suzuki",
          email: "utatane.tea@gmail.com",
          web: "http://github.com/Constellation"
        }
      ],
      repository: {
        type: "git",
        url: "https://github.com/estools/escope.git"
      },
      dependencies: {
        "es6-map": "^0.1.3",
        "es6-weak-map": "^2.0.1",
        esrecurse: "^4.1.0",
        estraverse: "^4.1.1"
      },
      devDependencies: {
        babel: "^6.3.26",
        "babel-preset-es2015": "^6.3.13",
        "babel-register": "^6.3.13",
        browserify: "^13.0.0",
        chai: "^3.4.1",
        espree: "^3.1.1",
        esprima: "^2.7.1",
        gulp: "^3.9.0",
        "gulp-babel": "^6.1.1",
        "gulp-bump": "^1.0.0",
        "gulp-eslint": "^1.1.1",
        "gulp-espower": "^1.0.2",
        "gulp-filter": "^3.0.1",
        "gulp-git": "^1.6.1",
        "gulp-mocha": "^2.2.0",
        "gulp-plumber": "^1.0.1",
        "gulp-sourcemaps": "^1.6.0",
        "gulp-tag-version": "^1.3.0",
        jsdoc: "^3.4.0",
        lazypipe: "^1.0.1",
        "vinyl-source-stream": "^1.1.0"
      },
      license: "BSD-2-Clause",
      scripts: {
        test: "gulp travis",
        "unit-test": "gulp test",
        lint: "gulp lint",
        jsdoc: "jsdoc src/*.js README.md"
      }
    };
  }
});

// node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/escope@3.6.0/node_modules/escope/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ScopeManager = exports.Scope = exports.Variable = exports.Reference = exports.version = void 0;
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };
    exports.analyze = analyze3;
    var _assert = require_assert();
    var _assert2 = _interopRequireDefault(_assert);
    var _scopeManager = require_scope_manager();
    var _scopeManager2 = _interopRequireDefault(_scopeManager);
    var _referencer = require_referencer();
    var _referencer2 = _interopRequireDefault(_referencer);
    var _reference = require_reference();
    var _reference2 = _interopRequireDefault(_reference);
    var _variable = require_variable();
    var _variable2 = _interopRequireDefault(_variable);
    var _scope = require_scope();
    var _scope2 = _interopRequireDefault(_scope);
    var _package = require_package3();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function defaultOptions() {
      return {
        optimistic: false,
        directive: false,
        nodejsScope: false,
        impliedStrict: false,
        sourceType: "script",
        ecmaVersion: 5,
        childVisitorKeys: null,
        fallback: "iteration"
      };
    }
    function updateDeeply(target, override) {
      var key, val;
      function isHashObject(target2) {
        return (typeof target2 === "undefined" ? "undefined" : _typeof(target2)) === "object" && target2 instanceof Object && !(target2 instanceof Array) && !(target2 instanceof RegExp);
      }
      for (key in override) {
        if (override.hasOwnProperty(key)) {
          val = override[key];
          if (isHashObject(val)) {
            if (isHashObject(target[key])) {
              updateDeeply(target[key], val);
            } else {
              target[key] = updateDeeply({}, val);
            }
          } else {
            target[key] = val;
          }
        }
      }
      return target;
    }
    function analyze3(tree, providedOptions) {
      var scopeManager, referencer, options;
      options = updateDeeply(defaultOptions(), providedOptions);
      scopeManager = new _scopeManager2.default(options);
      referencer = new _referencer2.default(options, scopeManager);
      referencer.visit(tree);
      (0, _assert2.default)(scopeManager.__currentScope === null, "currentScope should be null.");
      return scopeManager;
    }
    exports.version = _package.version;
    exports.Reference = _reference2.default;
    exports.Variable = _variable2.default;
    exports.Scope = _scope2.default;
    exports.ScopeManager = _scopeManager2.default;
  }
});

// entry.mjs
var __ = __toESM(require_lib(), 1);
var version2 = __.version;
var Reference2 = __.Reference;
var Variable2 = __.Variable;
var Scope2 = __.Scope;
var ScopeManager2 = __.ScopeManager;
var analyze2 = __.analyze;
export {
  Reference2 as Reference,
  Scope2 as Scope,
  ScopeManager2 as ScopeManager,
  Variable2 as Variable,
  analyze2 as analyze,
  version2 as version
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
