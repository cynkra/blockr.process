var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@xmldom/xmldom/lib/conventions.js
var require_conventions = __commonJS({
  "node_modules/@xmldom/xmldom/lib/conventions.js"(exports) {
    "use strict";
    function find2(list, predicate, ac) {
      if (ac === void 0) {
        ac = Array.prototype;
      }
      if (list && typeof ac.find === "function") {
        return ac.find.call(list, predicate);
      }
      for (var i = 0; i < list.length; i++) {
        if (hasOwn(list, i)) {
          var item = list[i];
          if (predicate.call(void 0, item, i, list)) {
            return item;
          }
        }
      }
    }
    function freeze(object, oc) {
      if (oc === void 0) {
        oc = Object;
      }
      if (oc && typeof oc.getOwnPropertyDescriptors === "function") {
        object = oc.create(null, oc.getOwnPropertyDescriptors(object));
      }
      return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
    }
    function hasOwn(object, key) {
      return Object.prototype.hasOwnProperty.call(object, key);
    }
    function assign2(target, source) {
      if (target === null || typeof target !== "object") {
        throw new TypeError("target is not an object");
      }
      for (var key in source) {
        if (hasOwn(source, key)) {
          target[key] = source[key];
        }
      }
      return target;
    }
    var HTML_BOOLEAN_ATTRIBUTES = freeze({
      allowfullscreen: true,
      async: true,
      autofocus: true,
      autoplay: true,
      checked: true,
      controls: true,
      default: true,
      defer: true,
      disabled: true,
      formnovalidate: true,
      hidden: true,
      ismap: true,
      itemscope: true,
      loop: true,
      multiple: true,
      muted: true,
      nomodule: true,
      novalidate: true,
      open: true,
      playsinline: true,
      readonly: true,
      required: true,
      reversed: true,
      selected: true
    });
    function isHTMLBooleanAttribute(name2) {
      return hasOwn(HTML_BOOLEAN_ATTRIBUTES, name2.toLowerCase());
    }
    var HTML_VOID_ELEMENTS = freeze({
      area: true,
      base: true,
      br: true,
      col: true,
      embed: true,
      hr: true,
      img: true,
      input: true,
      link: true,
      meta: true,
      param: true,
      source: true,
      track: true,
      wbr: true
    });
    function isHTMLVoidElement(tagName) {
      return hasOwn(HTML_VOID_ELEMENTS, tagName.toLowerCase());
    }
    var HTML_RAW_TEXT_ELEMENTS = freeze({
      script: false,
      style: false,
      textarea: true,
      title: true
    });
    function isHTMLRawTextElement(tagName) {
      var key = tagName.toLowerCase();
      return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && !HTML_RAW_TEXT_ELEMENTS[key];
    }
    function isHTMLEscapableRawTextElement(tagName) {
      var key = tagName.toLowerCase();
      return hasOwn(HTML_RAW_TEXT_ELEMENTS, key) && HTML_RAW_TEXT_ELEMENTS[key];
    }
    function isHTMLMimeType(mimeType) {
      return mimeType === MIME_TYPE.HTML;
    }
    function hasDefaultHTMLNamespace(mimeType) {
      return isHTMLMimeType(mimeType) || mimeType === MIME_TYPE.XML_XHTML_APPLICATION;
    }
    var MIME_TYPE = freeze({
      /**
       * `text/html`, the only mime type that triggers treating an XML document as HTML.
       *
       * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/HTML Wikipedia
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
       * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
       *      WHATWG HTML Spec
       */
      HTML: "text/html",
      /**
       * `application/xml`, the standard mime type for XML documents.
       *
       * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
       *      registration
       * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
       * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
       */
      XML_APPLICATION: "application/xml",
      /**
       * `text/xml`, an alias for `application/xml`.
       *
       * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
       * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
       */
      XML_TEXT: "text/xml",
      /**
       * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
       * but is parsed as an XML document.
       *
       * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
       *      registration
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
       * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
       */
      XML_XHTML_APPLICATION: "application/xhtml+xml",
      /**
       * `image/svg+xml`,
       *
       * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
       * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
       * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
       */
      XML_SVG_IMAGE: "image/svg+xml"
    });
    var _MIME_TYPES = Object.keys(MIME_TYPE).map(function(key) {
      return MIME_TYPE[key];
    });
    function isValidMimeType(mimeType) {
      return _MIME_TYPES.indexOf(mimeType) > -1;
    }
    var NAMESPACE = freeze({
      /**
       * The XHTML namespace.
       *
       * @see http://www.w3.org/1999/xhtml
       */
      HTML: "http://www.w3.org/1999/xhtml",
      /**
       * The SVG namespace.
       *
       * @see http://www.w3.org/2000/svg
       */
      SVG: "http://www.w3.org/2000/svg",
      /**
       * The `xml:` namespace.
       *
       * @see http://www.w3.org/XML/1998/namespace
       */
      XML: "http://www.w3.org/XML/1998/namespace",
      /**
       * The `xmlns:` namespace.
       *
       * @see https://www.w3.org/2000/xmlns/
       */
      XMLNS: "http://www.w3.org/2000/xmlns/"
    });
    exports.assign = assign2;
    exports.find = find2;
    exports.freeze = freeze;
    exports.HTML_BOOLEAN_ATTRIBUTES = HTML_BOOLEAN_ATTRIBUTES;
    exports.HTML_RAW_TEXT_ELEMENTS = HTML_RAW_TEXT_ELEMENTS;
    exports.HTML_VOID_ELEMENTS = HTML_VOID_ELEMENTS;
    exports.hasDefaultHTMLNamespace = hasDefaultHTMLNamespace;
    exports.hasOwn = hasOwn;
    exports.isHTMLBooleanAttribute = isHTMLBooleanAttribute;
    exports.isHTMLRawTextElement = isHTMLRawTextElement;
    exports.isHTMLEscapableRawTextElement = isHTMLEscapableRawTextElement;
    exports.isHTMLMimeType = isHTMLMimeType;
    exports.isHTMLVoidElement = isHTMLVoidElement;
    exports.isValidMimeType = isValidMimeType;
    exports.MIME_TYPE = MIME_TYPE;
    exports.NAMESPACE = NAMESPACE;
  }
});

// node_modules/@xmldom/xmldom/lib/errors.js
var require_errors = __commonJS({
  "node_modules/@xmldom/xmldom/lib/errors.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    function extendError(constructor, writableName) {
      constructor.prototype = Object.create(Error.prototype, {
        constructor: { value: constructor },
        name: { value: constructor.name, enumerable: true, writable: writableName }
      });
    }
    var DOMExceptionName = conventions.freeze({
      /**
       * the default value as defined by the spec
       */
      Error: "Error",
      /**
       * @deprecated
       * Use RangeError instead.
       */
      IndexSizeError: "IndexSizeError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      DomstringSizeError: "DomstringSizeError",
      HierarchyRequestError: "HierarchyRequestError",
      WrongDocumentError: "WrongDocumentError",
      InvalidCharacterError: "InvalidCharacterError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      NoDataAllowedError: "NoDataAllowedError",
      NoModificationAllowedError: "NoModificationAllowedError",
      NotFoundError: "NotFoundError",
      NotSupportedError: "NotSupportedError",
      InUseAttributeError: "InUseAttributeError",
      InvalidStateError: "InvalidStateError",
      SyntaxError: "SyntaxError",
      InvalidModificationError: "InvalidModificationError",
      NamespaceError: "NamespaceError",
      /**
       * @deprecated
       * Use TypeError for invalid arguments,
       * "NotSupportedError" DOMException for unsupported operations,
       * and "NotAllowedError" DOMException for denied requests instead.
       */
      InvalidAccessError: "InvalidAccessError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      ValidationError: "ValidationError",
      /**
       * @deprecated
       * Use TypeError instead.
       */
      TypeMismatchError: "TypeMismatchError",
      SecurityError: "SecurityError",
      NetworkError: "NetworkError",
      AbortError: "AbortError",
      /**
       * @deprecated
       * Just to match the related static code, not part of the spec.
       */
      URLMismatchError: "URLMismatchError",
      QuotaExceededError: "QuotaExceededError",
      TimeoutError: "TimeoutError",
      InvalidNodeTypeError: "InvalidNodeTypeError",
      DataCloneError: "DataCloneError",
      EncodingError: "EncodingError",
      NotReadableError: "NotReadableError",
      UnknownError: "UnknownError",
      ConstraintError: "ConstraintError",
      DataError: "DataError",
      TransactionInactiveError: "TransactionInactiveError",
      ReadOnlyError: "ReadOnlyError",
      VersionError: "VersionError",
      OperationError: "OperationError",
      NotAllowedError: "NotAllowedError",
      OptOutError: "OptOutError"
    });
    var DOMExceptionNames = Object.keys(DOMExceptionName);
    function isValidDomExceptionCode(value) {
      return typeof value === "number" && value >= 1 && value <= 25;
    }
    function endsWithError(value) {
      return typeof value === "string" && value.substring(value.length - DOMExceptionName.Error.length) === DOMExceptionName.Error;
    }
    function DOMException(messageOrCode, nameOrMessage) {
      if (isValidDomExceptionCode(messageOrCode)) {
        this.name = DOMExceptionNames[messageOrCode];
        this.message = nameOrMessage || "";
      } else {
        this.message = messageOrCode;
        this.name = endsWithError(nameOrMessage) ? nameOrMessage : DOMExceptionName.Error;
      }
      if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
    }
    extendError(DOMException, true);
    Object.defineProperties(DOMException.prototype, {
      code: {
        enumerable: true,
        get: function() {
          var code = DOMExceptionNames.indexOf(this.name);
          if (isValidDomExceptionCode(code)) return code;
          return 0;
        }
      }
    });
    var ExceptionCode = {
      INDEX_SIZE_ERR: 1,
      DOMSTRING_SIZE_ERR: 2,
      HIERARCHY_REQUEST_ERR: 3,
      WRONG_DOCUMENT_ERR: 4,
      INVALID_CHARACTER_ERR: 5,
      NO_DATA_ALLOWED_ERR: 6,
      NO_MODIFICATION_ALLOWED_ERR: 7,
      NOT_FOUND_ERR: 8,
      NOT_SUPPORTED_ERR: 9,
      INUSE_ATTRIBUTE_ERR: 10,
      INVALID_STATE_ERR: 11,
      SYNTAX_ERR: 12,
      INVALID_MODIFICATION_ERR: 13,
      NAMESPACE_ERR: 14,
      INVALID_ACCESS_ERR: 15,
      VALIDATION_ERR: 16,
      TYPE_MISMATCH_ERR: 17,
      SECURITY_ERR: 18,
      NETWORK_ERR: 19,
      ABORT_ERR: 20,
      URL_MISMATCH_ERR: 21,
      QUOTA_EXCEEDED_ERR: 22,
      TIMEOUT_ERR: 23,
      INVALID_NODE_TYPE_ERR: 24,
      DATA_CLONE_ERR: 25
    };
    var entries = Object.entries(ExceptionCode);
    for (i = 0; i < entries.length; i++) {
      key = entries[i][0];
      DOMException[key] = entries[i][1];
    }
    var key;
    var i;
    function ParseError(message, locator) {
      this.message = message;
      this.locator = locator;
      if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
    }
    extendError(ParseError);
    exports.DOMException = DOMException;
    exports.DOMExceptionName = DOMExceptionName;
    exports.ExceptionCode = ExceptionCode;
    exports.ParseError = ParseError;
  }
});

// node_modules/@xmldom/xmldom/lib/grammar.js
var require_grammar = __commonJS({
  "node_modules/@xmldom/xmldom/lib/grammar.js"(exports) {
    "use strict";
    function detectUnicodeSupport(RegExpImpl) {
      try {
        if (typeof RegExpImpl !== "function") {
          RegExpImpl = RegExp;
        }
        var match = new RegExpImpl("\u{1D306}", "u").exec("\u{1D306}");
        return !!match && match[0].length === 2;
      } catch (error3) {
      }
      return false;
    }
    var UNICODE_SUPPORT = detectUnicodeSupport();
    function chars(regexp) {
      if (regexp.source[0] !== "[") {
        throw new Error(regexp + " can not be used with chars");
      }
      return regexp.source.slice(1, regexp.source.lastIndexOf("]"));
    }
    function chars_without(regexp, search) {
      if (regexp.source[0] !== "[") {
        throw new Error("/" + regexp.source + "/ can not be used with chars_without");
      }
      if (!search || typeof search !== "string") {
        throw new Error(JSON.stringify(search) + " is not a valid search");
      }
      if (regexp.source.indexOf(search) === -1) {
        throw new Error('"' + search + '" is not is /' + regexp.source + "/");
      }
      if (search === "-" && regexp.source.indexOf(search) !== 1) {
        throw new Error('"' + search + '" is not at the first postion of /' + regexp.source + "/");
      }
      return new RegExp(regexp.source.replace(search, ""), UNICODE_SUPPORT ? "u" : "");
    }
    function reg(args) {
      var self = this;
      return new RegExp(
        Array.prototype.slice.call(arguments).map(function(part) {
          var isStr = typeof part === "string";
          if (isStr && self === void 0 && part === "|") {
            throw new Error("use regg instead of reg to wrap expressions with `|`!");
          }
          return isStr ? part : part.source;
        }).join(""),
        UNICODE_SUPPORT ? "mu" : "m"
      );
    }
    function regg(args) {
      if (arguments.length === 0) {
        throw new Error("no parameters provided");
      }
      return reg.apply(regg, ["(?:"].concat(Array.prototype.slice.call(arguments), [")"]));
    }
    var UNICODE_REPLACEMENT_CHARACTER = "\uFFFD";
    var Char = /[-\x09\x0A\x0D\x20-\x2C\x2E-\uD7FF\uE000-\uFFFD]/;
    if (UNICODE_SUPPORT) {
      Char = reg("[", chars(Char), "\\u{10000}-\\u{10FFFF}", "]");
    }
    var InvalidChar = new RegExp("[^" + chars(Char) + "]", UNICODE_SUPPORT ? "u" : "");
    var _SChar = /[\x20\x09\x0D\x0A]/;
    var SChar_s = chars(_SChar);
    var S = reg(_SChar, "+");
    var S_OPT = reg(_SChar, "*");
    var NameStartChar = /[:_a-zA-Z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    if (UNICODE_SUPPORT) {
      NameStartChar = reg("[", chars(NameStartChar), "\\u{10000}-\\u{10FFFF}", "]");
    }
    var NameStartChar_s = chars(NameStartChar);
    var NameChar = reg("[", NameStartChar_s, chars(/[-.0-9\xB7]/), chars(/[\u0300-\u036F\u203F-\u2040]/), "]");
    var Name = reg(NameStartChar, NameChar, "*");
    var Nmtoken = reg(NameChar, "+");
    var EntityRef = reg("&", Name, ";");
    var CharRef = regg(/&#[0-9]+;|&#x[0-9a-fA-F]+;/);
    var Reference = regg(EntityRef, "|", CharRef);
    var PEReference = reg("%", Name, ";");
    var EntityValue = regg(
      reg('"', regg(/[^%&"]/, "|", PEReference, "|", Reference), "*", '"'),
      "|",
      reg("'", regg(/[^%&']/, "|", PEReference, "|", Reference), "*", "'")
    );
    var AttValue = regg('"', regg(/[^<&"]/, "|", Reference), "*", '"', "|", "'", regg(/[^<&']/, "|", Reference), "*", "'");
    var NCNameStartChar = chars_without(NameStartChar, ":");
    var NCNameChar = chars_without(NameChar, ":");
    var NCName = reg(NCNameStartChar, NCNameChar, "*");
    var QName = reg(NCName, regg(":", NCName), "?");
    var QName_exact = reg("^", QName, "$");
    var QName_group = reg("(", QName, ")");
    var SystemLiteral = regg(/"[^"]*"|'[^']*'/);
    var PI = reg(/^<\?/, "(", Name, ")", regg(S, "(?!", _SChar, ")(", Char, "*?)"), "?", /\?>/);
    var PubidChar = /[\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/;
    var PubidLiteral = regg('"', PubidChar, '*"', "|", "'", chars_without(PubidChar, "'"), "*'");
    var COMMENT_START = "<!--";
    var COMMENT_END = "-->";
    var Comment = reg(COMMENT_START, regg(chars_without(Char, "-"), "|", reg("-", chars_without(Char, "-"))), "*", COMMENT_END);
    var PCDATA = "#PCDATA";
    var Mixed = regg(
      reg(/\(/, S_OPT, PCDATA, regg(S_OPT, /\|/, S_OPT, QName), "*", S_OPT, /\)\*/),
      "|",
      reg(/\(/, S_OPT, PCDATA, S_OPT, /\)/)
    );
    var _children_quantity = /[?*+]?/;
    var children = reg(
      /\([^>]+\)/,
      _children_quantity
      /*regg(choice, '|', seq), _children_quantity*/
    );
    var contentspec = regg("EMPTY", "|", "ANY", "|", Mixed, "|", children);
    var ELEMENTDECL_START = "<!ELEMENT";
    var elementdecl = reg(ELEMENTDECL_START, S, regg(QName, "|", PEReference), S, regg(contentspec, "|", PEReference), S_OPT, ">");
    var NotationType = reg("NOTATION", S, /\(/, S_OPT, Name, regg(S_OPT, /\|/, S_OPT, Name), "*", S_OPT, /\)/);
    var Enumeration = reg(/\(/, S_OPT, Nmtoken, regg(S_OPT, /\|/, S_OPT, Nmtoken), "*", S_OPT, /\)/);
    var EnumeratedType = regg(NotationType, "|", Enumeration);
    var AttType = regg(/CDATA|ID|IDREF|IDREFS|ENTITY|ENTITIES|NMTOKEN|NMTOKENS/, "|", EnumeratedType);
    var DefaultDecl = regg(/#REQUIRED|#IMPLIED/, "|", regg(regg("#FIXED", S), "?", AttValue));
    var AttDef = regg(S, Name, S, AttType, S, DefaultDecl);
    var ATTLIST_DECL_START = "<!ATTLIST";
    var AttlistDecl = reg(ATTLIST_DECL_START, S, Name, AttDef, "*", S_OPT, ">");
    var ABOUT_LEGACY_COMPAT = "about:legacy-compat";
    var ABOUT_LEGACY_COMPAT_SystemLiteral = regg('"' + ABOUT_LEGACY_COMPAT + '"', "|", "'" + ABOUT_LEGACY_COMPAT + "'");
    var SYSTEM = "SYSTEM";
    var PUBLIC = "PUBLIC";
    var ExternalID = regg(regg(SYSTEM, S, SystemLiteral), "|", regg(PUBLIC, S, PubidLiteral, S, SystemLiteral));
    var ExternalID_match = reg(
      "^",
      regg(
        regg(SYSTEM, S, "(?<SystemLiteralOnly>", SystemLiteral, ")"),
        "|",
        regg(PUBLIC, S, "(?<PubidLiteral>", PubidLiteral, ")", S, "(?<SystemLiteral>", SystemLiteral, ")")
      )
    );
    var PubidLiteral_match = reg("^", PubidLiteral, "$");
    var SystemLiteral_match = reg("^", SystemLiteral, "$");
    var NDataDecl = regg(S, "NDATA", S, Name);
    var EntityDef = regg(EntityValue, "|", regg(ExternalID, NDataDecl, "?"));
    var ENTITY_DECL_START = "<!ENTITY";
    var GEDecl = reg(ENTITY_DECL_START, S, Name, S, EntityDef, S_OPT, ">");
    var PEDef = regg(EntityValue, "|", ExternalID);
    var PEDecl = reg(ENTITY_DECL_START, S, "%", S, Name, S, PEDef, S_OPT, ">");
    var EntityDecl = regg(GEDecl, "|", PEDecl);
    var PublicID = reg(PUBLIC, S, PubidLiteral);
    var NotationDecl = reg("<!NOTATION", S, Name, S, regg(ExternalID, "|", PublicID), S_OPT, ">");
    var Eq = reg(S_OPT, "=", S_OPT);
    var VersionNum = /1[.]\d+/;
    var VersionInfo = reg(S, "version", Eq, regg("'", VersionNum, "'", "|", '"', VersionNum, '"'));
    var EncName = /[A-Za-z][-A-Za-z0-9._]*/;
    var EncodingDecl = regg(S, "encoding", Eq, regg('"', EncName, '"', "|", "'", EncName, "'"));
    var SDDecl = regg(S, "standalone", Eq, regg("'", regg("yes", "|", "no"), "'", "|", '"', regg("yes", "|", "no"), '"'));
    var XMLDecl = reg(/^<\?xml/, VersionInfo, EncodingDecl, "?", SDDecl, "?", S_OPT, /\?>/);
    var DOCTYPE_DECL_START = "<!DOCTYPE";
    var CDATA_START = "<![CDATA[";
    var CDATA_END = "]]>";
    var CDStart = /<!\[CDATA\[/;
    var CDEnd = /\]\]>/;
    var CData = reg(Char, "*?", CDEnd);
    var CDSect = reg(CDStart, CData);
    exports.chars = chars;
    exports.chars_without = chars_without;
    exports.detectUnicodeSupport = detectUnicodeSupport;
    exports.reg = reg;
    exports.regg = regg;
    exports.ABOUT_LEGACY_COMPAT = ABOUT_LEGACY_COMPAT;
    exports.ABOUT_LEGACY_COMPAT_SystemLiteral = ABOUT_LEGACY_COMPAT_SystemLiteral;
    exports.AttlistDecl = AttlistDecl;
    exports.CDATA_START = CDATA_START;
    exports.CDATA_END = CDATA_END;
    exports.CDSect = CDSect;
    exports.Char = Char;
    exports.Comment = Comment;
    exports.COMMENT_START = COMMENT_START;
    exports.COMMENT_END = COMMENT_END;
    exports.DOCTYPE_DECL_START = DOCTYPE_DECL_START;
    exports.elementdecl = elementdecl;
    exports.EntityDecl = EntityDecl;
    exports.EntityValue = EntityValue;
    exports.ExternalID = ExternalID;
    exports.ExternalID_match = ExternalID_match;
    exports.Name = Name;
    exports.NotationDecl = NotationDecl;
    exports.Reference = Reference;
    exports.PEReference = PEReference;
    exports.PI = PI;
    exports.PUBLIC = PUBLIC;
    exports.PubidLiteral = PubidLiteral;
    exports.PubidLiteral_match = PubidLiteral_match;
    exports.QName = QName;
    exports.QName_exact = QName_exact;
    exports.QName_group = QName_group;
    exports.S = S;
    exports.SChar_s = SChar_s;
    exports.S_OPT = S_OPT;
    exports.SYSTEM = SYSTEM;
    exports.SystemLiteral = SystemLiteral;
    exports.SystemLiteral_match = SystemLiteral_match;
    exports.InvalidChar = InvalidChar;
    exports.UNICODE_REPLACEMENT_CHARACTER = UNICODE_REPLACEMENT_CHARACTER;
    exports.UNICODE_SUPPORT = UNICODE_SUPPORT;
    exports.XMLDecl = XMLDecl;
  }
});

// node_modules/@xmldom/xmldom/lib/dom.js
var require_dom = __commonJS({
  "node_modules/@xmldom/xmldom/lib/dom.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var find2 = conventions.find;
    var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
    var hasOwn = conventions.hasOwn;
    var isHTMLMimeType = conventions.isHTMLMimeType;
    var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
    var isHTMLVoidElement = conventions.isHTMLVoidElement;
    var MIME_TYPE = conventions.MIME_TYPE;
    var NAMESPACE = conventions.NAMESPACE;
    var PDC = /* @__PURE__ */ Symbol();
    var errors = require_errors();
    var DOMException = errors.DOMException;
    var DOMExceptionName = errors.DOMExceptionName;
    var g = require_grammar();
    function checkSymbol(symbol) {
      if (symbol !== PDC) {
        throw new TypeError("Illegal constructor");
      }
    }
    function notEmptyString(input) {
      return input !== "";
    }
    function splitOnASCIIWhitespace(input) {
      return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
    }
    function orderedSetReducer(current, element) {
      if (!hasOwn(current, element)) {
        current[element] = true;
      }
      return current;
    }
    function toOrderedSet(input) {
      if (!input) return [];
      var list = splitOnASCIIWhitespace(input);
      return Object.keys(list.reduce(orderedSetReducer, {}));
    }
    function arrayIncludes(list) {
      return function(element) {
        return list && list.indexOf(element) !== -1;
      };
    }
    function validateQualifiedName(qualifiedName) {
      if (!g.QName_exact.test(qualifiedName)) {
        throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in qualified name "' + qualifiedName + '"');
      }
    }
    function validateAndExtract(namespace, qualifiedName) {
      validateQualifiedName(qualifiedName);
      namespace = namespace || null;
      var prefix2 = null;
      var localName = qualifiedName;
      if (qualifiedName.indexOf(":") >= 0) {
        var splitResult = qualifiedName.split(":");
        prefix2 = splitResult[0];
        localName = splitResult[1];
      }
      if (prefix2 !== null && namespace === null) {
        throw new DOMException(DOMException.NAMESPACE_ERR, "prefix is non-null and namespace is null");
      }
      if (prefix2 === "xml" && namespace !== conventions.NAMESPACE.XML) {
        throw new DOMException(DOMException.NAMESPACE_ERR, 'prefix is "xml" and namespace is not the XML namespace');
      }
      if ((prefix2 === "xmlns" || qualifiedName === "xmlns") && namespace !== conventions.NAMESPACE.XMLNS) {
        throw new DOMException(
          DOMException.NAMESPACE_ERR,
          'either qualifiedName or prefix is "xmlns" and namespace is not the XMLNS namespace'
        );
      }
      if (namespace === conventions.NAMESPACE.XMLNS && prefix2 !== "xmlns" && qualifiedName !== "xmlns") {
        throw new DOMException(
          DOMException.NAMESPACE_ERR,
          'namespace is the XMLNS namespace and neither qualifiedName nor prefix is "xmlns"'
        );
      }
      return [namespace, prefix2, localName];
    }
    function copy(src, dest) {
      for (var p in src) {
        if (hasOwn(src, p)) {
          dest[p] = src[p];
        }
      }
    }
    function _extends(Class, Super) {
      var pt = Class.prototype;
      if (!(pt instanceof Super)) {
        let t = function() {
        };
        t.prototype = Super.prototype;
        t = new t();
        copy(pt, t);
        Class.prototype = pt = t;
      }
      if (pt.constructor != Class) {
        if (typeof Class != "function") {
          console.error("unknown Class:" + Class);
        }
        pt.constructor = Class;
      }
    }
    var NodeType = {};
    var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
    var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
    var TEXT_NODE = NodeType.TEXT_NODE = 3;
    var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
    var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
    var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
    var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
    var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
    var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
    var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
    var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
    var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
    var DocumentPosition = conventions.freeze({
      DOCUMENT_POSITION_DISCONNECTED: 1,
      DOCUMENT_POSITION_PRECEDING: 2,
      DOCUMENT_POSITION_FOLLOWING: 4,
      DOCUMENT_POSITION_CONTAINS: 8,
      DOCUMENT_POSITION_CONTAINED_BY: 16,
      DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32
    });
    function commonAncestor(a, b) {
      if (b.length < a.length) return commonAncestor(b, a);
      var c = null;
      for (var n in a) {
        if (a[n] !== b[n]) return c;
        c = a[n];
      }
      return c;
    }
    function docGUID(doc) {
      if (!doc.guid) doc.guid = Math.random();
      return doc.guid;
    }
    function NodeList() {
    }
    NodeList.prototype = {
      /**
       * The number of nodes in the list. The range of valid child node indices is 0 to length-1
       * inclusive.
       *
       * @type {number}
       */
      length: 0,
      /**
       * Returns the item at `index`. If index is greater than or equal to the number of nodes in
       * the list, this returns null.
       *
       * @param index
       * Unsigned long Index into the collection.
       * @returns {Node | null}
       * The node at position `index` in the NodeList,
       * or null if that is not a valid index.
       */
      item: function(index) {
        return index >= 0 && index < this.length ? this[index] : null;
      },
      /**
       * Returns a string representation of the NodeList.
       *
       * Accepts the same `options` object as `XMLSerializer.prototype.serializeToString`
       * (`requireWellFormed`, `splitCDATASections`, `nodeFilter`). Passing a function is treated as
       * a legacy `nodeFilter` for backward compatibility.
       *
       * @param {Object | function} [options]
       * @param {boolean} [options.requireWellFormed=false]
       * @param {boolean} [options.splitCDATASections=true]
       * @param {function} [options.nodeFilter]
       * @returns {string}
       */
      toString: function(options) {
        var opts;
        if (typeof options === "function") {
          opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: options };
        } else if (!!options) {
          opts = {
            requireWellFormed: !!options.requireWellFormed,
            splitCDATASections: options.splitCDATASections !== false,
            nodeFilter: options.nodeFilter || null
          };
        } else {
          opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: null };
        }
        for (var buf = [], i = 0; i < this.length; i++) {
          serializeToString(this[i], buf, null, opts);
        }
        return buf.join("");
      },
      /**
       * Filters the NodeList based on a predicate.
       *
       * @param {function(Node): boolean} predicate
       * - A predicate function to filter the NodeList.
       * @returns {Node[]}
       * An array of nodes that satisfy the predicate.
       * @private
       */
      filter: function(predicate) {
        return Array.prototype.filter.call(this, predicate);
      },
      /**
       * Returns the first index at which a given node can be found in the NodeList, or -1 if it is
       * not present.
       *
       * @param {Node} item
       * - The Node item to locate in the NodeList.
       * @returns {number}
       * The first index of the node in the NodeList; -1 if not found.
       * @private
       */
      indexOf: function(item) {
        return Array.prototype.indexOf.call(this, item);
      }
    };
    NodeList.prototype[Symbol.iterator] = function() {
      var me = this;
      var index = 0;
      return {
        next: function() {
          if (index < me.length) {
            return {
              value: me[index++],
              done: false
            };
          } else {
            return {
              done: true
            };
          }
        },
        return: function() {
          return {
            done: true
          };
        }
      };
    };
    function LiveNodeList(node, refresh) {
      this._node = node;
      this._refresh = refresh;
      _updateLiveList(this);
    }
    function _updateLiveList(list) {
      var inc = list._node._inc || list._node.ownerDocument._inc;
      if (list._inc !== inc) {
        var ls = list._refresh(list._node);
        __set__(list, "length", ls.length);
        if (!list.$$length || ls.length < list.$$length) {
          for (var i = ls.length; i in list; i++) {
            if (hasOwn(list, i)) {
              delete list[i];
            }
          }
        }
        copy(ls, list);
        list._inc = inc;
      }
    }
    LiveNodeList.prototype.item = function(i) {
      _updateLiveList(this);
      return this[i] || null;
    };
    _extends(LiveNodeList, NodeList);
    function NamedNodeMap() {
    }
    function _findNodeIndex(list, node) {
      var i = 0;
      while (i < list.length) {
        if (list[i] === node) {
          return i;
        }
        i++;
      }
    }
    function _addNamedNode(el, list, newAttr, oldAttr) {
      if (oldAttr) {
        list[_findNodeIndex(list, oldAttr)] = newAttr;
      } else {
        list[list.length] = newAttr;
        list.length++;
      }
      if (el) {
        newAttr.ownerElement = el;
        var doc = el.ownerDocument;
        if (doc) {
          oldAttr && _onRemoveAttribute(doc, el, oldAttr);
          _onAddAttribute(doc, el, newAttr);
        }
      }
    }
    function _removeNamedNode(el, list, attr) {
      var i = _findNodeIndex(list, attr);
      if (i >= 0) {
        var lastIndex = list.length - 1;
        while (i <= lastIndex) {
          list[i] = list[++i];
        }
        list.length = lastIndex;
        if (el) {
          var doc = el.ownerDocument;
          if (doc) {
            _onRemoveAttribute(doc, el, attr);
          }
          attr.ownerElement = null;
        }
      }
    }
    NamedNodeMap.prototype = {
      length: 0,
      item: NodeList.prototype.item,
      /**
       * Get an attribute by name. Note: Name is in lower case in case of HTML namespace and
       * document.
       *
       * @param {string} localName
       * The local name of the attribute.
       * @returns {Attr | null}
       * The attribute with the given local name, or null if no such attribute exists.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-name
       */
      getNamedItem: function(localName) {
        if (this._ownerElement && this._ownerElement._isInHTMLDocumentAndNamespace()) {
          localName = localName.toLowerCase();
        }
        var i = 0;
        while (i < this.length) {
          var attr = this[i];
          if (attr.nodeName === localName) {
            return attr;
          }
          i++;
        }
        return null;
      },
      /**
       * Set an attribute.
       *
       * @param {Attr} attr
       * The attribute to set.
       * @returns {Attr | null}
       * The old attribute with the same local name and namespace URI as the new one, or null if no
       * such attribute exists.
       * @throws {DOMException}
       * With code:
       * - {@link INUSE_ATTRIBUTE_ERR} - If the attribute is already an attribute of another
       * element.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
       */
      setNamedItem: function(attr) {
        var el = attr.ownerElement;
        if (el && el !== this._ownerElement) {
          throw new DOMException(DOMException.INUSE_ATTRIBUTE_ERR);
        }
        var oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
        if (oldAttr === attr) {
          return attr;
        }
        _addNamedNode(this._ownerElement, this, attr, oldAttr);
        return oldAttr;
      },
      /**
       * Set an attribute, replacing an existing attribute with the same local name and namespace
       * URI if one exists.
       *
       * @param {Attr} attr
       * The attribute to set.
       * @returns {Attr | null}
       * The old attribute with the same local name and namespace URI as the new one, or null if no
       * such attribute exists.
       * @throws {DOMException}
       * Throws a DOMException with the name "InUseAttributeError" if the attribute is already an
       * attribute of another element.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-set
       */
      setNamedItemNS: function(attr) {
        return this.setNamedItem(attr);
      },
      /**
       * Removes an attribute specified by the local name.
       *
       * @param {string} localName
       * The local name of the attribute to be removed.
       * @returns {Attr}
       * The attribute node that was removed.
       * @throws {DOMException}
       * With code:
       * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given name is found.
       * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditem
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-name
       */
      removeNamedItem: function(localName) {
        var attr = this.getNamedItem(localName);
        if (!attr) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, localName);
        }
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      /**
       * Removes an attribute specified by the namespace and local name.
       *
       * @param {string | null} namespaceURI
       * The namespace URI of the attribute to be removed.
       * @param {string} localName
       * The local name of the attribute to be removed.
       * @returns {Attr}
       * The attribute node that was removed.
       * @throws {DOMException}
       * With code:
       * - {@link DOMException.NOT_FOUND_ERR} if no attribute with the given namespace URI and local
       * name is found.
       * @see https://dom.spec.whatwg.org/#dom-namednodemap-removenameditemns
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-remove-by-namespace
       */
      removeNamedItemNS: function(namespaceURI, localName) {
        var attr = this.getNamedItemNS(namespaceURI, localName);
        if (!attr) {
          throw new DOMException(DOMException.NOT_FOUND_ERR, namespaceURI ? namespaceURI + " : " + localName : localName);
        }
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      /**
       * Get an attribute by namespace and local name.
       *
       * @param {string | null} namespaceURI
       * The namespace URI of the attribute.
       * @param {string} localName
       * The local name of the attribute.
       * @returns {Attr | null}
       * The attribute with the given namespace URI and local name, or null if no such attribute
       * exists.
       * @see https://dom.spec.whatwg.org/#concept-element-attributes-get-by-namespace
       */
      getNamedItemNS: function(namespaceURI, localName) {
        if (!namespaceURI) {
          namespaceURI = null;
        }
        var i = 0;
        while (i < this.length) {
          var node = this[i];
          if (node.localName === localName && node.namespaceURI === namespaceURI) {
            return node;
          }
          i++;
        }
        return null;
      }
    };
    NamedNodeMap.prototype[Symbol.iterator] = function() {
      var me = this;
      var index = 0;
      return {
        next: function() {
          if (index < me.length) {
            return {
              value: me[index++],
              done: false
            };
          } else {
            return {
              done: true
            };
          }
        },
        return: function() {
          return {
            done: true
          };
        }
      };
    };
    function DOMImplementation() {
    }
    DOMImplementation.prototype = {
      /**
       * Test if the DOM implementation implements a specific feature and version, as specified in
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/core.html#DOMFeatures DOM Features}.
       *
       * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given
       * feature is supported. The different implementations fairly diverged in what kind of
       * features were reported. The latest version of the spec settled to force this method to
       * always return true, where the functionality was accurate and in use.
       *
       * @deprecated
       * It is deprecated and modern browsers return true in all cases.
       * @function DOMImplementation#hasFeature
       * @param {string} feature
       * The name of the feature to test.
       * @param {string} [version]
       * This is the version number of the feature to test.
       * @returns {boolean}
       * Always returns true.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
       * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-5CED94D7 DOM Level 3 Core
       */
      hasFeature: function(feature, version) {
        return true;
      },
      /**
       * Creates a DOM Document object of the specified type with its document element. Note that
       * based on the {@link DocumentType}
       * given to create the document, the implementation may instantiate specialized
       * {@link Document} objects that support additional features than the "Core", such as "HTML"
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML}.
       * On the other hand, setting the {@link DocumentType} after the document was created makes
       * this very unlikely to happen. Alternatively, specialized {@link Document} creation methods,
       * such as createHTMLDocument
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#DOM2HTML DOM Level 2 HTML},
       * can be used to obtain specific types of {@link Document} objects.
       *
       * __It behaves slightly different from the description in the living standard__:
       * - There is no interface/class `XMLDocument`, it returns a `Document`
       * instance (with it's `type` set to `'xml'`).
       * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       *
       * @function DOMImplementation.createDocument
       * @param {string | null} namespaceURI
       * The
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-namespaceURI namespace URI}
       * of the document element to create or null.
       * @param {string | null} qualifiedName
       * The
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified name}
       * of the document element to be created or null.
       * @param {DocumentType | null} [doctype=null]
       * The type of document to be created or null. When doctype is not null, its
       * {@link Node#ownerDocument} attribute is set to the document being created. Default is
       * `null`
       * @returns {Document}
       * A new {@link Document} object with its document element. If the NamespaceURI,
       * qualifiedName, and doctype are null, the returned {@link Document} is empty with no
       * document element.
       * @throws {DOMException}
       * With code:
       *
       * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
       * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
       * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed, if the qualifiedName has a
       * prefix and the namespaceURI is null, or if the qualifiedName is null and the namespaceURI
       * is different from null, or if the qualifiedName has a prefix that is "xml" and the
       * namespaceURI is different from "{@link http://www.w3.org/XML/1998/namespace}"
       * {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#Namespaces XML Namespaces},
       * or if the DOM implementation does not support the "XML" feature but a non-null namespace
       * URI was provided, since namespaces were defined by XML.
       * - `WRONG_DOCUMENT_ERR`: Raised if doctype has already been used with a different document
       * or was created from a different implementation.
       * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
       * "XML" and the language exposed through the Document does not support XML Namespaces (such
       * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
       * @since DOM Level 2.
       * @see {@link #createHTMLDocument}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Living Standard
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-2-Core-DOM-createDocument DOM
       *      Level 3 Core
       * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
       *      Level 2 Core (initial)
       */
      createDocument: function(namespaceURI, qualifiedName, doctype) {
        var contentType = MIME_TYPE.XML_APPLICATION;
        if (namespaceURI === NAMESPACE.HTML) {
          contentType = MIME_TYPE.XML_XHTML_APPLICATION;
        } else if (namespaceURI === NAMESPACE.SVG) {
          contentType = MIME_TYPE.XML_SVG_IMAGE;
        }
        var doc = new Document(PDC, { contentType });
        doc.implementation = this;
        doc.childNodes = new NodeList();
        doc.doctype = doctype || null;
        if (doctype) {
          doc.appendChild(doctype);
        }
        if (qualifiedName) {
          var root = doc.createElementNS(namespaceURI, qualifiedName);
          doc.appendChild(root);
        }
        return doc;
      },
      /**
       * Creates an empty DocumentType node. Entity declarations and notations are not made
       * available. Entity reference expansions and default attribute additions do not occur.
       *
       * **This behavior is slightly different from the one in the specs**:
       * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       * - `publicId` and `systemId` contain the raw data including any possible quotes,
       *   so they can always be serialized back to the original value
       * - `internalSubset` contains the raw string between `[` and `]` if present,
       *   but is not parsed or validated in any form.
       *
       * @function DOMImplementation#createDocumentType
       * @param {string} qualifiedName
       * The {@link https://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-qualifiedname qualified
       * name} of the document type to be created.
       * @param {string} [publicId]
       * The external subset public identifier. Stored verbatim including surrounding quotes.
       * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
       * if the value is non-empty and does not match the XML `PubidLiteral` production
       * (W3C DOM Parsing §3.2.1.3; XML 1.0 production [12]). Creation-time validation is not
       * enforced — deferred to a future breaking release.
       * @param {string} [systemId]
       * The external subset system identifier. Stored verbatim including surrounding quotes.
       * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
       * if the value is non-empty and does not match the XML `SystemLiteral` production
       * (W3C DOM Parsing §3.2.1.3; XML 1.0 production [11]). Creation-time validation is not
       * enforced — deferred to a future breaking release.
       * @param {string} [internalSubset]
       * The internal subset or an empty string if it is not present. Stored verbatim.
       * When serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
       * if the value contains `"]>"`. Creation-time validation is not enforced.
       * @returns {DocumentType}
       * A new {@link DocumentType} node with {@link Node#ownerDocument} set to null.
       * @throws {DOMException}
       * With code:
       *
       * - `INVALID_CHARACTER_ERR`: Raised if the specified qualified name is not an XML name
       * according to {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#XML XML 1.0}.
       * - `NAMESPACE_ERR`: Raised if the qualifiedName is malformed.
       * - `NOT_SUPPORTED_ERR`: May be raised if the implementation does not support the feature
       * "XML" and the language exposed through the Document does not support XML Namespaces (such
       * as {@link https://www.w3.org/TR/DOM-Level-3-Core/references.html#HTML40 HTML 4.01}).
       * @since DOM Level 2.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType
       *      MDN
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living
       *      Standard
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-3-Core-DOM-createDocType DOM
       *      Level 3 Core
       * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM
       *      Level 2 Core
       * @see https://github.com/xmldom/xmldom/blob/master/CHANGELOG.md#050
       * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-Core-DocType-internalSubset
       * @prettierignore
       */
      createDocumentType: function(qualifiedName, publicId, systemId, internalSubset) {
        validateQualifiedName(qualifiedName);
        var node = new DocumentType(PDC);
        node.name = qualifiedName;
        node.nodeName = qualifiedName;
        node.publicId = publicId || "";
        node.systemId = systemId || "";
        node.internalSubset = internalSubset || "";
        node.childNodes = new NodeList();
        return node;
      },
      /**
       * Returns an HTML document, that might already have a basic DOM structure.
       *
       * __It behaves slightly different from the description in the living standard__:
       * - If the first argument is `false` no initial nodes are added (steps 3-7 in the specs are
       * omitted)
       * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       *
       * @param {string | false} [title]
       * A string containing the title to give the new HTML document.
       * @returns {Document}
       * The HTML document.
       * @since WHATWG Living Standard.
       * @see {@link #createDocument}
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
       * @see https://dom.spec.whatwg.org/#html-document
       */
      createHTMLDocument: function(title) {
        var doc = new Document(PDC, { contentType: MIME_TYPE.HTML });
        doc.implementation = this;
        doc.childNodes = new NodeList();
        if (title !== false) {
          doc.doctype = this.createDocumentType("html");
          doc.doctype.ownerDocument = doc;
          doc.appendChild(doc.doctype);
          var htmlNode = doc.createElement("html");
          doc.appendChild(htmlNode);
          var headNode = doc.createElement("head");
          htmlNode.appendChild(headNode);
          if (typeof title === "string") {
            var titleNode = doc.createElement("title");
            titleNode.appendChild(doc.createTextNode(title));
            headNode.appendChild(titleNode);
          }
          htmlNode.appendChild(doc.createElement("body"));
        }
        return doc;
      }
    };
    function Node(symbol) {
      checkSymbol(symbol);
    }
    Node.prototype = {
      /**
       * The first child of this node.
       *
       * @type {Node | null}
       */
      firstChild: null,
      /**
       * The last child of this node.
       *
       * @type {Node | null}
       */
      lastChild: null,
      /**
       * The previous sibling of this node.
       *
       * @type {Node | null}
       */
      previousSibling: null,
      /**
       * The next sibling of this node.
       *
       * @type {Node | null}
       */
      nextSibling: null,
      /**
       * The parent node of this node.
       *
       * @type {Node | null}
       */
      parentNode: null,
      /**
       * The parent element of this node.
       *
       * @type {Element | null}
       */
      get parentElement() {
        return this.parentNode && this.parentNode.nodeType === this.ELEMENT_NODE ? this.parentNode : null;
      },
      /**
       * The child nodes of this node.
       *
       * @type {NodeList}
       */
      childNodes: null,
      /**
       * The document object associated with this node.
       *
       * @type {Document | null}
       */
      ownerDocument: null,
      /**
       * The value of this node.
       *
       * @type {string | null}
       */
      nodeValue: null,
      /**
       * The namespace URI of this node.
       *
       * @type {string | null}
       */
      namespaceURI: null,
      /**
       * The prefix of the namespace for this node.
       *
       * @type {string | null}
       */
      prefix: null,
      /**
       * The local part of the qualified name of this node.
       *
       * @type {string | null}
       */
      localName: null,
      /**
       * The baseURI is currently always `about:blank`,
       * since that's what happens when you create a document from scratch.
       *
       * @type {'about:blank'}
       */
      baseURI: "about:blank",
      /**
       * Is true if this node is part of a document.
       *
       * @type {boolean}
       */
      get isConnected() {
        var rootNode = this.getRootNode();
        return rootNode && rootNode.nodeType === rootNode.DOCUMENT_NODE;
      },
      /**
       * Checks whether `other` is an inclusive descendant of this node.
       *
       * @param {Node | null | undefined} other
       * The node to check.
       * @returns {boolean}
       * True if `other` is an inclusive descendant of this node; false otherwise.
       * @see https://dom.spec.whatwg.org/#dom-node-contains
       */
      contains: function(other) {
        if (!other) return false;
        var parent = other;
        do {
          if (this === parent) return true;
          parent = parent.parentNode;
        } while (parent);
        return false;
      },
      /**
       * @typedef GetRootNodeOptions
       * @property {boolean} [composed=false]
       */
      /**
       * Searches for the root node of this node.
       *
       * **This behavior is slightly different from the in the specs**:
       * - ignores `options.composed`, since `ShadowRoot`s are unsupported, always returns root.
       *
       * @param {GetRootNodeOptions} [options]
       * @returns {Node}
       * Root node.
       * @see https://dom.spec.whatwg.org/#dom-node-getrootnode
       * @see https://dom.spec.whatwg.org/#concept-shadow-including-root
       */
      getRootNode: function(options) {
        var parent = this;
        do {
          if (!parent.parentNode) {
            return parent;
          }
          parent = parent.parentNode;
        } while (parent);
      },
      /**
       * Checks whether the given node is equal to this node.
       *
       * Two nodes are equal when they have the same type, defining characteristics (for the type),
       * and the same childNodes. The comparison is iterative to avoid stack overflows on
       * deeply-nested trees. Attribute nodes of each Element pair are also pushed onto the stack
       * and compared the same way.
       *
       * @param {Node} [otherNode]
       * @returns {boolean}
       * @see https://dom.spec.whatwg.org/#concept-node-equals
       * @see ../docs/walk-dom.md.
       */
      isEqualNode: function(otherNode) {
        if (!otherNode) return false;
        var stack = [{ node: this, other: otherNode }];
        while (stack.length > 0) {
          var pair = stack.pop();
          var node = pair.node;
          var other = pair.other;
          if (node.nodeType !== other.nodeType) return false;
          switch (node.nodeType) {
            case node.DOCUMENT_TYPE_NODE:
              if (node.name !== other.name) return false;
              if (node.publicId !== other.publicId) return false;
              if (node.systemId !== other.systemId) return false;
              break;
            case node.ELEMENT_NODE:
              if (node.namespaceURI !== other.namespaceURI) return false;
              if (node.prefix !== other.prefix) return false;
              if (node.localName !== other.localName) return false;
              if (node.attributes.length !== other.attributes.length) return false;
              for (var i = 0; i < node.attributes.length; i++) {
                var attr = node.attributes.item(i);
                var otherAttr = other.getAttributeNodeNS(attr.namespaceURI, attr.localName);
                if (!otherAttr) return false;
                stack.push({ node: attr, other: otherAttr });
              }
              break;
            case node.ATTRIBUTE_NODE:
              if (node.namespaceURI !== other.namespaceURI) return false;
              if (node.localName !== other.localName) return false;
              if (node.value !== other.value) return false;
              break;
            case node.PROCESSING_INSTRUCTION_NODE:
              if (node.target !== other.target || node.data !== other.data) return false;
              break;
            case node.TEXT_NODE:
            case node.CDATA_SECTION_NODE:
            case node.COMMENT_NODE:
              if (node.data !== other.data) return false;
              break;
          }
          if (node.childNodes.length !== other.childNodes.length) return false;
          for (var i = node.childNodes.length - 1; i >= 0; i--) {
            stack.push({ node: node.childNodes[i], other: other.childNodes[i] });
          }
        }
        return true;
      },
      /**
       * Checks whether or not the given node is this node.
       *
       * @param {Node} [otherNode]
       */
      isSameNode: function(otherNode) {
        return this === otherNode;
      },
      /**
       * Inserts a node before a reference node as a child of this node.
       *
       * @param {Node} newChild
       * The new child node to be inserted.
       * @param {Node | null} refChild
       * The reference node before which newChild will be inserted.
       * @returns {Node}
       * The new child node successfully inserted.
       * @throws {DOMException}
       * Throws a DOMException if inserting the node would result in a DOM tree that is not
       * well-formed, or if `child` is provided but is not a child of `parent`.
       * See {@link _insertBefore} for more details.
       * @since Modified in DOM L2
       */
      insertBefore: function(newChild, refChild) {
        return _insertBefore(this, newChild, refChild);
      },
      /**
       * Replaces an old child node with a new child node within this node.
       *
       * @param {Node} newChild
       * The new node that is to replace the old node.
       * If it already exists in the DOM, it is removed from its original position.
       * @param {Node} oldChild
       * The existing child node to be replaced.
       * @returns {Node}
       * Returns the replaced child node.
       * @throws {DOMException}
       * Throws a DOMException if replacing the node would result in a DOM tree that is not
       * well-formed, or if `oldChild` is not a child of `this`.
       * This can also occur if the pre-replacement validity assertion fails.
       * See {@link _insertBefore}, {@link Node.removeChild}, and
       * {@link assertPreReplacementValidityInDocument} for more details.
       * @see https://dom.spec.whatwg.org/#concept-node-replace
       */
      replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
        if (oldChild) {
          this.removeChild(oldChild);
        }
      },
      /**
       * Removes an existing child node from this node.
       *
       * @param {Node} oldChild
       * The child node to be removed.
       * @returns {Node}
       * Returns the removed child node.
       * @throws {DOMException}
       * Throws a DOMException if `oldChild` is not a child of `this`.
       * See {@link _removeChild} for more details.
       */
      removeChild: function(oldChild) {
        return _removeChild(this, oldChild);
      },
      /**
       * Appends a child node to this node.
       *
       * @param {Node} newChild
       * The child node to be appended to this node.
       * If it already exists in the DOM, it is removed from its original position.
       * @returns {Node}
       * Returns the appended child node.
       * @throws {DOMException}
       * Throws a DOMException if appending the node would result in a DOM tree that is not
       * well-formed, or if `newChild` is not a valid Node.
       * See {@link insertBefore} for more details.
       */
      appendChild: function(newChild) {
        return this.insertBefore(newChild, null);
      },
      /**
       * Determines whether this node has any child nodes.
       *
       * @returns {boolean}
       * Returns true if this node has any child nodes, and false otherwise.
       */
      hasChildNodes: function() {
        return this.firstChild != null;
      },
      /**
       * Creates a copy of the calling node.
       *
       * @param {boolean} deep
       * If true, the contents of the node are recursively copied.
       * If false, only the node itself (and its attributes, if it is an element) are copied.
       * @returns {Node}
       * Returns the newly created copy of the node.
       * @throws {DOMException}
       * May throw a DOMException if operations within {@link Element#setAttributeNode} or
       * {@link Node#appendChild} (which are potentially invoked in this method) do not meet their
       * specific constraints.
       * @see {@link cloneNode}
       */
      cloneNode: function(deep) {
        return cloneNode(this.ownerDocument || this, this, deep);
      },
      /**
       * Puts the specified node and all of its subtree into a "normalized" form. In a normalized
       * subtree, no text nodes in the subtree are empty and there are no adjacent text nodes.
       *
       * Specifically, this method merges any adjacent text nodes (i.e., nodes for which `nodeType`
       * is `TEXT_NODE`) into a single node with the combined data. It also removes any empty text
       * nodes.
       *
       * This method iterativly traverses all child nodes to normalize all descendent nodes within
       * the subtree.
       *
       * @throws {DOMException}
       * May throw a DOMException if operations within removeChild or appendData (which are
       * potentially invoked in this method) do not meet their specific constraints.
       * @since Modified in DOM Level 2
       * @see {@link Node.removeChild}
       * @see {@link CharacterData.appendData}
       * @see ../docs/walk-dom.md.
       */
      normalize: function() {
        walkDOM(this, null, {
          enter: function(node) {
            var child = node.firstChild;
            while (child) {
              var next = child.nextSibling;
              if (next !== null && next.nodeType === TEXT_NODE && child.nodeType === TEXT_NODE) {
                node.removeChild(next);
                child.appendData(next.data);
              } else {
                child = next;
              }
            }
            return true;
          }
        });
      },
      /**
       * Checks whether the DOM implementation implements a specific feature and its version.
       *
       * @deprecated
       * Since `DOMImplementation.hasFeature` is deprecated and always returns true.
       * @param {string} feature
       * The package name of the feature to test. This is the same name that can be passed to the
       * method `hasFeature` on `DOMImplementation`.
       * @param {string} version
       * This is the version number of the package name to test.
       * @returns {boolean}
       * Returns true in all cases in the current implementation.
       * @since Introduced in DOM Level 2
       * @see {@link DOMImplementation.hasFeature}
       */
      isSupported: function(feature, version) {
        return this.ownerDocument.implementation.hasFeature(feature, version);
      },
      /**
       * Look up the prefix associated to the given namespace URI, starting from this node.
       * **The default namespace declarations are ignored by this method.**
       * See Namespace Prefix Lookup for details on the algorithm used by this method.
       *
       * **This behavior is different from the in the specs**:
       * - no node type specific handling
       * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
       *
       * @param {string | null} namespaceURI
       * The namespace URI for which to find the associated prefix.
       * @returns {string | null}
       * The associated prefix, if found; otherwise, null.
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
       * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
       * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
       * @see https://github.com/xmldom/xmldom/issues/322
       * @prettierignore
       */
      lookupPrefix: function(namespaceURI) {
        var el = this;
        while (el) {
          var map2 = el._nsMap;
          if (map2) {
            for (var n in map2) {
              if (hasOwn(map2, n) && map2[n] === namespaceURI) {
                return n;
              }
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      /**
       * This function is used to look up the namespace URI associated with the given prefix,
       * starting from this node.
       *
       * **This behavior is different from the in the specs**:
       * - no node type specific handling
       * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
       *
       * @param {string | null} prefix
       * The prefix for which to find the associated namespace URI.
       * @returns {string | null}
       * The associated namespace URI, if found; otherwise, null.
       * @since DOM Level 3
       * @see https://dom.spec.whatwg.org/#dom-node-lookupnamespaceuri
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI
       * @prettierignore
       */
      lookupNamespaceURI: function(prefix2) {
        var el = this;
        while (el) {
          var map2 = el._nsMap;
          if (map2) {
            if (hasOwn(map2, prefix2)) {
              return map2[prefix2];
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      /**
       * Determines whether the given namespace URI is the default namespace.
       *
       * The function works by looking up the prefix associated with the given namespace URI. If no
       * prefix is found (i.e., the namespace URI is not registered in the namespace map of this
       * node or any of its ancestors), it returns `true`, implying the namespace URI is considered
       * the default.
       *
       * **This behavior is different from the in the specs**:
       * - no node type specific handling
       * - uses the internal attribute _nsMap for resolving namespaces that is updated when changing attributes
       *
       * @param {string | null} namespaceURI
       * The namespace URI to be checked.
       * @returns {boolean}
       * Returns true if the given namespace URI is the default namespace, false otherwise.
       * @since DOM Level 3
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace
       * @see https://dom.spec.whatwg.org/#dom-node-isdefaultnamespace
       * @prettierignore
       */
      isDefaultNamespace: function(namespaceURI) {
        var prefix2 = this.lookupPrefix(namespaceURI);
        return prefix2 == null;
      },
      /**
       * Compares the reference node with a node with regard to their position in the document and
       * according to the document order.
       *
       * @param {Node} other
       * The node to compare the reference node to.
       * @returns {number}
       * Returns how the node is positioned relatively to the reference node according to the
       * bitmask. 0 if reference node and given node are the same.
       * @since DOM Level 3
       * @see https://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-compare
       * @see https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
       */
      compareDocumentPosition: function(other) {
        if (this === other) return 0;
        var node1 = other;
        var node2 = this;
        var attr1 = null;
        var attr2 = null;
        if (node1 instanceof Attr) {
          attr1 = node1;
          node1 = attr1.ownerElement;
        }
        if (node2 instanceof Attr) {
          attr2 = node2;
          node2 = attr2.ownerElement;
          if (attr1 && node1 && node2 === node1) {
            for (var i = 0, attr; attr = node2.attributes[i]; i++) {
              if (attr === attr1)
                return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
              if (attr === attr2)
                return DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
            }
          }
        }
        if (!node1 || !node2 || node2.ownerDocument !== node1.ownerDocument) {
          return DocumentPosition.DOCUMENT_POSITION_DISCONNECTED + DocumentPosition.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + (docGUID(node2.ownerDocument) > docGUID(node1.ownerDocument) ? DocumentPosition.DOCUMENT_POSITION_FOLLOWING : DocumentPosition.DOCUMENT_POSITION_PRECEDING);
        }
        if (attr2 && node1 === node2) {
          return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
        }
        if (attr1 && node1 === node2) {
          return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
        }
        var chain1 = [];
        var ancestor1 = node1.parentNode;
        while (ancestor1) {
          if (!attr2 && ancestor1 === node2) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINED_BY + DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          }
          chain1.push(ancestor1);
          ancestor1 = ancestor1.parentNode;
        }
        chain1.reverse();
        var chain2 = [];
        var ancestor2 = node2.parentNode;
        while (ancestor2) {
          if (!attr1 && ancestor2 === node1) {
            return DocumentPosition.DOCUMENT_POSITION_CONTAINS + DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          }
          chain2.push(ancestor2);
          ancestor2 = ancestor2.parentNode;
        }
        chain2.reverse();
        var ca = commonAncestor(chain1, chain2);
        for (var n in ca.childNodes) {
          var child = ca.childNodes[n];
          if (child === node2) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          if (child === node1) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
          if (chain2.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_FOLLOWING;
          if (chain1.indexOf(child) >= 0) return DocumentPosition.DOCUMENT_POSITION_PRECEDING;
        }
        return 0;
      }
    };
    function _xmlEncoder(c) {
      return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
    }
    copy(NodeType, Node);
    copy(NodeType, Node.prototype);
    copy(DocumentPosition, Node);
    copy(DocumentPosition, Node.prototype);
    function _visitNode(node, callback) {
      walkDOM(node, null, {
        enter: function(n) {
          return callback(n) ? walkDOM.STOP : true;
        }
      });
    }
    function walkDOM(node, context, callbacks) {
      var stack = [{ node, context, phase: walkDOM.ENTER }];
      while (stack.length > 0) {
        var frame = stack.pop();
        if (frame.phase === walkDOM.ENTER) {
          var childContext = callbacks.enter(frame.node, frame.context);
          if (childContext === walkDOM.STOP) {
            return walkDOM.STOP;
          }
          stack.push({ node: frame.node, context: childContext, phase: walkDOM.EXIT });
          if (childContext === null || childContext === void 0) {
            continue;
          }
          var child = frame.node.lastChild;
          while (child) {
            stack.push({ node: child, context: childContext, phase: walkDOM.ENTER });
            child = child.previousSibling;
          }
        } else {
          if (callbacks.exit) {
            callbacks.exit(frame.node, frame.context);
          }
        }
      }
    }
    walkDOM.STOP = /* @__PURE__ */ Symbol("walkDOM.STOP");
    walkDOM.ENTER = 0;
    walkDOM.EXIT = 1;
    function Document(symbol, options) {
      checkSymbol(symbol);
      var opt = options || {};
      this.ownerDocument = this;
      this.contentType = opt.contentType || MIME_TYPE.XML_APPLICATION;
      this.type = isHTMLMimeType(this.contentType) ? "html" : "xml";
    }
    function _onAddAttribute(doc, el, newAttr) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns === NAMESPACE.XMLNS) {
        el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
      }
    }
    function _onRemoveAttribute(doc, el, newAttr, remove) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns === NAMESPACE.XMLNS) {
        delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
      }
    }
    function _onUpdateChild(doc, parent, newChild) {
      if (doc && doc._inc) {
        doc._inc++;
        var childNodes = parent.childNodes;
        if (newChild && !newChild.nextSibling) {
          childNodes[childNodes.length++] = newChild;
        } else {
          var child = parent.firstChild;
          var i = 0;
          while (child) {
            childNodes[i++] = child;
            child = child.nextSibling;
          }
          childNodes.length = i;
          delete childNodes[childNodes.length];
        }
      }
    }
    function _removeChild(parentNode, child) {
      if (parentNode !== child.parentNode) {
        throw new DOMException(DOMException.NOT_FOUND_ERR, "child's parent is not parent");
      }
      var oldPreviousSibling = child.previousSibling;
      var oldNextSibling = child.nextSibling;
      if (oldPreviousSibling) {
        oldPreviousSibling.nextSibling = oldNextSibling;
      } else {
        parentNode.firstChild = oldNextSibling;
      }
      if (oldNextSibling) {
        oldNextSibling.previousSibling = oldPreviousSibling;
      } else {
        parentNode.lastChild = oldPreviousSibling;
      }
      _onUpdateChild(parentNode.ownerDocument, parentNode);
      child.parentNode = null;
      child.previousSibling = null;
      child.nextSibling = null;
      return child;
    }
    function hasValidParentNodeType(node) {
      return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
    }
    function hasInsertableNodeType(node) {
      return node && (node.nodeType === Node.CDATA_SECTION_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.DOCUMENT_TYPE_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE || node.nodeType === Node.TEXT_NODE);
    }
    function isDocTypeNode(node) {
      return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
    }
    function isElementNode(node) {
      return node && node.nodeType === Node.ELEMENT_NODE;
    }
    function isTextNode(node) {
      return node && node.nodeType === Node.TEXT_NODE;
    }
    function isElementInsertionPossible(doc, child) {
      var parentChildNodes = doc.childNodes || [];
      if (find2(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
        return false;
      }
      var docTypeNode = find2(parentChildNodes, isDocTypeNode);
      return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
    }
    function isElementReplacementPossible(doc, child) {
      var parentChildNodes = doc.childNodes || [];
      function hasElementChildThatIsNotChild(node) {
        return isElementNode(node) && node !== child;
      }
      if (find2(parentChildNodes, hasElementChildThatIsNotChild)) {
        return false;
      }
      var docTypeNode = find2(parentChildNodes, isDocTypeNode);
      return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
    }
    function assertPreInsertionValidity1to5(parent, node, child) {
      if (!hasValidParentNodeType(parent)) {
        throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
      }
      if (child && child.parentNode !== parent) {
        throw new DOMException(DOMException.NOT_FOUND_ERR, "child not in parent");
      }
      if (
        // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
        !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
        // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
        // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
        // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
        isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE
      ) {
        throw new DOMException(
          DOMException.HIERARCHY_REQUEST_ERR,
          "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
        );
      }
    }
    function assertPreInsertionValidityInDocument(parent, node, child) {
      var parentChildNodes = parent.childNodes || [];
      var nodeChildNodes = node.childNodes || [];
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var nodeChildElements = nodeChildNodes.filter(isElementNode);
        if (nodeChildElements.length > 1 || find2(nodeChildNodes, isTextNode)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
        }
        if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
      }
      if (isElementNode(node)) {
        if (!isElementInsertionPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        }
      }
      if (isDocTypeNode(node)) {
        if (find2(parentChildNodes, isDocTypeNode)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
        }
        var parentElementChild = find2(parentChildNodes, isElementNode);
        if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
        if (!child && parentElementChild) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
        }
      }
    }
    function assertPreReplacementValidityInDocument(parent, node, child) {
      var parentChildNodes = parent.childNodes || [];
      var nodeChildNodes = node.childNodes || [];
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var nodeChildElements = nodeChildNodes.filter(isElementNode);
        if (nodeChildElements.length > 1 || find2(nodeChildNodes, isTextNode)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
        }
        if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
      }
      if (isElementNode(node)) {
        if (!isElementReplacementPossible(parent, child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        }
      }
      if (isDocTypeNode(node)) {
        let hasDoctypeChildThatIsNotChild = function(node2) {
          return isDocTypeNode(node2) && node2 !== child;
        };
        if (find2(parentChildNodes, hasDoctypeChildThatIsNotChild)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
        }
        var parentElementChild = find2(parentChildNodes, isElementNode);
        if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
          throw new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
      }
    }
    function _insertBefore(parent, node, child, _inDocumentAssertion) {
      assertPreInsertionValidity1to5(parent, node, child);
      if (parent.nodeType === Node.DOCUMENT_NODE) {
        (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
      }
      var cp = node.parentNode;
      if (cp) {
        cp.removeChild(node);
      }
      if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        var newFirst = node.firstChild;
        if (newFirst == null) {
          return node;
        }
        var newLast = node.lastChild;
      } else {
        newFirst = newLast = node;
      }
      var pre = child ? child.previousSibling : parent.lastChild;
      newFirst.previousSibling = pre;
      newLast.nextSibling = child;
      if (pre) {
        pre.nextSibling = newFirst;
      } else {
        parent.firstChild = newFirst;
      }
      if (child == null) {
        parent.lastChild = newLast;
      } else {
        child.previousSibling = newLast;
      }
      do {
        newFirst.parentNode = parent;
      } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
      _onUpdateChild(parent.ownerDocument || parent, parent, node);
      if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
        node.firstChild = node.lastChild = null;
      }
      return node;
    }
    Document.prototype = {
      /**
       * The implementation that created this document.
       *
       * @type DOMImplementation
       * @readonly
       */
      implementation: null,
      nodeName: "#document",
      nodeType: DOCUMENT_NODE,
      /**
       * The DocumentType node of the document.
       *
       * @type DocumentType
       * @readonly
       */
      doctype: null,
      documentElement: null,
      _inc: 1,
      insertBefore: function(newChild, refChild) {
        if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
          var child = newChild.firstChild;
          while (child) {
            var next = child.nextSibling;
            this.insertBefore(child, refChild);
            child = next;
          }
          return newChild;
        }
        _insertBefore(this, newChild, refChild);
        newChild.ownerDocument = this;
        if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
          this.documentElement = newChild;
        }
        return newChild;
      },
      removeChild: function(oldChild) {
        var removed = _removeChild(this, oldChild);
        if (removed === this.documentElement) {
          this.documentElement = null;
        }
        return removed;
      },
      replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
        newChild.ownerDocument = this;
        if (oldChild) {
          this.removeChild(oldChild);
        }
        if (isElementNode(newChild)) {
          this.documentElement = newChild;
        }
      },
      /**
       * Imports a node from another document into this document, creating a new copy owned by this
       * document. The source node and its subtree are not modified.
       *
       * @param {Node} importedNode
       * The node to import.
       * @param {boolean} deep
       * If true, the contents of the node are recursively imported.
       * If false, only the node itself (and its attributes, if it is an element) are imported.
       * @returns {Node}
       * Returns the newly created import of the node.
       * @see {@link importNode}
       * @see {@link https://dom.spec.whatwg.org/#dom-document-importnode}
       */
      importNode: function(importedNode, deep) {
        return importNode(this, importedNode, deep);
      },
      // Introduced in DOM Level 2:
      getElementById: function(id) {
        var rtv = null;
        _visitNode(this.documentElement, function(node) {
          if (node.nodeType == ELEMENT_NODE) {
            if (node.getAttribute("id") == id) {
              rtv = node;
              return true;
            }
          }
        });
        return rtv;
      },
      /**
       * Creates a new `Element` that is owned by this `Document`.
       * In HTML Documents `localName` is the lower cased `tagName`,
       * otherwise no transformation is being applied.
       * When `contentType` implies the HTML namespace, it will be set as `namespaceURI`.
       *
       * __This implementation differs from the specification:__ - The provided name is not checked
       * against the `Name` production,
       * so no related error will be thrown.
       * - There is no interface `HTMLElement`, it is always an `Element`.
       * - There is no support for a second argument to indicate using custom elements.
       *
       * @param {string} tagName
       * @returns {Element}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
       * @see https://dom.spec.whatwg.org/#dom-document-createelement
       * @see https://dom.spec.whatwg.org/#concept-create-element
       */
      createElement: function(tagName) {
        var node = new Element(PDC);
        node.ownerDocument = this;
        if (this.type === "html") {
          tagName = tagName.toLowerCase();
        }
        if (hasDefaultHTMLNamespace(this.contentType)) {
          node.namespaceURI = NAMESPACE.HTML;
        }
        node.nodeName = tagName;
        node.tagName = tagName;
        node.localName = tagName;
        node.childNodes = new NodeList();
        var attrs = node.attributes = new NamedNodeMap();
        attrs._ownerElement = node;
        return node;
      },
      /**
       * @returns {DocumentFragment}
       */
      createDocumentFragment: function() {
        var node = new DocumentFragment(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        return node;
      },
      /**
       * @param {string} data
       * @returns {Text}
       */
      createTextNode: function(data) {
        var node = new Text(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.appendData(data);
        return node;
      },
      /**
       * @param {string} data
       * @returns {Comment}
       * @see https://dom.spec.whatwg.org/#dom-document-createcomment
       * @see https://www.w3.org/TR/xml/#NT-Comment XML 1.0 production [15]
       * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.3
       *
       *      Note: no validation is performed at creation time. When the resulting document is
       *      serialized with `requireWellFormed: true`, the serializer throws `InvalidStateError`
       *      if the comment data contains `--` anywhere, ends with `-`, or contains characters
       *      outside the XML Char production (W3C DOM Parsing §3.2.1.3). Without that option the
       *      data is emitted verbatim.
       */
      createComment: function(data) {
        var node = new Comment(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.appendData(data);
        return node;
      },
      /**
       * Returns a new CDATASection node whose data is `data`.
       *
       * __This implementation differs from the specification:__ - calling this method on an HTML
       * document does not throw `NotSupportedError`.
       *
       * @param {string} data
       * @returns {CDATASection}
       * @throws {DOMException}
       * With code `INVALID_CHARACTER_ERR` if `data` contains `"]]>"`.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createCDATASection
       * @see https://dom.spec.whatwg.org/#dom-document-createcdatasection
       */
      createCDATASection: function(data) {
        if (data.indexOf("]]>") !== -1) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'data contains "]]>"');
        }
        var node = new CDATASection(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.appendData(data);
        return node;
      },
      /**
       * Returns a ProcessingInstruction node whose target is target and data is data.
       *
       * __This behavior is slightly different from the in the specs__:
       * - it does not do any input validation on the arguments and doesn't throw
       * "InvalidCharacterError".
       *
       * Note: When the resulting document is serialized with `requireWellFormed: true`, the
       * serializer throws `InvalidStateError` if `.target` contains `:` or is an ASCII
       * case-insensitive match for `"xml"`, or if `.data` contains `?>` or characters outside the
       * XML Char production (W3C DOM Parsing §3.2.1.7). Without that option the data is emitted
       * verbatim.
       *
       * @param {string} target
       * @param {string} data
       * @returns {ProcessingInstruction}
       * @see https://developer.mozilla.org/docs/Web/API/Document/createProcessingInstruction
       * @see https://dom.spec.whatwg.org/#dom-document-createprocessinginstruction
       * @see https://www.w3.org/TR/DOM-Parsing/#dfn-concept-serialize-xml §3.2.1.7
       */
      createProcessingInstruction: function(target, data) {
        var node = new ProcessingInstruction(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.nodeName = node.target = target;
        node.nodeValue = node.data = data;
        return node;
      },
      /**
       * Creates an `Attr` node that is owned by this document.
       * In HTML Documents `localName` is the lower cased `name`,
       * otherwise no transformation is being applied.
       *
       * __This implementation differs from the specification:__ - The provided name is not checked
       * against the `Name` production,
       * so no related error will be thrown.
       *
       * @param {string} name
       * @returns {Attr}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createAttribute
       * @see https://dom.spec.whatwg.org/#dom-document-createattribute
       */
      createAttribute: function(name2) {
        if (!g.QName_exact.test(name2)) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'invalid character in name "' + name2 + '"');
        }
        if (this.type === "html") {
          name2 = name2.toLowerCase();
        }
        return this._createAttribute(name2);
      },
      _createAttribute: function(name2) {
        var node = new Attr(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.name = name2;
        node.nodeName = name2;
        node.localName = name2;
        node.specified = true;
        return node;
      },
      /**
       * Creates an EntityReference object.
       * The current implementation does not fill the `childNodes` with those of the corresponding
       * `Entity`
       *
       * @deprecated
       * In DOM Level 4.
       * @param {string} name
       * The name of the entity to reference. No namespace well-formedness checks are performed.
       * @returns {EntityReference}
       * @throws {DOMException}
       * With code `INVALID_CHARACTER_ERR` when `name` is not valid.
       * @throws {DOMException}
       * with code `NOT_SUPPORTED_ERR` when the document is of type `html`
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
       */
      createEntityReference: function(name2) {
        if (!g.Name.test(name2)) {
          throw new DOMException(DOMException.INVALID_CHARACTER_ERR, 'not a valid xml name "' + name2 + '"');
        }
        if (this.type === "html") {
          throw new DOMException("document is an html document", DOMExceptionName.NotSupportedError);
        }
        var node = new EntityReference(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.nodeName = name2;
        return node;
      },
      // Introduced in DOM Level 2:
      /**
       * @param {string} namespaceURI
       * @param {string} qualifiedName
       * @returns {Element}
       */
      createElementNS: function(namespaceURI, qualifiedName) {
        var validated = validateAndExtract(namespaceURI, qualifiedName);
        var node = new Element(PDC);
        var attrs = node.attributes = new NamedNodeMap();
        node.childNodes = new NodeList();
        node.ownerDocument = this;
        node.nodeName = qualifiedName;
        node.tagName = qualifiedName;
        node.namespaceURI = validated[0];
        node.prefix = validated[1];
        node.localName = validated[2];
        attrs._ownerElement = node;
        return node;
      },
      // Introduced in DOM Level 2:
      /**
       * @param {string} namespaceURI
       * @param {string} qualifiedName
       * @returns {Attr}
       */
      createAttributeNS: function(namespaceURI, qualifiedName) {
        var validated = validateAndExtract(namespaceURI, qualifiedName);
        var node = new Attr(PDC);
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        node.nodeName = qualifiedName;
        node.name = qualifiedName;
        node.specified = true;
        node.namespaceURI = validated[0];
        node.prefix = validated[1];
        node.localName = validated[2];
        return node;
      }
    };
    _extends(Document, Node);
    function Element(symbol) {
      checkSymbol(symbol);
      this._nsMap = /* @__PURE__ */ Object.create(null);
    }
    Element.prototype = {
      nodeType: ELEMENT_NODE,
      /**
       * The attributes of this element.
       *
       * @type {NamedNodeMap | null}
       */
      attributes: null,
      getQualifiedName: function() {
        return this.prefix ? this.prefix + ":" + this.localName : this.localName;
      },
      _isInHTMLDocumentAndNamespace: function() {
        return this.ownerDocument.type === "html" && this.namespaceURI === NAMESPACE.HTML;
      },
      /**
       * Implementaton of Level2 Core function hasAttributes.
       *
       * @returns {boolean}
       * True if attribute list is not empty.
       * @see https://www.w3.org/TR/DOM-Level-2-Core/#core-ID-NodeHasAttrs
       */
      hasAttributes: function() {
        return !!(this.attributes && this.attributes.length);
      },
      hasAttribute: function(name2) {
        return !!this.getAttributeNode(name2);
      },
      /**
       * Returns element’s first attribute whose qualified name is `name`, and `null`
       * if there is no such attribute.
       *
       * @param {string} name
       * @returns {string | null}
       */
      getAttribute: function(name2) {
        var attr = this.getAttributeNode(name2);
        return attr ? attr.value : null;
      },
      getAttributeNode: function(name2) {
        if (this._isInHTMLDocumentAndNamespace()) {
          name2 = name2.toLowerCase();
        }
        return this.attributes.getNamedItem(name2);
      },
      /**
       * Sets the value of element’s first attribute whose qualified name is qualifiedName to value.
       *
       * @param {string} name
       * @param {string} value
       */
      setAttribute: function(name2, value) {
        if (this._isInHTMLDocumentAndNamespace()) {
          name2 = name2.toLowerCase();
        }
        var attr = this.getAttributeNode(name2);
        if (attr) {
          attr.value = attr.nodeValue = "" + value;
        } else {
          attr = this.ownerDocument._createAttribute(name2);
          attr.value = attr.nodeValue = "" + value;
          this.setAttributeNode(attr);
        }
      },
      removeAttribute: function(name2) {
        var attr = this.getAttributeNode(name2);
        attr && this.removeAttributeNode(attr);
      },
      setAttributeNode: function(newAttr) {
        return this.attributes.setNamedItem(newAttr);
      },
      setAttributeNodeNS: function(newAttr) {
        return this.attributes.setNamedItemNS(newAttr);
      },
      removeAttributeNode: function(oldAttr) {
        return this.attributes.removeNamedItem(oldAttr.nodeName);
      },
      //get real attribute name,and remove it by removeAttributeNode
      removeAttributeNS: function(namespaceURI, localName) {
        var old = this.getAttributeNodeNS(namespaceURI, localName);
        old && this.removeAttributeNode(old);
      },
      hasAttributeNS: function(namespaceURI, localName) {
        return this.getAttributeNodeNS(namespaceURI, localName) != null;
      },
      /**
       * Returns element’s attribute whose namespace is `namespaceURI` and local name is
       * `localName`,
       * or `null` if there is no such attribute.
       *
       * @param {string} namespaceURI
       * @param {string} localName
       * @returns {string | null}
       */
      getAttributeNS: function(namespaceURI, localName) {
        var attr = this.getAttributeNodeNS(namespaceURI, localName);
        return attr ? attr.value : null;
      },
      /**
       * Sets the value of element’s attribute whose namespace is `namespaceURI` and local name is
       * `localName` to value.
       *
       * @param {string} namespaceURI
       * @param {string} qualifiedName
       * @param {string} value
       * @see https://dom.spec.whatwg.org/#dom-element-setattributens
       */
      setAttributeNS: function(namespaceURI, qualifiedName, value) {
        var validated = validateAndExtract(namespaceURI, qualifiedName);
        var localName = validated[2];
        var attr = this.getAttributeNodeNS(namespaceURI, localName);
        if (attr) {
          attr.value = attr.nodeValue = "" + value;
        } else {
          attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
          attr.value = attr.nodeValue = "" + value;
          this.setAttributeNode(attr);
        }
      },
      getAttributeNodeNS: function(namespaceURI, localName) {
        return this.attributes.getNamedItemNS(namespaceURI, localName);
      },
      /**
       * Returns a LiveNodeList of all child elements which have **all** of the given class name(s).
       *
       * Returns an empty list if `classNames` is an empty string or only contains HTML white space
       * characters.
       *
       * Warning: This returns a live LiveNodeList.
       * Changes in the DOM will reflect in the array as the changes occur.
       * If an element selected by this array no longer qualifies for the selector,
       * it will automatically be removed. Be aware of this for iteration purposes.
       *
       * @param {string} classNames
       * Is a string representing the class name(s) to match; multiple class names are separated by
       * (ASCII-)whitespace.
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByClassName
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
       * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
       */
      getElementsByClassName: function(classNames) {
        var classNamesSet = toOrderedSet(classNames);
        return new LiveNodeList(this, function(base) {
          var ls = [];
          if (classNamesSet.length > 0) {
            _visitNode(base, function(node) {
              if (node !== base && node.nodeType === ELEMENT_NODE) {
                var nodeClassNames = node.getAttribute("class");
                if (nodeClassNames) {
                  var matches = classNames === nodeClassNames;
                  if (!matches) {
                    var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                    matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                  }
                  if (matches) {
                    ls.push(node);
                  }
                }
              }
            });
          }
          return ls;
        });
      },
      /**
       * Returns a LiveNodeList of elements with the given qualifiedName.
       * Searching for all descendants can be done by passing `*` as `qualifiedName`.
       *
       * All descendants of the specified element are searched, but not the element itself.
       * The returned list is live, which means it updates itself with the DOM tree automatically.
       * Therefore, there is no need to call `Element.getElementsByTagName()`
       * with the same element and arguments repeatedly if the DOM changes in between calls.
       *
       * When called on an HTML element in an HTML document,
       * `getElementsByTagName` lower-cases the argument before searching for it.
       * This is undesirable when trying to match camel-cased SVG elements (such as
       * `<linearGradient>`) in an HTML document.
       * Instead, use `Element.getElementsByTagNameNS()`,
       * which preserves the capitalization of the tag name.
       *
       * `Element.getElementsByTagName` is similar to `Document.getElementsByTagName()`,
       * except that it only searches for elements that are descendants of the specified element.
       *
       * @param {string} qualifiedName
       * @returns {LiveNodeList}
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/getElementsByTagName
       * @see https://dom.spec.whatwg.org/#concept-getelementsbytagname
       */
      getElementsByTagName: function(qualifiedName) {
        var isHTMLDocument = (this.nodeType === DOCUMENT_NODE ? this : this.ownerDocument).type === "html";
        var lowerQualifiedName = qualifiedName.toLowerCase();
        return new LiveNodeList(this, function(base) {
          var ls = [];
          _visitNode(base, function(node) {
            if (node === base || node.nodeType !== ELEMENT_NODE) {
              return;
            }
            if (qualifiedName === "*") {
              ls.push(node);
            } else {
              var nodeQualifiedName = node.getQualifiedName();
              var matchingQName = isHTMLDocument && node.namespaceURI === NAMESPACE.HTML ? lowerQualifiedName : qualifiedName;
              if (nodeQualifiedName === matchingQName) {
                ls.push(node);
              }
            }
          });
          return ls;
        });
      },
      getElementsByTagNameNS: function(namespaceURI, localName) {
        return new LiveNodeList(this, function(base) {
          var ls = [];
          _visitNode(base, function(node) {
            if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
              ls.push(node);
            }
          });
          return ls;
        });
      }
    };
    Document.prototype.getElementsByClassName = Element.prototype.getElementsByClassName;
    Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
    Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
    _extends(Element, Node);
    function Attr(symbol) {
      checkSymbol(symbol);
      this.namespaceURI = null;
      this.prefix = null;
      this.ownerElement = null;
    }
    Attr.prototype.nodeType = ATTRIBUTE_NODE;
    _extends(Attr, Node);
    function CharacterData(symbol) {
      checkSymbol(symbol);
    }
    CharacterData.prototype = {
      data: "",
      substringData: function(offset, count) {
        return this.data.substring(offset, offset + count);
      },
      appendData: function(text) {
        text = this.data + text;
        this.nodeValue = this.data = text;
        this.length = text.length;
      },
      insertData: function(offset, text) {
        this.replaceData(offset, 0, text);
      },
      deleteData: function(offset, count) {
        this.replaceData(offset, count, "");
      },
      replaceData: function(offset, count, text) {
        var start = this.data.substring(0, offset);
        var end = this.data.substring(offset + count);
        text = start + text + end;
        this.nodeValue = this.data = text;
        this.length = text.length;
      }
    };
    _extends(CharacterData, Node);
    function Text(symbol) {
      checkSymbol(symbol);
    }
    Text.prototype = {
      nodeName: "#text",
      nodeType: TEXT_NODE,
      splitText: function(offset) {
        var text = this.data;
        var newText = text.substring(offset);
        text = text.substring(0, offset);
        this.data = this.nodeValue = text;
        this.length = text.length;
        var newNode = this.ownerDocument.createTextNode(newText);
        if (this.parentNode) {
          this.parentNode.insertBefore(newNode, this.nextSibling);
        }
        return newNode;
      }
    };
    _extends(Text, CharacterData);
    function Comment(symbol) {
      checkSymbol(symbol);
    }
    Comment.prototype = {
      nodeName: "#comment",
      nodeType: COMMENT_NODE
    };
    _extends(Comment, CharacterData);
    function CDATASection(symbol) {
      checkSymbol(symbol);
    }
    CDATASection.prototype = {
      nodeName: "#cdata-section",
      nodeType: CDATA_SECTION_NODE
    };
    _extends(CDATASection, Text);
    function DocumentType(symbol) {
      checkSymbol(symbol);
    }
    DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
    _extends(DocumentType, Node);
    function Notation(symbol) {
      checkSymbol(symbol);
    }
    Notation.prototype.nodeType = NOTATION_NODE;
    _extends(Notation, Node);
    function Entity(symbol) {
      checkSymbol(symbol);
    }
    Entity.prototype.nodeType = ENTITY_NODE;
    _extends(Entity, Node);
    function EntityReference(symbol) {
      checkSymbol(symbol);
    }
    EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
    _extends(EntityReference, Node);
    function DocumentFragment(symbol) {
      checkSymbol(symbol);
    }
    DocumentFragment.prototype.nodeName = "#document-fragment";
    DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
    _extends(DocumentFragment, Node);
    function ProcessingInstruction(symbol) {
      checkSymbol(symbol);
    }
    ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
    _extends(ProcessingInstruction, CharacterData);
    function XMLSerializer2() {
    }
    XMLSerializer2.prototype.serializeToString = function(node, options) {
      return nodeSerializeToString.call(node, options);
    };
    Node.prototype.toString = nodeSerializeToString;
    function nodeSerializeToString(options) {
      var opts;
      if (typeof options === "function") {
        opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: options };
      } else if (options != null) {
        opts = {
          requireWellFormed: !!options.requireWellFormed,
          splitCDATASections: options.splitCDATASections !== false,
          nodeFilter: options.nodeFilter || null
        };
      } else {
        opts = { requireWellFormed: false, splitCDATASections: true, nodeFilter: null };
      }
      var buf = [];
      var refNode = this.nodeType === DOCUMENT_NODE && this.documentElement || this;
      var prefix2 = refNode.prefix;
      var uri2 = refNode.namespaceURI;
      if (uri2 && prefix2 == null) {
        var prefix2 = refNode.lookupPrefix(uri2);
        if (prefix2 == null) {
          var visibleNamespaces = [
            { namespace: uri2, prefix: null }
            //{namespace:uri,prefix:''}
          ];
        }
      }
      serializeToString(this, buf, visibleNamespaces, opts);
      return buf.join("");
    }
    function needNamespaceDefine(node, isHTML, visibleNamespaces) {
      var prefix2 = node.prefix || "";
      var uri2 = node.namespaceURI;
      if (!uri2) {
        return false;
      }
      if (prefix2 === "xml" && uri2 === NAMESPACE.XML || uri2 === NAMESPACE.XMLNS) {
        return false;
      }
      var i = visibleNamespaces.length;
      while (i--) {
        var ns = visibleNamespaces[i];
        if (ns.prefix === prefix2) {
          return ns.namespace !== uri2;
        }
      }
      return true;
    }
    function addSerializedAttribute(buf, qualifiedName, value, requireWellFormed) {
      if (requireWellFormed && !g.QName_exact.test(qualifiedName)) {
        throw new DOMException(
          'The attribute name "' + qualifiedName + '" is not a valid XML QName',
          DOMExceptionName.InvalidStateError
        );
      }
      buf.push(" ", qualifiedName, '="', value.replace(/[<>&"\t\n\r]/g, _xmlEncoder), '"');
    }
    function serializeToString(node, buf, visibleNamespaces, opts) {
      if (!visibleNamespaces) {
        visibleNamespaces = [];
      }
      var nodeFilter = opts.nodeFilter;
      var requireWellFormed = opts.requireWellFormed;
      var splitCDATASections = opts.splitCDATASections;
      var doc = node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
      var isHTML = doc.type === "html";
      walkDOM(
        node,
        { ns: visibleNamespaces },
        {
          enter: function(n, ctx) {
            var namespaces = ctx.ns;
            if (nodeFilter) {
              n = nodeFilter(n);
              if (n) {
                if (typeof n == "string") {
                  buf.push(n);
                  return null;
                }
              } else {
                return null;
              }
            }
            switch (n.nodeType) {
              case ELEMENT_NODE:
                var attrs = n.attributes;
                var len = attrs.length;
                var nodeName = n.tagName;
                var prefixedNodeName = nodeName;
                if (!isHTML && !n.prefix && n.namespaceURI) {
                  var defaultNS;
                  for (var ai = 0; ai < attrs.length; ai++) {
                    if (attrs.item(ai).name === "xmlns") {
                      defaultNS = attrs.item(ai).value;
                      break;
                    }
                  }
                  if (!defaultNS) {
                    for (var nsi = namespaces.length - 1; nsi >= 0; nsi--) {
                      var nsEntry = namespaces[nsi];
                      if (nsEntry.prefix === "" && nsEntry.namespace === n.namespaceURI) {
                        defaultNS = nsEntry.namespace;
                        break;
                      }
                    }
                  }
                  if (defaultNS !== n.namespaceURI) {
                    for (var nsi = namespaces.length - 1; nsi >= 0; nsi--) {
                      var nsEntry = namespaces[nsi];
                      if (nsEntry.namespace === n.namespaceURI) {
                        if (nsEntry.prefix) {
                          prefixedNodeName = nsEntry.prefix + ":" + nodeName;
                        }
                        break;
                      }
                    }
                  }
                }
                if (requireWellFormed && !g.QName_exact.test(prefixedNodeName)) {
                  throw new DOMException(
                    'The element name "' + prefixedNodeName + '" is not a valid XML QName',
                    DOMExceptionName.InvalidStateError
                  );
                }
                buf.push("<", prefixedNodeName);
                var childNamespaces = namespaces.slice();
                for (var i = 0; i < len; i++) {
                  var attr = attrs.item(i);
                  if (attr.prefix == "xmlns") {
                    childNamespaces.push({
                      prefix: attr.localName,
                      namespace: attr.value
                    });
                  } else if (attr.nodeName == "xmlns") {
                    childNamespaces.push({ prefix: "", namespace: attr.value });
                  }
                }
                for (var i = 0; i < len; i++) {
                  var attr = attrs.item(i);
                  if (needNamespaceDefine(attr, isHTML, childNamespaces)) {
                    var attrPrefix = attr.prefix || "";
                    var uri2 = attr.namespaceURI;
                    addSerializedAttribute(buf, attrPrefix ? "xmlns:" + attrPrefix : "xmlns", uri2, requireWellFormed);
                    childNamespaces.push({ prefix: attrPrefix, namespace: uri2 });
                  }
                  var filteredAttr = nodeFilter ? nodeFilter(attr) : attr;
                  if (filteredAttr) {
                    if (typeof filteredAttr === "string") {
                      buf.push(filteredAttr);
                    } else {
                      addSerializedAttribute(buf, filteredAttr.name, filteredAttr.value, requireWellFormed);
                    }
                  }
                }
                if (nodeName === prefixedNodeName && needNamespaceDefine(n, isHTML, childNamespaces)) {
                  var nodePrefix = n.prefix || "";
                  var uri2 = n.namespaceURI;
                  addSerializedAttribute(buf, nodePrefix ? "xmlns:" + nodePrefix : "xmlns", uri2, requireWellFormed);
                  childNamespaces.push({ prefix: nodePrefix, namespace: uri2 });
                }
                var canCloseTag = !n.firstChild;
                if (canCloseTag && (isHTML || n.namespaceURI === NAMESPACE.HTML)) {
                  canCloseTag = isHTMLVoidElement(nodeName);
                }
                if (canCloseTag) {
                  buf.push("/>");
                  return null;
                }
                buf.push(">");
                if (isHTML && isHTMLRawTextElement(nodeName)) {
                  var child = n.firstChild;
                  while (child) {
                    if (child.data) {
                      buf.push(child.data);
                    } else {
                      serializeToString(child, buf, childNamespaces.slice(), opts);
                    }
                    child = child.nextSibling;
                  }
                  buf.push("</", prefixedNodeName, ">");
                  return null;
                }
                return { ns: childNamespaces, tag: prefixedNodeName };
              case DOCUMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                if (requireWellFormed && n.nodeType === DOCUMENT_NODE && n.documentElement == null) {
                  throw new DOMException("The Document has no documentElement", DOMExceptionName.InvalidStateError);
                }
                return { ns: namespaces };
              case ATTRIBUTE_NODE:
                addSerializedAttribute(buf, n.name, n.value, requireWellFormed);
                return null;
              case TEXT_NODE:
                if (requireWellFormed && g.InvalidChar.test(n.data)) {
                  throw new DOMException(
                    "The Text node data contains characters outside the XML Char production",
                    DOMExceptionName.InvalidStateError
                  );
                }
                buf.push(n.data.replace(/[<&>]/g, _xmlEncoder));
                return null;
              case CDATA_SECTION_NODE:
                if (requireWellFormed && n.data.indexOf("]]>") !== -1) {
                  throw new DOMException('The CDATASection data contains "]]>"', DOMExceptionName.InvalidStateError);
                }
                if (splitCDATASections) {
                  buf.push(g.CDATA_START, n.data.replace(/]]>/g, "]]]]><![CDATA[>"), g.CDATA_END);
                } else {
                  buf.push(g.CDATA_START, n.data, g.CDATA_END);
                }
                return null;
              case COMMENT_NODE:
                if (requireWellFormed) {
                  if (g.InvalidChar.test(n.data)) {
                    throw new DOMException(
                      "The comment node data contains characters outside the XML Char production",
                      DOMExceptionName.InvalidStateError
                    );
                  }
                  if (n.data.indexOf("--") !== -1 || n.data[n.data.length - 1] === "-") {
                    throw new DOMException(
                      'The comment node data contains "--" or ends with "-"',
                      DOMExceptionName.InvalidStateError
                    );
                  }
                }
                buf.push(g.COMMENT_START, n.data, g.COMMENT_END);
                return null;
              case DOCUMENT_TYPE_NODE:
                var pubid = n.publicId;
                var sysid = n.systemId;
                if (requireWellFormed) {
                  if (pubid && !g.PubidLiteral_match.test(pubid)) {
                    throw new DOMException("DocumentType publicId is not a valid PubidLiteral", DOMExceptionName.InvalidStateError);
                  }
                  if (sysid && sysid !== "." && !g.SystemLiteral_match.test(sysid)) {
                    throw new DOMException("DocumentType systemId is not a valid SystemLiteral", DOMExceptionName.InvalidStateError);
                  }
                  if (n.internalSubset && n.internalSubset.indexOf("]>") !== -1) {
                    throw new DOMException('DocumentType internalSubset contains "]>"', DOMExceptionName.InvalidStateError);
                  }
                }
                buf.push(g.DOCTYPE_DECL_START, " ", n.name);
                if (pubid) {
                  buf.push(" ", g.PUBLIC, " ", pubid);
                  if (sysid && sysid !== ".") {
                    buf.push(" ", sysid);
                  }
                } else if (sysid && sysid !== ".") {
                  buf.push(" ", g.SYSTEM, " ", sysid);
                }
                if (n.internalSubset) {
                  buf.push(" [", n.internalSubset, "]");
                }
                buf.push(">");
                return null;
              case PROCESSING_INSTRUCTION_NODE:
                if (requireWellFormed) {
                  if (n.target.indexOf(":") !== -1 || n.target.toLowerCase() === "xml") {
                    throw new DOMException("The ProcessingInstruction target is not well-formed", DOMExceptionName.InvalidStateError);
                  }
                  if (g.InvalidChar.test(n.data)) {
                    throw new DOMException(
                      "The ProcessingInstruction data contains characters outside the XML Char production",
                      DOMExceptionName.InvalidStateError
                    );
                  }
                  if (n.data.indexOf("?>") !== -1) {
                    throw new DOMException('The ProcessingInstruction data contains "?>"', DOMExceptionName.InvalidStateError);
                  }
                }
                buf.push("<?", n.target, " ", n.data, "?>");
                return null;
              case ENTITY_REFERENCE_NODE:
                buf.push("&", n.nodeName, ";");
                return null;
              //case ENTITY_NODE:
              //case NOTATION_NODE:
              default:
                buf.push("??", n.nodeName);
                return null;
            }
          },
          exit: function(n, childCtx) {
            if (childCtx && childCtx.tag) {
              buf.push("</", childCtx.tag, ">");
            }
          }
        }
      );
    }
    function importNode(doc, node, deep) {
      var destRoot;
      walkDOM(node, null, {
        enter: function(srcNode, destParent) {
          var destNode = srcNode.cloneNode(false);
          destNode.ownerDocument = doc;
          destNode.parentNode = null;
          if (destParent === null) {
            destRoot = destNode;
          } else {
            destParent.appendChild(destNode);
          }
          var shouldDeep = srcNode.nodeType === ATTRIBUTE_NODE || deep;
          return shouldDeep ? destNode : null;
        }
      });
      return destRoot;
    }
    function cloneNode(doc, node, deep) {
      var destRoot;
      walkDOM(node, null, {
        enter: function(srcNode, destParent) {
          var destNode = new srcNode.constructor(PDC);
          for (var n in srcNode) {
            if (hasOwn(srcNode, n)) {
              var v = srcNode[n];
              if (typeof v != "object") {
                if (v != destNode[n]) {
                  destNode[n] = v;
                }
              }
            }
          }
          if (srcNode.childNodes) {
            destNode.childNodes = new NodeList();
          }
          destNode.ownerDocument = doc;
          var shouldDeep = deep;
          switch (destNode.nodeType) {
            case ELEMENT_NODE:
              var attrs = srcNode.attributes;
              var attrs2 = destNode.attributes = new NamedNodeMap();
              var len = attrs.length;
              attrs2._ownerElement = destNode;
              for (var i = 0; i < len; i++) {
                destNode.setAttributeNode(cloneNode(doc, attrs.item(i), true));
              }
              break;
            case ATTRIBUTE_NODE:
              shouldDeep = true;
          }
          if (destParent !== null) {
            destParent.appendChild(destNode);
          } else {
            destRoot = destNode;
          }
          return shouldDeep ? destNode : null;
        }
      });
      return destRoot;
    }
    function __set__(object, key, value) {
      object[key] = value;
    }
    function childrenRefresh(node) {
      var ls = [];
      var child = node.firstChild;
      while (child) {
        if (child.nodeType === ELEMENT_NODE) {
          ls.push(child);
        }
        child = child.nextSibling;
      }
      return ls;
    }
    try {
      if (Object.defineProperty) {
        Object.defineProperty(LiveNodeList.prototype, "length", {
          get: function() {
            _updateLiveList(this);
            return this.$$length;
          }
        });
        Object.defineProperty(Node.prototype, "textContent", {
          get: function() {
            if (this.nodeType === ELEMENT_NODE || this.nodeType === DOCUMENT_FRAGMENT_NODE) {
              var buf = [];
              walkDOM(this, null, {
                enter: function(n) {
                  if (n.nodeType === ELEMENT_NODE || n.nodeType === DOCUMENT_FRAGMENT_NODE) {
                    return true;
                  }
                  if (n.nodeType === PROCESSING_INSTRUCTION_NODE || n.nodeType === COMMENT_NODE) {
                    return null;
                  }
                  buf.push(n.nodeValue);
                }
              });
              return buf.join("");
            }
            return this.nodeValue;
          },
          set: function(data) {
            switch (this.nodeType) {
              case ELEMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                while (this.firstChild) {
                  this.removeChild(this.firstChild);
                }
                if (data || String(data)) {
                  this.appendChild(this.ownerDocument.createTextNode(data));
                }
                break;
              default:
                this.data = data;
                this.value = data;
                this.nodeValue = data;
            }
          }
        });
        Object.defineProperty(CharacterData.prototype, "data", {
          get: function() {
            return this._data != null ? this._data : "";
          },
          set: function(v) {
            this._data = v;
            this.length = typeof v === "string" ? v.length : 0;
          }
        });
        Object.defineProperty(CharacterData.prototype, "nodeValue", {
          get: function() {
            return this.data;
          },
          set: function(v) {
            this.data = v;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Element.prototype, "children", {
          get: function() {
            return new LiveNodeList(this, childrenRefresh);
          }
        });
        Object.defineProperty(Document.prototype, "children", {
          get: function() {
            return new LiveNodeList(this, childrenRefresh);
          }
        });
        Object.defineProperty(DocumentFragment.prototype, "children", {
          get: function() {
            return new LiveNodeList(this, childrenRefresh);
          }
        });
        __set__ = function(object, key, value) {
          object["$$" + key] = value;
        };
      }
    } catch (e) {
    }
    exports._updateLiveList = _updateLiveList;
    exports.Attr = Attr;
    exports.CDATASection = CDATASection;
    exports.CharacterData = CharacterData;
    exports.Comment = Comment;
    exports.Document = Document;
    exports.DocumentFragment = DocumentFragment;
    exports.DocumentType = DocumentType;
    exports.DOMImplementation = DOMImplementation;
    exports.Element = Element;
    exports.Entity = Entity;
    exports.EntityReference = EntityReference;
    exports.LiveNodeList = LiveNodeList;
    exports.NamedNodeMap = NamedNodeMap;
    exports.Node = Node;
    exports.NodeList = NodeList;
    exports.Notation = Notation;
    exports.Text = Text;
    exports.ProcessingInstruction = ProcessingInstruction;
    exports.walkDOM = walkDOM;
    exports.XMLSerializer = XMLSerializer2;
  }
});

// node_modules/@xmldom/xmldom/lib/entities.js
var require_entities = __commonJS({
  "node_modules/@xmldom/xmldom/lib/entities.js"(exports) {
    "use strict";
    var freeze = require_conventions().freeze;
    exports.XML_ENTITIES = freeze({
      amp: "&",
      apos: "'",
      gt: ">",
      lt: "<",
      quot: '"'
    });
    exports.HTML_ENTITIES = freeze({
      Aacute: "\xC1",
      aacute: "\xE1",
      Abreve: "\u0102",
      abreve: "\u0103",
      ac: "\u223E",
      acd: "\u223F",
      acE: "\u223E\u0333",
      Acirc: "\xC2",
      acirc: "\xE2",
      acute: "\xB4",
      Acy: "\u0410",
      acy: "\u0430",
      AElig: "\xC6",
      aelig: "\xE6",
      af: "\u2061",
      Afr: "\u{1D504}",
      afr: "\u{1D51E}",
      Agrave: "\xC0",
      agrave: "\xE0",
      alefsym: "\u2135",
      aleph: "\u2135",
      Alpha: "\u0391",
      alpha: "\u03B1",
      Amacr: "\u0100",
      amacr: "\u0101",
      amalg: "\u2A3F",
      AMP: "&",
      amp: "&",
      And: "\u2A53",
      and: "\u2227",
      andand: "\u2A55",
      andd: "\u2A5C",
      andslope: "\u2A58",
      andv: "\u2A5A",
      ang: "\u2220",
      ange: "\u29A4",
      angle: "\u2220",
      angmsd: "\u2221",
      angmsdaa: "\u29A8",
      angmsdab: "\u29A9",
      angmsdac: "\u29AA",
      angmsdad: "\u29AB",
      angmsdae: "\u29AC",
      angmsdaf: "\u29AD",
      angmsdag: "\u29AE",
      angmsdah: "\u29AF",
      angrt: "\u221F",
      angrtvb: "\u22BE",
      angrtvbd: "\u299D",
      angsph: "\u2222",
      angst: "\xC5",
      angzarr: "\u237C",
      Aogon: "\u0104",
      aogon: "\u0105",
      Aopf: "\u{1D538}",
      aopf: "\u{1D552}",
      ap: "\u2248",
      apacir: "\u2A6F",
      apE: "\u2A70",
      ape: "\u224A",
      apid: "\u224B",
      apos: "'",
      ApplyFunction: "\u2061",
      approx: "\u2248",
      approxeq: "\u224A",
      Aring: "\xC5",
      aring: "\xE5",
      Ascr: "\u{1D49C}",
      ascr: "\u{1D4B6}",
      Assign: "\u2254",
      ast: "*",
      asymp: "\u2248",
      asympeq: "\u224D",
      Atilde: "\xC3",
      atilde: "\xE3",
      Auml: "\xC4",
      auml: "\xE4",
      awconint: "\u2233",
      awint: "\u2A11",
      backcong: "\u224C",
      backepsilon: "\u03F6",
      backprime: "\u2035",
      backsim: "\u223D",
      backsimeq: "\u22CD",
      Backslash: "\u2216",
      Barv: "\u2AE7",
      barvee: "\u22BD",
      Barwed: "\u2306",
      barwed: "\u2305",
      barwedge: "\u2305",
      bbrk: "\u23B5",
      bbrktbrk: "\u23B6",
      bcong: "\u224C",
      Bcy: "\u0411",
      bcy: "\u0431",
      bdquo: "\u201E",
      becaus: "\u2235",
      Because: "\u2235",
      because: "\u2235",
      bemptyv: "\u29B0",
      bepsi: "\u03F6",
      bernou: "\u212C",
      Bernoullis: "\u212C",
      Beta: "\u0392",
      beta: "\u03B2",
      beth: "\u2136",
      between: "\u226C",
      Bfr: "\u{1D505}",
      bfr: "\u{1D51F}",
      bigcap: "\u22C2",
      bigcirc: "\u25EF",
      bigcup: "\u22C3",
      bigodot: "\u2A00",
      bigoplus: "\u2A01",
      bigotimes: "\u2A02",
      bigsqcup: "\u2A06",
      bigstar: "\u2605",
      bigtriangledown: "\u25BD",
      bigtriangleup: "\u25B3",
      biguplus: "\u2A04",
      bigvee: "\u22C1",
      bigwedge: "\u22C0",
      bkarow: "\u290D",
      blacklozenge: "\u29EB",
      blacksquare: "\u25AA",
      blacktriangle: "\u25B4",
      blacktriangledown: "\u25BE",
      blacktriangleleft: "\u25C2",
      blacktriangleright: "\u25B8",
      blank: "\u2423",
      blk12: "\u2592",
      blk14: "\u2591",
      blk34: "\u2593",
      block: "\u2588",
      bne: "=\u20E5",
      bnequiv: "\u2261\u20E5",
      bNot: "\u2AED",
      bnot: "\u2310",
      Bopf: "\u{1D539}",
      bopf: "\u{1D553}",
      bot: "\u22A5",
      bottom: "\u22A5",
      bowtie: "\u22C8",
      boxbox: "\u29C9",
      boxDL: "\u2557",
      boxDl: "\u2556",
      boxdL: "\u2555",
      boxdl: "\u2510",
      boxDR: "\u2554",
      boxDr: "\u2553",
      boxdR: "\u2552",
      boxdr: "\u250C",
      boxH: "\u2550",
      boxh: "\u2500",
      boxHD: "\u2566",
      boxHd: "\u2564",
      boxhD: "\u2565",
      boxhd: "\u252C",
      boxHU: "\u2569",
      boxHu: "\u2567",
      boxhU: "\u2568",
      boxhu: "\u2534",
      boxminus: "\u229F",
      boxplus: "\u229E",
      boxtimes: "\u22A0",
      boxUL: "\u255D",
      boxUl: "\u255C",
      boxuL: "\u255B",
      boxul: "\u2518",
      boxUR: "\u255A",
      boxUr: "\u2559",
      boxuR: "\u2558",
      boxur: "\u2514",
      boxV: "\u2551",
      boxv: "\u2502",
      boxVH: "\u256C",
      boxVh: "\u256B",
      boxvH: "\u256A",
      boxvh: "\u253C",
      boxVL: "\u2563",
      boxVl: "\u2562",
      boxvL: "\u2561",
      boxvl: "\u2524",
      boxVR: "\u2560",
      boxVr: "\u255F",
      boxvR: "\u255E",
      boxvr: "\u251C",
      bprime: "\u2035",
      Breve: "\u02D8",
      breve: "\u02D8",
      brvbar: "\xA6",
      Bscr: "\u212C",
      bscr: "\u{1D4B7}",
      bsemi: "\u204F",
      bsim: "\u223D",
      bsime: "\u22CD",
      bsol: "\\",
      bsolb: "\u29C5",
      bsolhsub: "\u27C8",
      bull: "\u2022",
      bullet: "\u2022",
      bump: "\u224E",
      bumpE: "\u2AAE",
      bumpe: "\u224F",
      Bumpeq: "\u224E",
      bumpeq: "\u224F",
      Cacute: "\u0106",
      cacute: "\u0107",
      Cap: "\u22D2",
      cap: "\u2229",
      capand: "\u2A44",
      capbrcup: "\u2A49",
      capcap: "\u2A4B",
      capcup: "\u2A47",
      capdot: "\u2A40",
      CapitalDifferentialD: "\u2145",
      caps: "\u2229\uFE00",
      caret: "\u2041",
      caron: "\u02C7",
      Cayleys: "\u212D",
      ccaps: "\u2A4D",
      Ccaron: "\u010C",
      ccaron: "\u010D",
      Ccedil: "\xC7",
      ccedil: "\xE7",
      Ccirc: "\u0108",
      ccirc: "\u0109",
      Cconint: "\u2230",
      ccups: "\u2A4C",
      ccupssm: "\u2A50",
      Cdot: "\u010A",
      cdot: "\u010B",
      cedil: "\xB8",
      Cedilla: "\xB8",
      cemptyv: "\u29B2",
      cent: "\xA2",
      CenterDot: "\xB7",
      centerdot: "\xB7",
      Cfr: "\u212D",
      cfr: "\u{1D520}",
      CHcy: "\u0427",
      chcy: "\u0447",
      check: "\u2713",
      checkmark: "\u2713",
      Chi: "\u03A7",
      chi: "\u03C7",
      cir: "\u25CB",
      circ: "\u02C6",
      circeq: "\u2257",
      circlearrowleft: "\u21BA",
      circlearrowright: "\u21BB",
      circledast: "\u229B",
      circledcirc: "\u229A",
      circleddash: "\u229D",
      CircleDot: "\u2299",
      circledR: "\xAE",
      circledS: "\u24C8",
      CircleMinus: "\u2296",
      CirclePlus: "\u2295",
      CircleTimes: "\u2297",
      cirE: "\u29C3",
      cire: "\u2257",
      cirfnint: "\u2A10",
      cirmid: "\u2AEF",
      cirscir: "\u29C2",
      ClockwiseContourIntegral: "\u2232",
      CloseCurlyDoubleQuote: "\u201D",
      CloseCurlyQuote: "\u2019",
      clubs: "\u2663",
      clubsuit: "\u2663",
      Colon: "\u2237",
      colon: ":",
      Colone: "\u2A74",
      colone: "\u2254",
      coloneq: "\u2254",
      comma: ",",
      commat: "@",
      comp: "\u2201",
      compfn: "\u2218",
      complement: "\u2201",
      complexes: "\u2102",
      cong: "\u2245",
      congdot: "\u2A6D",
      Congruent: "\u2261",
      Conint: "\u222F",
      conint: "\u222E",
      ContourIntegral: "\u222E",
      Copf: "\u2102",
      copf: "\u{1D554}",
      coprod: "\u2210",
      Coproduct: "\u2210",
      COPY: "\xA9",
      copy: "\xA9",
      copysr: "\u2117",
      CounterClockwiseContourIntegral: "\u2233",
      crarr: "\u21B5",
      Cross: "\u2A2F",
      cross: "\u2717",
      Cscr: "\u{1D49E}",
      cscr: "\u{1D4B8}",
      csub: "\u2ACF",
      csube: "\u2AD1",
      csup: "\u2AD0",
      csupe: "\u2AD2",
      ctdot: "\u22EF",
      cudarrl: "\u2938",
      cudarrr: "\u2935",
      cuepr: "\u22DE",
      cuesc: "\u22DF",
      cularr: "\u21B6",
      cularrp: "\u293D",
      Cup: "\u22D3",
      cup: "\u222A",
      cupbrcap: "\u2A48",
      CupCap: "\u224D",
      cupcap: "\u2A46",
      cupcup: "\u2A4A",
      cupdot: "\u228D",
      cupor: "\u2A45",
      cups: "\u222A\uFE00",
      curarr: "\u21B7",
      curarrm: "\u293C",
      curlyeqprec: "\u22DE",
      curlyeqsucc: "\u22DF",
      curlyvee: "\u22CE",
      curlywedge: "\u22CF",
      curren: "\xA4",
      curvearrowleft: "\u21B6",
      curvearrowright: "\u21B7",
      cuvee: "\u22CE",
      cuwed: "\u22CF",
      cwconint: "\u2232",
      cwint: "\u2231",
      cylcty: "\u232D",
      Dagger: "\u2021",
      dagger: "\u2020",
      daleth: "\u2138",
      Darr: "\u21A1",
      dArr: "\u21D3",
      darr: "\u2193",
      dash: "\u2010",
      Dashv: "\u2AE4",
      dashv: "\u22A3",
      dbkarow: "\u290F",
      dblac: "\u02DD",
      Dcaron: "\u010E",
      dcaron: "\u010F",
      Dcy: "\u0414",
      dcy: "\u0434",
      DD: "\u2145",
      dd: "\u2146",
      ddagger: "\u2021",
      ddarr: "\u21CA",
      DDotrahd: "\u2911",
      ddotseq: "\u2A77",
      deg: "\xB0",
      Del: "\u2207",
      Delta: "\u0394",
      delta: "\u03B4",
      demptyv: "\u29B1",
      dfisht: "\u297F",
      Dfr: "\u{1D507}",
      dfr: "\u{1D521}",
      dHar: "\u2965",
      dharl: "\u21C3",
      dharr: "\u21C2",
      DiacriticalAcute: "\xB4",
      DiacriticalDot: "\u02D9",
      DiacriticalDoubleAcute: "\u02DD",
      DiacriticalGrave: "`",
      DiacriticalTilde: "\u02DC",
      diam: "\u22C4",
      Diamond: "\u22C4",
      diamond: "\u22C4",
      diamondsuit: "\u2666",
      diams: "\u2666",
      die: "\xA8",
      DifferentialD: "\u2146",
      digamma: "\u03DD",
      disin: "\u22F2",
      div: "\xF7",
      divide: "\xF7",
      divideontimes: "\u22C7",
      divonx: "\u22C7",
      DJcy: "\u0402",
      djcy: "\u0452",
      dlcorn: "\u231E",
      dlcrop: "\u230D",
      dollar: "$",
      Dopf: "\u{1D53B}",
      dopf: "\u{1D555}",
      Dot: "\xA8",
      dot: "\u02D9",
      DotDot: "\u20DC",
      doteq: "\u2250",
      doteqdot: "\u2251",
      DotEqual: "\u2250",
      dotminus: "\u2238",
      dotplus: "\u2214",
      dotsquare: "\u22A1",
      doublebarwedge: "\u2306",
      DoubleContourIntegral: "\u222F",
      DoubleDot: "\xA8",
      DoubleDownArrow: "\u21D3",
      DoubleLeftArrow: "\u21D0",
      DoubleLeftRightArrow: "\u21D4",
      DoubleLeftTee: "\u2AE4",
      DoubleLongLeftArrow: "\u27F8",
      DoubleLongLeftRightArrow: "\u27FA",
      DoubleLongRightArrow: "\u27F9",
      DoubleRightArrow: "\u21D2",
      DoubleRightTee: "\u22A8",
      DoubleUpArrow: "\u21D1",
      DoubleUpDownArrow: "\u21D5",
      DoubleVerticalBar: "\u2225",
      DownArrow: "\u2193",
      Downarrow: "\u21D3",
      downarrow: "\u2193",
      DownArrowBar: "\u2913",
      DownArrowUpArrow: "\u21F5",
      DownBreve: "\u0311",
      downdownarrows: "\u21CA",
      downharpoonleft: "\u21C3",
      downharpoonright: "\u21C2",
      DownLeftRightVector: "\u2950",
      DownLeftTeeVector: "\u295E",
      DownLeftVector: "\u21BD",
      DownLeftVectorBar: "\u2956",
      DownRightTeeVector: "\u295F",
      DownRightVector: "\u21C1",
      DownRightVectorBar: "\u2957",
      DownTee: "\u22A4",
      DownTeeArrow: "\u21A7",
      drbkarow: "\u2910",
      drcorn: "\u231F",
      drcrop: "\u230C",
      Dscr: "\u{1D49F}",
      dscr: "\u{1D4B9}",
      DScy: "\u0405",
      dscy: "\u0455",
      dsol: "\u29F6",
      Dstrok: "\u0110",
      dstrok: "\u0111",
      dtdot: "\u22F1",
      dtri: "\u25BF",
      dtrif: "\u25BE",
      duarr: "\u21F5",
      duhar: "\u296F",
      dwangle: "\u29A6",
      DZcy: "\u040F",
      dzcy: "\u045F",
      dzigrarr: "\u27FF",
      Eacute: "\xC9",
      eacute: "\xE9",
      easter: "\u2A6E",
      Ecaron: "\u011A",
      ecaron: "\u011B",
      ecir: "\u2256",
      Ecirc: "\xCA",
      ecirc: "\xEA",
      ecolon: "\u2255",
      Ecy: "\u042D",
      ecy: "\u044D",
      eDDot: "\u2A77",
      Edot: "\u0116",
      eDot: "\u2251",
      edot: "\u0117",
      ee: "\u2147",
      efDot: "\u2252",
      Efr: "\u{1D508}",
      efr: "\u{1D522}",
      eg: "\u2A9A",
      Egrave: "\xC8",
      egrave: "\xE8",
      egs: "\u2A96",
      egsdot: "\u2A98",
      el: "\u2A99",
      Element: "\u2208",
      elinters: "\u23E7",
      ell: "\u2113",
      els: "\u2A95",
      elsdot: "\u2A97",
      Emacr: "\u0112",
      emacr: "\u0113",
      empty: "\u2205",
      emptyset: "\u2205",
      EmptySmallSquare: "\u25FB",
      emptyv: "\u2205",
      EmptyVerySmallSquare: "\u25AB",
      emsp: "\u2003",
      emsp13: "\u2004",
      emsp14: "\u2005",
      ENG: "\u014A",
      eng: "\u014B",
      ensp: "\u2002",
      Eogon: "\u0118",
      eogon: "\u0119",
      Eopf: "\u{1D53C}",
      eopf: "\u{1D556}",
      epar: "\u22D5",
      eparsl: "\u29E3",
      eplus: "\u2A71",
      epsi: "\u03B5",
      Epsilon: "\u0395",
      epsilon: "\u03B5",
      epsiv: "\u03F5",
      eqcirc: "\u2256",
      eqcolon: "\u2255",
      eqsim: "\u2242",
      eqslantgtr: "\u2A96",
      eqslantless: "\u2A95",
      Equal: "\u2A75",
      equals: "=",
      EqualTilde: "\u2242",
      equest: "\u225F",
      Equilibrium: "\u21CC",
      equiv: "\u2261",
      equivDD: "\u2A78",
      eqvparsl: "\u29E5",
      erarr: "\u2971",
      erDot: "\u2253",
      Escr: "\u2130",
      escr: "\u212F",
      esdot: "\u2250",
      Esim: "\u2A73",
      esim: "\u2242",
      Eta: "\u0397",
      eta: "\u03B7",
      ETH: "\xD0",
      eth: "\xF0",
      Euml: "\xCB",
      euml: "\xEB",
      euro: "\u20AC",
      excl: "!",
      exist: "\u2203",
      Exists: "\u2203",
      expectation: "\u2130",
      ExponentialE: "\u2147",
      exponentiale: "\u2147",
      fallingdotseq: "\u2252",
      Fcy: "\u0424",
      fcy: "\u0444",
      female: "\u2640",
      ffilig: "\uFB03",
      fflig: "\uFB00",
      ffllig: "\uFB04",
      Ffr: "\u{1D509}",
      ffr: "\u{1D523}",
      filig: "\uFB01",
      FilledSmallSquare: "\u25FC",
      FilledVerySmallSquare: "\u25AA",
      fjlig: "fj",
      flat: "\u266D",
      fllig: "\uFB02",
      fltns: "\u25B1",
      fnof: "\u0192",
      Fopf: "\u{1D53D}",
      fopf: "\u{1D557}",
      ForAll: "\u2200",
      forall: "\u2200",
      fork: "\u22D4",
      forkv: "\u2AD9",
      Fouriertrf: "\u2131",
      fpartint: "\u2A0D",
      frac12: "\xBD",
      frac13: "\u2153",
      frac14: "\xBC",
      frac15: "\u2155",
      frac16: "\u2159",
      frac18: "\u215B",
      frac23: "\u2154",
      frac25: "\u2156",
      frac34: "\xBE",
      frac35: "\u2157",
      frac38: "\u215C",
      frac45: "\u2158",
      frac56: "\u215A",
      frac58: "\u215D",
      frac78: "\u215E",
      frasl: "\u2044",
      frown: "\u2322",
      Fscr: "\u2131",
      fscr: "\u{1D4BB}",
      gacute: "\u01F5",
      Gamma: "\u0393",
      gamma: "\u03B3",
      Gammad: "\u03DC",
      gammad: "\u03DD",
      gap: "\u2A86",
      Gbreve: "\u011E",
      gbreve: "\u011F",
      Gcedil: "\u0122",
      Gcirc: "\u011C",
      gcirc: "\u011D",
      Gcy: "\u0413",
      gcy: "\u0433",
      Gdot: "\u0120",
      gdot: "\u0121",
      gE: "\u2267",
      ge: "\u2265",
      gEl: "\u2A8C",
      gel: "\u22DB",
      geq: "\u2265",
      geqq: "\u2267",
      geqslant: "\u2A7E",
      ges: "\u2A7E",
      gescc: "\u2AA9",
      gesdot: "\u2A80",
      gesdoto: "\u2A82",
      gesdotol: "\u2A84",
      gesl: "\u22DB\uFE00",
      gesles: "\u2A94",
      Gfr: "\u{1D50A}",
      gfr: "\u{1D524}",
      Gg: "\u22D9",
      gg: "\u226B",
      ggg: "\u22D9",
      gimel: "\u2137",
      GJcy: "\u0403",
      gjcy: "\u0453",
      gl: "\u2277",
      gla: "\u2AA5",
      glE: "\u2A92",
      glj: "\u2AA4",
      gnap: "\u2A8A",
      gnapprox: "\u2A8A",
      gnE: "\u2269",
      gne: "\u2A88",
      gneq: "\u2A88",
      gneqq: "\u2269",
      gnsim: "\u22E7",
      Gopf: "\u{1D53E}",
      gopf: "\u{1D558}",
      grave: "`",
      GreaterEqual: "\u2265",
      GreaterEqualLess: "\u22DB",
      GreaterFullEqual: "\u2267",
      GreaterGreater: "\u2AA2",
      GreaterLess: "\u2277",
      GreaterSlantEqual: "\u2A7E",
      GreaterTilde: "\u2273",
      Gscr: "\u{1D4A2}",
      gscr: "\u210A",
      gsim: "\u2273",
      gsime: "\u2A8E",
      gsiml: "\u2A90",
      Gt: "\u226B",
      GT: ">",
      gt: ">",
      gtcc: "\u2AA7",
      gtcir: "\u2A7A",
      gtdot: "\u22D7",
      gtlPar: "\u2995",
      gtquest: "\u2A7C",
      gtrapprox: "\u2A86",
      gtrarr: "\u2978",
      gtrdot: "\u22D7",
      gtreqless: "\u22DB",
      gtreqqless: "\u2A8C",
      gtrless: "\u2277",
      gtrsim: "\u2273",
      gvertneqq: "\u2269\uFE00",
      gvnE: "\u2269\uFE00",
      Hacek: "\u02C7",
      hairsp: "\u200A",
      half: "\xBD",
      hamilt: "\u210B",
      HARDcy: "\u042A",
      hardcy: "\u044A",
      hArr: "\u21D4",
      harr: "\u2194",
      harrcir: "\u2948",
      harrw: "\u21AD",
      Hat: "^",
      hbar: "\u210F",
      Hcirc: "\u0124",
      hcirc: "\u0125",
      hearts: "\u2665",
      heartsuit: "\u2665",
      hellip: "\u2026",
      hercon: "\u22B9",
      Hfr: "\u210C",
      hfr: "\u{1D525}",
      HilbertSpace: "\u210B",
      hksearow: "\u2925",
      hkswarow: "\u2926",
      hoarr: "\u21FF",
      homtht: "\u223B",
      hookleftarrow: "\u21A9",
      hookrightarrow: "\u21AA",
      Hopf: "\u210D",
      hopf: "\u{1D559}",
      horbar: "\u2015",
      HorizontalLine: "\u2500",
      Hscr: "\u210B",
      hscr: "\u{1D4BD}",
      hslash: "\u210F",
      Hstrok: "\u0126",
      hstrok: "\u0127",
      HumpDownHump: "\u224E",
      HumpEqual: "\u224F",
      hybull: "\u2043",
      hyphen: "\u2010",
      Iacute: "\xCD",
      iacute: "\xED",
      ic: "\u2063",
      Icirc: "\xCE",
      icirc: "\xEE",
      Icy: "\u0418",
      icy: "\u0438",
      Idot: "\u0130",
      IEcy: "\u0415",
      iecy: "\u0435",
      iexcl: "\xA1",
      iff: "\u21D4",
      Ifr: "\u2111",
      ifr: "\u{1D526}",
      Igrave: "\xCC",
      igrave: "\xEC",
      ii: "\u2148",
      iiiint: "\u2A0C",
      iiint: "\u222D",
      iinfin: "\u29DC",
      iiota: "\u2129",
      IJlig: "\u0132",
      ijlig: "\u0133",
      Im: "\u2111",
      Imacr: "\u012A",
      imacr: "\u012B",
      image: "\u2111",
      ImaginaryI: "\u2148",
      imagline: "\u2110",
      imagpart: "\u2111",
      imath: "\u0131",
      imof: "\u22B7",
      imped: "\u01B5",
      Implies: "\u21D2",
      in: "\u2208",
      incare: "\u2105",
      infin: "\u221E",
      infintie: "\u29DD",
      inodot: "\u0131",
      Int: "\u222C",
      int: "\u222B",
      intcal: "\u22BA",
      integers: "\u2124",
      Integral: "\u222B",
      intercal: "\u22BA",
      Intersection: "\u22C2",
      intlarhk: "\u2A17",
      intprod: "\u2A3C",
      InvisibleComma: "\u2063",
      InvisibleTimes: "\u2062",
      IOcy: "\u0401",
      iocy: "\u0451",
      Iogon: "\u012E",
      iogon: "\u012F",
      Iopf: "\u{1D540}",
      iopf: "\u{1D55A}",
      Iota: "\u0399",
      iota: "\u03B9",
      iprod: "\u2A3C",
      iquest: "\xBF",
      Iscr: "\u2110",
      iscr: "\u{1D4BE}",
      isin: "\u2208",
      isindot: "\u22F5",
      isinE: "\u22F9",
      isins: "\u22F4",
      isinsv: "\u22F3",
      isinv: "\u2208",
      it: "\u2062",
      Itilde: "\u0128",
      itilde: "\u0129",
      Iukcy: "\u0406",
      iukcy: "\u0456",
      Iuml: "\xCF",
      iuml: "\xEF",
      Jcirc: "\u0134",
      jcirc: "\u0135",
      Jcy: "\u0419",
      jcy: "\u0439",
      Jfr: "\u{1D50D}",
      jfr: "\u{1D527}",
      jmath: "\u0237",
      Jopf: "\u{1D541}",
      jopf: "\u{1D55B}",
      Jscr: "\u{1D4A5}",
      jscr: "\u{1D4BF}",
      Jsercy: "\u0408",
      jsercy: "\u0458",
      Jukcy: "\u0404",
      jukcy: "\u0454",
      Kappa: "\u039A",
      kappa: "\u03BA",
      kappav: "\u03F0",
      Kcedil: "\u0136",
      kcedil: "\u0137",
      Kcy: "\u041A",
      kcy: "\u043A",
      Kfr: "\u{1D50E}",
      kfr: "\u{1D528}",
      kgreen: "\u0138",
      KHcy: "\u0425",
      khcy: "\u0445",
      KJcy: "\u040C",
      kjcy: "\u045C",
      Kopf: "\u{1D542}",
      kopf: "\u{1D55C}",
      Kscr: "\u{1D4A6}",
      kscr: "\u{1D4C0}",
      lAarr: "\u21DA",
      Lacute: "\u0139",
      lacute: "\u013A",
      laemptyv: "\u29B4",
      lagran: "\u2112",
      Lambda: "\u039B",
      lambda: "\u03BB",
      Lang: "\u27EA",
      lang: "\u27E8",
      langd: "\u2991",
      langle: "\u27E8",
      lap: "\u2A85",
      Laplacetrf: "\u2112",
      laquo: "\xAB",
      Larr: "\u219E",
      lArr: "\u21D0",
      larr: "\u2190",
      larrb: "\u21E4",
      larrbfs: "\u291F",
      larrfs: "\u291D",
      larrhk: "\u21A9",
      larrlp: "\u21AB",
      larrpl: "\u2939",
      larrsim: "\u2973",
      larrtl: "\u21A2",
      lat: "\u2AAB",
      lAtail: "\u291B",
      latail: "\u2919",
      late: "\u2AAD",
      lates: "\u2AAD\uFE00",
      lBarr: "\u290E",
      lbarr: "\u290C",
      lbbrk: "\u2772",
      lbrace: "{",
      lbrack: "[",
      lbrke: "\u298B",
      lbrksld: "\u298F",
      lbrkslu: "\u298D",
      Lcaron: "\u013D",
      lcaron: "\u013E",
      Lcedil: "\u013B",
      lcedil: "\u013C",
      lceil: "\u2308",
      lcub: "{",
      Lcy: "\u041B",
      lcy: "\u043B",
      ldca: "\u2936",
      ldquo: "\u201C",
      ldquor: "\u201E",
      ldrdhar: "\u2967",
      ldrushar: "\u294B",
      ldsh: "\u21B2",
      lE: "\u2266",
      le: "\u2264",
      LeftAngleBracket: "\u27E8",
      LeftArrow: "\u2190",
      Leftarrow: "\u21D0",
      leftarrow: "\u2190",
      LeftArrowBar: "\u21E4",
      LeftArrowRightArrow: "\u21C6",
      leftarrowtail: "\u21A2",
      LeftCeiling: "\u2308",
      LeftDoubleBracket: "\u27E6",
      LeftDownTeeVector: "\u2961",
      LeftDownVector: "\u21C3",
      LeftDownVectorBar: "\u2959",
      LeftFloor: "\u230A",
      leftharpoondown: "\u21BD",
      leftharpoonup: "\u21BC",
      leftleftarrows: "\u21C7",
      LeftRightArrow: "\u2194",
      Leftrightarrow: "\u21D4",
      leftrightarrow: "\u2194",
      leftrightarrows: "\u21C6",
      leftrightharpoons: "\u21CB",
      leftrightsquigarrow: "\u21AD",
      LeftRightVector: "\u294E",
      LeftTee: "\u22A3",
      LeftTeeArrow: "\u21A4",
      LeftTeeVector: "\u295A",
      leftthreetimes: "\u22CB",
      LeftTriangle: "\u22B2",
      LeftTriangleBar: "\u29CF",
      LeftTriangleEqual: "\u22B4",
      LeftUpDownVector: "\u2951",
      LeftUpTeeVector: "\u2960",
      LeftUpVector: "\u21BF",
      LeftUpVectorBar: "\u2958",
      LeftVector: "\u21BC",
      LeftVectorBar: "\u2952",
      lEg: "\u2A8B",
      leg: "\u22DA",
      leq: "\u2264",
      leqq: "\u2266",
      leqslant: "\u2A7D",
      les: "\u2A7D",
      lescc: "\u2AA8",
      lesdot: "\u2A7F",
      lesdoto: "\u2A81",
      lesdotor: "\u2A83",
      lesg: "\u22DA\uFE00",
      lesges: "\u2A93",
      lessapprox: "\u2A85",
      lessdot: "\u22D6",
      lesseqgtr: "\u22DA",
      lesseqqgtr: "\u2A8B",
      LessEqualGreater: "\u22DA",
      LessFullEqual: "\u2266",
      LessGreater: "\u2276",
      lessgtr: "\u2276",
      LessLess: "\u2AA1",
      lesssim: "\u2272",
      LessSlantEqual: "\u2A7D",
      LessTilde: "\u2272",
      lfisht: "\u297C",
      lfloor: "\u230A",
      Lfr: "\u{1D50F}",
      lfr: "\u{1D529}",
      lg: "\u2276",
      lgE: "\u2A91",
      lHar: "\u2962",
      lhard: "\u21BD",
      lharu: "\u21BC",
      lharul: "\u296A",
      lhblk: "\u2584",
      LJcy: "\u0409",
      ljcy: "\u0459",
      Ll: "\u22D8",
      ll: "\u226A",
      llarr: "\u21C7",
      llcorner: "\u231E",
      Lleftarrow: "\u21DA",
      llhard: "\u296B",
      lltri: "\u25FA",
      Lmidot: "\u013F",
      lmidot: "\u0140",
      lmoust: "\u23B0",
      lmoustache: "\u23B0",
      lnap: "\u2A89",
      lnapprox: "\u2A89",
      lnE: "\u2268",
      lne: "\u2A87",
      lneq: "\u2A87",
      lneqq: "\u2268",
      lnsim: "\u22E6",
      loang: "\u27EC",
      loarr: "\u21FD",
      lobrk: "\u27E6",
      LongLeftArrow: "\u27F5",
      Longleftarrow: "\u27F8",
      longleftarrow: "\u27F5",
      LongLeftRightArrow: "\u27F7",
      Longleftrightarrow: "\u27FA",
      longleftrightarrow: "\u27F7",
      longmapsto: "\u27FC",
      LongRightArrow: "\u27F6",
      Longrightarrow: "\u27F9",
      longrightarrow: "\u27F6",
      looparrowleft: "\u21AB",
      looparrowright: "\u21AC",
      lopar: "\u2985",
      Lopf: "\u{1D543}",
      lopf: "\u{1D55D}",
      loplus: "\u2A2D",
      lotimes: "\u2A34",
      lowast: "\u2217",
      lowbar: "_",
      LowerLeftArrow: "\u2199",
      LowerRightArrow: "\u2198",
      loz: "\u25CA",
      lozenge: "\u25CA",
      lozf: "\u29EB",
      lpar: "(",
      lparlt: "\u2993",
      lrarr: "\u21C6",
      lrcorner: "\u231F",
      lrhar: "\u21CB",
      lrhard: "\u296D",
      lrm: "\u200E",
      lrtri: "\u22BF",
      lsaquo: "\u2039",
      Lscr: "\u2112",
      lscr: "\u{1D4C1}",
      Lsh: "\u21B0",
      lsh: "\u21B0",
      lsim: "\u2272",
      lsime: "\u2A8D",
      lsimg: "\u2A8F",
      lsqb: "[",
      lsquo: "\u2018",
      lsquor: "\u201A",
      Lstrok: "\u0141",
      lstrok: "\u0142",
      Lt: "\u226A",
      LT: "<",
      lt: "<",
      ltcc: "\u2AA6",
      ltcir: "\u2A79",
      ltdot: "\u22D6",
      lthree: "\u22CB",
      ltimes: "\u22C9",
      ltlarr: "\u2976",
      ltquest: "\u2A7B",
      ltri: "\u25C3",
      ltrie: "\u22B4",
      ltrif: "\u25C2",
      ltrPar: "\u2996",
      lurdshar: "\u294A",
      luruhar: "\u2966",
      lvertneqq: "\u2268\uFE00",
      lvnE: "\u2268\uFE00",
      macr: "\xAF",
      male: "\u2642",
      malt: "\u2720",
      maltese: "\u2720",
      Map: "\u2905",
      map: "\u21A6",
      mapsto: "\u21A6",
      mapstodown: "\u21A7",
      mapstoleft: "\u21A4",
      mapstoup: "\u21A5",
      marker: "\u25AE",
      mcomma: "\u2A29",
      Mcy: "\u041C",
      mcy: "\u043C",
      mdash: "\u2014",
      mDDot: "\u223A",
      measuredangle: "\u2221",
      MediumSpace: "\u205F",
      Mellintrf: "\u2133",
      Mfr: "\u{1D510}",
      mfr: "\u{1D52A}",
      mho: "\u2127",
      micro: "\xB5",
      mid: "\u2223",
      midast: "*",
      midcir: "\u2AF0",
      middot: "\xB7",
      minus: "\u2212",
      minusb: "\u229F",
      minusd: "\u2238",
      minusdu: "\u2A2A",
      MinusPlus: "\u2213",
      mlcp: "\u2ADB",
      mldr: "\u2026",
      mnplus: "\u2213",
      models: "\u22A7",
      Mopf: "\u{1D544}",
      mopf: "\u{1D55E}",
      mp: "\u2213",
      Mscr: "\u2133",
      mscr: "\u{1D4C2}",
      mstpos: "\u223E",
      Mu: "\u039C",
      mu: "\u03BC",
      multimap: "\u22B8",
      mumap: "\u22B8",
      nabla: "\u2207",
      Nacute: "\u0143",
      nacute: "\u0144",
      nang: "\u2220\u20D2",
      nap: "\u2249",
      napE: "\u2A70\u0338",
      napid: "\u224B\u0338",
      napos: "\u0149",
      napprox: "\u2249",
      natur: "\u266E",
      natural: "\u266E",
      naturals: "\u2115",
      nbsp: "\xA0",
      nbump: "\u224E\u0338",
      nbumpe: "\u224F\u0338",
      ncap: "\u2A43",
      Ncaron: "\u0147",
      ncaron: "\u0148",
      Ncedil: "\u0145",
      ncedil: "\u0146",
      ncong: "\u2247",
      ncongdot: "\u2A6D\u0338",
      ncup: "\u2A42",
      Ncy: "\u041D",
      ncy: "\u043D",
      ndash: "\u2013",
      ne: "\u2260",
      nearhk: "\u2924",
      neArr: "\u21D7",
      nearr: "\u2197",
      nearrow: "\u2197",
      nedot: "\u2250\u0338",
      NegativeMediumSpace: "\u200B",
      NegativeThickSpace: "\u200B",
      NegativeThinSpace: "\u200B",
      NegativeVeryThinSpace: "\u200B",
      nequiv: "\u2262",
      nesear: "\u2928",
      nesim: "\u2242\u0338",
      NestedGreaterGreater: "\u226B",
      NestedLessLess: "\u226A",
      NewLine: "\n",
      nexist: "\u2204",
      nexists: "\u2204",
      Nfr: "\u{1D511}",
      nfr: "\u{1D52B}",
      ngE: "\u2267\u0338",
      nge: "\u2271",
      ngeq: "\u2271",
      ngeqq: "\u2267\u0338",
      ngeqslant: "\u2A7E\u0338",
      nges: "\u2A7E\u0338",
      nGg: "\u22D9\u0338",
      ngsim: "\u2275",
      nGt: "\u226B\u20D2",
      ngt: "\u226F",
      ngtr: "\u226F",
      nGtv: "\u226B\u0338",
      nhArr: "\u21CE",
      nharr: "\u21AE",
      nhpar: "\u2AF2",
      ni: "\u220B",
      nis: "\u22FC",
      nisd: "\u22FA",
      niv: "\u220B",
      NJcy: "\u040A",
      njcy: "\u045A",
      nlArr: "\u21CD",
      nlarr: "\u219A",
      nldr: "\u2025",
      nlE: "\u2266\u0338",
      nle: "\u2270",
      nLeftarrow: "\u21CD",
      nleftarrow: "\u219A",
      nLeftrightarrow: "\u21CE",
      nleftrightarrow: "\u21AE",
      nleq: "\u2270",
      nleqq: "\u2266\u0338",
      nleqslant: "\u2A7D\u0338",
      nles: "\u2A7D\u0338",
      nless: "\u226E",
      nLl: "\u22D8\u0338",
      nlsim: "\u2274",
      nLt: "\u226A\u20D2",
      nlt: "\u226E",
      nltri: "\u22EA",
      nltrie: "\u22EC",
      nLtv: "\u226A\u0338",
      nmid: "\u2224",
      NoBreak: "\u2060",
      NonBreakingSpace: "\xA0",
      Nopf: "\u2115",
      nopf: "\u{1D55F}",
      Not: "\u2AEC",
      not: "\xAC",
      NotCongruent: "\u2262",
      NotCupCap: "\u226D",
      NotDoubleVerticalBar: "\u2226",
      NotElement: "\u2209",
      NotEqual: "\u2260",
      NotEqualTilde: "\u2242\u0338",
      NotExists: "\u2204",
      NotGreater: "\u226F",
      NotGreaterEqual: "\u2271",
      NotGreaterFullEqual: "\u2267\u0338",
      NotGreaterGreater: "\u226B\u0338",
      NotGreaterLess: "\u2279",
      NotGreaterSlantEqual: "\u2A7E\u0338",
      NotGreaterTilde: "\u2275",
      NotHumpDownHump: "\u224E\u0338",
      NotHumpEqual: "\u224F\u0338",
      notin: "\u2209",
      notindot: "\u22F5\u0338",
      notinE: "\u22F9\u0338",
      notinva: "\u2209",
      notinvb: "\u22F7",
      notinvc: "\u22F6",
      NotLeftTriangle: "\u22EA",
      NotLeftTriangleBar: "\u29CF\u0338",
      NotLeftTriangleEqual: "\u22EC",
      NotLess: "\u226E",
      NotLessEqual: "\u2270",
      NotLessGreater: "\u2278",
      NotLessLess: "\u226A\u0338",
      NotLessSlantEqual: "\u2A7D\u0338",
      NotLessTilde: "\u2274",
      NotNestedGreaterGreater: "\u2AA2\u0338",
      NotNestedLessLess: "\u2AA1\u0338",
      notni: "\u220C",
      notniva: "\u220C",
      notnivb: "\u22FE",
      notnivc: "\u22FD",
      NotPrecedes: "\u2280",
      NotPrecedesEqual: "\u2AAF\u0338",
      NotPrecedesSlantEqual: "\u22E0",
      NotReverseElement: "\u220C",
      NotRightTriangle: "\u22EB",
      NotRightTriangleBar: "\u29D0\u0338",
      NotRightTriangleEqual: "\u22ED",
      NotSquareSubset: "\u228F\u0338",
      NotSquareSubsetEqual: "\u22E2",
      NotSquareSuperset: "\u2290\u0338",
      NotSquareSupersetEqual: "\u22E3",
      NotSubset: "\u2282\u20D2",
      NotSubsetEqual: "\u2288",
      NotSucceeds: "\u2281",
      NotSucceedsEqual: "\u2AB0\u0338",
      NotSucceedsSlantEqual: "\u22E1",
      NotSucceedsTilde: "\u227F\u0338",
      NotSuperset: "\u2283\u20D2",
      NotSupersetEqual: "\u2289",
      NotTilde: "\u2241",
      NotTildeEqual: "\u2244",
      NotTildeFullEqual: "\u2247",
      NotTildeTilde: "\u2249",
      NotVerticalBar: "\u2224",
      npar: "\u2226",
      nparallel: "\u2226",
      nparsl: "\u2AFD\u20E5",
      npart: "\u2202\u0338",
      npolint: "\u2A14",
      npr: "\u2280",
      nprcue: "\u22E0",
      npre: "\u2AAF\u0338",
      nprec: "\u2280",
      npreceq: "\u2AAF\u0338",
      nrArr: "\u21CF",
      nrarr: "\u219B",
      nrarrc: "\u2933\u0338",
      nrarrw: "\u219D\u0338",
      nRightarrow: "\u21CF",
      nrightarrow: "\u219B",
      nrtri: "\u22EB",
      nrtrie: "\u22ED",
      nsc: "\u2281",
      nsccue: "\u22E1",
      nsce: "\u2AB0\u0338",
      Nscr: "\u{1D4A9}",
      nscr: "\u{1D4C3}",
      nshortmid: "\u2224",
      nshortparallel: "\u2226",
      nsim: "\u2241",
      nsime: "\u2244",
      nsimeq: "\u2244",
      nsmid: "\u2224",
      nspar: "\u2226",
      nsqsube: "\u22E2",
      nsqsupe: "\u22E3",
      nsub: "\u2284",
      nsubE: "\u2AC5\u0338",
      nsube: "\u2288",
      nsubset: "\u2282\u20D2",
      nsubseteq: "\u2288",
      nsubseteqq: "\u2AC5\u0338",
      nsucc: "\u2281",
      nsucceq: "\u2AB0\u0338",
      nsup: "\u2285",
      nsupE: "\u2AC6\u0338",
      nsupe: "\u2289",
      nsupset: "\u2283\u20D2",
      nsupseteq: "\u2289",
      nsupseteqq: "\u2AC6\u0338",
      ntgl: "\u2279",
      Ntilde: "\xD1",
      ntilde: "\xF1",
      ntlg: "\u2278",
      ntriangleleft: "\u22EA",
      ntrianglelefteq: "\u22EC",
      ntriangleright: "\u22EB",
      ntrianglerighteq: "\u22ED",
      Nu: "\u039D",
      nu: "\u03BD",
      num: "#",
      numero: "\u2116",
      numsp: "\u2007",
      nvap: "\u224D\u20D2",
      nVDash: "\u22AF",
      nVdash: "\u22AE",
      nvDash: "\u22AD",
      nvdash: "\u22AC",
      nvge: "\u2265\u20D2",
      nvgt: ">\u20D2",
      nvHarr: "\u2904",
      nvinfin: "\u29DE",
      nvlArr: "\u2902",
      nvle: "\u2264\u20D2",
      nvlt: "<\u20D2",
      nvltrie: "\u22B4\u20D2",
      nvrArr: "\u2903",
      nvrtrie: "\u22B5\u20D2",
      nvsim: "\u223C\u20D2",
      nwarhk: "\u2923",
      nwArr: "\u21D6",
      nwarr: "\u2196",
      nwarrow: "\u2196",
      nwnear: "\u2927",
      Oacute: "\xD3",
      oacute: "\xF3",
      oast: "\u229B",
      ocir: "\u229A",
      Ocirc: "\xD4",
      ocirc: "\xF4",
      Ocy: "\u041E",
      ocy: "\u043E",
      odash: "\u229D",
      Odblac: "\u0150",
      odblac: "\u0151",
      odiv: "\u2A38",
      odot: "\u2299",
      odsold: "\u29BC",
      OElig: "\u0152",
      oelig: "\u0153",
      ofcir: "\u29BF",
      Ofr: "\u{1D512}",
      ofr: "\u{1D52C}",
      ogon: "\u02DB",
      Ograve: "\xD2",
      ograve: "\xF2",
      ogt: "\u29C1",
      ohbar: "\u29B5",
      ohm: "\u03A9",
      oint: "\u222E",
      olarr: "\u21BA",
      olcir: "\u29BE",
      olcross: "\u29BB",
      oline: "\u203E",
      olt: "\u29C0",
      Omacr: "\u014C",
      omacr: "\u014D",
      Omega: "\u03A9",
      omega: "\u03C9",
      Omicron: "\u039F",
      omicron: "\u03BF",
      omid: "\u29B6",
      ominus: "\u2296",
      Oopf: "\u{1D546}",
      oopf: "\u{1D560}",
      opar: "\u29B7",
      OpenCurlyDoubleQuote: "\u201C",
      OpenCurlyQuote: "\u2018",
      operp: "\u29B9",
      oplus: "\u2295",
      Or: "\u2A54",
      or: "\u2228",
      orarr: "\u21BB",
      ord: "\u2A5D",
      order: "\u2134",
      orderof: "\u2134",
      ordf: "\xAA",
      ordm: "\xBA",
      origof: "\u22B6",
      oror: "\u2A56",
      orslope: "\u2A57",
      orv: "\u2A5B",
      oS: "\u24C8",
      Oscr: "\u{1D4AA}",
      oscr: "\u2134",
      Oslash: "\xD8",
      oslash: "\xF8",
      osol: "\u2298",
      Otilde: "\xD5",
      otilde: "\xF5",
      Otimes: "\u2A37",
      otimes: "\u2297",
      otimesas: "\u2A36",
      Ouml: "\xD6",
      ouml: "\xF6",
      ovbar: "\u233D",
      OverBar: "\u203E",
      OverBrace: "\u23DE",
      OverBracket: "\u23B4",
      OverParenthesis: "\u23DC",
      par: "\u2225",
      para: "\xB6",
      parallel: "\u2225",
      parsim: "\u2AF3",
      parsl: "\u2AFD",
      part: "\u2202",
      PartialD: "\u2202",
      Pcy: "\u041F",
      pcy: "\u043F",
      percnt: "%",
      period: ".",
      permil: "\u2030",
      perp: "\u22A5",
      pertenk: "\u2031",
      Pfr: "\u{1D513}",
      pfr: "\u{1D52D}",
      Phi: "\u03A6",
      phi: "\u03C6",
      phiv: "\u03D5",
      phmmat: "\u2133",
      phone: "\u260E",
      Pi: "\u03A0",
      pi: "\u03C0",
      pitchfork: "\u22D4",
      piv: "\u03D6",
      planck: "\u210F",
      planckh: "\u210E",
      plankv: "\u210F",
      plus: "+",
      plusacir: "\u2A23",
      plusb: "\u229E",
      pluscir: "\u2A22",
      plusdo: "\u2214",
      plusdu: "\u2A25",
      pluse: "\u2A72",
      PlusMinus: "\xB1",
      plusmn: "\xB1",
      plussim: "\u2A26",
      plustwo: "\u2A27",
      pm: "\xB1",
      Poincareplane: "\u210C",
      pointint: "\u2A15",
      Popf: "\u2119",
      popf: "\u{1D561}",
      pound: "\xA3",
      Pr: "\u2ABB",
      pr: "\u227A",
      prap: "\u2AB7",
      prcue: "\u227C",
      prE: "\u2AB3",
      pre: "\u2AAF",
      prec: "\u227A",
      precapprox: "\u2AB7",
      preccurlyeq: "\u227C",
      Precedes: "\u227A",
      PrecedesEqual: "\u2AAF",
      PrecedesSlantEqual: "\u227C",
      PrecedesTilde: "\u227E",
      preceq: "\u2AAF",
      precnapprox: "\u2AB9",
      precneqq: "\u2AB5",
      precnsim: "\u22E8",
      precsim: "\u227E",
      Prime: "\u2033",
      prime: "\u2032",
      primes: "\u2119",
      prnap: "\u2AB9",
      prnE: "\u2AB5",
      prnsim: "\u22E8",
      prod: "\u220F",
      Product: "\u220F",
      profalar: "\u232E",
      profline: "\u2312",
      profsurf: "\u2313",
      prop: "\u221D",
      Proportion: "\u2237",
      Proportional: "\u221D",
      propto: "\u221D",
      prsim: "\u227E",
      prurel: "\u22B0",
      Pscr: "\u{1D4AB}",
      pscr: "\u{1D4C5}",
      Psi: "\u03A8",
      psi: "\u03C8",
      puncsp: "\u2008",
      Qfr: "\u{1D514}",
      qfr: "\u{1D52E}",
      qint: "\u2A0C",
      Qopf: "\u211A",
      qopf: "\u{1D562}",
      qprime: "\u2057",
      Qscr: "\u{1D4AC}",
      qscr: "\u{1D4C6}",
      quaternions: "\u210D",
      quatint: "\u2A16",
      quest: "?",
      questeq: "\u225F",
      QUOT: '"',
      quot: '"',
      rAarr: "\u21DB",
      race: "\u223D\u0331",
      Racute: "\u0154",
      racute: "\u0155",
      radic: "\u221A",
      raemptyv: "\u29B3",
      Rang: "\u27EB",
      rang: "\u27E9",
      rangd: "\u2992",
      range: "\u29A5",
      rangle: "\u27E9",
      raquo: "\xBB",
      Rarr: "\u21A0",
      rArr: "\u21D2",
      rarr: "\u2192",
      rarrap: "\u2975",
      rarrb: "\u21E5",
      rarrbfs: "\u2920",
      rarrc: "\u2933",
      rarrfs: "\u291E",
      rarrhk: "\u21AA",
      rarrlp: "\u21AC",
      rarrpl: "\u2945",
      rarrsim: "\u2974",
      Rarrtl: "\u2916",
      rarrtl: "\u21A3",
      rarrw: "\u219D",
      rAtail: "\u291C",
      ratail: "\u291A",
      ratio: "\u2236",
      rationals: "\u211A",
      RBarr: "\u2910",
      rBarr: "\u290F",
      rbarr: "\u290D",
      rbbrk: "\u2773",
      rbrace: "}",
      rbrack: "]",
      rbrke: "\u298C",
      rbrksld: "\u298E",
      rbrkslu: "\u2990",
      Rcaron: "\u0158",
      rcaron: "\u0159",
      Rcedil: "\u0156",
      rcedil: "\u0157",
      rceil: "\u2309",
      rcub: "}",
      Rcy: "\u0420",
      rcy: "\u0440",
      rdca: "\u2937",
      rdldhar: "\u2969",
      rdquo: "\u201D",
      rdquor: "\u201D",
      rdsh: "\u21B3",
      Re: "\u211C",
      real: "\u211C",
      realine: "\u211B",
      realpart: "\u211C",
      reals: "\u211D",
      rect: "\u25AD",
      REG: "\xAE",
      reg: "\xAE",
      ReverseElement: "\u220B",
      ReverseEquilibrium: "\u21CB",
      ReverseUpEquilibrium: "\u296F",
      rfisht: "\u297D",
      rfloor: "\u230B",
      Rfr: "\u211C",
      rfr: "\u{1D52F}",
      rHar: "\u2964",
      rhard: "\u21C1",
      rharu: "\u21C0",
      rharul: "\u296C",
      Rho: "\u03A1",
      rho: "\u03C1",
      rhov: "\u03F1",
      RightAngleBracket: "\u27E9",
      RightArrow: "\u2192",
      Rightarrow: "\u21D2",
      rightarrow: "\u2192",
      RightArrowBar: "\u21E5",
      RightArrowLeftArrow: "\u21C4",
      rightarrowtail: "\u21A3",
      RightCeiling: "\u2309",
      RightDoubleBracket: "\u27E7",
      RightDownTeeVector: "\u295D",
      RightDownVector: "\u21C2",
      RightDownVectorBar: "\u2955",
      RightFloor: "\u230B",
      rightharpoondown: "\u21C1",
      rightharpoonup: "\u21C0",
      rightleftarrows: "\u21C4",
      rightleftharpoons: "\u21CC",
      rightrightarrows: "\u21C9",
      rightsquigarrow: "\u219D",
      RightTee: "\u22A2",
      RightTeeArrow: "\u21A6",
      RightTeeVector: "\u295B",
      rightthreetimes: "\u22CC",
      RightTriangle: "\u22B3",
      RightTriangleBar: "\u29D0",
      RightTriangleEqual: "\u22B5",
      RightUpDownVector: "\u294F",
      RightUpTeeVector: "\u295C",
      RightUpVector: "\u21BE",
      RightUpVectorBar: "\u2954",
      RightVector: "\u21C0",
      RightVectorBar: "\u2953",
      ring: "\u02DA",
      risingdotseq: "\u2253",
      rlarr: "\u21C4",
      rlhar: "\u21CC",
      rlm: "\u200F",
      rmoust: "\u23B1",
      rmoustache: "\u23B1",
      rnmid: "\u2AEE",
      roang: "\u27ED",
      roarr: "\u21FE",
      robrk: "\u27E7",
      ropar: "\u2986",
      Ropf: "\u211D",
      ropf: "\u{1D563}",
      roplus: "\u2A2E",
      rotimes: "\u2A35",
      RoundImplies: "\u2970",
      rpar: ")",
      rpargt: "\u2994",
      rppolint: "\u2A12",
      rrarr: "\u21C9",
      Rrightarrow: "\u21DB",
      rsaquo: "\u203A",
      Rscr: "\u211B",
      rscr: "\u{1D4C7}",
      Rsh: "\u21B1",
      rsh: "\u21B1",
      rsqb: "]",
      rsquo: "\u2019",
      rsquor: "\u2019",
      rthree: "\u22CC",
      rtimes: "\u22CA",
      rtri: "\u25B9",
      rtrie: "\u22B5",
      rtrif: "\u25B8",
      rtriltri: "\u29CE",
      RuleDelayed: "\u29F4",
      ruluhar: "\u2968",
      rx: "\u211E",
      Sacute: "\u015A",
      sacute: "\u015B",
      sbquo: "\u201A",
      Sc: "\u2ABC",
      sc: "\u227B",
      scap: "\u2AB8",
      Scaron: "\u0160",
      scaron: "\u0161",
      sccue: "\u227D",
      scE: "\u2AB4",
      sce: "\u2AB0",
      Scedil: "\u015E",
      scedil: "\u015F",
      Scirc: "\u015C",
      scirc: "\u015D",
      scnap: "\u2ABA",
      scnE: "\u2AB6",
      scnsim: "\u22E9",
      scpolint: "\u2A13",
      scsim: "\u227F",
      Scy: "\u0421",
      scy: "\u0441",
      sdot: "\u22C5",
      sdotb: "\u22A1",
      sdote: "\u2A66",
      searhk: "\u2925",
      seArr: "\u21D8",
      searr: "\u2198",
      searrow: "\u2198",
      sect: "\xA7",
      semi: ";",
      seswar: "\u2929",
      setminus: "\u2216",
      setmn: "\u2216",
      sext: "\u2736",
      Sfr: "\u{1D516}",
      sfr: "\u{1D530}",
      sfrown: "\u2322",
      sharp: "\u266F",
      SHCHcy: "\u0429",
      shchcy: "\u0449",
      SHcy: "\u0428",
      shcy: "\u0448",
      ShortDownArrow: "\u2193",
      ShortLeftArrow: "\u2190",
      shortmid: "\u2223",
      shortparallel: "\u2225",
      ShortRightArrow: "\u2192",
      ShortUpArrow: "\u2191",
      shy: "\xAD",
      Sigma: "\u03A3",
      sigma: "\u03C3",
      sigmaf: "\u03C2",
      sigmav: "\u03C2",
      sim: "\u223C",
      simdot: "\u2A6A",
      sime: "\u2243",
      simeq: "\u2243",
      simg: "\u2A9E",
      simgE: "\u2AA0",
      siml: "\u2A9D",
      simlE: "\u2A9F",
      simne: "\u2246",
      simplus: "\u2A24",
      simrarr: "\u2972",
      slarr: "\u2190",
      SmallCircle: "\u2218",
      smallsetminus: "\u2216",
      smashp: "\u2A33",
      smeparsl: "\u29E4",
      smid: "\u2223",
      smile: "\u2323",
      smt: "\u2AAA",
      smte: "\u2AAC",
      smtes: "\u2AAC\uFE00",
      SOFTcy: "\u042C",
      softcy: "\u044C",
      sol: "/",
      solb: "\u29C4",
      solbar: "\u233F",
      Sopf: "\u{1D54A}",
      sopf: "\u{1D564}",
      spades: "\u2660",
      spadesuit: "\u2660",
      spar: "\u2225",
      sqcap: "\u2293",
      sqcaps: "\u2293\uFE00",
      sqcup: "\u2294",
      sqcups: "\u2294\uFE00",
      Sqrt: "\u221A",
      sqsub: "\u228F",
      sqsube: "\u2291",
      sqsubset: "\u228F",
      sqsubseteq: "\u2291",
      sqsup: "\u2290",
      sqsupe: "\u2292",
      sqsupset: "\u2290",
      sqsupseteq: "\u2292",
      squ: "\u25A1",
      Square: "\u25A1",
      square: "\u25A1",
      SquareIntersection: "\u2293",
      SquareSubset: "\u228F",
      SquareSubsetEqual: "\u2291",
      SquareSuperset: "\u2290",
      SquareSupersetEqual: "\u2292",
      SquareUnion: "\u2294",
      squarf: "\u25AA",
      squf: "\u25AA",
      srarr: "\u2192",
      Sscr: "\u{1D4AE}",
      sscr: "\u{1D4C8}",
      ssetmn: "\u2216",
      ssmile: "\u2323",
      sstarf: "\u22C6",
      Star: "\u22C6",
      star: "\u2606",
      starf: "\u2605",
      straightepsilon: "\u03F5",
      straightphi: "\u03D5",
      strns: "\xAF",
      Sub: "\u22D0",
      sub: "\u2282",
      subdot: "\u2ABD",
      subE: "\u2AC5",
      sube: "\u2286",
      subedot: "\u2AC3",
      submult: "\u2AC1",
      subnE: "\u2ACB",
      subne: "\u228A",
      subplus: "\u2ABF",
      subrarr: "\u2979",
      Subset: "\u22D0",
      subset: "\u2282",
      subseteq: "\u2286",
      subseteqq: "\u2AC5",
      SubsetEqual: "\u2286",
      subsetneq: "\u228A",
      subsetneqq: "\u2ACB",
      subsim: "\u2AC7",
      subsub: "\u2AD5",
      subsup: "\u2AD3",
      succ: "\u227B",
      succapprox: "\u2AB8",
      succcurlyeq: "\u227D",
      Succeeds: "\u227B",
      SucceedsEqual: "\u2AB0",
      SucceedsSlantEqual: "\u227D",
      SucceedsTilde: "\u227F",
      succeq: "\u2AB0",
      succnapprox: "\u2ABA",
      succneqq: "\u2AB6",
      succnsim: "\u22E9",
      succsim: "\u227F",
      SuchThat: "\u220B",
      Sum: "\u2211",
      sum: "\u2211",
      sung: "\u266A",
      Sup: "\u22D1",
      sup: "\u2283",
      sup1: "\xB9",
      sup2: "\xB2",
      sup3: "\xB3",
      supdot: "\u2ABE",
      supdsub: "\u2AD8",
      supE: "\u2AC6",
      supe: "\u2287",
      supedot: "\u2AC4",
      Superset: "\u2283",
      SupersetEqual: "\u2287",
      suphsol: "\u27C9",
      suphsub: "\u2AD7",
      suplarr: "\u297B",
      supmult: "\u2AC2",
      supnE: "\u2ACC",
      supne: "\u228B",
      supplus: "\u2AC0",
      Supset: "\u22D1",
      supset: "\u2283",
      supseteq: "\u2287",
      supseteqq: "\u2AC6",
      supsetneq: "\u228B",
      supsetneqq: "\u2ACC",
      supsim: "\u2AC8",
      supsub: "\u2AD4",
      supsup: "\u2AD6",
      swarhk: "\u2926",
      swArr: "\u21D9",
      swarr: "\u2199",
      swarrow: "\u2199",
      swnwar: "\u292A",
      szlig: "\xDF",
      Tab: "	",
      target: "\u2316",
      Tau: "\u03A4",
      tau: "\u03C4",
      tbrk: "\u23B4",
      Tcaron: "\u0164",
      tcaron: "\u0165",
      Tcedil: "\u0162",
      tcedil: "\u0163",
      Tcy: "\u0422",
      tcy: "\u0442",
      tdot: "\u20DB",
      telrec: "\u2315",
      Tfr: "\u{1D517}",
      tfr: "\u{1D531}",
      there4: "\u2234",
      Therefore: "\u2234",
      therefore: "\u2234",
      Theta: "\u0398",
      theta: "\u03B8",
      thetasym: "\u03D1",
      thetav: "\u03D1",
      thickapprox: "\u2248",
      thicksim: "\u223C",
      ThickSpace: "\u205F\u200A",
      thinsp: "\u2009",
      ThinSpace: "\u2009",
      thkap: "\u2248",
      thksim: "\u223C",
      THORN: "\xDE",
      thorn: "\xFE",
      Tilde: "\u223C",
      tilde: "\u02DC",
      TildeEqual: "\u2243",
      TildeFullEqual: "\u2245",
      TildeTilde: "\u2248",
      times: "\xD7",
      timesb: "\u22A0",
      timesbar: "\u2A31",
      timesd: "\u2A30",
      tint: "\u222D",
      toea: "\u2928",
      top: "\u22A4",
      topbot: "\u2336",
      topcir: "\u2AF1",
      Topf: "\u{1D54B}",
      topf: "\u{1D565}",
      topfork: "\u2ADA",
      tosa: "\u2929",
      tprime: "\u2034",
      TRADE: "\u2122",
      trade: "\u2122",
      triangle: "\u25B5",
      triangledown: "\u25BF",
      triangleleft: "\u25C3",
      trianglelefteq: "\u22B4",
      triangleq: "\u225C",
      triangleright: "\u25B9",
      trianglerighteq: "\u22B5",
      tridot: "\u25EC",
      trie: "\u225C",
      triminus: "\u2A3A",
      TripleDot: "\u20DB",
      triplus: "\u2A39",
      trisb: "\u29CD",
      tritime: "\u2A3B",
      trpezium: "\u23E2",
      Tscr: "\u{1D4AF}",
      tscr: "\u{1D4C9}",
      TScy: "\u0426",
      tscy: "\u0446",
      TSHcy: "\u040B",
      tshcy: "\u045B",
      Tstrok: "\u0166",
      tstrok: "\u0167",
      twixt: "\u226C",
      twoheadleftarrow: "\u219E",
      twoheadrightarrow: "\u21A0",
      Uacute: "\xDA",
      uacute: "\xFA",
      Uarr: "\u219F",
      uArr: "\u21D1",
      uarr: "\u2191",
      Uarrocir: "\u2949",
      Ubrcy: "\u040E",
      ubrcy: "\u045E",
      Ubreve: "\u016C",
      ubreve: "\u016D",
      Ucirc: "\xDB",
      ucirc: "\xFB",
      Ucy: "\u0423",
      ucy: "\u0443",
      udarr: "\u21C5",
      Udblac: "\u0170",
      udblac: "\u0171",
      udhar: "\u296E",
      ufisht: "\u297E",
      Ufr: "\u{1D518}",
      ufr: "\u{1D532}",
      Ugrave: "\xD9",
      ugrave: "\xF9",
      uHar: "\u2963",
      uharl: "\u21BF",
      uharr: "\u21BE",
      uhblk: "\u2580",
      ulcorn: "\u231C",
      ulcorner: "\u231C",
      ulcrop: "\u230F",
      ultri: "\u25F8",
      Umacr: "\u016A",
      umacr: "\u016B",
      uml: "\xA8",
      UnderBar: "_",
      UnderBrace: "\u23DF",
      UnderBracket: "\u23B5",
      UnderParenthesis: "\u23DD",
      Union: "\u22C3",
      UnionPlus: "\u228E",
      Uogon: "\u0172",
      uogon: "\u0173",
      Uopf: "\u{1D54C}",
      uopf: "\u{1D566}",
      UpArrow: "\u2191",
      Uparrow: "\u21D1",
      uparrow: "\u2191",
      UpArrowBar: "\u2912",
      UpArrowDownArrow: "\u21C5",
      UpDownArrow: "\u2195",
      Updownarrow: "\u21D5",
      updownarrow: "\u2195",
      UpEquilibrium: "\u296E",
      upharpoonleft: "\u21BF",
      upharpoonright: "\u21BE",
      uplus: "\u228E",
      UpperLeftArrow: "\u2196",
      UpperRightArrow: "\u2197",
      Upsi: "\u03D2",
      upsi: "\u03C5",
      upsih: "\u03D2",
      Upsilon: "\u03A5",
      upsilon: "\u03C5",
      UpTee: "\u22A5",
      UpTeeArrow: "\u21A5",
      upuparrows: "\u21C8",
      urcorn: "\u231D",
      urcorner: "\u231D",
      urcrop: "\u230E",
      Uring: "\u016E",
      uring: "\u016F",
      urtri: "\u25F9",
      Uscr: "\u{1D4B0}",
      uscr: "\u{1D4CA}",
      utdot: "\u22F0",
      Utilde: "\u0168",
      utilde: "\u0169",
      utri: "\u25B5",
      utrif: "\u25B4",
      uuarr: "\u21C8",
      Uuml: "\xDC",
      uuml: "\xFC",
      uwangle: "\u29A7",
      vangrt: "\u299C",
      varepsilon: "\u03F5",
      varkappa: "\u03F0",
      varnothing: "\u2205",
      varphi: "\u03D5",
      varpi: "\u03D6",
      varpropto: "\u221D",
      vArr: "\u21D5",
      varr: "\u2195",
      varrho: "\u03F1",
      varsigma: "\u03C2",
      varsubsetneq: "\u228A\uFE00",
      varsubsetneqq: "\u2ACB\uFE00",
      varsupsetneq: "\u228B\uFE00",
      varsupsetneqq: "\u2ACC\uFE00",
      vartheta: "\u03D1",
      vartriangleleft: "\u22B2",
      vartriangleright: "\u22B3",
      Vbar: "\u2AEB",
      vBar: "\u2AE8",
      vBarv: "\u2AE9",
      Vcy: "\u0412",
      vcy: "\u0432",
      VDash: "\u22AB",
      Vdash: "\u22A9",
      vDash: "\u22A8",
      vdash: "\u22A2",
      Vdashl: "\u2AE6",
      Vee: "\u22C1",
      vee: "\u2228",
      veebar: "\u22BB",
      veeeq: "\u225A",
      vellip: "\u22EE",
      Verbar: "\u2016",
      verbar: "|",
      Vert: "\u2016",
      vert: "|",
      VerticalBar: "\u2223",
      VerticalLine: "|",
      VerticalSeparator: "\u2758",
      VerticalTilde: "\u2240",
      VeryThinSpace: "\u200A",
      Vfr: "\u{1D519}",
      vfr: "\u{1D533}",
      vltri: "\u22B2",
      vnsub: "\u2282\u20D2",
      vnsup: "\u2283\u20D2",
      Vopf: "\u{1D54D}",
      vopf: "\u{1D567}",
      vprop: "\u221D",
      vrtri: "\u22B3",
      Vscr: "\u{1D4B1}",
      vscr: "\u{1D4CB}",
      vsubnE: "\u2ACB\uFE00",
      vsubne: "\u228A\uFE00",
      vsupnE: "\u2ACC\uFE00",
      vsupne: "\u228B\uFE00",
      Vvdash: "\u22AA",
      vzigzag: "\u299A",
      Wcirc: "\u0174",
      wcirc: "\u0175",
      wedbar: "\u2A5F",
      Wedge: "\u22C0",
      wedge: "\u2227",
      wedgeq: "\u2259",
      weierp: "\u2118",
      Wfr: "\u{1D51A}",
      wfr: "\u{1D534}",
      Wopf: "\u{1D54E}",
      wopf: "\u{1D568}",
      wp: "\u2118",
      wr: "\u2240",
      wreath: "\u2240",
      Wscr: "\u{1D4B2}",
      wscr: "\u{1D4CC}",
      xcap: "\u22C2",
      xcirc: "\u25EF",
      xcup: "\u22C3",
      xdtri: "\u25BD",
      Xfr: "\u{1D51B}",
      xfr: "\u{1D535}",
      xhArr: "\u27FA",
      xharr: "\u27F7",
      Xi: "\u039E",
      xi: "\u03BE",
      xlArr: "\u27F8",
      xlarr: "\u27F5",
      xmap: "\u27FC",
      xnis: "\u22FB",
      xodot: "\u2A00",
      Xopf: "\u{1D54F}",
      xopf: "\u{1D569}",
      xoplus: "\u2A01",
      xotime: "\u2A02",
      xrArr: "\u27F9",
      xrarr: "\u27F6",
      Xscr: "\u{1D4B3}",
      xscr: "\u{1D4CD}",
      xsqcup: "\u2A06",
      xuplus: "\u2A04",
      xutri: "\u25B3",
      xvee: "\u22C1",
      xwedge: "\u22C0",
      Yacute: "\xDD",
      yacute: "\xFD",
      YAcy: "\u042F",
      yacy: "\u044F",
      Ycirc: "\u0176",
      ycirc: "\u0177",
      Ycy: "\u042B",
      ycy: "\u044B",
      yen: "\xA5",
      Yfr: "\u{1D51C}",
      yfr: "\u{1D536}",
      YIcy: "\u0407",
      yicy: "\u0457",
      Yopf: "\u{1D550}",
      yopf: "\u{1D56A}",
      Yscr: "\u{1D4B4}",
      yscr: "\u{1D4CE}",
      YUcy: "\u042E",
      yucy: "\u044E",
      Yuml: "\u0178",
      yuml: "\xFF",
      Zacute: "\u0179",
      zacute: "\u017A",
      Zcaron: "\u017D",
      zcaron: "\u017E",
      Zcy: "\u0417",
      zcy: "\u0437",
      Zdot: "\u017B",
      zdot: "\u017C",
      zeetrf: "\u2128",
      ZeroWidthSpace: "\u200B",
      Zeta: "\u0396",
      zeta: "\u03B6",
      Zfr: "\u2128",
      zfr: "\u{1D537}",
      ZHcy: "\u0416",
      zhcy: "\u0436",
      zigrarr: "\u21DD",
      Zopf: "\u2124",
      zopf: "\u{1D56B}",
      Zscr: "\u{1D4B5}",
      zscr: "\u{1D4CF}",
      zwj: "\u200D",
      zwnj: "\u200C"
    });
    exports.entityMap = exports.HTML_ENTITIES;
  }
});

// node_modules/@xmldom/xmldom/lib/sax.js
var require_sax = __commonJS({
  "node_modules/@xmldom/xmldom/lib/sax.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var g = require_grammar();
    var errors = require_errors();
    var isHTMLEscapableRawTextElement = conventions.isHTMLEscapableRawTextElement;
    var isHTMLMimeType = conventions.isHTMLMimeType;
    var isHTMLRawTextElement = conventions.isHTMLRawTextElement;
    var hasOwn = conventions.hasOwn;
    var NAMESPACE = conventions.NAMESPACE;
    var ParseError = errors.ParseError;
    var DOMException = errors.DOMException;
    var S_TAG = 0;
    var S_ATTR = 1;
    var S_ATTR_SPACE = 2;
    var S_EQ = 3;
    var S_ATTR_NOQUOT_VALUE = 4;
    var S_ATTR_END = 5;
    var S_TAG_SPACE = 6;
    var S_TAG_CLOSE = 7;
    function XMLReader() {
    }
    XMLReader.prototype = {
      parse: function(source, defaultNSMap, entityMap) {
        var domBuilder = this.domBuilder;
        domBuilder.startDocument();
        _copy(defaultNSMap, defaultNSMap = /* @__PURE__ */ Object.create(null));
        parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
        domBuilder.endDocument();
      }
    };
    var ENTITY_REG = /&#?\w+;?/g;
    function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
      var isHTML = isHTMLMimeType(domBuilder.mimeType);
      if (source.indexOf(g.UNICODE_REPLACEMENT_CHARACTER) >= 0) {
        errorHandler.warning("Unicode replacement character detected, source encoding issues?");
      }
      function fixedFromCharCode(code) {
        if (code > 65535) {
          code -= 65536;
          var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
          return String.fromCharCode(surrogate1, surrogate2);
        } else {
          return String.fromCharCode(code);
        }
      }
      function entityReplacer(a2) {
        var complete = a2[a2.length - 1] === ";" ? a2 : a2 + ";";
        if (!isHTML && complete !== a2) {
          errorHandler.error("EntityRef: expecting ;");
          return a2;
        }
        var match = g.Reference.exec(complete);
        if (!match || match[0].length !== complete.length) {
          errorHandler.error("entity not matching Reference production: " + a2);
          return a2;
        }
        var k = complete.slice(1, -1);
        if (hasOwn(entityMap, k)) {
          return entityMap[k];
        } else if (k.charAt(0) === "#") {
          return fixedFromCharCode(parseInt(k.substring(1).replace("x", "0x")));
        } else {
          errorHandler.error("entity not found:" + a2);
          return a2;
        }
      }
      function appendText(end2) {
        if (end2 > start) {
          var xt = source.substring(start, end2).replace(ENTITY_REG, entityReplacer);
          locator && position(start);
          domBuilder.characters(xt, 0, end2 - start);
          start = end2;
        }
      }
      var lineStart = 0;
      var lineEnd = 0;
      var linePattern = /\r\n?|\n|$/g;
      var locator = domBuilder.locator;
      function position(p, m) {
        while (p >= lineEnd && (m = linePattern.exec(source))) {
          lineStart = lineEnd;
          lineEnd = m.index + m[0].length;
          locator.lineNumber++;
        }
        locator.columnNumber = p - lineStart + 1;
      }
      var parseStack = [{ currentNSMap: defaultNSMapCopy }];
      var unclosedTags = [];
      var start = 0;
      while (true) {
        try {
          var tagStart = source.indexOf("<", start);
          if (tagStart < 0) {
            if (!isHTML && unclosedTags.length > 0) {
              return errorHandler.fatalError("unclosed xml tag(s): " + unclosedTags.join(", "));
            }
            if (!source.substring(start).match(/^\s*$/)) {
              var doc = domBuilder.doc;
              var text = doc.createTextNode(source.substring(start));
              if (doc.documentElement) {
                return errorHandler.error("Extra content at the end of the document");
              }
              doc.appendChild(text);
              domBuilder.currentElement = text;
            }
            return;
          }
          if (tagStart > start) {
            var fromSource = source.substring(start, tagStart);
            if (!isHTML && unclosedTags.length === 0) {
              fromSource = fromSource.replace(new RegExp(g.S_OPT.source, "g"), "");
              fromSource && errorHandler.error("Unexpected content outside root element: '" + fromSource + "'");
            }
            appendText(tagStart);
          }
          switch (source.charAt(tagStart + 1)) {
            case "/":
              var end = source.indexOf(">", tagStart + 2);
              var tagNameRaw = source.substring(tagStart + 2, end > 0 ? end : void 0);
              if (!tagNameRaw) {
                return errorHandler.fatalError("end tag name missing");
              }
              var tagNameMatch = end > 0 && g.reg("^", g.QName_group, g.S_OPT, "$").exec(tagNameRaw);
              if (!tagNameMatch) {
                return errorHandler.fatalError('end tag name contains invalid characters: "' + tagNameRaw + '"');
              }
              if (!domBuilder.currentElement && !domBuilder.doc.documentElement) {
                return;
              }
              var currentTagName = unclosedTags[unclosedTags.length - 1] || domBuilder.currentElement.tagName || domBuilder.doc.documentElement.tagName || "";
              if (currentTagName !== tagNameMatch[1]) {
                var tagNameLower = tagNameMatch[1].toLowerCase();
                if (!isHTML || currentTagName.toLowerCase() !== tagNameLower) {
                  return errorHandler.fatalError('Opening and ending tag mismatch: "' + currentTagName + '" != "' + tagNameRaw + '"');
                }
              }
              var config = parseStack.pop();
              unclosedTags.pop();
              var localNSMap = config.localNSMap;
              domBuilder.endElement(config.uri, config.localName, currentTagName);
              if (localNSMap) {
                for (var prefix2 in localNSMap) {
                  if (hasOwn(localNSMap, prefix2)) {
                    domBuilder.endPrefixMapping(prefix2);
                  }
                }
              }
              end++;
              break;
            // end element
            case "?":
              locator && position(tagStart);
              end = parseProcessingInstruction(source, tagStart, domBuilder, errorHandler);
              break;
            case "!":
              locator && position(tagStart);
              end = parseDoctypeCommentOrCData(source, tagStart, domBuilder, errorHandler, isHTML);
              break;
            default:
              locator && position(tagStart);
              var el = new ElementAttributes();
              var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
              var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler, isHTML);
              var len = el.length;
              if (!el.closed) {
                if (isHTML && conventions.isHTMLVoidElement(el.tagName)) {
                  el.closed = true;
                } else {
                  unclosedTags.push(el.tagName);
                }
              }
              if (locator && len) {
                var locator2 = copyLocator(locator, {});
                for (var i = 0; i < len; i++) {
                  var a = el[i];
                  position(a.offset);
                  a.locator = copyLocator(locator, {});
                }
                domBuilder.locator = locator2;
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
                domBuilder.locator = locator;
              } else {
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
              }
              if (isHTML && !el.closed) {
                end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
              } else {
                end++;
              }
          }
        } catch (e) {
          if (e instanceof ParseError) {
            throw e;
          } else if (e instanceof DOMException) {
            throw new ParseError(e.name + ": " + e.message, domBuilder.locator, e);
          }
          errorHandler.error("element parse error: " + e);
          end = -1;
        }
        if (end > start) {
          start = end;
        } else {
          appendText(Math.max(tagStart, start) + 1);
        }
      }
    }
    function copyLocator(f, t) {
      t.lineNumber = f.lineNumber;
      t.columnNumber = f.columnNumber;
      return t;
    }
    function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler, isHTML) {
      function addAttribute(qname, value2, startIndex) {
        if (hasOwn(el.attributeNames, qname)) {
          return errorHandler.fatalError("Attribute " + qname + " redefined");
        }
        if (!isHTML && value2.indexOf("<") >= 0) {
          return errorHandler.fatalError("Unescaped '<' not allowed in attributes values");
        }
        el.addValue(
          qname,
          // @see https://www.w3.org/TR/xml/#AVNormalize
          // since the xmldom sax parser does not "interpret" DTD the following is not implemented:
          // - recursive replacement of (DTD) entity references
          // - trimming and collapsing multiple spaces into a single one for attributes that are not of type CDATA
          value2.replace(/[\t\n\r]/g, " ").replace(ENTITY_REG, entityReplacer),
          startIndex
        );
      }
      var attrName;
      var value;
      var p = ++start;
      var s = S_TAG;
      while (true) {
        var c = source.charAt(p);
        switch (c) {
          case "=":
            if (s === S_ATTR) {
              attrName = source.slice(start, p);
              s = S_EQ;
            } else if (s === S_ATTR_SPACE) {
              s = S_EQ;
            } else {
              throw new Error("attribute equal must after attrName");
            }
            break;
          case "'":
          case '"':
            if (s === S_EQ || s === S_ATTR) {
              if (s === S_ATTR) {
                errorHandler.warning('attribute value must after "="');
                attrName = source.slice(start, p);
              }
              start = p + 1;
              p = source.indexOf(c, start);
              if (p > 0) {
                value = source.slice(start, p);
                addAttribute(attrName, value, start - 1);
                s = S_ATTR_END;
              } else {
                throw new Error("attribute value no end '" + c + "' match");
              }
            } else if (s == S_ATTR_NOQUOT_VALUE) {
              value = source.slice(start, p);
              addAttribute(attrName, value, start);
              errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
              start = p + 1;
              s = S_ATTR_END;
            } else {
              throw new Error('attribute value must after "="');
            }
            break;
          case "/":
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                s = S_TAG_CLOSE;
                el.closed = true;
              case S_ATTR_NOQUOT_VALUE:
              case S_ATTR:
                break;
              case S_ATTR_SPACE:
                el.closed = true;
                break;
              //case S_EQ:
              default:
                throw new Error("attribute invalid close char('/')");
            }
            break;
          case "":
            errorHandler.error("unexpected end of input");
            if (s == S_TAG) {
              el.setTagName(source.slice(start, p));
            }
            return p;
          case ">":
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                break;
              //normal
              case S_ATTR_NOQUOT_VALUE:
              //Compatible state
              case S_ATTR:
                value = source.slice(start, p);
                if (value.slice(-1) === "/") {
                  el.closed = true;
                  value = value.slice(0, -1);
                }
              case S_ATTR_SPACE:
                if (s === S_ATTR_SPACE) {
                  value = attrName;
                }
                if (s == S_ATTR_NOQUOT_VALUE) {
                  errorHandler.warning('attribute "' + value + '" missed quot(")!');
                  addAttribute(attrName, value, start);
                } else {
                  if (!isHTML) {
                    errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                  }
                  addAttribute(value, value, start);
                }
                break;
              case S_EQ:
                if (!isHTML) {
                  return errorHandler.fatalError(`AttValue: ' or " expected`);
                }
            }
            return p;
          /*xml space '\x20' | #x9 | #xD | #xA; */
          case "\x80":
            c = " ";
          default:
            if (c <= " ") {
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                  s = S_TAG_SPACE;
                  break;
                case S_ATTR:
                  attrName = source.slice(start, p);
                  s = S_ATTR_SPACE;
                  break;
                case S_ATTR_NOQUOT_VALUE:
                  var value = source.slice(start, p);
                  errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                  addAttribute(attrName, value, start);
                case S_ATTR_END:
                  s = S_TAG_SPACE;
                  break;
              }
            } else {
              switch (s) {
                //case S_TAG:void();break;
                //case S_ATTR:void();break;
                //case S_ATTR_NOQUOT_VALUE:void();break;
                case S_ATTR_SPACE:
                  if (!isHTML) {
                    errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                  }
                  addAttribute(attrName, attrName, start);
                  start = p;
                  s = S_ATTR;
                  break;
                case S_ATTR_END:
                  errorHandler.warning('attribute space is required"' + attrName + '"!!');
                case S_TAG_SPACE:
                  s = S_ATTR;
                  start = p;
                  break;
                case S_EQ:
                  s = S_ATTR_NOQUOT_VALUE;
                  start = p;
                  break;
                case S_TAG_CLOSE:
                  throw new Error("elements closed character '/' and '>' must be connected to");
              }
            }
        }
        p++;
      }
    }
    function appendElement(el, domBuilder, currentNSMap) {
      var tagName = el.tagName;
      var localNSMap = null;
      var i = el.length;
      while (i--) {
        var a = el[i];
        var qName = a.qName;
        var value = a.value;
        var nsp = qName.indexOf(":");
        if (nsp > 0) {
          var prefix2 = a.prefix = qName.slice(0, nsp);
          var localName = qName.slice(nsp + 1);
          var nsPrefix = prefix2 === "xmlns" && localName;
        } else {
          localName = qName;
          prefix2 = null;
          nsPrefix = qName === "xmlns" && "";
        }
        a.localName = localName;
        if (nsPrefix !== false) {
          if (localNSMap == null) {
            localNSMap = /* @__PURE__ */ Object.create(null);
            _copy(currentNSMap, currentNSMap = /* @__PURE__ */ Object.create(null));
          }
          currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
          a.uri = NAMESPACE.XMLNS;
          domBuilder.startPrefixMapping(nsPrefix, value);
        }
      }
      var i = el.length;
      while (i--) {
        a = el[i];
        if (a.prefix) {
          if (a.prefix === "xml") {
            a.uri = NAMESPACE.XML;
          }
          if (a.prefix !== "xmlns") {
            a.uri = currentNSMap[a.prefix];
          }
        }
      }
      var nsp = tagName.indexOf(":");
      if (nsp > 0) {
        prefix2 = el.prefix = tagName.slice(0, nsp);
        localName = el.localName = tagName.slice(nsp + 1);
      } else {
        prefix2 = null;
        localName = el.localName = tagName;
      }
      var ns = el.uri = currentNSMap[prefix2 || ""];
      domBuilder.startElement(ns, localName, tagName, el);
      if (el.closed) {
        domBuilder.endElement(ns, localName, tagName);
        if (localNSMap) {
          for (prefix2 in localNSMap) {
            if (hasOwn(localNSMap, prefix2)) {
              domBuilder.endPrefixMapping(prefix2);
            }
          }
        }
      } else {
        el.currentNSMap = currentNSMap;
        el.localNSMap = localNSMap;
        return true;
      }
    }
    function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
      var isEscapableRaw = isHTMLEscapableRawTextElement(tagName);
      if (isEscapableRaw || isHTMLRawTextElement(tagName)) {
        var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
        var text = source.substring(elStartEnd + 1, elEndStart);
        if (isEscapableRaw) {
          text = text.replace(ENTITY_REG, entityReplacer);
        }
        domBuilder.characters(text, 0, text.length);
        return elEndStart;
      }
      return elStartEnd + 1;
    }
    function _copy(source, target) {
      for (var n in source) {
        if (hasOwn(source, n)) {
          target[n] = source[n];
        }
      }
    }
    function parseUtils(source, start) {
      var index = start;
      function char(n) {
        n = n || 0;
        return source.charAt(index + n);
      }
      function skip(n) {
        n = n || 1;
        index += n;
      }
      function skipBlanks() {
        var blanks = 0;
        while (index < source.length) {
          var c = char();
          if (c !== " " && c !== "\n" && c !== "	" && c !== "\r") {
            return blanks;
          }
          blanks++;
          skip();
        }
        return -1;
      }
      function substringFromIndex() {
        return source.substring(index);
      }
      function substringStartsWith(text) {
        return source.substring(index, index + text.length) === text;
      }
      function substringStartsWithCaseInsensitive(text) {
        return source.substring(index, index + text.length).toUpperCase() === text.toUpperCase();
      }
      function getMatch(args) {
        var expr = g.reg("^", args);
        var match = expr.exec(substringFromIndex());
        if (match) {
          skip(match[0].length);
          return match[0];
        }
        return null;
      }
      return {
        char,
        getIndex: function() {
          return index;
        },
        getMatch,
        getSource: function() {
          return source;
        },
        skip,
        skipBlanks,
        substringFromIndex,
        substringStartsWith,
        substringStartsWithCaseInsensitive
      };
    }
    function parseDoctypeInternalSubset(p, errorHandler) {
      function parsePI(p2, errorHandler2) {
        var match = g.PI.exec(p2.substringFromIndex());
        if (!match) {
          return errorHandler2.fatalError("processing instruction is not well-formed at position " + p2.getIndex());
        }
        if (match[1].toLowerCase() === "xml") {
          return errorHandler2.fatalError(
            "xml declaration is only allowed at the start of the document, but found at position " + p2.getIndex()
          );
        }
        p2.skip(match[0].length);
        return match[0];
      }
      var source = p.getSource();
      if (p.char() === "[") {
        p.skip(1);
        var intSubsetStart = p.getIndex();
        while (p.getIndex() < source.length) {
          p.skipBlanks();
          if (p.char() === "]") {
            var internalSubset = source.substring(intSubsetStart, p.getIndex());
            p.skip(1);
            return internalSubset;
          }
          var current = null;
          if (p.char() === "<" && p.char(1) === "!") {
            switch (p.char(2)) {
              case "E":
                if (p.char(3) === "L") {
                  current = p.getMatch(g.elementdecl);
                } else if (p.char(3) === "N") {
                  current = p.getMatch(g.EntityDecl);
                }
                break;
              case "A":
                current = p.getMatch(g.AttlistDecl);
                break;
              case "N":
                current = p.getMatch(g.NotationDecl);
                break;
              case "-":
                current = p.getMatch(g.Comment);
                break;
            }
          } else if (p.char() === "<" && p.char(1) === "?") {
            current = parsePI(p, errorHandler);
          } else if (p.char() === "%") {
            current = p.getMatch(g.PEReference);
          } else {
            return errorHandler.fatalError("Error detected in Markup declaration");
          }
          if (!current) {
            return errorHandler.fatalError("Error in internal subset at position " + p.getIndex());
          }
        }
        return errorHandler.fatalError("doctype internal subset is not well-formed, missing ]");
      }
    }
    function parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler, isHTML) {
      var p = parseUtils(source, start);
      switch (isHTML ? p.char(2).toUpperCase() : p.char(2)) {
        case "-":
          var comment = p.getMatch(g.Comment);
          if (comment) {
            domBuilder.comment(comment, g.COMMENT_START.length, comment.length - g.COMMENT_START.length - g.COMMENT_END.length);
            return p.getIndex();
          } else {
            return errorHandler.fatalError("comment is not well-formed at position " + p.getIndex());
          }
        case "[":
          var cdata = p.getMatch(g.CDSect);
          if (cdata) {
            if (!isHTML && !domBuilder.currentElement) {
              return errorHandler.fatalError("CDATA outside of element");
            }
            domBuilder.startCDATA();
            domBuilder.characters(cdata, g.CDATA_START.length, cdata.length - g.CDATA_START.length - g.CDATA_END.length);
            domBuilder.endCDATA();
            return p.getIndex();
          } else {
            return errorHandler.fatalError("Invalid CDATA starting at position " + start);
          }
        case "D": {
          if (domBuilder.doc && domBuilder.doc.documentElement) {
            return errorHandler.fatalError("Doctype not allowed inside or after documentElement at position " + p.getIndex());
          }
          if (isHTML ? !p.substringStartsWithCaseInsensitive(g.DOCTYPE_DECL_START) : !p.substringStartsWith(g.DOCTYPE_DECL_START)) {
            return errorHandler.fatalError("Expected " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
          }
          p.skip(g.DOCTYPE_DECL_START.length);
          if (p.skipBlanks() < 1) {
            return errorHandler.fatalError("Expected whitespace after " + g.DOCTYPE_DECL_START + " at position " + p.getIndex());
          }
          var doctype = {
            name: void 0,
            publicId: void 0,
            systemId: void 0,
            internalSubset: void 0
          };
          doctype.name = p.getMatch(g.Name);
          if (!doctype.name)
            return errorHandler.fatalError("doctype name missing or contains unexpected characters at position " + p.getIndex());
          if (isHTML && doctype.name.toLowerCase() !== "html") {
            errorHandler.warning("Unexpected DOCTYPE in HTML document at position " + p.getIndex());
          }
          p.skipBlanks();
          if (p.substringStartsWith(g.PUBLIC) || p.substringStartsWith(g.SYSTEM)) {
            var match = g.ExternalID_match.exec(p.substringFromIndex());
            if (!match) {
              return errorHandler.fatalError("doctype external id is not well-formed at position " + p.getIndex());
            }
            if (match.groups.SystemLiteralOnly !== void 0) {
              doctype.systemId = match.groups.SystemLiteralOnly;
            } else {
              doctype.systemId = match.groups.SystemLiteral;
              doctype.publicId = match.groups.PubidLiteral;
            }
            p.skip(match[0].length);
          } else if (isHTML && p.substringStartsWithCaseInsensitive(g.SYSTEM)) {
            p.skip(g.SYSTEM.length);
            if (p.skipBlanks() < 1) {
              return errorHandler.fatalError("Expected whitespace after " + g.SYSTEM + " at position " + p.getIndex());
            }
            doctype.systemId = p.getMatch(g.ABOUT_LEGACY_COMPAT_SystemLiteral);
            if (!doctype.systemId) {
              return errorHandler.fatalError(
                "Expected " + g.ABOUT_LEGACY_COMPAT + " in single or double quotes after " + g.SYSTEM + " at position " + p.getIndex()
              );
            }
          }
          if (isHTML && doctype.systemId && !g.ABOUT_LEGACY_COMPAT_SystemLiteral.test(doctype.systemId)) {
            errorHandler.warning("Unexpected doctype.systemId in HTML document at position " + p.getIndex());
          }
          if (!isHTML) {
            p.skipBlanks();
            doctype.internalSubset = parseDoctypeInternalSubset(p, errorHandler);
          }
          p.skipBlanks();
          if (p.char() !== ">") {
            return errorHandler.fatalError("doctype not terminated with > at position " + p.getIndex());
          }
          p.skip(1);
          domBuilder.startDTD(doctype.name, doctype.publicId, doctype.systemId, doctype.internalSubset);
          domBuilder.endDTD();
          return p.getIndex();
        }
        default:
          return errorHandler.fatalError('Not well-formed XML starting with "<!" at position ' + start);
      }
    }
    function parseProcessingInstruction(source, start, domBuilder, errorHandler) {
      var match = source.substring(start).match(g.PI);
      if (!match) {
        return errorHandler.fatalError("Invalid processing instruction starting at position " + start);
      }
      if (match[1].toLowerCase() === "xml") {
        if (start > 0) {
          return errorHandler.fatalError(
            "processing instruction at position " + start + " is an xml declaration which is only at the start of the document"
          );
        }
        if (!g.XMLDecl.test(source.substring(start))) {
          return errorHandler.fatalError("xml declaration is not well-formed");
        }
      }
      domBuilder.processingInstruction(match[1], match[2]);
      return start + match[0].length;
    }
    function ElementAttributes() {
      this.attributeNames = /* @__PURE__ */ Object.create(null);
    }
    ElementAttributes.prototype = {
      setTagName: function(tagName) {
        if (!g.QName_exact.test(tagName)) {
          throw new Error("invalid tagName:" + tagName);
        }
        this.tagName = tagName;
      },
      addValue: function(qName, value, offset) {
        if (!g.QName_exact.test(qName)) {
          throw new Error("invalid attribute:" + qName);
        }
        this.attributeNames[qName] = this.length;
        this[this.length++] = { qName, value, offset };
      },
      length: 0,
      getLocalName: function(i) {
        return this[i].localName;
      },
      getLocator: function(i) {
        return this[i].locator;
      },
      getQName: function(i) {
        return this[i].qName;
      },
      getURI: function(i) {
        return this[i].uri;
      },
      getValue: function(i) {
        return this[i].value;
      }
      //	,getIndex:function(uri, localName)){
      //		if(localName){
      //
      //		}else{
      //			var qName = uri
      //		}
      //	},
      //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
      //	getType:function(uri,localName){}
      //	getType:function(i){},
    };
    exports.XMLReader = XMLReader;
    exports.parseUtils = parseUtils;
    exports.parseDoctypeCommentOrCData = parseDoctypeCommentOrCData;
  }
});

// node_modules/@xmldom/xmldom/lib/dom-parser.js
var require_dom_parser = __commonJS({
  "node_modules/@xmldom/xmldom/lib/dom-parser.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var dom = require_dom();
    var errors = require_errors();
    var entities = require_entities();
    var sax = require_sax();
    var DOMImplementation = dom.DOMImplementation;
    var hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
    var isHTMLMimeType = conventions.isHTMLMimeType;
    var isValidMimeType = conventions.isValidMimeType;
    var MIME_TYPE = conventions.MIME_TYPE;
    var NAMESPACE = conventions.NAMESPACE;
    var ParseError = errors.ParseError;
    var XMLReader = sax.XMLReader;
    function normalizeLineEndings(input) {
      return input.replace(/\r[\n\u0085]/g, "\n").replace(/[\r\u0085\u2028\u2029]/g, "\n");
    }
    function DOMParser2(options) {
      options = options || {};
      if (options.locator === void 0) {
        options.locator = true;
      }
      this.assign = options.assign || conventions.assign;
      this.domHandler = options.domHandler || DOMHandler;
      this.onError = options.onError || options.errorHandler;
      if (options.errorHandler && typeof options.errorHandler !== "function") {
        throw new TypeError("errorHandler object is no longer supported, switch to onError!");
      } else if (options.errorHandler) {
        options.errorHandler("warning", "The `errorHandler` option has been deprecated, use `onError` instead!", this);
      }
      this.normalizeLineEndings = options.normalizeLineEndings || normalizeLineEndings;
      this.locator = !!options.locator;
      this.xmlns = this.assign(/* @__PURE__ */ Object.create(null), options.xmlns);
    }
    DOMParser2.prototype.parseFromString = function(source, mimeType) {
      if (!isValidMimeType(mimeType)) {
        throw new TypeError('DOMParser.parseFromString: the provided mimeType "' + mimeType + '" is not valid.');
      }
      var defaultNSMap = this.assign(/* @__PURE__ */ Object.create(null), this.xmlns);
      var entityMap = entities.XML_ENTITIES;
      var defaultNamespace = defaultNSMap[""] || null;
      if (hasDefaultHTMLNamespace(mimeType)) {
        entityMap = entities.HTML_ENTITIES;
        defaultNamespace = NAMESPACE.HTML;
      } else if (mimeType === MIME_TYPE.XML_SVG_IMAGE) {
        defaultNamespace = NAMESPACE.SVG;
      }
      defaultNSMap[""] = defaultNamespace;
      defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
      var domBuilder = new this.domHandler({
        mimeType,
        defaultNamespace,
        onError: this.onError
      });
      var locator = this.locator ? {} : void 0;
      if (this.locator) {
        domBuilder.setDocumentLocator(locator);
      }
      var sax2 = new XMLReader();
      sax2.errorHandler = domBuilder;
      sax2.domBuilder = domBuilder;
      var isXml = !conventions.isHTMLMimeType(mimeType);
      if (isXml && typeof source !== "string") {
        sax2.errorHandler.fatalError("source is not a string");
      }
      sax2.parse(this.normalizeLineEndings(String(source)), defaultNSMap, entityMap);
      if (!domBuilder.doc.documentElement) {
        sax2.errorHandler.fatalError("missing root element");
      }
      return domBuilder.doc;
    };
    function DOMHandler(options) {
      var opt = options || {};
      this.mimeType = opt.mimeType || MIME_TYPE.XML_APPLICATION;
      this.defaultNamespace = opt.defaultNamespace || null;
      this.cdata = false;
      this.currentElement = void 0;
      this.doc = void 0;
      this.locator = void 0;
      this.onError = opt.onError;
    }
    function position(locator, node) {
      node.lineNumber = locator.lineNumber;
      node.columnNumber = locator.columnNumber;
    }
    DOMHandler.prototype = {
      /**
       * Either creates an XML or an HTML document and stores it under `this.doc`.
       * If it is an XML document, `this.defaultNamespace` is used to create it,
       * and it will not contain any `childNodes`.
       * If it is an HTML document, it will be created without any `childNodes`.
       *
       * @see http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
       */
      startDocument: function() {
        var impl = new DOMImplementation();
        this.doc = isHTMLMimeType(this.mimeType) ? impl.createHTMLDocument(false) : impl.createDocument(this.defaultNamespace, "");
      },
      startElement: function(namespaceURI, localName, qName, attrs) {
        var doc = this.doc;
        var el = doc.createElementNS(namespaceURI, qName || localName);
        var len = attrs.length;
        appendElement(this, el);
        this.currentElement = el;
        this.locator && position(this.locator, el);
        for (var i = 0; i < len; i++) {
          var namespaceURI = attrs.getURI(i);
          var value = attrs.getValue(i);
          var qName = attrs.getQName(i);
          var attr = doc.createAttributeNS(namespaceURI, qName);
          this.locator && position(attrs.getLocator(i), attr);
          attr.value = attr.nodeValue = value;
          el.setAttributeNode(attr);
        }
      },
      endElement: function(namespaceURI, localName, qName) {
        this.currentElement = this.currentElement.parentNode;
      },
      startPrefixMapping: function(prefix2, uri2) {
      },
      endPrefixMapping: function(prefix2) {
      },
      processingInstruction: function(target, data) {
        var ins = this.doc.createProcessingInstruction(target, data);
        this.locator && position(this.locator, ins);
        appendElement(this, ins);
      },
      ignorableWhitespace: function(ch, start, length) {
      },
      characters: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        if (chars) {
          if (this.cdata) {
            var charNode = this.doc.createCDATASection(chars);
          } else {
            var charNode = this.doc.createTextNode(chars);
          }
          if (this.currentElement) {
            this.currentElement.appendChild(charNode);
          } else if (/^\s*$/.test(chars)) {
            this.doc.appendChild(charNode);
          }
          this.locator && position(this.locator, charNode);
        }
      },
      skippedEntity: function(name2) {
      },
      endDocument: function() {
        this.doc.normalize();
      },
      /**
       * Stores the locator to be able to set the `columnNumber` and `lineNumber`
       * on the created DOM nodes.
       *
       * @param {Locator} locator
       */
      setDocumentLocator: function(locator) {
        if (locator) {
          locator.lineNumber = 0;
        }
        this.locator = locator;
      },
      //LexicalHandler
      comment: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        var comm = this.doc.createComment(chars);
        this.locator && position(this.locator, comm);
        appendElement(this, comm);
      },
      startCDATA: function() {
        this.cdata = true;
      },
      endCDATA: function() {
        this.cdata = false;
      },
      startDTD: function(name2, publicId, systemId, internalSubset) {
        var impl = this.doc.implementation;
        if (impl && impl.createDocumentType) {
          var dt = impl.createDocumentType(name2, publicId, systemId, internalSubset);
          this.locator && position(this.locator, dt);
          appendElement(this, dt);
          this.doc.doctype = dt;
        }
      },
      reportError: function(level, message) {
        if (typeof this.onError === "function") {
          try {
            this.onError(level, message, this);
          } catch (e) {
            throw new ParseError("Reporting " + level + ' "' + message + '" caused ' + e, this.locator);
          }
        } else {
          console.error("[xmldom " + level + "]	" + message, _locator(this.locator));
        }
      },
      /**
       * @see http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
       */
      warning: function(message) {
        this.reportError("warning", message);
      },
      error: function(message) {
        this.reportError("error", message);
      },
      /**
       * This function reports a fatal error and throws a ParseError.
       *
       * @param {string} message
       * - The message to be used for reporting and throwing the error.
       * @returns {never}
       * This function always throws an error and never returns a value.
       * @throws {ParseError}
       * Always throws a ParseError with the provided message.
       */
      fatalError: function(message) {
        this.reportError("fatalError", message);
        throw new ParseError(message, this.locator);
      }
    };
    function _locator(l) {
      if (l) {
        return "\n@#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
      }
    }
    function _toString(chars, start, length) {
      if (typeof chars == "string") {
        return chars.substr(start, length);
      } else {
        if (chars.length >= start + length || start) {
          return new java.lang.String(chars, start, length) + "";
        }
        return chars;
      }
    }
    "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(
      /\w+/g,
      function(key) {
        DOMHandler.prototype[key] = function() {
          return null;
        };
      }
    );
    function appendElement(handler, node) {
      if (!handler.currentElement) {
        handler.doc.appendChild(node);
      } else {
        handler.currentElement.appendChild(node);
      }
    }
    function onErrorStopParsing(level) {
      if (level === "error") throw "onErrorStopParsing";
    }
    function onWarningStopParsing() {
      throw "onWarningStopParsing";
    }
    exports.__DOMHandler = DOMHandler;
    exports.DOMParser = DOMParser2;
    exports.normalizeLineEndings = normalizeLineEndings;
    exports.onErrorStopParsing = onErrorStopParsing;
    exports.onWarningStopParsing = onWarningStopParsing;
  }
});

// node_modules/@xmldom/xmldom/lib/index.js
var require_lib = __commonJS({
  "node_modules/@xmldom/xmldom/lib/index.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    exports.assign = conventions.assign;
    exports.hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
    exports.isHTMLMimeType = conventions.isHTMLMimeType;
    exports.isValidMimeType = conventions.isValidMimeType;
    exports.MIME_TYPE = conventions.MIME_TYPE;
    exports.NAMESPACE = conventions.NAMESPACE;
    var errors = require_errors();
    exports.DOMException = errors.DOMException;
    exports.DOMExceptionName = errors.DOMExceptionName;
    exports.ExceptionCode = errors.ExceptionCode;
    exports.ParseError = errors.ParseError;
    var dom = require_dom();
    exports.Attr = dom.Attr;
    exports.CDATASection = dom.CDATASection;
    exports.CharacterData = dom.CharacterData;
    exports.Comment = dom.Comment;
    exports.Document = dom.Document;
    exports.DocumentFragment = dom.DocumentFragment;
    exports.DocumentType = dom.DocumentType;
    exports.DOMImplementation = dom.DOMImplementation;
    exports.Element = dom.Element;
    exports.Entity = dom.Entity;
    exports.EntityReference = dom.EntityReference;
    exports.LiveNodeList = dom.LiveNodeList;
    exports.NamedNodeMap = dom.NamedNodeMap;
    exports.Node = dom.Node;
    exports.NodeList = dom.NodeList;
    exports.Notation = dom.Notation;
    exports.ProcessingInstruction = dom.ProcessingInstruction;
    exports.Text = dom.Text;
    exports.XMLSerializer = dom.XMLSerializer;
    var domParser = require_dom_parser();
    exports.DOMParser = domParser.DOMParser;
    exports.normalizeLineEndings = domParser.normalizeLineEndings;
    exports.onErrorStopParsing = domParser.onErrorStopParsing;
    exports.onWarningStopParsing = domParser.onWarningStopParsing;
  }
});

// node_modules/min-dash/dist/index.js
var nativeToString = Object.prototype.toString;
var nativeHasOwnProperty = Object.prototype.hasOwnProperty;
function isUndefined(obj) {
  return obj === void 0;
}
function isDefined(obj) {
  return obj !== void 0;
}
function isNil(obj) {
  return obj == null;
}
function isArray(obj) {
  return nativeToString.call(obj) === "[object Array]";
}
function isObject(obj) {
  return nativeToString.call(obj) === "[object Object]";
}
function isFunction(obj) {
  const tag = nativeToString.call(obj);
  return tag === "[object Function]" || tag === "[object AsyncFunction]" || tag === "[object GeneratorFunction]" || tag === "[object AsyncGeneratorFunction]" || tag === "[object Proxy]";
}
function isString(obj) {
  return nativeToString.call(obj) === "[object String]";
}
function has(target, key) {
  return !isNil(target) && nativeHasOwnProperty.call(target, key);
}
function find(collection, matcher) {
  const matchFn = toMatcher(matcher);
  let match;
  forEach(collection, function(val, key) {
    if (matchFn(val, key)) {
      match = val;
      return false;
    }
  });
  return match;
}
function findIndex(collection, matcher) {
  const matchFn = toMatcher(matcher);
  let idx = isArray(collection) ? -1 : void 0;
  forEach(collection, function(val, key) {
    if (matchFn(val, key)) {
      idx = key;
      return false;
    }
  });
  return idx;
}
function filter(collection, matcher) {
  const matchFn = toMatcher(matcher);
  let result = [];
  forEach(collection, function(val, key) {
    if (matchFn(val, key)) {
      result.push(val);
    }
  });
  return result;
}
function forEach(collection, iterator) {
  let val, result;
  if (isUndefined(collection)) {
    return;
  }
  const convertKey = isArray(collection) ? toNum : identity;
  for (let key in collection) {
    if (has(collection, key)) {
      val = collection[key];
      result = iterator(val, convertKey(key));
      if (result === false) {
        return val;
      }
    }
  }
}
function map(collection, fn) {
  let result = [];
  forEach(collection, function(val, key) {
    result.push(fn(val, key));
  });
  return result;
}
function toMatcher(matcher) {
  return isFunction(matcher) ? matcher : (e) => {
    return e === matcher;
  };
}
function identity(arg) {
  return arg;
}
function toNum(arg) {
  return Number(arg);
}
function bind(fn, target) {
  return fn.bind(target);
}
function assign(target, ...others) {
  return Object.assign(target, ...others);
}
function set(target, path, value) {
  let currentTarget = target;
  forEach(path, function(key, idx) {
    if (typeof key !== "number" && typeof key !== "string") {
      throw new Error("illegal key type: " + typeof key + ". Key should be of type number or string.");
    }
    if (key === "constructor") {
      throw new Error("illegal key: constructor");
    }
    if (key === "__proto__") {
      throw new Error("illegal key: __proto__");
    }
    let nextKey = path[idx + 1];
    let nextTarget = currentTarget[key];
    if (isDefined(nextKey) && isNil(nextTarget)) {
      nextTarget = currentTarget[key] = isNaN(+nextKey) ? {} : [];
    }
    if (isUndefined(nextKey)) {
      if (isUndefined(value)) {
        delete currentTarget[key];
      } else {
        currentTarget[key] = value;
      }
    } else {
      currentTarget = nextTarget;
    }
  });
  return target;
}
function pick(target, properties) {
  let result = {};
  let obj = Object(target);
  forEach(properties, function(prop) {
    if (prop in obj) {
      result[prop] = target[prop];
    }
  });
  return result;
}

// node_modules/moddle/dist/index.js
function Base() {
}
Base.prototype.get = function(name2) {
  return this.$model.properties.get(this, name2);
};
Base.prototype.set = function(name2, value) {
  this.$model.properties.set(this, name2, value);
};
function Factory(model, properties) {
  this.model = model;
  this.properties = properties;
}
Factory.prototype.createType = function(descriptor) {
  var model = this.model;
  var props = this.properties, prototype = Object.create(Base.prototype);
  forEach(descriptor.properties, function(p) {
    if (!p.isMany && p.default !== void 0) {
      prototype[p.name] = p.default;
    }
  });
  props.defineModel(prototype, model);
  props.defineDescriptor(prototype, descriptor);
  var name2 = descriptor.ns.name;
  function ModdleElement(attrs) {
    props.define(this, "$type", { value: name2, enumerable: true });
    props.define(this, "$attrs", { value: {} });
    props.define(this, "$parent", { writable: true });
    forEach(attrs, bind(function(val, key) {
      this.set(key, val);
    }, this));
  }
  ModdleElement.prototype = prototype;
  ModdleElement.hasType = prototype.$instanceOf = this.model.hasType;
  props.defineModel(ModdleElement, model);
  props.defineDescriptor(ModdleElement, descriptor);
  return ModdleElement;
};
var BUILTINS = assign(/* @__PURE__ */ Object.create(null), {
  String: true,
  Boolean: true,
  Integer: true,
  Real: true,
  Element: true
});
var TYPE_CONVERTERS = assign(/* @__PURE__ */ Object.create(null), {
  String: function(s) {
    return s;
  },
  Boolean: function(s) {
    return s === "true";
  },
  Integer: function(s) {
    return parseInt(s, 10);
  },
  Real: function(s) {
    return parseFloat(s);
  }
});
function coerceType(type, value) {
  var converter = TYPE_CONVERTERS[type];
  if (converter) {
    return converter(value);
  } else {
    return value;
  }
}
function isBuiltIn(type) {
  return !!BUILTINS[type];
}
function isSimple(type) {
  return !!TYPE_CONVERTERS[type];
}
function parseName(name2, defaultPrefix) {
  var parts = name2.split(/:/), localName, prefix2;
  if (parts.length === 1) {
    localName = name2;
    prefix2 = defaultPrefix;
  } else if (parts.length === 2) {
    localName = parts[1];
    prefix2 = parts[0];
  } else {
    throw new Error("expected <prefix:localName> or <localName>, got " + name2);
  }
  name2 = (prefix2 ? prefix2 + ":" : "") + localName;
  return {
    name: name2,
    prefix: prefix2,
    localName
  };
}
function DescriptorBuilder(nameNs) {
  this.ns = nameNs;
  this.name = nameNs.name;
  this.allTypes = [];
  this.allTypesByName = /* @__PURE__ */ Object.create(null);
  this.properties = [];
  this.propertiesByName = /* @__PURE__ */ Object.create(null);
}
DescriptorBuilder.prototype.build = function() {
  return pick(this, [
    "ns",
    "name",
    "allTypes",
    "allTypesByName",
    "properties",
    "propertiesByName",
    "bodyProperty",
    "idProperty"
  ]);
};
DescriptorBuilder.prototype.addProperty = function(p, idx, validate) {
  if (typeof idx === "boolean") {
    validate = idx;
    idx = void 0;
  }
  this.addNamedProperty(p, validate !== false);
  var properties = this.properties;
  if (idx !== void 0) {
    properties.splice(idx, 0, p);
  } else {
    properties.push(p);
  }
};
DescriptorBuilder.prototype.replaceProperty = function(oldProperty, newProperty, replace) {
  var oldNameNs = oldProperty.ns;
  var props = this.properties, propertiesByName = this.propertiesByName, rename = oldProperty.name !== newProperty.name;
  if (oldProperty.isId) {
    if (!newProperty.isId) {
      throw new Error(
        "property <" + newProperty.ns.name + "> must be id property to refine <" + oldProperty.ns.name + ">"
      );
    }
    this.setIdProperty(newProperty, false);
  }
  if (oldProperty.isBody) {
    if (!newProperty.isBody) {
      throw new Error(
        "property <" + newProperty.ns.name + "> must be body property to refine <" + oldProperty.ns.name + ">"
      );
    }
    this.setBodyProperty(newProperty, false);
  }
  var idx = props.indexOf(oldProperty);
  if (idx === -1) {
    throw new Error("property <" + oldNameNs.name + "> not found in property list");
  }
  props.splice(idx, 1);
  this.addProperty(newProperty, replace ? void 0 : idx, rename);
  propertiesByName[oldNameNs.name] = propertiesByName[oldNameNs.localName] = newProperty;
};
DescriptorBuilder.prototype.redefineProperty = function(p, targetPropertyName, replace) {
  var nsPrefix = p.ns.prefix;
  var parts = targetPropertyName.split("#");
  var name2 = parseName(parts[0], nsPrefix);
  var attrName = parseName(parts[1], name2.prefix).name;
  var redefinedProperty = this.propertiesByName[attrName];
  if (!redefinedProperty) {
    throw new Error("refined property <" + attrName + "> not found");
  } else {
    this.replaceProperty(redefinedProperty, p, replace);
  }
  delete p.redefines;
};
DescriptorBuilder.prototype.addNamedProperty = function(p, validate) {
  var ns = p.ns, propsByName = this.propertiesByName;
  if (validate) {
    this.assertNotDefined(p, ns.name);
    this.assertNotDefined(p, ns.localName);
  }
  propsByName[ns.name] = propsByName[ns.localName] = p;
};
DescriptorBuilder.prototype.removeNamedProperty = function(p) {
  var ns = p.ns, propsByName = this.propertiesByName;
  delete propsByName[ns.name];
  delete propsByName[ns.localName];
};
DescriptorBuilder.prototype.setBodyProperty = function(p, validate) {
  if (validate && this.bodyProperty) {
    throw new Error(
      "body property defined multiple times (<" + this.bodyProperty.ns.name + ">, <" + p.ns.name + ">)"
    );
  }
  this.bodyProperty = p;
};
DescriptorBuilder.prototype.setIdProperty = function(p, validate) {
  if (validate && this.idProperty) {
    throw new Error(
      "id property defined multiple times (<" + this.idProperty.ns.name + ">, <" + p.ns.name + ">)"
    );
  }
  this.idProperty = p;
};
DescriptorBuilder.prototype.assertNotTrait = function(typeDescriptor) {
  const _extends = typeDescriptor.extends || [];
  if (_extends.length) {
    throw new Error(
      `cannot create <${typeDescriptor.name}> extending <${typeDescriptor.extends}>`
    );
  }
};
DescriptorBuilder.prototype.assertNotDefined = function(p, name2) {
  var propertyName = p.name, definedProperty = this.propertiesByName[propertyName];
  if (definedProperty) {
    throw new Error(
      "property <" + propertyName + "> already defined; override of <" + definedProperty.definedBy.ns.name + "#" + definedProperty.ns.name + "> by <" + p.definedBy.ns.name + "#" + p.ns.name + "> not allowed without redefines"
    );
  }
};
DescriptorBuilder.prototype.hasProperty = function(name2) {
  return this.propertiesByName[name2];
};
DescriptorBuilder.prototype.addTrait = function(t, inherited) {
  if (inherited) {
    this.assertNotTrait(t);
  }
  var typesByName = this.allTypesByName, types2 = this.allTypes;
  var typeName = t.name;
  if (typeName in typesByName) {
    return;
  }
  forEach(t.properties, bind(function(p) {
    p = assign({}, p, {
      name: p.ns.localName,
      inherited
    });
    Object.defineProperty(p, "definedBy", {
      value: t
    });
    var replaces = p.replaces, redefines = p.redefines;
    if (replaces || redefines) {
      this.redefineProperty(p, replaces || redefines, replaces);
    } else {
      if (p.isBody) {
        this.setBodyProperty(p);
      }
      if (p.isId) {
        this.setIdProperty(p);
      }
      this.addProperty(p);
    }
  }, this));
  types2.push(t);
  typesByName[typeName] = t;
};
function Registry(packages2, properties) {
  this.packageMap = /* @__PURE__ */ Object.create(null);
  this.typeMap = /* @__PURE__ */ Object.create(null);
  this.packages = [];
  this.properties = properties;
  forEach(packages2, bind(this.registerPackage, this));
}
Registry.prototype.getPackage = function(uriOrPrefix) {
  return this.packageMap[uriOrPrefix];
};
Registry.prototype.getPackages = function() {
  return this.packages;
};
Registry.prototype.registerPackage = function(pkg) {
  pkg = assign({}, pkg);
  var pkgMap = this.packageMap;
  ensureAvailable(pkgMap, pkg, "prefix");
  ensureAvailable(pkgMap, pkg, "uri");
  forEach(pkg.types, bind(function(descriptor) {
    this.registerType(descriptor, pkg);
  }, this));
  pkgMap[pkg.uri] = pkgMap[pkg.prefix] = pkg;
  this.packages.push(pkg);
};
Registry.prototype.registerType = function(type, pkg) {
  type = assign({}, type, {
    superClass: (type.superClass || []).slice(),
    extends: (type.extends || []).slice(),
    properties: (type.properties || []).slice(),
    meta: assign({}, type.meta || {})
  });
  var ns = parseName(type.name, pkg.prefix), name2 = ns.name, propertiesByName = /* @__PURE__ */ Object.create(null);
  forEach(type.properties, bind(function(p) {
    var propertyNs = parseName(p.name, ns.prefix), propertyName = propertyNs.name;
    if (!isBuiltIn(p.type)) {
      p.type = parseName(p.type, propertyNs.prefix).name;
    }
    assign(p, {
      ns: propertyNs,
      name: propertyName
    });
    propertiesByName[propertyName] = p;
  }, this));
  assign(type, {
    ns,
    name: name2,
    propertiesByName
  });
  forEach(type.extends, bind(function(extendsName) {
    var extendsNameNs = parseName(extendsName, ns.prefix);
    var extended = this.typeMap[extendsNameNs.name];
    extended.traits = extended.traits || [];
    extended.traits.push(name2);
  }, this));
  this.definePackage(type, pkg);
  this.typeMap[name2] = type;
};
Registry.prototype.mapTypes = function(nsName2, iterator, trait) {
  var type = isBuiltIn(nsName2.name) ? { name: nsName2.name } : this.typeMap[nsName2.name];
  var self = this;
  function traverse(cls, trait2) {
    var parentNs = parseName(cls, isBuiltIn(cls) ? "" : nsName2.prefix);
    self.mapTypes(parentNs, iterator, trait2);
  }
  function traverseTrait(cls) {
    return traverse(cls, true);
  }
  function traverseSuper(cls) {
    return traverse(cls, false);
  }
  if (!type) {
    throw new Error("unknown type <" + nsName2.name + ">");
  }
  forEach(type.superClass, trait ? traverseTrait : traverseSuper);
  iterator(type, !trait);
  forEach(type.traits, traverseTrait);
};
Registry.prototype.getEffectiveDescriptor = function(name2) {
  var nsName2 = parseName(name2);
  var builder = new DescriptorBuilder(nsName2);
  this.mapTypes(nsName2, function(type, inherited) {
    builder.addTrait(type, inherited);
  });
  var descriptor = builder.build();
  this.definePackage(descriptor, descriptor.allTypes[descriptor.allTypes.length - 1].$pkg);
  return descriptor;
};
Registry.prototype.definePackage = function(target, pkg) {
  this.properties.define(target, "$pkg", { value: pkg });
};
function ensureAvailable(packageMap, pkg, identifierKey) {
  var value = pkg[identifierKey];
  if (value in packageMap) {
    throw new Error("package with " + identifierKey + " <" + value + "> already defined");
  }
}
function Properties(model) {
  this.model = model;
}
Properties.prototype.set = function(target, name2, value) {
  if (!isString(name2) || !name2.length) {
    throw new TypeError("property name must be a non-empty string");
  }
  var property = this.getProperty(target, name2);
  var propertyName = property && property.name;
  if (isUndefined2(value)) {
    if (property) {
      delete target[propertyName];
    } else {
      delete target.$attrs[stripGlobal(name2)];
    }
  } else {
    if (property) {
      if (propertyName in target) {
        target[propertyName] = value;
      } else {
        defineProperty(target, property, value);
      }
    } else {
      target.$attrs[stripGlobal(name2)] = value;
    }
  }
};
Properties.prototype.get = function(target, name2) {
  var property = this.getProperty(target, name2);
  if (!property) {
    return target.$attrs[stripGlobal(name2)];
  }
  var propertyName = property.name;
  if (!target[propertyName] && property.isMany) {
    defineProperty(target, property, []);
  }
  return target[propertyName];
};
Properties.prototype.define = function(target, name2, options) {
  if (!options.writable) {
    var value = options.value;
    options = assign({}, options, {
      get: function() {
        return value;
      }
    });
    delete options.value;
  }
  Object.defineProperty(target, name2, options);
};
Properties.prototype.defineDescriptor = function(target, descriptor) {
  this.define(target, "$descriptor", { value: descriptor });
};
Properties.prototype.defineModel = function(target, model) {
  this.define(target, "$model", { value: model });
};
Properties.prototype.getProperty = function(target, name2) {
  var model = this.model;
  var property = model.getPropertyDescriptor(target, name2);
  if (property) {
    return property;
  }
  if (name2.includes(":")) {
    return null;
  }
  const strict = model.config.strict;
  if (typeof strict !== "undefined") {
    const error3 = new TypeError(`unknown property <${name2}> on <${target.$type}>`);
    if (strict) {
      throw error3;
    } else {
      typeof console !== "undefined" && console.warn(error3);
    }
  }
  return null;
};
function isUndefined2(val) {
  return typeof val === "undefined";
}
function defineProperty(target, property, value) {
  Object.defineProperty(target, property.name, {
    enumerable: !property.isReference,
    writable: true,
    value,
    configurable: true
  });
}
function stripGlobal(name2) {
  return name2.replace(/^:/, "");
}
function Moddle(packages2, config = {}) {
  this.properties = new Properties(this);
  this.factory = new Factory(this, this.properties);
  this.registry = new Registry(packages2, this.properties);
  this.typeCache = /* @__PURE__ */ Object.create(null);
  this.config = config;
}
Moddle.prototype.create = function(descriptor, attrs) {
  var Type = this.getType(descriptor);
  if (!Type) {
    throw new Error("unknown type <" + descriptor + ">");
  }
  return new Type(attrs);
};
Moddle.prototype.getType = function(descriptor) {
  var cache = this.typeCache;
  var name2 = isString(descriptor) ? descriptor : descriptor.ns.name;
  var type = cache[name2];
  if (!type) {
    descriptor = this.registry.getEffectiveDescriptor(name2);
    type = cache[name2] = this.factory.createType(descriptor);
  }
  return type;
};
Moddle.prototype.createAny = function(name2, nsUri, properties) {
  var nameNs = parseName(name2);
  var element = {
    $type: name2,
    $instanceOf: function(type) {
      return type === this.$type;
    },
    get: function(key) {
      return this[key];
    },
    set: function(key, value) {
      set(this, [key], value);
    }
  };
  var descriptor = {
    name: name2,
    isGeneric: true,
    ns: {
      prefix: nameNs.prefix,
      localName: nameNs.localName,
      uri: nsUri
    }
  };
  this.properties.defineDescriptor(element, descriptor);
  this.properties.defineModel(element, this);
  this.properties.define(element, "get", { enumerable: false, writable: true });
  this.properties.define(element, "set", { enumerable: false, writable: true });
  this.properties.define(element, "$parent", { enumerable: false, writable: true });
  this.properties.define(element, "$instanceOf", { enumerable: false, writable: true });
  forEach(properties, function(a, key) {
    if (isObject(a) && a.value !== void 0) {
      element[a.name] = a.value;
    } else {
      element[key] = a;
    }
  });
  return element;
};
Moddle.prototype.getPackage = function(uriOrPrefix) {
  return this.registry.getPackage(uriOrPrefix);
};
Moddle.prototype.getPackages = function() {
  return this.registry.getPackages();
};
Moddle.prototype.getElementDescriptor = function(element) {
  return element.$descriptor;
};
Moddle.prototype.hasType = function(element, type) {
  if (type === void 0) {
    type = element;
    element = this;
  }
  var descriptor = element.$model.getElementDescriptor(element);
  return type in descriptor.allTypesByName;
};
Moddle.prototype.getPropertyDescriptor = function(element, property) {
  return this.getElementDescriptor(element).propertiesByName[property];
};
Moddle.prototype.getTypeDescriptor = function(type) {
  return this.registry.typeMap[type];
};

// node_modules/saxen/dist/index.js
var fromCharCode = String.fromCharCode;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var ENTITY_PATTERN = /&#(\d+);|&#x([0-9a-f]+);|&(\w+);/ig;
var ENTITY_MAPPING = {
  "amp": "&",
  "apos": "'",
  "gt": ">",
  "lt": "<",
  "quot": '"'
};
Object.keys(ENTITY_MAPPING).forEach(function(k) {
  ENTITY_MAPPING[k.toUpperCase()] = ENTITY_MAPPING[k];
});
function replaceEntities(_, d, x, z) {
  if (z) {
    if (hasOwnProperty.call(ENTITY_MAPPING, z)) {
      return ENTITY_MAPPING[z];
    } else {
      return "&" + z + ";";
    }
  }
  if (d) {
    return fromCharCode(d);
  }
  return fromCharCode(parseInt(x, 16));
}
function decodeEntities(s) {
  if (s.length > 3 && s.indexOf("&") !== -1) {
    return s.replace(ENTITY_PATTERN, replaceEntities);
  }
  return s;
}
var NON_WHITESPACE_OUTSIDE_ROOT_NODE = "non-whitespace outside of root node";
function error(msg) {
  return new Error(msg);
}
function missingNamespaceForPrefix(prefix2) {
  return "missing namespace for prefix <" + prefix2 + ">";
}
function getter(getFn) {
  return {
    "get": getFn,
    "enumerable": true
  };
}
function cloneNsMatrix(nsMatrix) {
  var clone = /* @__PURE__ */ Object.create(null), key;
  for (key in nsMatrix) {
    clone[key] = nsMatrix[key];
  }
  return clone;
}
var NAME_CACHE = /* @__PURE__ */ Symbol("nameCache");
function uriPrefix(prefix2) {
  return prefix2 + "$uri";
}
function buildNsMatrix(nsUriToPrefix) {
  var nsMatrix = /* @__PURE__ */ Object.create(null), uri2, prefix2;
  for (uri2 in nsUriToPrefix) {
    prefix2 = nsUriToPrefix[uri2];
    nsMatrix[prefix2] = prefix2;
    nsMatrix[uriPrefix(prefix2)] = uri2;
  }
  return nsMatrix;
}
function noopGetContext() {
  return { line: 0, column: 0 };
}
function throwFunc(err) {
  throw err;
}
function Parser(options) {
  if (!this) {
    return new Parser(options);
  }
  var proxy = options && options["proxy"];
  var onText, onOpenTag, onCloseTag, onCDATA, onError = throwFunc, onWarning, onComment, onQuestion, onAttention;
  var getContext = noopGetContext;
  var streaming = false;
  var rootTagFound = false;
  var leftoverXml = "";
  var maybeNS = false;
  var isNamespace = false;
  var returnError = null;
  var parseStop = false;
  var nsMatrixStack, nsMatrix, nodeStack;
  var nsUriToPrefix;
  function handleError(err) {
    if (!(err instanceof Error)) {
      err = error(err);
    }
    returnError = err;
    onError(err, getContext);
  }
  function handleWarning(err) {
    if (!onWarning) {
      return;
    }
    if (!(err instanceof Error)) {
      err = error(err);
    }
    onWarning(err, getContext);
  }
  this["on"] = function(name2, cb) {
    if (typeof cb !== "function") {
      throw error("required args <name, cb>");
    }
    switch (name2) {
      case "openTag":
        onOpenTag = cb;
        break;
      case "text":
        onText = cb;
        break;
      case "closeTag":
        onCloseTag = cb;
        break;
      case "error":
        onError = cb;
        break;
      case "warn":
        onWarning = cb;
        break;
      case "cdata":
        onCDATA = cb;
        break;
      case "attention":
        onAttention = cb;
        break;
      // <!XXXXX zzzz="eeee">
      case "question":
        onQuestion = cb;
        break;
      // <? ....  ?>
      case "comment":
        onComment = cb;
        break;
      default:
        throw error("unsupported event: " + name2);
    }
    return this;
  };
  this["ns"] = function(nsMap) {
    if (typeof nsMap === "undefined") {
      nsMap = {};
    }
    if (typeof nsMap !== "object") {
      throw error("required args <nsMap={}>");
    }
    var _nsUriToPrefix = /* @__PURE__ */ Object.create(null), k;
    for (k in nsMap) {
      _nsUriToPrefix[k] = nsMap[k];
    }
    isNamespace = true;
    nsUriToPrefix = _nsUriToPrefix;
    return this;
  };
  function resetState() {
    nsMatrixStack = isNamespace ? [] : null;
    nsMatrix = isNamespace ? buildNsMatrix(nsUriToPrefix) : null;
    nodeStack = [];
    getContext = noopGetContext;
    parseStop = false;
    returnError = null;
    rootTagFound = false;
    leftoverXml = "";
  }
  this["parse"] = function(xml2) {
    if (typeof xml2 !== "string") {
      throw error("required args <xml=string>");
    }
    if (streaming) {
      throw error("parse during stream; call end() first");
    }
    resetState();
    parse(xml2);
    getContext = noopGetContext;
    parseStop = false;
    return returnError;
  };
  this["write"] = function(xml2) {
    if (typeof xml2 !== "string") {
      throw error("required args <xml=string>");
    }
    if (!streaming) {
      resetState();
      streaming = true;
    }
    if (!returnError) {
      leftoverXml = parse(leftoverXml + xml2, true) || "";
    }
    return this;
  };
  this["end"] = function() {
    if (!streaming) {
      resetState();
    }
    streaming = false;
    if (!returnError) {
      parse(leftoverXml);
    }
    leftoverXml = "";
    getContext = noopGetContext;
    parseStop = false;
    return returnError;
  };
  this["stop"] = function() {
    parseStop = true;
  };
  function parse(xml2, streaming2 = false) {
    var elNameCache = null, elNameCacheMatrix = null;
    var _nsMatrix, anonymousNsCount = 0, tagStart = false, tagEnd = false, i = 0, j = 0, x, y, q, w, v, xmlns, elementName, _elementName, elementProxy;
    var attrsString = "", attrsStart = 0, cachedAttrs;
    function normalizeAttrName(name2, defaultAlias) {
      var w2 = name2.indexOf(":");
      if (w2 === -1) {
        return name2;
      }
      var nsName2 = nsMatrix[name2.substring(0, w2)];
      if (!nsName2) {
        handleWarning(missingNamespaceForPrefix(name2.substring(0, w2)));
        return null;
      }
      return defaultAlias === nsName2 ? name2.substr(w2 + 1) : nsName2 + name2.substr(w2);
    }
    function getAttrs() {
      if (cachedAttrs !== null) {
        return cachedAttrs;
      }
      var nsUri, nsUriPrefix, defaultAlias = isNamespace && nsMatrix["xmlns"], attrList = isNamespace && maybeNS ? [] : null, i2 = attrsStart, s = attrsString, l = s.length, hasNewMatrix, newalias, value, alias, name2, attrs = {}, seenAttrs = /* @__PURE__ */ new Set(), skipAttr, w2, j2;
      parseAttr:
        for (; i2 < l; i2++) {
          skipAttr = false;
          w2 = s.charCodeAt(i2);
          if (w2 === 32 || w2 < 14 && w2 > 8) {
            continue;
          }
          if (w2 < 65 || w2 > 122 || w2 > 90 && w2 < 97) {
            if (w2 !== 95 && w2 !== 58) {
              handleWarning("illegal first char attribute name");
              skipAttr = true;
            }
          }
          for (j2 = i2 + 1; j2 < l; j2++) {
            w2 = s.charCodeAt(j2);
            if (w2 > 96 && w2 < 123 || w2 > 64 && w2 < 91 || w2 > 47 && w2 < 59 || w2 === 46 || // '.'
            w2 === 45 || // '-'
            w2 === 95) {
              continue;
            }
            if (w2 === 32 || w2 < 14 && w2 > 8) {
              handleWarning("missing attribute value");
              i2 = j2;
              continue parseAttr;
            }
            if (w2 === 61) {
              break;
            }
            handleWarning("illegal attribute name char");
            skipAttr = true;
          }
          name2 = s.substring(i2, j2);
          if (name2 === "xmlns:xmlns") {
            handleWarning("illegal declaration of xmlns");
            skipAttr = true;
          }
          w2 = s.charCodeAt(j2 + 1);
          if (w2 === 34) {
            j2 = s.indexOf('"', i2 = j2 + 2);
            if (j2 === -1) {
              j2 = s.indexOf("'", i2);
              if (j2 !== -1) {
                handleWarning("attribute value quote missmatch");
                skipAttr = true;
              }
            }
          } else if (w2 === 39) {
            j2 = s.indexOf("'", i2 = j2 + 2);
            if (j2 === -1) {
              j2 = s.indexOf('"', i2);
              if (j2 !== -1) {
                handleWarning("attribute value quote missmatch");
                skipAttr = true;
              }
            }
          } else {
            handleWarning("missing attribute value quotes");
            skipAttr = true;
            for (j2 = j2 + 1; j2 < l; j2++) {
              w2 = s.charCodeAt(j2 + 1);
              if (w2 === 32 || w2 < 14 && w2 > 8) {
                break;
              }
            }
          }
          if (j2 === -1) {
            handleWarning("missing closing quotes");
            j2 = l;
            skipAttr = true;
          }
          if (!skipAttr) {
            value = s.substring(i2, j2);
          }
          i2 = j2;
          for (; j2 + 1 < l; j2++) {
            w2 = s.charCodeAt(j2 + 1);
            if (w2 === 32 || w2 < 14 && w2 > 8) {
              break;
            }
            if (i2 === j2) {
              handleWarning("illegal character after attribute end");
              skipAttr = true;
            }
          }
          i2 = j2 + 1;
          if (skipAttr) {
            continue parseAttr;
          }
          if (seenAttrs.has(name2)) {
            handleWarning("attribute <" + name2 + "> already defined");
            continue;
          }
          seenAttrs.add(name2);
          if (!isNamespace) {
            attrs[name2] = value;
            continue;
          }
          if (maybeNS) {
            newalias = name2 === "xmlns" ? "xmlns" : name2.charCodeAt(0) === 120 && name2.substr(0, 6) === "xmlns:" ? name2.substr(6) : null;
            if (newalias !== null) {
              nsUri = decodeEntities(value);
              nsUriPrefix = uriPrefix(newalias);
              alias = nsUriToPrefix[nsUri];
              if (!alias) {
                if (newalias === "xmlns" || nsUriPrefix in nsMatrix && nsMatrix[nsUriPrefix] !== nsUri) {
                  do {
                    alias = "ns" + anonymousNsCount++;
                  } while (typeof nsMatrix[alias] !== "undefined");
                } else {
                  alias = newalias;
                }
                nsUriToPrefix[nsUri] = alias;
              }
              if (nsMatrix[newalias] !== alias) {
                if (!hasNewMatrix) {
                  nsMatrix = cloneNsMatrix(nsMatrix);
                  hasNewMatrix = true;
                }
                nsMatrix[newalias] = alias;
                if (newalias === "xmlns") {
                  nsMatrix[uriPrefix(alias)] = nsUri;
                  defaultAlias = alias;
                }
                nsMatrix[nsUriPrefix] = nsUri;
              }
              attrs[name2] = value;
              continue;
            }
            attrList.push(name2, value);
            continue;
          }
          name2 = normalizeAttrName(name2, defaultAlias);
          if (name2 === null) {
            continue;
          }
          attrs[name2] = value;
        }
      if (maybeNS) {
        for (i2 = 0, l = attrList.length; i2 < l; i2++) {
          name2 = normalizeAttrName(attrList[i2++], defaultAlias);
          value = attrList[i2];
          if (name2 === null) {
            continue;
          }
          attrs[name2] = value;
        }
      }
      return cachedAttrs = attrs;
    }
    function getParseContext() {
      var splitsRe = /(\r\n|\r|\n)/g;
      var line = 0;
      var column = 0;
      var startOfLine = 0;
      var endOfLine = j;
      var match;
      var data;
      while (i >= startOfLine) {
        match = splitsRe.exec(xml2);
        if (!match) {
          break;
        }
        endOfLine = match[0].length + match.index;
        if (endOfLine > i) {
          break;
        }
        line += 1;
        startOfLine = endOfLine;
      }
      if (i == -1) {
        column = endOfLine;
        data = xml2.substring(j);
      } else if (j === 0) {
        data = xml2.substring(j, i);
      } else {
        column = i - startOfLine;
        data = j == -1 ? xml2.substring(i) : xml2.substring(i, j + 1);
      }
      return {
        "data": data,
        "line": line,
        "column": column
      };
    }
    getContext = getParseContext;
    if (proxy) {
      elementProxy = Object.create({}, {
        "name": getter(function() {
          return elementName;
        }),
        "originalName": getter(function() {
          return _elementName;
        }),
        "attrs": getter(getAttrs),
        "ns": getter(function() {
          return nsMatrix;
        })
      });
    }
    while (j !== -1) {
      if (xml2.charCodeAt(j) === 60) {
        i = j;
      } else {
        i = xml2.indexOf("<", j);
      }
      if (i === -1) {
        if (streaming2) {
          return xml2.substring(j);
        }
        if (nodeStack.length) {
          return handleError("unexpected end of file");
        }
        if (!rootTagFound) {
          return handleError("missing start tag");
        }
        if (j < xml2.length) {
          if (xml2.substring(j).trim()) {
            handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
          }
        }
        return;
      }
      if (!rootTagFound) {
        rootTagFound = true;
      }
      if (j !== i) {
        if (nodeStack.length) {
          if (onText) {
            onText(xml2.substring(j, i), decodeEntities, getContext);
            if (parseStop) {
              return;
            }
          }
        } else {
          if (xml2.substring(j, i).trim()) {
            handleWarning(NON_WHITESPACE_OUTSIDE_ROOT_NODE);
            if (parseStop) {
              return;
            }
          }
        }
      }
      w = xml2.charCodeAt(i + 1);
      if (w === 33) {
        q = xml2.charCodeAt(i + 2);
        if (q === 91 && xml2.substr(i + 3, 6) === "CDATA[") {
          j = xml2.indexOf("]]>", i);
          if (j === -1) {
            if (streaming2) {
              return xml2.substring(i);
            }
            return handleError("unclosed cdata");
          }
          if (onCDATA) {
            onCDATA(xml2.substring(i + 9, j), getContext);
            if (parseStop) {
              return;
            }
          }
          j += 3;
          continue;
        }
        if (q === 45 && xml2.charCodeAt(i + 3) === 45) {
          j = xml2.indexOf("-->", i);
          if (j === -1) {
            if (streaming2) {
              return xml2.substring(i);
            }
            return handleError("unclosed comment");
          }
          if (onComment) {
            onComment(xml2.substring(i + 4, j), decodeEntities, getContext);
            if (parseStop) {
              return;
            }
          }
          j += 3;
          continue;
        }
      }
      if (w === 63) {
        j = xml2.indexOf("?>", i);
        if (j === -1) {
          if (streaming2) {
            return xml2.substring(i);
          }
          return handleError("unclosed question");
        }
        if (onQuestion) {
          onQuestion(xml2.substring(i, j + 2), getContext);
          if (parseStop) {
            return;
          }
        }
        j += 2;
        continue;
      }
      for (x = i + 1; ; x++) {
        v = xml2.charCodeAt(x);
        if (isNaN(v)) {
          if (streaming2) {
            return xml2.substring(i);
          }
          j = -1;
          return handleError("unclosed tag");
        }
        if (v === 34) {
          q = xml2.indexOf('"', x + 1);
          x = q !== -1 ? q : x;
        } else if (v === 39) {
          q = xml2.indexOf("'", x + 1);
          x = q !== -1 ? q : x;
        } else if (v === 62) {
          j = x;
          break;
        }
      }
      if (w === 33) {
        if (onAttention) {
          onAttention(xml2.substring(i, j + 1), decodeEntities, getContext);
          if (parseStop) {
            return;
          }
        }
        j += 1;
        continue;
      }
      cachedAttrs = {};
      if (w === 47) {
        tagStart = false;
        tagEnd = true;
        if (!nodeStack.length) {
          return handleError("missing open tag");
        }
        x = elementName = nodeStack.pop();
        q = i + 2 + x.length;
        if (xml2.substring(i + 2, q) !== x) {
          return handleError("closing tag mismatch");
        }
        for (; q < j; q++) {
          w = xml2.charCodeAt(q);
          if (w === 32 || w > 8 && w < 14) {
            continue;
          }
          return handleError("close tag");
        }
      } else {
        if (xml2.charCodeAt(j - 1) === 47) {
          x = elementName = xml2.substring(i + 1, j - 1);
          tagStart = true;
          tagEnd = true;
        } else {
          x = elementName = xml2.substring(i + 1, j);
          tagStart = true;
          tagEnd = false;
        }
        if (!(w > 96 && w < 123 || w > 64 && w < 91 || w === 95 || w === 58)) {
          return handleError("illegal first char nodeName");
        }
        for (q = 1, y = x.length; q < y; q++) {
          w = x.charCodeAt(q);
          if (w > 96 && w < 123 || w > 64 && w < 91 || w > 47 && w < 59 || w === 45 || w === 95 || w == 46) {
            continue;
          }
          if (w === 32 || w < 14 && w > 8) {
            elementName = x.substring(0, q);
            cachedAttrs = null;
            break;
          }
          return handleError("invalid nodeName");
        }
        if (!tagEnd) {
          nodeStack.push(elementName);
        }
      }
      if (isNamespace) {
        _nsMatrix = nsMatrix;
        if (tagStart) {
          if (!tagEnd) {
            nsMatrixStack.push(_nsMatrix);
          }
          if (cachedAttrs === null) {
            if (maybeNS = x.indexOf("xmlns", q) !== -1) {
              attrsStart = q;
              attrsString = x;
              getAttrs();
              maybeNS = false;
            }
          }
        }
        _elementName = elementName;
        if (elNameCacheMatrix !== nsMatrix) {
          elNameCache = nsMatrix[NAME_CACHE];
          if (elNameCache === void 0) {
            elNameCache = nsMatrix[NAME_CACHE] = /* @__PURE__ */ Object.create(null);
          }
          elNameCacheMatrix = nsMatrix;
        }
        var _cachedName = elNameCache[elementName];
        if (_cachedName !== void 0) {
          elementName = _cachedName;
        } else {
          w = elementName.indexOf(":");
          if (w !== -1) {
            xmlns = nsMatrix[elementName.substring(0, w)];
            if (!xmlns) {
              return handleError("missing namespace on <" + _elementName + ">");
            }
            elementName = elementName.substr(w + 1);
          } else {
            xmlns = nsMatrix["xmlns"];
          }
          if (xmlns) {
            elementName = xmlns + ":" + elementName;
          }
          elNameCache[_elementName] = elementName;
        }
      }
      if (tagStart) {
        attrsStart = q;
        attrsString = x;
        if (onOpenTag) {
          if (proxy) {
            onOpenTag(elementProxy, decodeEntities, tagEnd, getContext);
          } else {
            onOpenTag(elementName, getAttrs, decodeEntities, tagEnd, getContext);
          }
          if (parseStop) {
            return;
          }
        }
      }
      if (tagEnd) {
        if (onCloseTag) {
          onCloseTag(proxy ? elementProxy : elementName, decodeEntities, tagStart, getContext);
          if (parseStop) {
            return;
          }
        }
        if (isNamespace) {
          if (!tagStart) {
            nsMatrix = nsMatrixStack.pop();
          } else {
            nsMatrix = _nsMatrix;
          }
        }
      }
      j += 1;
    }
  }
}

// node_modules/moddle-xml/dist/index.js
function hasLowerCaseAlias(pkg) {
  return pkg.xml && pkg.xml.tagAlias === "lowerCase";
}
var DEFAULT_NS_MAP = {
  "xsi": "http://www.w3.org/2001/XMLSchema-instance",
  "xml": "http://www.w3.org/XML/1998/namespace"
};
var SERIALIZE_PROPERTY = "property";
function getSerialization(element) {
  return element.xml && element.xml.serialize;
}
function getSerializationType(element) {
  const type = getSerialization(element);
  return type !== SERIALIZE_PROPERTY && (type || null);
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function aliasToName(aliasNs, pkg) {
  if (!hasLowerCaseAlias(pkg)) {
    return aliasNs.name;
  }
  return aliasNs.prefix + ":" + capitalize(aliasNs.localName);
}
function prefixedToName(nameNs, pkg) {
  var name2 = nameNs.name, localName = nameNs.localName;
  var typePrefix = pkg && pkg.xml && pkg.xml.typePrefix;
  if (typePrefix && localName.indexOf(typePrefix) === 0) {
    return nameNs.prefix + ":" + localName.slice(typePrefix.length);
  } else {
    return name2;
  }
}
function normalizeTypeName(name2, nsMap, model) {
  const nameNs = parseName(name2, nsMap.xmlns);
  const normalizedName = `${nsMap[nameNs.prefix] || nameNs.prefix}:${nameNs.localName}`;
  const normalizedNameNs = parseName(normalizedName);
  var pkg = model.getPackage(normalizedNameNs.prefix);
  return prefixedToName(normalizedNameNs, pkg);
}
function error2(message) {
  return new Error(message);
}
function getModdleDescriptor(element) {
  return element.$descriptor;
}
function Context(options) {
  assign(this, options);
  this.elementsById = {};
  this.references = [];
  this.warnings = [];
  this.addReference = function(reference) {
    this.references.push(reference);
  };
  this.addElement = function(element) {
    if (!element) {
      throw error2("expected element");
    }
    var elementsById = this.elementsById;
    var descriptor = getModdleDescriptor(element);
    var idProperty = descriptor.idProperty, id;
    if (idProperty) {
      id = element.get(idProperty.name);
      if (id) {
        if (!/^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i.test(id)) {
          throw new Error("illegal ID <" + id + ">");
        }
        if (elementsById[id]) {
          throw error2("duplicate ID <" + id + ">");
        }
        elementsById[id] = element;
      }
    }
  };
  this.addWarning = function(warning) {
    this.warnings.push(warning);
  };
}
function BaseHandler() {
}
BaseHandler.prototype.handleEnd = function() {
};
BaseHandler.prototype.handleText = function() {
};
BaseHandler.prototype.handleNode = function() {
};
function NoopHandler() {
}
NoopHandler.prototype = Object.create(BaseHandler.prototype);
NoopHandler.prototype.handleNode = function() {
  return this;
};
function BodyHandler() {
}
BodyHandler.prototype = Object.create(BaseHandler.prototype);
BodyHandler.prototype.handleText = function(text) {
  this.body = (this.body || "") + text;
};
function ReferenceHandler(property, context) {
  this.property = property;
  this.context = context;
}
ReferenceHandler.prototype = Object.create(BodyHandler.prototype);
ReferenceHandler.prototype.handleNode = function(node) {
  if (this.element) {
    throw error2("expected no sub nodes");
  } else {
    this.element = this.createReference(node);
  }
  return this;
};
ReferenceHandler.prototype.handleEnd = function() {
  this.element.id = this.body;
};
ReferenceHandler.prototype.createReference = function(node) {
  return {
    property: this.property.ns.name,
    id: ""
  };
};
function ValueHandler(propertyDesc, element) {
  this.element = element;
  this.propertyDesc = propertyDesc;
}
ValueHandler.prototype = Object.create(BodyHandler.prototype);
ValueHandler.prototype.handleEnd = function() {
  var value = this.body || "", element = this.element, propertyDesc = this.propertyDesc;
  value = coerceType(propertyDesc.type, value);
  if (propertyDesc.isMany) {
    element.get(propertyDesc.name).push(value);
  } else {
    element.set(propertyDesc.name, value);
  }
};
function BaseElementHandler() {
}
BaseElementHandler.prototype = Object.create(BodyHandler.prototype);
BaseElementHandler.prototype.handleNode = function(node) {
  var parser = this, element = this.element;
  if (!element) {
    element = this.element = this.createElement(node);
    this.context.addElement(element);
  } else {
    parser = this.handleChild(node);
  }
  return parser;
};
function ElementHandler(model, typeName, context) {
  this.model = model;
  this.type = model.getType(typeName);
  this.context = context;
}
ElementHandler.prototype = Object.create(BaseElementHandler.prototype);
ElementHandler.prototype.addReference = function(reference) {
  this.context.addReference(reference);
};
ElementHandler.prototype.handleText = function(text) {
  var element = this.element, descriptor = getModdleDescriptor(element), bodyProperty = descriptor.bodyProperty;
  if (!bodyProperty) {
    throw error2("unexpected body text <" + text + ">");
  }
  BodyHandler.prototype.handleText.call(this, text);
};
ElementHandler.prototype.handleEnd = function() {
  var value = this.body, element = this.element, descriptor = getModdleDescriptor(element), bodyProperty = descriptor.bodyProperty;
  if (bodyProperty && value !== void 0) {
    value = coerceType(bodyProperty.type, value);
    element.set(bodyProperty.name, value);
  }
};
ElementHandler.prototype.createElement = function(node) {
  var attributes = node.attributes, Type = this.type, descriptor = getModdleDescriptor(Type), context = this.context, instance = new Type({}), model = this.model, propNameNs;
  forEach(attributes, function(value, name2) {
    var prop = descriptor.propertiesByName[name2], values;
    if (prop && prop.isReference) {
      if (!prop.isMany) {
        context.addReference({
          element: instance,
          property: prop.ns.name,
          id: value
        });
      } else {
        values = value.split(" ");
        forEach(values, function(v) {
          context.addReference({
            element: instance,
            property: prop.ns.name,
            id: v
          });
        });
      }
    } else {
      if (prop) {
        value = coerceType(prop.type, value);
      } else if (name2 === "xmlns") {
        name2 = ":" + name2;
      } else {
        propNameNs = parseName(name2, descriptor.ns.prefix);
        if (model.getPackage(propNameNs.prefix)) {
          context.addWarning({
            message: "unknown attribute <" + name2 + ">",
            element: instance,
            property: name2,
            value
          });
        }
      }
      instance.set(name2, value);
    }
  });
  return instance;
};
ElementHandler.prototype.getPropertyForNode = function(node) {
  var name2 = node.name;
  var nameNs = parseName(name2);
  var type = this.type, model = this.model, descriptor = getModdleDescriptor(type);
  var propertyName = nameNs.name, property = descriptor.propertiesByName[propertyName];
  if (property && !property.isAttr) {
    const serializationType = getSerializationType(property);
    if (serializationType) {
      const elementTypeName = node.attributes[serializationType];
      if (elementTypeName) {
        const normalizedTypeName = normalizeTypeName(elementTypeName, node.ns, model);
        const elementType = model.getType(normalizedTypeName);
        return assign({}, property, {
          effectiveType: getModdleDescriptor(elementType).name
        });
      }
    }
    return property;
  }
  var pkg = model.getPackage(nameNs.prefix);
  if (pkg) {
    const elementTypeName = aliasToName(nameNs, pkg);
    const elementType = model.getType(elementTypeName);
    property = find(descriptor.properties, function(p) {
      return !p.isVirtual && !p.isReference && !p.isAttribute && elementType.hasType(p.type);
    });
    if (property) {
      return assign({}, property, {
        effectiveType: getModdleDescriptor(elementType).name
      });
    }
  } else {
    property = find(descriptor.properties, function(p) {
      return !p.isReference && !p.isAttribute && p.type === "Element";
    });
    if (property) {
      return property;
    }
  }
  throw error2("unrecognized element <" + nameNs.name + ">");
};
ElementHandler.prototype.toString = function() {
  return "ElementDescriptor[" + getModdleDescriptor(this.type).name + "]";
};
ElementHandler.prototype.valueHandler = function(propertyDesc, element) {
  return new ValueHandler(propertyDesc, element);
};
ElementHandler.prototype.referenceHandler = function(propertyDesc) {
  return new ReferenceHandler(propertyDesc, this.context);
};
ElementHandler.prototype.handler = function(type) {
  if (type === "Element") {
    return new GenericElementHandler(this.model, type, this.context);
  } else {
    return new ElementHandler(this.model, type, this.context);
  }
};
ElementHandler.prototype.handleChild = function(node) {
  var propertyDesc, type, element, childHandler;
  propertyDesc = this.getPropertyForNode(node);
  element = this.element;
  type = propertyDesc.effectiveType || propertyDesc.type;
  if (isSimple(type)) {
    return this.valueHandler(propertyDesc, element);
  }
  if (propertyDesc.isReference) {
    childHandler = this.referenceHandler(propertyDesc).handleNode(node);
  } else {
    childHandler = this.handler(type).handleNode(node);
  }
  var newElement = childHandler.element;
  if (newElement !== void 0) {
    if (propertyDesc.isMany) {
      element.get(propertyDesc.name).push(newElement);
    } else {
      element.set(propertyDesc.name, newElement);
    }
    if (propertyDesc.isReference) {
      assign(newElement, {
        element
      });
      this.context.addReference(newElement);
    } else {
      newElement.$parent = element;
    }
  }
  return childHandler;
};
function RootElementHandler(model, typeName, context) {
  ElementHandler.call(this, model, typeName, context);
}
RootElementHandler.prototype = Object.create(ElementHandler.prototype);
RootElementHandler.prototype.createElement = function(node) {
  var name2 = node.name, nameNs = parseName(name2), model = this.model, type = this.type, pkg = model.getPackage(nameNs.prefix), typeName = pkg && aliasToName(nameNs, pkg) || name2;
  if (!type.hasType(typeName)) {
    throw error2("unexpected element <" + node.originalName + ">");
  }
  return ElementHandler.prototype.createElement.call(this, node);
};
function GenericElementHandler(model, typeName, context) {
  this.model = model;
  this.context = context;
}
GenericElementHandler.prototype = Object.create(BaseElementHandler.prototype);
GenericElementHandler.prototype.createElement = function(node) {
  var name2 = node.name, ns = parseName(name2), prefix2 = ns.prefix, uri2 = node.ns[prefix2 + "$uri"], attributes = node.attributes;
  return this.model.createAny(name2, uri2, attributes);
};
GenericElementHandler.prototype.handleChild = function(node) {
  var handler = new GenericElementHandler(this.model, "Element", this.context).handleNode(node), element = this.element;
  var newElement = handler.element, children;
  if (newElement !== void 0) {
    children = element.$children = element.$children || [];
    children.push(newElement);
    newElement.$parent = element;
  }
  return handler;
};
GenericElementHandler.prototype.handleEnd = function() {
  if (this.body) {
    this.element.$body = this.body;
  }
};
function Reader(options) {
  if (options instanceof Moddle) {
    options = {
      model: options
    };
  }
  assign(this, { lax: false }, options);
}
Reader.prototype.fromXML = function(xml2, options, done) {
  var rootHandler = options.rootHandler;
  if (options instanceof ElementHandler) {
    rootHandler = options;
    options = {};
  } else {
    if (typeof options === "string") {
      rootHandler = this.handler(options);
      options = {};
    } else if (typeof rootHandler === "string") {
      rootHandler = this.handler(rootHandler);
    }
  }
  var model = this.model, lax = this.lax;
  var context = new Context(assign({}, options, { rootHandler })), parser = new Parser({ proxy: true }), stack = createStack();
  rootHandler.context = context;
  stack.push(rootHandler);
  function handleError(err, getContext, lax2) {
    var ctx = getContext();
    var line = ctx.line, column = ctx.column, data = ctx.data;
    if (data.charAt(0) === "<" && data.indexOf(" ") !== -1) {
      data = data.slice(0, data.indexOf(" ")) + ">";
    }
    var message = "unparsable content " + (data ? data + " " : "") + "detected\n	line: " + line + "\n	column: " + column + "\n	nested error: " + err.message;
    if (lax2) {
      context.addWarning({
        message,
        error: err
      });
      return true;
    } else {
      throw error2(message);
    }
  }
  function handleWarning(err, getContext) {
    return handleError(err, getContext, true);
  }
  function resolveReferences() {
    var elementsById = context.elementsById;
    var references = context.references;
    var i, r;
    for (i = 0; r = references[i]; i++) {
      var element = r.element;
      var reference = elementsById[r.id];
      var property = getModdleDescriptor(element).propertiesByName[r.property];
      if (!reference) {
        context.addWarning({
          message: "unresolved reference <" + r.id + ">",
          element: r.element,
          property: r.property,
          value: r.id
        });
      }
      if (property.isMany) {
        var collection = element.get(property.name), idx = collection.indexOf(r);
        if (idx === -1) {
          idx = collection.length;
        }
        if (!reference) {
          collection.splice(idx, 1);
        } else {
          collection[idx] = reference;
        }
      } else {
        element.set(property.name, reference);
      }
    }
  }
  function handleClose() {
    stack.pop().handleEnd();
  }
  var PREAMBLE_START_PATTERN = /^<\?xml /i;
  var ENCODING_PATTERN = / encoding="([^"]+)"/i;
  var UTF_8_PATTERN = /^utf-8$/i;
  function handleQuestion(question) {
    if (!PREAMBLE_START_PATTERN.test(question)) {
      return;
    }
    var match = ENCODING_PATTERN.exec(question);
    var encoding = match && match[1];
    if (!encoding || UTF_8_PATTERN.test(encoding)) {
      return;
    }
    context.addWarning({
      message: "unsupported document encoding <" + encoding + ">, falling back to UTF-8"
    });
  }
  function handleOpen(node, getContext) {
    var handler = stack.peek();
    try {
      stack.push(handler.handleNode(node));
    } catch (err) {
      if (handleError(err, getContext, lax)) {
        stack.push(new NoopHandler());
      }
    }
  }
  function handleCData(text, getContext) {
    try {
      stack.peek().handleText(text);
    } catch (err) {
      handleWarning(err, getContext);
    }
  }
  function handleText(text, getContext) {
    if (!text.trim()) {
      return;
    }
    handleCData(text, getContext);
  }
  var uriMap = model.getPackages().reduce(function(uriMap2, p) {
    uriMap2[p.uri] = p.prefix;
    return uriMap2;
  }, Object.entries(DEFAULT_NS_MAP).reduce(function(map2, [prefix2, url]) {
    map2[url] = prefix2;
    return map2;
  }, model.config && model.config.nsMap || {}));
  parser.ns(uriMap).on("openTag", function(obj, decodeStr, selfClosing, getContext) {
    var attrs = obj.attrs || {};
    var decodedAttrs = Object.keys(attrs).reduce(function(d, key) {
      var value = decodeStr(attrs[key]);
      d[key] = value;
      return d;
    }, {});
    var node = {
      name: obj.name,
      originalName: obj.originalName,
      attributes: decodedAttrs,
      ns: obj.ns
    };
    handleOpen(node, getContext);
  }).on("question", handleQuestion).on("closeTag", handleClose).on("cdata", handleCData).on("text", function(text, decodeEntities2, getContext) {
    handleText(decodeEntities2(text), getContext);
  }).on("error", handleError).on("warn", handleWarning);
  return new Promise(function(resolve, reject) {
    var err;
    try {
      parser.parse(xml2);
      resolveReferences();
    } catch (e) {
      err = e;
    }
    var rootElement = rootHandler.element;
    if (!err && !rootElement) {
      err = error2("failed to parse document as <" + rootHandler.type.$descriptor.name + ">");
    }
    var warnings = context.warnings;
    var references = context.references;
    var elementsById = context.elementsById;
    if (err) {
      err.warnings = warnings;
      return reject(err);
    } else {
      return resolve({
        rootElement,
        elementsById,
        references,
        warnings
      });
    }
  });
};
Reader.prototype.handler = function(name2) {
  return new RootElementHandler(this.model, name2);
};
function createStack() {
  var stack = [];
  Object.defineProperty(stack, "peek", {
    value: function() {
      return this[this.length - 1];
    }
  });
  return stack;
}
var XML_PREAMBLE = '<?xml version="1.0" encoding="UTF-8"?>\n';
var ESCAPE_ATTR_CHARS = /<|>|'|"|&|\n\r|\n/g;
var ESCAPE_CHARS = /<|>|&/g;
function Namespaces(parent) {
  this.prefixMap = {};
  this.uriMap = {};
  this.used = {};
  this.wellknown = [];
  this.custom = [];
  this.parent = parent;
  this.defaultPrefixMap = parent && parent.defaultPrefixMap || {};
}
Namespaces.prototype.mapDefaultPrefixes = function(defaultPrefixMap) {
  this.defaultPrefixMap = defaultPrefixMap;
};
Namespaces.prototype.defaultUriByPrefix = function(prefix2) {
  return this.defaultPrefixMap[prefix2];
};
Namespaces.prototype.byUri = function(uri2) {
  return this.uriMap[uri2] || this.parent && this.parent.byUri(uri2);
};
Namespaces.prototype.add = function(ns, isWellknown) {
  this.uriMap[ns.uri] = ns;
  if (isWellknown) {
    this.wellknown.push(ns);
  } else {
    this.custom.push(ns);
  }
  this.mapPrefix(ns.prefix, ns.uri);
};
Namespaces.prototype.uriByPrefix = function(prefix2) {
  return this.prefixMap[prefix2 || "xmlns"] || this.parent && this.parent.uriByPrefix(prefix2);
};
Namespaces.prototype.mapPrefix = function(prefix2, uri2) {
  this.prefixMap[prefix2 || "xmlns"] = uri2;
};
Namespaces.prototype.getNSKey = function(ns) {
  return ns.prefix !== void 0 ? ns.uri + "|" + ns.prefix : ns.uri;
};
Namespaces.prototype.logUsed = function(ns) {
  var uri2 = ns.uri;
  var nsKey = this.getNSKey(ns);
  this.used[nsKey] = this.byUri(uri2);
  if (this.parent) {
    this.parent.logUsed(ns);
  }
};
Namespaces.prototype.getUsed = function(ns) {
  var allNs = [].concat(this.wellknown, this.custom);
  return allNs.filter((ns2) => {
    var nsKey = this.getNSKey(ns2);
    return this.used[nsKey];
  });
};
function lower(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
function nameToAlias(name2, pkg) {
  if (hasLowerCaseAlias(pkg)) {
    return lower(name2);
  } else {
    return name2;
  }
}
function inherits(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}
function nsName(ns) {
  if (isString(ns)) {
    return ns;
  } else {
    return (ns.prefix ? ns.prefix + ":" : "") + ns.localName;
  }
}
function getNsAttrs(namespaces) {
  return namespaces.getUsed().filter(function(ns) {
    return ns.prefix !== "xml";
  }).map(function(ns) {
    var name2 = "xmlns" + (ns.prefix ? ":" + ns.prefix : "");
    return { name: name2, value: ns.uri };
  });
}
function getElementNs(ns, descriptor) {
  if (descriptor.isGeneric) {
    return assign({ localName: descriptor.ns.localName }, ns);
  } else {
    return assign({ localName: nameToAlias(descriptor.ns.localName, descriptor.$pkg) }, ns);
  }
}
function getPropertyNs(ns, descriptor) {
  return assign({ localName: descriptor.ns.localName }, ns);
}
function getSerializableProperties(element) {
  var descriptor = element.$descriptor;
  return filter(descriptor.properties, function(p) {
    var name2 = p.name;
    if (p.isVirtual) {
      return false;
    }
    if (!has(element, name2)) {
      return false;
    }
    var value = element[name2];
    if (value === p.default) {
      return false;
    }
    if (value === null) {
      return false;
    }
    return p.isMany ? value.length : true;
  });
}
var ESCAPE_ATTR_MAP = {
  "\n": "#10",
  "\n\r": "#10",
  '"': "#34",
  "'": "#39",
  "<": "#60",
  ">": "#62",
  "&": "#38"
};
var ESCAPE_MAP = {
  "<": "lt",
  ">": "gt",
  "&": "amp"
};
function escape(str, charPattern, replaceMap) {
  str = isString(str) ? str : "" + str;
  return str.replace(charPattern, function(s) {
    return "&" + replaceMap[s] + ";";
  });
}
function escapeAttr(str) {
  return escape(str, ESCAPE_ATTR_CHARS, ESCAPE_ATTR_MAP);
}
function escapeBody(str) {
  return escape(str, ESCAPE_CHARS, ESCAPE_MAP);
}
function filterAttributes(props) {
  return filter(props, function(p) {
    return p.isAttr;
  });
}
function filterContained(props) {
  return filter(props, function(p) {
    return !p.isAttr;
  });
}
function ReferenceSerializer(tagName) {
  this.tagName = tagName;
}
ReferenceSerializer.prototype.build = function(element) {
  this.element = element;
  return this;
};
ReferenceSerializer.prototype.serializeTo = function(writer) {
  writer.appendIndent().append("<" + this.tagName + ">" + this.element.id + "</" + this.tagName + ">").appendNewLine();
};
function BodySerializer() {
}
BodySerializer.prototype.serializeValue = BodySerializer.prototype.serializeTo = function(writer) {
  writer.append(
    this.escape ? escapeBody(this.value) : this.value
  );
};
BodySerializer.prototype.build = function(prop, value) {
  this.value = value;
  if (prop.type === "String" && value.search(ESCAPE_CHARS) !== -1) {
    this.escape = true;
  }
  return this;
};
function ValueSerializer(tagName) {
  this.tagName = tagName;
}
inherits(ValueSerializer, BodySerializer);
ValueSerializer.prototype.serializeTo = function(writer) {
  writer.appendIndent().append("<" + this.tagName + ">");
  this.serializeValue(writer);
  writer.append("</" + this.tagName + ">").appendNewLine();
};
function ElementSerializer(parent, propertyDescriptor) {
  this.body = [];
  this.attrs = [];
  this.parent = parent;
  this.propertyDescriptor = propertyDescriptor;
}
ElementSerializer.prototype.build = function(element) {
  this.element = element;
  var elementDescriptor = element.$descriptor, propertyDescriptor = this.propertyDescriptor;
  var otherAttrs, properties;
  var isGeneric = elementDescriptor.isGeneric;
  if (isGeneric) {
    otherAttrs = this.parseGenericNsAttributes(element);
  } else {
    otherAttrs = this.parseNsAttributes(element);
  }
  if (propertyDescriptor) {
    this.ns = this.nsPropertyTagName(propertyDescriptor);
  } else {
    this.ns = this.nsTagName(elementDescriptor);
  }
  this.tagName = this.addTagName(this.ns);
  if (isGeneric) {
    this.parseGenericContainments(element);
  } else {
    properties = getSerializableProperties(element);
    this.parseAttributes(filterAttributes(properties));
    this.parseContainments(filterContained(properties));
  }
  this.parseGenericAttributes(element, otherAttrs);
  return this;
};
ElementSerializer.prototype.nsTagName = function(descriptor) {
  var effectiveNs = this.logNamespaceUsed(descriptor.ns);
  return getElementNs(effectiveNs, descriptor);
};
ElementSerializer.prototype.nsPropertyTagName = function(descriptor) {
  var effectiveNs = this.logNamespaceUsed(descriptor.ns);
  return getPropertyNs(effectiveNs, descriptor);
};
ElementSerializer.prototype.isLocalNs = function(ns) {
  return ns.uri === this.ns.uri;
};
ElementSerializer.prototype.nsAttributeName = function(element) {
  var ns;
  if (isString(element)) {
    ns = parseName(element);
  } else {
    ns = element.ns;
  }
  if (element.inherited) {
    return { localName: ns.localName };
  }
  var effectiveNs = this.logNamespaceUsed(ns);
  this.getNamespaces().logUsed(effectiveNs);
  if (this.isLocalNs(effectiveNs)) {
    return { localName: ns.localName };
  } else {
    return assign({ localName: ns.localName }, effectiveNs);
  }
};
ElementSerializer.prototype.parseGenericNsAttributes = function(element) {
  return Object.entries(element).filter(
    ([key, value]) => !key.startsWith("$") && this.parseNsAttribute(element, key, value)
  ).map(
    ([key, value]) => ({ name: key, value })
  );
};
ElementSerializer.prototype.parseGenericContainments = function(element) {
  var body = element.$body;
  if (body) {
    this.body.push(new BodySerializer().build({ type: "String" }, body));
  }
  var children = element.$children;
  if (children) {
    forEach(children, (child) => {
      this.body.push(new ElementSerializer(this).build(child));
    });
  }
};
ElementSerializer.prototype.parseNsAttribute = function(element, name2, value) {
  var model = element.$model;
  var nameNs = parseName(name2);
  var ns;
  if (nameNs.prefix === "xmlns") {
    ns = { prefix: nameNs.localName, uri: value };
  }
  if (!nameNs.prefix && nameNs.localName === "xmlns") {
    ns = { uri: value };
  }
  if (!ns) {
    return {
      name: name2,
      value
    };
  }
  if (model && model.getPackage(value)) {
    this.logNamespace(ns, true, true);
  } else {
    var actualNs = this.logNamespaceUsed(ns, true);
    this.getNamespaces().logUsed(actualNs);
  }
};
ElementSerializer.prototype.parseNsAttributes = function(element) {
  var self = this;
  var genericAttrs = element.$attrs;
  var attributes = [];
  forEach(genericAttrs, function(value, name2) {
    var nonNsAttr = self.parseNsAttribute(element, name2, value);
    if (nonNsAttr) {
      attributes.push(nonNsAttr);
    }
  });
  return attributes;
};
ElementSerializer.prototype.parseGenericAttributes = function(element, attributes) {
  var self = this;
  forEach(attributes, function(attr) {
    try {
      self.addAttribute(self.nsAttributeName(attr.name), attr.value);
    } catch (e) {
      typeof console !== "undefined" && console.warn(
        `missing namespace information for <${attr.name}=${attr.value}> on`,
        element,
        e
      );
    }
  });
};
ElementSerializer.prototype.parseContainments = function(properties) {
  var self = this, body = this.body, element = this.element;
  forEach(properties, function(p) {
    var value = element.get(p.name), isReference = p.isReference, isMany = p.isMany;
    if (!isMany) {
      value = [value];
    }
    if (p.isBody) {
      body.push(new BodySerializer().build(p, value[0]));
    } else if (isSimple(p.type)) {
      forEach(value, function(v) {
        body.push(new ValueSerializer(self.addTagName(self.nsPropertyTagName(p))).build(p, v));
      });
    } else if (isReference) {
      forEach(value, function(v) {
        body.push(new ReferenceSerializer(self.addTagName(self.nsPropertyTagName(p))).build(v));
      });
    } else {
      var serialization = getSerialization(p);
      forEach(value, function(v) {
        var serializer;
        if (serialization) {
          if (serialization === SERIALIZE_PROPERTY) {
            serializer = new ElementSerializer(self, p);
          } else {
            serializer = new TypeSerializer(self, p, serialization);
          }
        } else {
          serializer = new ElementSerializer(self);
        }
        body.push(serializer.build(v));
      });
    }
  });
};
ElementSerializer.prototype.getNamespaces = function(local) {
  var namespaces = this.namespaces, parent = this.parent, parentNamespaces;
  if (!namespaces) {
    parentNamespaces = parent && parent.getNamespaces();
    if (local || !parentNamespaces) {
      this.namespaces = namespaces = new Namespaces(parentNamespaces);
    } else {
      namespaces = parentNamespaces;
    }
  }
  return namespaces;
};
ElementSerializer.prototype.logNamespace = function(ns, wellknown, local) {
  var namespaces = this.getNamespaces(local);
  var nsUri = ns.uri, nsPrefix = ns.prefix;
  var existing = namespaces.byUri(nsUri);
  if (!existing || local) {
    namespaces.add(ns, wellknown);
  }
  namespaces.mapPrefix(nsPrefix, nsUri);
  return ns;
};
ElementSerializer.prototype.logNamespaceUsed = function(ns, local) {
  var namespaces = this.getNamespaces(local);
  var prefix2 = ns.prefix, uri2 = ns.uri, newPrefix, idx, wellknownUri;
  if (!prefix2 && !uri2) {
    return { localName: ns.localName };
  }
  wellknownUri = namespaces.defaultUriByPrefix(prefix2);
  uri2 = uri2 || wellknownUri || namespaces.uriByPrefix(prefix2);
  if (!uri2) {
    throw new Error("no namespace uri given for prefix <" + prefix2 + ">");
  }
  ns = namespaces.byUri(uri2);
  if (!ns && !prefix2) {
    ns = this.logNamespace({ uri: uri2 }, wellknownUri === uri2, true);
  }
  if (!ns) {
    newPrefix = prefix2;
    idx = 1;
    while (namespaces.uriByPrefix(newPrefix)) {
      newPrefix = prefix2 + "_" + idx++;
    }
    ns = this.logNamespace({ prefix: newPrefix, uri: uri2 }, wellknownUri === uri2);
  }
  if (prefix2) {
    namespaces.mapPrefix(prefix2, uri2);
  }
  return ns;
};
ElementSerializer.prototype.parseAttributes = function(properties) {
  var self = this, element = this.element;
  forEach(properties, function(p) {
    var value = element.get(p.name);
    if (p.isReference) {
      if (!p.isMany) {
        value = value.id;
      } else {
        var values = [];
        forEach(value, function(v) {
          values.push(v.id);
        });
        value = values.join(" ");
      }
    }
    self.addAttribute(self.nsAttributeName(p), value);
  });
};
ElementSerializer.prototype.addTagName = function(nsTagName) {
  var actualNs = this.logNamespaceUsed(nsTagName);
  this.getNamespaces().logUsed(actualNs);
  return nsName(nsTagName);
};
ElementSerializer.prototype.addAttribute = function(name2, value) {
  var attrs = this.attrs;
  if (isString(value)) {
    value = escapeAttr(value);
  }
  var idx = findIndex(attrs, function(element) {
    return element.name.localName === name2.localName && element.name.uri === name2.uri && element.name.prefix === name2.prefix;
  });
  var attr = { name: name2, value };
  if (idx !== -1) {
    attrs.splice(idx, 1, attr);
  } else {
    attrs.push(attr);
  }
};
ElementSerializer.prototype.serializeAttributes = function(writer) {
  var attrs = this.attrs, namespaces = this.namespaces;
  if (namespaces) {
    attrs = getNsAttrs(namespaces).concat(attrs);
  }
  forEach(attrs, function(a) {
    writer.append(" ").append(nsName(a.name)).append('="').append(a.value).append('"');
  });
};
ElementSerializer.prototype.serializeTo = function(writer) {
  var firstBody = this.body[0], indent = firstBody && firstBody.constructor !== BodySerializer;
  writer.appendIndent().append("<" + this.tagName);
  this.serializeAttributes(writer);
  writer.append(firstBody ? ">" : " />");
  if (firstBody) {
    if (indent) {
      writer.appendNewLine().indent();
    }
    forEach(this.body, function(b) {
      b.serializeTo(writer);
    });
    if (indent) {
      writer.unindent().appendIndent();
    }
    writer.append("</" + this.tagName + ">");
  }
  writer.appendNewLine();
};
function TypeSerializer(parent, propertyDescriptor, serialization) {
  ElementSerializer.call(this, parent, propertyDescriptor);
  this.serialization = serialization;
}
inherits(TypeSerializer, ElementSerializer);
TypeSerializer.prototype.parseNsAttributes = function(element) {
  var attributes = ElementSerializer.prototype.parseNsAttributes.call(this, element).filter(
    (attr) => attr.name !== this.serialization
  );
  var descriptor = element.$descriptor;
  if (descriptor.name === this.propertyDescriptor.type) {
    return attributes;
  }
  var typeNs = this.typeNs = this.nsTagName(descriptor);
  this.getNamespaces().logUsed(this.typeNs);
  var pkg = element.$model.getPackage(typeNs.uri), typePrefix = pkg.xml && pkg.xml.typePrefix || "";
  this.addAttribute(
    this.nsAttributeName(this.serialization),
    (typeNs.prefix ? typeNs.prefix + ":" : "") + typePrefix + descriptor.ns.localName
  );
  return attributes;
};
TypeSerializer.prototype.isLocalNs = function(ns) {
  return ns.uri === (this.typeNs || this.ns).uri;
};
function SavingWriter() {
  this.value = "";
  this.write = function(str) {
    this.value += str;
  };
}
function FormatingWriter(out, format) {
  var indent = [""];
  this.append = function(str) {
    out.write(str);
    return this;
  };
  this.appendNewLine = function() {
    if (format) {
      out.write("\n");
    }
    return this;
  };
  this.appendIndent = function() {
    if (format) {
      out.write(indent.join("  "));
    }
    return this;
  };
  this.indent = function() {
    indent.push("");
    return this;
  };
  this.unindent = function() {
    indent.pop();
    return this;
  };
}
function Writer(options) {
  options = assign({ format: false, preamble: true }, options || {});
  function toXML(tree, writer) {
    var internalWriter = writer || new SavingWriter();
    var formatingWriter = new FormatingWriter(internalWriter, options.format);
    if (options.preamble) {
      formatingWriter.append(XML_PREAMBLE);
    }
    var serializer = new ElementSerializer();
    var model = tree.$model;
    serializer.getNamespaces().mapDefaultPrefixes(getDefaultPrefixMappings(model));
    serializer.build(tree).serializeTo(formatingWriter);
    if (!writer) {
      return internalWriter.value;
    }
  }
  return {
    toXML
  };
}
function getDefaultPrefixMappings(model) {
  const nsMap = model.config && model.config.nsMap || {};
  const prefixMap = {};
  for (const prefix2 in DEFAULT_NS_MAP) {
    prefixMap[prefix2] = DEFAULT_NS_MAP[prefix2];
  }
  for (const uri2 in nsMap) {
    const prefix2 = nsMap[uri2];
    prefixMap[prefix2] = uri2;
  }
  for (const pkg of model.getPackages()) {
    prefixMap[pkg.prefix] = pkg.uri;
  }
  return prefixMap;
}

// node_modules/bpmn-moddle/dist/index.js
function BpmnModdle(packages2, options) {
  Moddle.call(this, packages2, options);
}
BpmnModdle.prototype = Object.create(Moddle.prototype);
BpmnModdle.prototype.fromXML = function(xmlStr, typeName, options) {
  if (!isString(typeName)) {
    options = typeName;
    typeName = "bpmn:Definitions";
  }
  var reader = new Reader(assign({ model: this, lax: true }, options));
  var rootHandler = reader.handler(typeName);
  return reader.fromXML(xmlStr, rootHandler);
};
BpmnModdle.prototype.toXML = function(element, options) {
  var writer = new Writer(options);
  return new Promise(function(resolve, reject) {
    try {
      var result = writer.toXML(element);
      return resolve({
        xml: result
      });
    } catch (err) {
      return reject(err);
    }
  });
};
var name$5 = "BPMN20";
var uri$5 = "http://www.omg.org/spec/BPMN/20100524/MODEL";
var prefix$5 = "bpmn";
var associations$5 = [];
var types$5 = [
  {
    name: "Interface",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "operations",
        type: "Operation",
        isMany: true
      },
      {
        name: "implementationRef",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Operation",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "inMessageRef",
        type: "Message",
        isReference: true
      },
      {
        name: "outMessageRef",
        type: "Message",
        isReference: true
      },
      {
        name: "errorRef",
        type: "Error",
        isMany: true,
        isReference: true
      },
      {
        name: "implementationRef",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "EndPoint",
    superClass: [
      "RootElement"
    ]
  },
  {
    name: "Auditing",
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "GlobalTask",
    superClass: [
      "CallableElement"
    ],
    properties: [
      {
        name: "resources",
        type: "ResourceRole",
        isMany: true
      }
    ]
  },
  {
    name: "Monitoring",
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "Performer",
    superClass: [
      "ResourceRole"
    ]
  },
  {
    name: "Process",
    superClass: [
      "FlowElementsContainer",
      "CallableElement"
    ],
    properties: [
      {
        name: "processType",
        type: "ProcessType",
        isAttr: true
      },
      {
        name: "isClosed",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "auditing",
        type: "Auditing"
      },
      {
        name: "monitoring",
        type: "Monitoring"
      },
      {
        name: "properties",
        type: "Property",
        isMany: true
      },
      {
        name: "laneSets",
        isMany: true,
        replaces: "FlowElementsContainer#laneSets",
        type: "LaneSet"
      },
      {
        name: "flowElements",
        isMany: true,
        replaces: "FlowElementsContainer#flowElements",
        type: "FlowElement"
      },
      {
        name: "artifacts",
        type: "Artifact",
        isMany: true
      },
      {
        name: "resources",
        type: "ResourceRole",
        isMany: true
      },
      {
        name: "correlationSubscriptions",
        type: "CorrelationSubscription",
        isMany: true
      },
      {
        name: "supports",
        type: "Process",
        isMany: true,
        isReference: true
      },
      {
        name: "definitionalCollaborationRef",
        type: "Collaboration",
        isAttr: true,
        isReference: true
      },
      {
        name: "isExecutable",
        isAttr: true,
        type: "Boolean"
      }
    ]
  },
  {
    name: "LaneSet",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "lanes",
        type: "Lane",
        isMany: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Lane",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "partitionElementRef",
        type: "BaseElement",
        isAttr: true,
        isReference: true
      },
      {
        name: "partitionElement",
        type: "BaseElement"
      },
      {
        name: "flowNodeRef",
        type: "FlowNode",
        isMany: true,
        isReference: true
      },
      {
        name: "childLaneSet",
        type: "LaneSet",
        xml: {
          serialize: "xsi:type"
        }
      }
    ]
  },
  {
    name: "GlobalManualTask",
    superClass: [
      "GlobalTask"
    ]
  },
  {
    name: "ManualTask",
    superClass: [
      "Task"
    ]
  },
  {
    name: "UserTask",
    superClass: [
      "Task"
    ],
    properties: [
      {
        name: "renderings",
        type: "Rendering",
        isMany: true
      },
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Rendering",
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "HumanPerformer",
    superClass: [
      "Performer"
    ]
  },
  {
    name: "PotentialOwner",
    superClass: [
      "HumanPerformer"
    ]
  },
  {
    name: "GlobalUserTask",
    superClass: [
      "GlobalTask"
    ],
    properties: [
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      },
      {
        name: "renderings",
        type: "Rendering",
        isMany: true
      }
    ]
  },
  {
    name: "Gateway",
    isAbstract: true,
    superClass: [
      "FlowNode"
    ],
    properties: [
      {
        name: "gatewayDirection",
        type: "GatewayDirection",
        "default": "Unspecified",
        isAttr: true
      }
    ]
  },
  {
    name: "EventBasedGateway",
    superClass: [
      "Gateway"
    ],
    properties: [
      {
        name: "instantiate",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "eventGatewayType",
        type: "EventBasedGatewayType",
        isAttr: true,
        "default": "Exclusive"
      }
    ]
  },
  {
    name: "ComplexGateway",
    superClass: [
      "Gateway"
    ],
    properties: [
      {
        name: "activationCondition",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "default",
        type: "SequenceFlow",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ExclusiveGateway",
    superClass: [
      "Gateway"
    ],
    properties: [
      {
        name: "default",
        type: "SequenceFlow",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "InclusiveGateway",
    superClass: [
      "Gateway"
    ],
    properties: [
      {
        name: "default",
        type: "SequenceFlow",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ParallelGateway",
    superClass: [
      "Gateway"
    ]
  },
  {
    name: "RootElement",
    isAbstract: true,
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "Relationship",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "type",
        isAttr: true,
        type: "String"
      },
      {
        name: "direction",
        type: "RelationshipDirection",
        isAttr: true
      },
      {
        name: "source",
        isMany: true,
        isReference: true,
        type: "Element"
      },
      {
        name: "target",
        isMany: true,
        isReference: true,
        type: "Element"
      }
    ]
  },
  {
    name: "BaseElement",
    isAbstract: true,
    properties: [
      {
        name: "id",
        isAttr: true,
        type: "String",
        isId: true
      },
      {
        name: "documentation",
        type: "Documentation",
        isMany: true
      },
      {
        name: "extensionDefinitions",
        type: "ExtensionDefinition",
        isMany: true,
        isReference: true
      },
      {
        name: "extensionElements",
        type: "ExtensionElements"
      }
    ]
  },
  {
    name: "Extension",
    properties: [
      {
        name: "mustUnderstand",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "definition",
        type: "ExtensionDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ExtensionDefinition",
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "extensionAttributeDefinitions",
        type: "ExtensionAttributeDefinition",
        isMany: true
      }
    ]
  },
  {
    name: "ExtensionAttributeDefinition",
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "type",
        isAttr: true,
        type: "String"
      },
      {
        name: "isReference",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "extensionDefinition",
        type: "ExtensionDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ExtensionElements",
    properties: [
      {
        name: "valueRef",
        isAttr: true,
        isReference: true,
        type: "Element"
      },
      {
        name: "values",
        type: "Element",
        isMany: true
      },
      {
        name: "extensionAttributeDefinition",
        type: "ExtensionAttributeDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Documentation",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "text",
        type: "String",
        isBody: true
      },
      {
        name: "textFormat",
        "default": "text/plain",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Event",
    isAbstract: true,
    superClass: [
      "FlowNode",
      "InteractionNode"
    ],
    properties: [
      {
        name: "properties",
        type: "Property",
        isMany: true
      }
    ]
  },
  {
    name: "IntermediateCatchEvent",
    superClass: [
      "CatchEvent"
    ]
  },
  {
    name: "IntermediateThrowEvent",
    superClass: [
      "ThrowEvent"
    ]
  },
  {
    name: "EndEvent",
    superClass: [
      "ThrowEvent"
    ]
  },
  {
    name: "StartEvent",
    superClass: [
      "CatchEvent"
    ],
    properties: [
      {
        name: "isInterrupting",
        "default": true,
        isAttr: true,
        type: "Boolean"
      }
    ]
  },
  {
    name: "ThrowEvent",
    isAbstract: true,
    superClass: [
      "Event"
    ],
    properties: [
      {
        name: "dataInputs",
        type: "DataInput",
        isMany: true
      },
      {
        name: "dataInputAssociations",
        type: "DataInputAssociation",
        isMany: true
      },
      {
        name: "inputSet",
        type: "InputSet"
      },
      {
        name: "eventDefinitions",
        type: "EventDefinition",
        isMany: true
      },
      {
        name: "eventDefinitionRef",
        type: "EventDefinition",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "CatchEvent",
    isAbstract: true,
    superClass: [
      "Event"
    ],
    properties: [
      {
        name: "parallelMultiple",
        isAttr: true,
        type: "Boolean",
        "default": false
      },
      {
        name: "dataOutputs",
        type: "DataOutput",
        isMany: true
      },
      {
        name: "dataOutputAssociations",
        type: "DataOutputAssociation",
        isMany: true
      },
      {
        name: "outputSet",
        type: "OutputSet"
      },
      {
        name: "eventDefinitions",
        type: "EventDefinition",
        isMany: true
      },
      {
        name: "eventDefinitionRef",
        type: "EventDefinition",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "BoundaryEvent",
    superClass: [
      "CatchEvent"
    ],
    properties: [
      {
        name: "cancelActivity",
        "default": true,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "attachedToRef",
        type: "Activity",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "EventDefinition",
    isAbstract: true,
    superClass: [
      "RootElement"
    ]
  },
  {
    name: "CancelEventDefinition",
    superClass: [
      "EventDefinition"
    ]
  },
  {
    name: "ErrorEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "errorRef",
        type: "Error",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "TerminateEventDefinition",
    superClass: [
      "EventDefinition"
    ]
  },
  {
    name: "EscalationEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "escalationRef",
        type: "Escalation",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Escalation",
    properties: [
      {
        name: "structureRef",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "escalationCode",
        isAttr: true,
        type: "String"
      }
    ],
    superClass: [
      "RootElement"
    ]
  },
  {
    name: "CompensateEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "waitForCompletion",
        isAttr: true,
        type: "Boolean",
        "default": true
      },
      {
        name: "activityRef",
        type: "Activity",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "TimerEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "timeDate",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "timeCycle",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "timeDuration",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      }
    ]
  },
  {
    name: "LinkEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "target",
        type: "LinkEventDefinition",
        isReference: true
      },
      {
        name: "source",
        type: "LinkEventDefinition",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "MessageEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "messageRef",
        type: "Message",
        isAttr: true,
        isReference: true
      },
      {
        name: "operationRef",
        type: "Operation",
        isReference: true
      }
    ]
  },
  {
    name: "ConditionalEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "condition",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      }
    ]
  },
  {
    name: "SignalEventDefinition",
    superClass: [
      "EventDefinition"
    ],
    properties: [
      {
        name: "signalRef",
        type: "Signal",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Signal",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "structureRef",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ImplicitThrowEvent",
    superClass: [
      "ThrowEvent"
    ]
  },
  {
    name: "DataState",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ItemAwareElement",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "itemSubjectRef",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      },
      {
        name: "dataState",
        type: "DataState"
      }
    ]
  },
  {
    name: "DataAssociation",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "sourceRef",
        type: "ItemAwareElement",
        isMany: true,
        isReference: true
      },
      {
        name: "targetRef",
        type: "ItemAwareElement",
        isReference: true
      },
      {
        name: "transformation",
        type: "FormalExpression",
        xml: {
          serialize: "property"
        }
      },
      {
        name: "assignment",
        type: "Assignment",
        isMany: true
      }
    ]
  },
  {
    name: "DataInput",
    superClass: [
      "ItemAwareElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "isCollection",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "inputSetRef",
        type: "InputSet",
        isMany: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "inputSetWithOptional",
        type: "InputSet",
        isMany: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "inputSetWithWhileExecuting",
        type: "InputSet",
        isMany: true,
        isVirtual: true,
        isReference: true
      }
    ]
  },
  {
    name: "DataOutput",
    superClass: [
      "ItemAwareElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "isCollection",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "outputSetRef",
        type: "OutputSet",
        isMany: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "outputSetWithOptional",
        type: "OutputSet",
        isMany: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "outputSetWithWhileExecuting",
        type: "OutputSet",
        isMany: true,
        isVirtual: true,
        isReference: true
      }
    ]
  },
  {
    name: "InputSet",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "dataInputRefs",
        type: "DataInput",
        isMany: true,
        isReference: true
      },
      {
        name: "optionalInputRefs",
        type: "DataInput",
        isMany: true,
        isReference: true
      },
      {
        name: "whileExecutingInputRefs",
        type: "DataInput",
        isMany: true,
        isReference: true
      },
      {
        name: "outputSetRefs",
        type: "OutputSet",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "OutputSet",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "dataOutputRefs",
        type: "DataOutput",
        isMany: true,
        isReference: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "inputSetRefs",
        type: "InputSet",
        isMany: true,
        isReference: true
      },
      {
        name: "optionalOutputRefs",
        type: "DataOutput",
        isMany: true,
        isReference: true
      },
      {
        name: "whileExecutingOutputRefs",
        type: "DataOutput",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "Property",
    superClass: [
      "ItemAwareElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "DataInputAssociation",
    superClass: [
      "DataAssociation"
    ]
  },
  {
    name: "DataOutputAssociation",
    superClass: [
      "DataAssociation"
    ]
  },
  {
    name: "InputOutputSpecification",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "dataInputs",
        type: "DataInput",
        isMany: true
      },
      {
        name: "dataOutputs",
        type: "DataOutput",
        isMany: true
      },
      {
        name: "inputSets",
        type: "InputSet",
        isMany: true
      },
      {
        name: "outputSets",
        type: "OutputSet",
        isMany: true
      }
    ]
  },
  {
    name: "DataObject",
    superClass: [
      "FlowElement",
      "ItemAwareElement"
    ],
    properties: [
      {
        name: "isCollection",
        "default": false,
        isAttr: true,
        type: "Boolean"
      }
    ]
  },
  {
    name: "InputOutputBinding",
    properties: [
      {
        name: "inputDataRef",
        type: "InputSet",
        isAttr: true,
        isReference: true
      },
      {
        name: "outputDataRef",
        type: "OutputSet",
        isAttr: true,
        isReference: true
      },
      {
        name: "operationRef",
        type: "Operation",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Assignment",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "from",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "to",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      }
    ]
  },
  {
    name: "DataStore",
    superClass: [
      "RootElement",
      "ItemAwareElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "capacity",
        isAttr: true,
        type: "Integer"
      },
      {
        name: "isUnlimited",
        "default": true,
        isAttr: true,
        type: "Boolean"
      }
    ]
  },
  {
    name: "DataStoreReference",
    superClass: [
      "ItemAwareElement",
      "FlowElement"
    ],
    properties: [
      {
        name: "dataStoreRef",
        type: "DataStore",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "DataObjectReference",
    superClass: [
      "ItemAwareElement",
      "FlowElement"
    ],
    properties: [
      {
        name: "dataObjectRef",
        type: "DataObject",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ConversationLink",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "sourceRef",
        type: "InteractionNode",
        isAttr: true,
        isReference: true
      },
      {
        name: "targetRef",
        type: "InteractionNode",
        isAttr: true,
        isReference: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ConversationAssociation",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "innerConversationNodeRef",
        type: "ConversationNode",
        isAttr: true,
        isReference: true
      },
      {
        name: "outerConversationNodeRef",
        type: "ConversationNode",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "CallConversation",
    superClass: [
      "ConversationNode"
    ],
    properties: [
      {
        name: "calledCollaborationRef",
        type: "Collaboration",
        isAttr: true,
        isReference: true
      },
      {
        name: "participantAssociations",
        type: "ParticipantAssociation",
        isMany: true
      }
    ]
  },
  {
    name: "Conversation",
    superClass: [
      "ConversationNode"
    ]
  },
  {
    name: "SubConversation",
    superClass: [
      "ConversationNode"
    ],
    properties: [
      {
        name: "conversationNodes",
        type: "ConversationNode",
        isMany: true
      }
    ]
  },
  {
    name: "ConversationNode",
    isAbstract: true,
    superClass: [
      "InteractionNode",
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "participantRef",
        type: "Participant",
        isMany: true,
        isReference: true
      },
      {
        name: "messageFlowRefs",
        type: "MessageFlow",
        isMany: true,
        isReference: true
      },
      {
        name: "correlationKeys",
        type: "CorrelationKey",
        isMany: true
      }
    ]
  },
  {
    name: "GlobalConversation",
    superClass: [
      "Collaboration"
    ]
  },
  {
    name: "PartnerEntity",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "participantRef",
        type: "Participant",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "PartnerRole",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "participantRef",
        type: "Participant",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "CorrelationProperty",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "correlationPropertyRetrievalExpression",
        type: "CorrelationPropertyRetrievalExpression",
        isMany: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "type",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Error",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "structureRef",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "errorCode",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "CorrelationKey",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "correlationPropertyRef",
        type: "CorrelationProperty",
        isMany: true,
        isReference: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Expression",
    superClass: [
      "BaseElement"
    ],
    isAbstract: false,
    properties: [
      {
        name: "body",
        isBody: true,
        type: "String"
      }
    ]
  },
  {
    name: "FormalExpression",
    superClass: [
      "Expression"
    ],
    properties: [
      {
        name: "language",
        isAttr: true,
        type: "String"
      },
      {
        name: "evaluatesToTypeRef",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Message",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "itemRef",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ItemDefinition",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "itemKind",
        type: "ItemKind",
        isAttr: true
      },
      {
        name: "structureRef",
        isAttr: true,
        type: "String"
      },
      {
        name: "isCollection",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "import",
        type: "Import",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "FlowElement",
    isAbstract: true,
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "auditing",
        type: "Auditing"
      },
      {
        name: "monitoring",
        type: "Monitoring"
      },
      {
        name: "categoryValueRef",
        type: "CategoryValue",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "SequenceFlow",
    superClass: [
      "FlowElement"
    ],
    properties: [
      {
        name: "isImmediate",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "conditionExpression",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "sourceRef",
        type: "FlowNode",
        isAttr: true,
        isReference: true
      },
      {
        name: "targetRef",
        type: "FlowNode",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "FlowElementsContainer",
    isAbstract: true,
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "laneSets",
        type: "LaneSet",
        isMany: true
      },
      {
        name: "flowElements",
        type: "FlowElement",
        isMany: true
      }
    ]
  },
  {
    name: "CallableElement",
    isAbstract: true,
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "ioSpecification",
        type: "InputOutputSpecification",
        xml: {
          serialize: "property"
        }
      },
      {
        name: "supportedInterfaceRef",
        type: "Interface",
        isMany: true,
        isReference: true
      },
      {
        name: "ioBinding",
        type: "InputOutputBinding",
        isMany: true,
        xml: {
          serialize: "property"
        }
      }
    ]
  },
  {
    name: "FlowNode",
    isAbstract: true,
    superClass: [
      "FlowElement"
    ],
    properties: [
      {
        name: "incoming",
        type: "SequenceFlow",
        isMany: true,
        isReference: true
      },
      {
        name: "outgoing",
        type: "SequenceFlow",
        isMany: true,
        isReference: true
      },
      {
        name: "lanes",
        type: "Lane",
        isMany: true,
        isVirtual: true,
        isReference: true
      }
    ]
  },
  {
    name: "CorrelationPropertyRetrievalExpression",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "messagePath",
        type: "FormalExpression"
      },
      {
        name: "messageRef",
        type: "Message",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "CorrelationPropertyBinding",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "dataPath",
        type: "FormalExpression"
      },
      {
        name: "correlationPropertyRef",
        type: "CorrelationProperty",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Resource",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "resourceParameters",
        type: "ResourceParameter",
        isMany: true
      }
    ]
  },
  {
    name: "ResourceParameter",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "isRequired",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "type",
        type: "ItemDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "CorrelationSubscription",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "correlationKeyRef",
        type: "CorrelationKey",
        isAttr: true,
        isReference: true
      },
      {
        name: "correlationPropertyBinding",
        type: "CorrelationPropertyBinding",
        isMany: true
      }
    ]
  },
  {
    name: "MessageFlow",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "sourceRef",
        type: "InteractionNode",
        isAttr: true,
        isReference: true
      },
      {
        name: "targetRef",
        type: "InteractionNode",
        isAttr: true,
        isReference: true
      },
      {
        name: "messageRef",
        type: "Message",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "MessageFlowAssociation",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "innerMessageFlowRef",
        type: "MessageFlow",
        isAttr: true,
        isReference: true
      },
      {
        name: "outerMessageFlowRef",
        type: "MessageFlow",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "InteractionNode",
    isAbstract: true,
    properties: [
      {
        name: "incomingConversationLinks",
        type: "ConversationLink",
        isMany: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "outgoingConversationLinks",
        type: "ConversationLink",
        isMany: true,
        isVirtual: true,
        isReference: true
      }
    ]
  },
  {
    name: "Participant",
    superClass: [
      "InteractionNode",
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "interfaceRef",
        type: "Interface",
        isMany: true,
        isReference: true
      },
      {
        name: "participantMultiplicity",
        type: "ParticipantMultiplicity"
      },
      {
        name: "endPointRefs",
        type: "EndPoint",
        isMany: true,
        isReference: true
      },
      {
        name: "processRef",
        type: "Process",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ParticipantAssociation",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "innerParticipantRef",
        type: "Participant",
        isAttr: true,
        isReference: true
      },
      {
        name: "outerParticipantRef",
        type: "Participant",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ParticipantMultiplicity",
    properties: [
      {
        name: "minimum",
        "default": 0,
        isAttr: true,
        type: "Integer"
      },
      {
        name: "maximum",
        "default": 1,
        isAttr: true,
        type: "Integer"
      }
    ],
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "Collaboration",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "isClosed",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "participants",
        type: "Participant",
        isMany: true
      },
      {
        name: "messageFlows",
        type: "MessageFlow",
        isMany: true
      },
      {
        name: "artifacts",
        type: "Artifact",
        isMany: true
      },
      {
        name: "conversations",
        type: "ConversationNode",
        isMany: true
      },
      {
        name: "conversationAssociations",
        type: "ConversationAssociation"
      },
      {
        name: "participantAssociations",
        type: "ParticipantAssociation",
        isMany: true
      },
      {
        name: "messageFlowAssociations",
        type: "MessageFlowAssociation",
        isMany: true
      },
      {
        name: "correlationKeys",
        type: "CorrelationKey",
        isMany: true
      },
      {
        name: "choreographyRef",
        type: "Choreography",
        isMany: true,
        isReference: true
      },
      {
        name: "conversationLinks",
        type: "ConversationLink",
        isMany: true
      }
    ]
  },
  {
    name: "ChoreographyActivity",
    isAbstract: true,
    superClass: [
      "FlowNode"
    ],
    properties: [
      {
        name: "participantRef",
        type: "Participant",
        isMany: true,
        isReference: true
      },
      {
        name: "initiatingParticipantRef",
        type: "Participant",
        isAttr: true,
        isReference: true
      },
      {
        name: "correlationKeys",
        type: "CorrelationKey",
        isMany: true
      },
      {
        name: "loopType",
        type: "ChoreographyLoopType",
        "default": "None",
        isAttr: true
      }
    ]
  },
  {
    name: "CallChoreography",
    superClass: [
      "ChoreographyActivity"
    ],
    properties: [
      {
        name: "calledChoreographyRef",
        type: "Choreography",
        isAttr: true,
        isReference: true
      },
      {
        name: "participantAssociations",
        type: "ParticipantAssociation",
        isMany: true
      }
    ]
  },
  {
    name: "SubChoreography",
    superClass: [
      "ChoreographyActivity",
      "FlowElementsContainer"
    ],
    properties: [
      {
        name: "artifacts",
        type: "Artifact",
        isMany: true
      }
    ]
  },
  {
    name: "ChoreographyTask",
    superClass: [
      "ChoreographyActivity"
    ],
    properties: [
      {
        name: "messageFlowRef",
        type: "MessageFlow",
        isMany: true,
        isReference: true
      }
    ]
  },
  {
    name: "Choreography",
    superClass: [
      "Collaboration",
      "FlowElementsContainer"
    ]
  },
  {
    name: "GlobalChoreographyTask",
    superClass: [
      "Choreography"
    ],
    properties: [
      {
        name: "initiatingParticipantRef",
        type: "Participant",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "TextAnnotation",
    superClass: [
      "Artifact"
    ],
    properties: [
      {
        name: "text",
        type: "String"
      },
      {
        name: "textFormat",
        "default": "text/plain",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Group",
    superClass: [
      "Artifact"
    ],
    properties: [
      {
        name: "categoryValueRef",
        type: "CategoryValue",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Association",
    superClass: [
      "Artifact"
    ],
    properties: [
      {
        name: "associationDirection",
        type: "AssociationDirection",
        isAttr: true
      },
      {
        name: "sourceRef",
        type: "BaseElement",
        isAttr: true,
        isReference: true
      },
      {
        name: "targetRef",
        type: "BaseElement",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "Category",
    superClass: [
      "RootElement"
    ],
    properties: [
      {
        name: "categoryValue",
        type: "CategoryValue",
        isMany: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Artifact",
    isAbstract: true,
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "CategoryValue",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "categorizedFlowElements",
        type: "FlowElement",
        isMany: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "value",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Activity",
    isAbstract: true,
    superClass: [
      "FlowNode"
    ],
    properties: [
      {
        name: "isForCompensation",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "default",
        type: "SequenceFlow",
        isAttr: true,
        isReference: true
      },
      {
        name: "ioSpecification",
        type: "InputOutputSpecification",
        xml: {
          serialize: "property"
        }
      },
      {
        name: "boundaryEventRefs",
        type: "BoundaryEvent",
        isMany: true,
        isReference: true
      },
      {
        name: "properties",
        type: "Property",
        isMany: true
      },
      {
        name: "dataInputAssociations",
        type: "DataInputAssociation",
        isMany: true
      },
      {
        name: "dataOutputAssociations",
        type: "DataOutputAssociation",
        isMany: true
      },
      {
        name: "startQuantity",
        "default": 1,
        isAttr: true,
        type: "Integer"
      },
      {
        name: "resources",
        type: "ResourceRole",
        isMany: true
      },
      {
        name: "completionQuantity",
        "default": 1,
        isAttr: true,
        type: "Integer"
      },
      {
        name: "loopCharacteristics",
        type: "LoopCharacteristics"
      }
    ]
  },
  {
    name: "ServiceTask",
    superClass: [
      "Task"
    ],
    properties: [
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      },
      {
        name: "operationRef",
        type: "Operation",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "SubProcess",
    superClass: [
      "Activity",
      "FlowElementsContainer",
      "InteractionNode"
    ],
    properties: [
      {
        name: "triggeredByEvent",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "artifacts",
        type: "Artifact",
        isMany: true
      }
    ]
  },
  {
    name: "LoopCharacteristics",
    isAbstract: true,
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "MultiInstanceLoopCharacteristics",
    superClass: [
      "LoopCharacteristics"
    ],
    properties: [
      {
        name: "isSequential",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "behavior",
        type: "MultiInstanceBehavior",
        "default": "All",
        isAttr: true
      },
      {
        name: "loopCardinality",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "loopDataInputRef",
        type: "ItemAwareElement",
        isReference: true
      },
      {
        name: "loopDataOutputRef",
        type: "ItemAwareElement",
        isReference: true
      },
      {
        name: "inputDataItem",
        type: "DataInput",
        xml: {
          serialize: "property"
        }
      },
      {
        name: "outputDataItem",
        type: "DataOutput",
        xml: {
          serialize: "property"
        }
      },
      {
        name: "complexBehaviorDefinition",
        type: "ComplexBehaviorDefinition",
        isMany: true
      },
      {
        name: "completionCondition",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "oneBehaviorEventRef",
        type: "EventDefinition",
        isAttr: true,
        isReference: true
      },
      {
        name: "noneBehaviorEventRef",
        type: "EventDefinition",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "StandardLoopCharacteristics",
    superClass: [
      "LoopCharacteristics"
    ],
    properties: [
      {
        name: "testBefore",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "loopCondition",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "loopMaximum",
        type: "Integer",
        isAttr: true
      }
    ]
  },
  {
    name: "CallActivity",
    superClass: [
      "Activity",
      "InteractionNode"
    ],
    properties: [
      {
        name: "calledElement",
        type: "String",
        isAttr: true
      }
    ]
  },
  {
    name: "Task",
    superClass: [
      "Activity",
      "InteractionNode"
    ]
  },
  {
    name: "SendTask",
    superClass: [
      "Task"
    ],
    properties: [
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      },
      {
        name: "operationRef",
        type: "Operation",
        isAttr: true,
        isReference: true
      },
      {
        name: "messageRef",
        type: "Message",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ReceiveTask",
    superClass: [
      "Task"
    ],
    properties: [
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      },
      {
        name: "instantiate",
        "default": false,
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "operationRef",
        type: "Operation",
        isAttr: true,
        isReference: true
      },
      {
        name: "messageRef",
        type: "Message",
        isAttr: true,
        isReference: true
      }
    ]
  },
  {
    name: "ScriptTask",
    superClass: [
      "Task"
    ],
    properties: [
      {
        name: "scriptFormat",
        isAttr: true,
        type: "String"
      },
      {
        name: "script",
        type: "String"
      }
    ]
  },
  {
    name: "BusinessRuleTask",
    superClass: [
      "Task"
    ],
    properties: [
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "AdHocSubProcess",
    superClass: [
      "SubProcess"
    ],
    properties: [
      {
        name: "completionCondition",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "ordering",
        type: "AdHocOrdering",
        isAttr: true
      },
      {
        name: "cancelRemainingInstances",
        "default": true,
        isAttr: true,
        type: "Boolean"
      }
    ]
  },
  {
    name: "Transaction",
    superClass: [
      "SubProcess"
    ],
    properties: [
      {
        name: "protocol",
        isAttr: true,
        type: "String"
      },
      {
        name: "method",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "GlobalScriptTask",
    superClass: [
      "GlobalTask"
    ],
    properties: [
      {
        name: "scriptLanguage",
        isAttr: true,
        type: "String"
      },
      {
        name: "script",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "GlobalBusinessRuleTask",
    superClass: [
      "GlobalTask"
    ],
    properties: [
      {
        name: "implementation",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ComplexBehaviorDefinition",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "condition",
        type: "FormalExpression"
      },
      {
        name: "event",
        type: "ImplicitThrowEvent"
      }
    ]
  },
  {
    name: "ResourceRole",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "resourceRef",
        type: "Resource",
        isReference: true
      },
      {
        name: "resourceParameterBindings",
        type: "ResourceParameterBinding",
        isMany: true
      },
      {
        name: "resourceAssignmentExpression",
        type: "ResourceAssignmentExpression"
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ResourceParameterBinding",
    properties: [
      {
        name: "expression",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      },
      {
        name: "parameterRef",
        type: "ResourceParameter",
        isAttr: true,
        isReference: true
      }
    ],
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "ResourceAssignmentExpression",
    properties: [
      {
        name: "expression",
        type: "Expression",
        xml: {
          serialize: "xsi:type"
        }
      }
    ],
    superClass: [
      "BaseElement"
    ]
  },
  {
    name: "Import",
    properties: [
      {
        name: "importType",
        isAttr: true,
        type: "String"
      },
      {
        name: "location",
        isAttr: true,
        type: "String"
      },
      {
        name: "namespace",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "Definitions",
    superClass: [
      "BaseElement"
    ],
    properties: [
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "targetNamespace",
        isAttr: true,
        type: "String"
      },
      {
        name: "expressionLanguage",
        "default": "http://www.w3.org/1999/XPath",
        isAttr: true,
        type: "String"
      },
      {
        name: "typeLanguage",
        "default": "http://www.w3.org/2001/XMLSchema",
        isAttr: true,
        type: "String"
      },
      {
        name: "imports",
        type: "Import",
        isMany: true
      },
      {
        name: "extensions",
        type: "Extension",
        isMany: true
      },
      {
        name: "rootElements",
        type: "RootElement",
        isMany: true
      },
      {
        name: "diagrams",
        isMany: true,
        type: "bpmndi:BPMNDiagram"
      },
      {
        name: "exporter",
        isAttr: true,
        type: "String"
      },
      {
        name: "relationships",
        type: "Relationship",
        isMany: true
      },
      {
        name: "exporterVersion",
        isAttr: true,
        type: "String"
      }
    ]
  }
];
var enumerations$3 = [
  {
    name: "ProcessType",
    literalValues: [
      {
        name: "None"
      },
      {
        name: "Public"
      },
      {
        name: "Private"
      }
    ]
  },
  {
    name: "GatewayDirection",
    literalValues: [
      {
        name: "Unspecified"
      },
      {
        name: "Converging"
      },
      {
        name: "Diverging"
      },
      {
        name: "Mixed"
      }
    ]
  },
  {
    name: "EventBasedGatewayType",
    literalValues: [
      {
        name: "Parallel"
      },
      {
        name: "Exclusive"
      }
    ]
  },
  {
    name: "RelationshipDirection",
    literalValues: [
      {
        name: "None"
      },
      {
        name: "Forward"
      },
      {
        name: "Backward"
      },
      {
        name: "Both"
      }
    ]
  },
  {
    name: "ItemKind",
    literalValues: [
      {
        name: "Physical"
      },
      {
        name: "Information"
      }
    ]
  },
  {
    name: "ChoreographyLoopType",
    literalValues: [
      {
        name: "None"
      },
      {
        name: "Standard"
      },
      {
        name: "MultiInstanceSequential"
      },
      {
        name: "MultiInstanceParallel"
      }
    ]
  },
  {
    name: "AssociationDirection",
    literalValues: [
      {
        name: "None"
      },
      {
        name: "One"
      },
      {
        name: "Both"
      }
    ]
  },
  {
    name: "MultiInstanceBehavior",
    literalValues: [
      {
        name: "None"
      },
      {
        name: "One"
      },
      {
        name: "All"
      },
      {
        name: "Complex"
      }
    ]
  },
  {
    name: "AdHocOrdering",
    literalValues: [
      {
        name: "Parallel"
      },
      {
        name: "Sequential"
      }
    ]
  }
];
var xml$1 = {
  tagAlias: "lowerCase",
  typePrefix: "t"
};
var BpmnPackage = {
  name: name$5,
  uri: uri$5,
  prefix: prefix$5,
  associations: associations$5,
  types: types$5,
  enumerations: enumerations$3,
  xml: xml$1
};
var name$4 = "BPMNDI";
var uri$4 = "http://www.omg.org/spec/BPMN/20100524/DI";
var prefix$4 = "bpmndi";
var types$4 = [
  {
    name: "BPMNDiagram",
    properties: [
      {
        name: "plane",
        type: "BPMNPlane",
        redefines: "di:Diagram#rootElement"
      },
      {
        name: "labelStyle",
        type: "BPMNLabelStyle",
        isMany: true
      }
    ],
    superClass: [
      "di:Diagram"
    ]
  },
  {
    name: "BPMNPlane",
    properties: [
      {
        name: "bpmnElement",
        isAttr: true,
        isReference: true,
        type: "bpmn:BaseElement",
        redefines: "di:DiagramElement#modelElement"
      }
    ],
    superClass: [
      "di:Plane"
    ]
  },
  {
    name: "BPMNShape",
    properties: [
      {
        name: "bpmnElement",
        isAttr: true,
        isReference: true,
        type: "bpmn:BaseElement",
        redefines: "di:DiagramElement#modelElement"
      },
      {
        name: "isHorizontal",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "isExpanded",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "isMarkerVisible",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "label",
        type: "BPMNLabel"
      },
      {
        name: "isMessageVisible",
        isAttr: true,
        type: "Boolean"
      },
      {
        name: "participantBandKind",
        type: "ParticipantBandKind",
        isAttr: true
      },
      {
        name: "choreographyActivityShape",
        type: "BPMNShape",
        isAttr: true,
        isReference: true
      }
    ],
    superClass: [
      "di:LabeledShape"
    ]
  },
  {
    name: "BPMNEdge",
    properties: [
      {
        name: "label",
        type: "BPMNLabel"
      },
      {
        name: "bpmnElement",
        isAttr: true,
        isReference: true,
        type: "bpmn:BaseElement",
        redefines: "di:DiagramElement#modelElement"
      },
      {
        name: "sourceElement",
        isAttr: true,
        isReference: true,
        type: "di:DiagramElement",
        redefines: "di:Edge#source"
      },
      {
        name: "targetElement",
        isAttr: true,
        isReference: true,
        type: "di:DiagramElement",
        redefines: "di:Edge#target"
      },
      {
        name: "messageVisibleKind",
        type: "MessageVisibleKind",
        isAttr: true,
        "default": "initiating"
      }
    ],
    superClass: [
      "di:LabeledEdge"
    ]
  },
  {
    name: "BPMNLabel",
    properties: [
      {
        name: "labelStyle",
        type: "BPMNLabelStyle",
        isAttr: true,
        isReference: true,
        redefines: "di:DiagramElement#style"
      }
    ],
    superClass: [
      "di:Label"
    ]
  },
  {
    name: "BPMNLabelStyle",
    properties: [
      {
        name: "font",
        type: "dc:Font"
      }
    ],
    superClass: [
      "di:Style"
    ]
  }
];
var enumerations$2 = [
  {
    name: "ParticipantBandKind",
    literalValues: [
      {
        name: "top_initiating"
      },
      {
        name: "middle_initiating"
      },
      {
        name: "bottom_initiating"
      },
      {
        name: "top_non_initiating"
      },
      {
        name: "middle_non_initiating"
      },
      {
        name: "bottom_non_initiating"
      }
    ]
  },
  {
    name: "MessageVisibleKind",
    literalValues: [
      {
        name: "initiating"
      },
      {
        name: "non_initiating"
      }
    ]
  }
];
var associations$4 = [];
var BpmnDiPackage = {
  name: name$4,
  uri: uri$4,
  prefix: prefix$4,
  types: types$4,
  enumerations: enumerations$2,
  associations: associations$4
};
var name$3 = "DC";
var uri$3 = "http://www.omg.org/spec/DD/20100524/DC";
var prefix$3 = "dc";
var types$3 = [
  {
    name: "Boolean"
  },
  {
    name: "Integer"
  },
  {
    name: "Real"
  },
  {
    name: "String"
  },
  {
    name: "Font",
    properties: [
      {
        name: "name",
        type: "String",
        isAttr: true
      },
      {
        name: "size",
        type: "Real",
        isAttr: true
      },
      {
        name: "isBold",
        type: "Boolean",
        isAttr: true
      },
      {
        name: "isItalic",
        type: "Boolean",
        isAttr: true
      },
      {
        name: "isUnderline",
        type: "Boolean",
        isAttr: true
      },
      {
        name: "isStrikeThrough",
        type: "Boolean",
        isAttr: true
      }
    ]
  },
  {
    name: "Point",
    properties: [
      {
        name: "x",
        type: "Real",
        "default": "0",
        isAttr: true
      },
      {
        name: "y",
        type: "Real",
        "default": "0",
        isAttr: true
      }
    ]
  },
  {
    name: "Bounds",
    properties: [
      {
        name: "x",
        type: "Real",
        "default": "0",
        isAttr: true
      },
      {
        name: "y",
        type: "Real",
        "default": "0",
        isAttr: true
      },
      {
        name: "width",
        type: "Real",
        isAttr: true
      },
      {
        name: "height",
        type: "Real",
        isAttr: true
      }
    ]
  }
];
var associations$3 = [];
var DcPackage = {
  name: name$3,
  uri: uri$3,
  prefix: prefix$3,
  types: types$3,
  associations: associations$3
};
var name$2 = "DI";
var uri$2 = "http://www.omg.org/spec/DD/20100524/DI";
var prefix$2 = "di";
var types$2 = [
  {
    name: "DiagramElement",
    isAbstract: true,
    properties: [
      {
        name: "id",
        isAttr: true,
        isId: true,
        type: "String"
      },
      {
        name: "extension",
        type: "Extension"
      },
      {
        name: "owningDiagram",
        type: "Diagram",
        isReadOnly: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "owningElement",
        type: "DiagramElement",
        isReadOnly: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "modelElement",
        isReadOnly: true,
        isVirtual: true,
        isReference: true,
        type: "Element"
      },
      {
        name: "style",
        type: "Style",
        isReadOnly: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "ownedElement",
        type: "DiagramElement",
        isReadOnly: true,
        isMany: true,
        isVirtual: true
      }
    ]
  },
  {
    name: "Node",
    isAbstract: true,
    superClass: [
      "DiagramElement"
    ]
  },
  {
    name: "Edge",
    isAbstract: true,
    superClass: [
      "DiagramElement"
    ],
    properties: [
      {
        name: "source",
        type: "DiagramElement",
        isReadOnly: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "target",
        type: "DiagramElement",
        isReadOnly: true,
        isVirtual: true,
        isReference: true
      },
      {
        name: "waypoint",
        isUnique: false,
        isMany: true,
        type: "dc:Point",
        xml: {
          serialize: "xsi:type"
        }
      }
    ]
  },
  {
    name: "Diagram",
    isAbstract: true,
    properties: [
      {
        name: "id",
        isAttr: true,
        isId: true,
        type: "String"
      },
      {
        name: "rootElement",
        type: "DiagramElement",
        isReadOnly: true,
        isVirtual: true
      },
      {
        name: "name",
        isAttr: true,
        type: "String"
      },
      {
        name: "documentation",
        isAttr: true,
        type: "String"
      },
      {
        name: "resolution",
        isAttr: true,
        type: "Real"
      },
      {
        name: "ownedStyle",
        type: "Style",
        isReadOnly: true,
        isMany: true,
        isVirtual: true
      }
    ]
  },
  {
    name: "Shape",
    isAbstract: true,
    superClass: [
      "Node"
    ],
    properties: [
      {
        name: "bounds",
        type: "dc:Bounds"
      }
    ]
  },
  {
    name: "Plane",
    isAbstract: true,
    superClass: [
      "Node"
    ],
    properties: [
      {
        name: "planeElement",
        type: "DiagramElement",
        subsettedProperty: "DiagramElement-ownedElement",
        isMany: true
      }
    ]
  },
  {
    name: "LabeledEdge",
    isAbstract: true,
    superClass: [
      "Edge"
    ],
    properties: [
      {
        name: "ownedLabel",
        type: "Label",
        isReadOnly: true,
        subsettedProperty: "DiagramElement-ownedElement",
        isMany: true,
        isVirtual: true
      }
    ]
  },
  {
    name: "LabeledShape",
    isAbstract: true,
    superClass: [
      "Shape"
    ],
    properties: [
      {
        name: "ownedLabel",
        type: "Label",
        isReadOnly: true,
        subsettedProperty: "DiagramElement-ownedElement",
        isMany: true,
        isVirtual: true
      }
    ]
  },
  {
    name: "Label",
    isAbstract: true,
    superClass: [
      "Node"
    ],
    properties: [
      {
        name: "bounds",
        type: "dc:Bounds"
      }
    ]
  },
  {
    name: "Style",
    isAbstract: true,
    properties: [
      {
        name: "id",
        isAttr: true,
        isId: true,
        type: "String"
      }
    ]
  },
  {
    name: "Extension",
    properties: [
      {
        name: "values",
        isMany: true,
        type: "Element"
      }
    ]
  }
];
var associations$2 = [];
var xml = {
  tagAlias: "lowerCase"
};
var DiPackage = {
  name: name$2,
  uri: uri$2,
  prefix: prefix$2,
  types: types$2,
  associations: associations$2,
  xml
};
var name$1 = "bpmn.io colors for BPMN";
var uri$1 = "http://bpmn.io/schema/bpmn/biocolor/1.0";
var prefix$1 = "bioc";
var types$1 = [
  {
    name: "ColoredShape",
    "extends": [
      "bpmndi:BPMNShape"
    ],
    properties: [
      {
        name: "stroke",
        isAttr: true,
        type: "String"
      },
      {
        name: "fill",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ColoredEdge",
    "extends": [
      "bpmndi:BPMNEdge"
    ],
    properties: [
      {
        name: "stroke",
        isAttr: true,
        type: "String"
      },
      {
        name: "fill",
        isAttr: true,
        type: "String"
      }
    ]
  }
];
var enumerations$1 = [];
var associations$1 = [];
var BiocPackage = {
  name: name$1,
  uri: uri$1,
  prefix: prefix$1,
  types: types$1,
  enumerations: enumerations$1,
  associations: associations$1
};
var name = "BPMN in Color";
var uri = "http://www.omg.org/spec/BPMN/non-normative/color/1.0";
var prefix = "color";
var types = [
  {
    name: "ColoredLabel",
    "extends": [
      "bpmndi:BPMNLabel"
    ],
    properties: [
      {
        name: "color",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ColoredShape",
    "extends": [
      "bpmndi:BPMNShape"
    ],
    properties: [
      {
        name: "background-color",
        isAttr: true,
        type: "String"
      },
      {
        name: "border-color",
        isAttr: true,
        type: "String"
      }
    ]
  },
  {
    name: "ColoredEdge",
    "extends": [
      "bpmndi:BPMNEdge"
    ],
    properties: [
      {
        name: "border-color",
        isAttr: true,
        type: "String"
      }
    ]
  }
];
var enumerations = [];
var associations = [];
var BpmnInColorPackage = {
  name,
  uri,
  prefix,
  types,
  enumerations,
  associations
};
var packages = {
  bpmn: BpmnPackage,
  bpmndi: BpmnDiPackage,
  dc: DcPackage,
  di: DiPackage,
  bioc: BiocPackage,
  color: BpmnInColorPackage
};
function SimpleBpmnModdle(additionalPackages, options) {
  const pks = assign({}, packages, additionalPackages);
  return new BpmnModdle(pks, options);
}

// node_modules/bpmn-auto-layout/dist/index.js
function isConnection(element) {
  return !!element.sourceRef;
}
function isBoundaryEvent(element) {
  return !!element.attachedToRef;
}
function findElementInTree(currentElement, targetElement, visited = /* @__PURE__ */ new Set()) {
  if (currentElement === targetElement) return true;
  if (visited.has(currentElement)) return false;
  visited.add(currentElement);
  if (!currentElement.outgoing || currentElement.outgoing.length === 0) return false;
  for (let nextElement of currentElement.outgoing.map((out) => out.targetRef)) {
    if (findElementInTree(nextElement, targetElement, visited)) {
      return true;
    }
  }
  return false;
}
var DEFAULT_TASK_HEIGHT = 80;
var DEFAULT_TASK_WIDTH = 100;
function getDefaultSize(element) {
  if (is(element, "bpmn:SubProcess")) {
    return { width: DEFAULT_TASK_WIDTH, height: DEFAULT_TASK_HEIGHT };
  }
  if (is(element, "bpmn:Task")) {
    return { width: DEFAULT_TASK_WIDTH, height: DEFAULT_TASK_HEIGHT };
  }
  if (is(element, "bpmn:Gateway")) {
    return { width: 50, height: 50 };
  }
  if (is(element, "bpmn:Event")) {
    return { width: 36, height: 36 };
  }
  if (is(element, "bpmn:Participant")) {
    return { width: 400, height: 100 };
  }
  if (is(element, "bpmn:Lane")) {
    return { width: 400, height: 100 };
  }
  if (is(element, "bpmn:DataObjectReference")) {
    return { width: 36, height: 50 };
  }
  if (is(element, "bpmn:DataStoreReference")) {
    return { width: 50, height: 50 };
  }
  if (is(element, "bpmn:TextAnnotation")) {
    return { width: DEFAULT_TASK_WIDTH, height: 30 };
  }
  return { width: DEFAULT_TASK_WIDTH, height: DEFAULT_TASK_HEIGHT };
}
function is(element, type) {
  return element.$instanceOf(type);
}
var DEFAULT_CELL_WIDTH = 150;
var DEFAULT_CELL_HEIGHT = 140;
function getMid(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
}
function getDockingPoint(point, rectangle, dockingDirection = "r", targetOrientation = "top-left") {
  if (dockingDirection === "h") {
    dockingDirection = /left/.test(targetOrientation) ? "l" : "r";
  }
  if (dockingDirection === "v") {
    dockingDirection = /top/.test(targetOrientation) ? "t" : "b";
  }
  if (dockingDirection === "t") {
    return { original: point, x: point.x, y: rectangle.y };
  }
  if (dockingDirection === "r") {
    return { original: point, x: rectangle.x + rectangle.width, y: point.y };
  }
  if (dockingDirection === "b") {
    return { original: point, x: point.x, y: rectangle.y + rectangle.height };
  }
  if (dockingDirection === "l") {
    return { original: point, x: rectangle.x, y: point.y };
  }
  throw new Error("unexpected dockingDirection: <" + dockingDirection + ">");
}
function connectElements(source, target, layoutGrid) {
  const sourceDi = source.di;
  const targetDi = target.di;
  const sourceBounds = sourceDi.get("bounds");
  const targetBounds = targetDi.get("bounds");
  const sourceMid = getMid(sourceBounds);
  const targetMid = getMid(targetBounds);
  const dX = target.gridPosition.col - source.gridPosition.col;
  const dY = target.gridPosition.row - source.gridPosition.row;
  const dockingSource = `${dY > 0 ? "bottom" : "top"}-${dX > 0 ? "right" : "left"}`;
  const dockingTarget = `${dY > 0 ? "top" : "bottom"}-${dX > 0 ? "left" : "right"}`;
  const baseSourceGrid = source.grid || source.attachedToRef?.grid;
  const baseTargetGrid = target.grid;
  if (dX === 0 && dY === 0) {
    const { x, y } = coordinatesToPosition(source.gridPosition.row, source.gridPosition.col);
    return [
      getDockingPoint(sourceMid, sourceBounds, "r", dockingSource),
      { x: baseSourceGrid ? x + (baseSourceGrid.getGridDimensions()[1] + 1) * DEFAULT_CELL_WIDTH : x + DEFAULT_CELL_WIDTH, y: sourceMid.y },
      { x: baseSourceGrid ? x + (baseSourceGrid.getGridDimensions()[1] + 1) * DEFAULT_CELL_WIDTH : x + DEFAULT_CELL_WIDTH, y },
      { x: targetMid.x, y },
      getDockingPoint(targetMid, targetBounds, "t", dockingTarget)
    ];
  }
  if (dX < 0) {
    const { y } = coordinatesToPosition(source.gridPosition.row, source.gridPosition.col);
    const offsetY = DEFAULT_CELL_HEIGHT / 2;
    if (sourceMid.y >= targetMid.y) {
      const maxExpanded = getMaxExpandedBetween(source, target, layoutGrid);
      if (maxExpanded) {
        return [
          getDockingPoint(sourceMid, sourceBounds, "b"),
          { x: sourceMid.x, y: !baseSourceGrid ? y + DEFAULT_CELL_HEIGHT + maxExpanded * DEFAULT_CELL_HEIGHT : y + (baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
          { x: targetMid.x, y: !baseSourceGrid ? y + DEFAULT_CELL_HEIGHT + maxExpanded * DEFAULT_CELL_HEIGHT : y + (baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
          getDockingPoint(targetMid, targetBounds, "b")
        ];
      }
      return [
        getDockingPoint(sourceMid, sourceBounds, "b"),
        { x: sourceMid.x, y: !baseSourceGrid ? y + DEFAULT_CELL_HEIGHT : y + (baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
        { x: targetMid.x, y: !baseSourceGrid ? y + DEFAULT_CELL_HEIGHT : y + (baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
        getDockingPoint(targetMid, targetBounds, "b")
      ];
    } else {
      const bendY = sourceMid.y - offsetY;
      return [
        getDockingPoint(sourceMid, sourceBounds, "t"),
        { x: sourceMid.x, y: bendY },
        { x: targetMid.x, y: bendY },
        getDockingPoint(targetMid, targetBounds, "t")
      ];
    }
  }
  if (dY === 0) {
    if (isDirectPathBlocked(source, target, layoutGrid)) {
      const { y } = coordinatesToPosition(source.gridPosition.row, source.gridPosition.col);
      return [
        getDockingPoint(sourceMid, sourceBounds, "b"),
        { x: sourceMid.x, y: !baseSourceGrid ? y + DEFAULT_CELL_HEIGHT : y + (baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
        { x: targetMid.x, y: !baseSourceGrid ? y + DEFAULT_CELL_HEIGHT : y + (baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
        getDockingPoint(targetMid, targetBounds, "b")
      ];
    } else {
      const firstPoint = getDockingPoint(sourceMid, sourceBounds, "h", dockingSource);
      const lastPoint = getDockingPoint(targetMid, targetBounds, "h", dockingTarget);
      if (baseSourceGrid) {
        firstPoint.y = sourceBounds.y + DEFAULT_TASK_HEIGHT / 2;
      }
      if (baseTargetGrid) {
        lastPoint.y = targetBounds.y + DEFAULT_TASK_HEIGHT / 2;
      }
      return [
        firstPoint,
        lastPoint
      ];
    }
  }
  if (dX === 0) {
    if (isDirectPathBlocked(source, target, layoutGrid)) {
      const yOffset2 = -Math.sign(dY) * DEFAULT_CELL_HEIGHT / 2;
      return [
        getDockingPoint(sourceMid, sourceBounds, "r"),
        { x: sourceMid.x + DEFAULT_CELL_WIDTH / 2, y: sourceMid.y },
        // out right
        { x: targetMid.x + DEFAULT_CELL_WIDTH / 2, y: targetMid.y + yOffset2 },
        { x: targetMid.x, y: targetMid.y + yOffset2 },
        getDockingPoint(targetMid, targetBounds, Math.sign(yOffset2) > 0 ? "b" : "t")
      ];
    } else {
      return [
        getDockingPoint(sourceMid, sourceBounds, "v", dockingSource),
        getDockingPoint(targetMid, targetBounds, "v", dockingTarget)
      ];
    }
  }
  const directManhattan = directManhattanConnect(source, target, layoutGrid);
  if (directManhattan) {
    const startPoint = getDockingPoint(sourceMid, sourceBounds, directManhattan[0], dockingSource);
    const endPoint = getDockingPoint(targetMid, targetBounds, directManhattan[1], dockingTarget);
    const midPoint = directManhattan[0] === "h" ? { x: endPoint.x, y: startPoint.y } : { x: startPoint.x, y: endPoint.y };
    return [
      startPoint,
      midPoint,
      endPoint
    ];
  }
  const yOffset = -Math.sign(dY) * DEFAULT_CELL_HEIGHT / 2;
  return [
    getDockingPoint(sourceMid, sourceBounds, "r", dockingSource),
    { x: sourceMid.x + DEFAULT_CELL_WIDTH / 2, y: sourceMid.y },
    // out right
    { x: sourceMid.x + DEFAULT_CELL_WIDTH / 2, y: targetMid.y + yOffset },
    // to target row
    { x: targetMid.x - DEFAULT_CELL_WIDTH / 2, y: targetMid.y + yOffset },
    // to target column
    { x: targetMid.x - DEFAULT_CELL_WIDTH / 2, y: targetMid.y },
    // to mid
    getDockingPoint(targetMid, targetBounds, "l", dockingTarget)
  ];
}
function coordinatesToPosition(row, col) {
  return {
    width: DEFAULT_CELL_WIDTH,
    height: DEFAULT_CELL_HEIGHT,
    x: col * DEFAULT_CELL_WIDTH,
    y: row * DEFAULT_CELL_HEIGHT
  };
}
function getBounds(element, row, col, shift, attachedTo) {
  let { width, height } = getDefaultSize(element);
  const { x, y } = shift;
  if (!attachedTo) {
    return {
      width: element.isExpanded ? element.grid.getGridDimensions()[1] * DEFAULT_CELL_WIDTH + width : width,
      height: element.isExpanded ? element.grid.getGridDimensions()[0] * DEFAULT_CELL_HEIGHT + height : height,
      x: col * DEFAULT_CELL_WIDTH + (DEFAULT_CELL_WIDTH - width) / 2 + x,
      y: row * DEFAULT_CELL_HEIGHT + (DEFAULT_CELL_HEIGHT - height) / 2 + y
    };
  }
  const hostBounds = attachedTo.di.bounds;
  return {
    width,
    height,
    x: Math.round(hostBounds.x + hostBounds.width / 2 - width / 2),
    y: Math.round(hostBounds.y + hostBounds.height - height / 2)
  };
}
function isDirectPathBlocked(source, target, layoutGrid) {
  const { row: sourceRow, col: sourceCol } = source.gridPosition;
  const { row: targetRow, col: targetCol } = target.gridPosition;
  const dX = targetCol - sourceCol;
  const dY = targetRow - sourceRow;
  let totalElements = 0;
  if (dX) {
    totalElements += layoutGrid.getElementsInRange({ row: sourceRow, col: sourceCol }, { row: sourceRow, col: targetCol }).length;
  }
  if (dY) {
    totalElements += layoutGrid.getElementsInRange({ row: sourceRow, col: targetCol }, { row: targetRow, col: targetCol }).length;
  }
  return totalElements > 2;
}
function directManhattanConnect(source, target, layoutGrid) {
  const { row: sourceRow, col: sourceCol } = source.gridPosition;
  const { row: targetRow, col: targetCol } = target.gridPosition;
  const dX = targetCol - sourceCol;
  const dY = targetRow - sourceRow;
  if (!(dX > 0 && dY !== 0)) {
    return;
  }
  if (dY > 0) {
    let totalElements = 0;
    const bendPoint = { row: targetRow, col: sourceCol };
    totalElements += layoutGrid.getElementsInRange({ row: sourceRow, col: sourceCol }, bendPoint).length;
    totalElements += layoutGrid.getElementsInRange(bendPoint, { row: targetRow, col: targetCol }).length;
    return totalElements > 2 ? false : ["v", "h"];
  } else {
    let totalElements = 0;
    const bendPoint = { row: sourceRow, col: targetCol };
    totalElements += layoutGrid.getElementsInRange({ row: sourceRow, col: sourceCol }, bendPoint).length;
    totalElements += layoutGrid.getElementsInRange(bendPoint, { row: targetRow, col: targetCol }).length;
    return totalElements > 2 ? false : ["h", "v"];
  }
}
function getMaxExpandedBetween(source, target, layoutGrid) {
  const hostSource = source.attachedToRef ? source.attachedToRef : source;
  const hostTarget = target.attachedToRef ? target.attachedToRef : target;
  const [sourceRow, sourceCol] = layoutGrid.find(hostSource);
  const [, targetCol] = layoutGrid.find(hostTarget);
  const firstCol = sourceCol < targetCol ? sourceCol : targetCol;
  const lastCol = sourceCol < targetCol ? targetCol : sourceCol;
  const elementsInRange = layoutGrid.getAllElements().filter((element) => element.gridPosition.row === sourceRow && element.gridPosition.col > firstCol && element.gridPosition.col < lastCol);
  return elementsInRange.reduce((acc, cur) => {
    if (cur.grid?.getGridDimensions()[0] > acc) return cur.grid?.getGridDimensions()[0];
  }, 0);
}
var Grid = class {
  constructor() {
    this.grid = [];
  }
  add(element, position) {
    if (!position) {
      this._addStart(element);
      return;
    }
    const [row, col] = position;
    if (!row && !col) {
      this._addStart(element);
    }
    if (!this.grid[row]) {
      this.grid[row] = [];
    }
    if (this.grid[row][col]) {
      throw new Error("Grid is occupied please ensure the place you insert at is not occupied");
    }
    this.grid[row][col] = element;
  }
  createRow(afterIndex) {
    if (!afterIndex && !Number.isInteger(afterIndex)) {
      this.grid.push([]);
    } else {
      this.grid.splice(afterIndex + 1, 0, []);
    }
  }
  _addStart(element) {
    this.grid.push([element]);
  }
  addAfter(element, newElement) {
    if (!element) {
      this._addStart(newElement);
    }
    const [row, col] = this.find(element);
    this.grid[row].splice(col + 1, 0, newElement);
  }
  addBelow(element, newElement) {
    if (!element) {
      this._addStart(newElement);
    }
    const [row, col] = this.find(element);
    if (!this.grid[row + 1]) {
      this.grid[row + 1] = [];
    }
    if (this.grid[row + 1][col]) {
      this.grid.splice(row + 1, 0, []);
    }
    if (this.grid[row + 1][col]) {
      throw new Error("Grid is occupied and we could not find a place - this should not happen");
    }
    this.grid[row + 1][col] = newElement;
  }
  find(element) {
    let row, col;
    row = this.grid.findIndex((row2) => {
      col = row2.findIndex((el) => {
        return el === element;
      });
      return col !== -1;
    });
    return [row, col];
  }
  get(row, col) {
    return (this.grid[row] || [])[col];
  }
  getElementsInRange({ row: startRow, col: startCol }, { row: endRow, col: endCol }) {
    const elements = [];
    if (startRow > endRow) {
      [startRow, endRow] = [endRow, startRow];
    }
    if (startCol > endCol) {
      [startCol, endCol] = [endCol, startCol];
    }
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const element = this.get(row, col);
        if (element) {
          elements.push(element);
        }
      }
    }
    return elements;
  }
  adjustGridPosition(element) {
    let [row, col] = this.find(element);
    const [, maxCol] = this.getGridDimensions();
    if (col < maxCol - 1) {
      this.grid[row].length = maxCol;
      this.grid[row][maxCol] = element;
      this.grid[row][col] = null;
    }
  }
  adjustRowForMultipleIncoming(elements, currentElement) {
    const results = elements.map((element) => this.find(element));
    const lowestRow = Math.min(...results.map((result) => result[0]).filter((row2) => row2 >= 0));
    const [row, col] = this.find(currentElement);
    if (lowestRow < row && !this.grid[lowestRow][col]) {
      this.grid[lowestRow][col] = currentElement;
      this.grid[row][col] = null;
    }
  }
  adjustColumnForMultipleIncoming(elements, currentElement) {
    const results = elements.map((element) => this.find(element));
    const maxCol = Math.max(...results.map((result) => result[1]).filter((col2) => col2 >= 0));
    const [row, col] = this.find(currentElement);
    if (maxCol + 1 > col) {
      this.grid[row][maxCol + 1] = currentElement;
      this.grid[row][col] = null;
    }
  }
  getAllElements() {
    const elements = [];
    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.grid[row].length; col++) {
        const element = this.get(row, col);
        if (element) {
          elements.push(element);
        }
      }
    }
    return elements;
  }
  getGridDimensions() {
    const numRows = this.grid.length;
    let maxCols = 0;
    for (let i = 0; i < numRows; i++) {
      const currentRowLength = this.grid[i].length;
      if (currentRowLength > maxCols) {
        maxCols = currentRowLength;
      }
    }
    return [numRows, maxCols];
  }
  elementsByPosition() {
    const elements = [];
    this.grid.forEach((row, rowIndex) => {
      row.forEach((element, colIndex) => {
        if (!element) {
          return;
        }
        elements.push({
          element,
          row: rowIndex,
          col: colIndex
        });
      });
    });
    return elements;
  }
  getElementsTotal() {
    const flattenedGrid = this.grid.flat();
    const uniqueElements = new Set(flattenedGrid.filter((value) => value));
    return uniqueElements.size;
  }
  /**
   *
   * @param {number} afterIndex - number is integer
   * @param {number=} colCount - number is positive integer
   */
  createCol(afterIndex, colCount) {
    this.grid.forEach((row, rowIndex) => {
      this.expandRow(rowIndex, afterIndex, colCount);
    });
  }
  /**
   * @param {number} rowIndex - is positive integer
   * @param {number} afterIndex - is integer
   * @param {number=} colCount - is positive integer
   */
  expandRow(rowIndex, afterIndex, colCount) {
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex > this.rowCount - 1) return;
    const placeholder = Number.isInteger(colCount) && colCount > 0 ? Array(colCount) : Array(1);
    const row = this.grid[rowIndex];
    if (!afterIndex && !Number.isInteger(afterIndex)) {
      row.splice(row.length, 0, ...placeholder);
    } else {
      row.splice(afterIndex + 1, 0, ...placeholder);
    }
  }
};
var DiFactory = class {
  constructor(moddle) {
    this.moddle = moddle;
  }
  create(type, attrs) {
    return this.moddle.create(type, attrs || {});
  }
  createDiBounds(bounds) {
    return this.create("dc:Bounds", bounds);
  }
  createDiLabel() {
    return this.create("bpmndi:BPMNLabel", {
      bounds: this.createDiBounds()
    });
  }
  createDiShape(semantic, bounds, attrs) {
    return this.create("bpmndi:BPMNShape", assign({
      bpmnElement: semantic,
      bounds: this.createDiBounds(bounds)
    }, attrs));
  }
  createDiWaypoints(waypoints) {
    var self = this;
    return map(waypoints, function(pos) {
      return self.createDiWaypoint(pos);
    });
  }
  createDiWaypoint(point) {
    return this.create("dc:Point", pick(point, ["x", "y"]));
  }
  createDiEdge(semantic, waypoints, attrs) {
    return this.create("bpmndi:BPMNEdge", assign({
      bpmnElement: semantic,
      waypoint: this.createDiWaypoints(waypoints)
    }, attrs));
  }
  createDiPlane(attrs) {
    return this.create("bpmndi:BPMNPlane", attrs);
  }
  createDiDiagram(attrs) {
    return this.create("bpmndi:BPMNDiagram", attrs);
  }
};
var attacherHandler = {
  "addToGrid": ({ element, grid, visited }) => {
    const nextElements = [];
    const attachedOutgoing = (element.attachers || []).map((attacher) => (attacher.outgoing || []).reverse()).flat().map((out) => out.targetRef);
    attachedOutgoing.forEach((nextElement, index, arr) => {
      if (visited.has(nextElement)) {
        return;
      }
      insertIntoGrid(nextElement, element, grid);
      nextElements.push(nextElement);
      visited.add(nextElement);
    });
    return nextElements;
  },
  "createElementDi": ({ element, row, col, diFactory, shift }) => {
    const hostBounds = getBounds(element, row, col, shift);
    const DIs = [];
    (element.attachers || []).forEach((att, i, arr) => {
      att.gridPosition = { row, col };
      const bounds = getBounds(att, row, col, shift, element);
      bounds.x = hostBounds.x + (i + 1) * (hostBounds.width / (arr.length + 1)) - bounds.width / 2;
      const attacherDi = diFactory.createDiShape(att, bounds, {
        id: att.id + "_di"
      });
      att.di = attacherDi;
      att.gridPosition = { row, col };
      DIs.push(attacherDi);
    });
    return DIs;
  },
  "createConnectionDi": ({ element, row, col, layoutGrid, diFactory, shift }) => {
    const attachers = element.attachers || [];
    return attachers.flatMap((att) => {
      const outgoing = att.outgoing || [];
      return outgoing.map((out) => {
        const target = out.targetRef;
        const waypoints = connectElements(att, target, layoutGrid);
        ensureExitBottom(att, waypoints, [row, col]);
        return diFactory.createDiEdge(out, waypoints, {
          id: out.id + "_di"
        });
      });
    });
  }
};
function insertIntoGrid(newElement, host, grid) {
  const [row, col] = grid.find(host);
  if (grid.get(row + 1, col) || grid.get(row + 1, col + 1)) {
    grid.createRow(row);
  }
  grid.add(newElement, [row + 1, col + 1]);
}
function ensureExitBottom(source, waypoints, [row, col]) {
  const sourceDi = source.di;
  const sourceBounds = sourceDi.get("bounds");
  const sourceMid = getMid(sourceBounds);
  const dockingPoint = getDockingPoint(sourceMid, sourceBounds, "b");
  if (waypoints[0].x === dockingPoint.x && waypoints[0].y === dockingPoint.y) {
    return;
  }
  const baseSourceGrid = source.grid || source.attachedToRef?.grid;
  if (waypoints.length === 2) {
    const newStart2 = [
      dockingPoint,
      { x: dockingPoint.x, y: !baseSourceGrid ? (row + 1) * DEFAULT_CELL_HEIGHT : (row + baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
      { x: !baseSourceGrid ? (col + 1) * DEFAULT_CELL_WIDTH : (col + baseSourceGrid.getGridDimensions()[1] + 1) * DEFAULT_CELL_WIDTH, y: !baseSourceGrid ? (row + 1) * DEFAULT_CELL_HEIGHT : (row + baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
      { x: !baseSourceGrid ? (col + 1) * DEFAULT_CELL_WIDTH : (col + baseSourceGrid.getGridDimensions()[1] + 1) * DEFAULT_CELL_WIDTH, y: !baseSourceGrid ? (row + 0.5) * DEFAULT_CELL_HEIGHT : row * DEFAULT_CELL_HEIGHT + DEFAULT_CELL_HEIGHT / 2 }
    ];
    waypoints.splice(0, 1, ...newStart2);
    return;
  }
  const newStart = [
    dockingPoint,
    { x: dockingPoint.x, y: !baseSourceGrid ? (row + 1) * DEFAULT_CELL_HEIGHT : (row + baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT },
    { x: waypoints[1].x, y: !baseSourceGrid ? (row + 1) * DEFAULT_CELL_HEIGHT : (row + baseSourceGrid.getGridDimensions()[0] + 1) * DEFAULT_CELL_HEIGHT }
  ];
  waypoints.splice(0, 1, ...newStart);
}
var elementHandler = {
  "createElementDi": ({ element, row, col, diFactory, shift }) => {
    const bounds = getBounds(element, row, col, shift);
    const options = {
      id: element.id + "_di"
    };
    if (is(element, "bpmn:ExclusiveGateway")) {
      options.isMarkerVisible = true;
    }
    if (element.isExpanded) {
      options.isExpanded = true;
    }
    const shapeDi = diFactory.createDiShape(element, bounds, options);
    element.di = shapeDi;
    element.gridPosition = { row, col };
    return shapeDi;
  }
};
var outgoingHandler = {
  "addToGrid": ({ element, grid, visited, stack }) => {
    let nextElements = [];
    const outgoing = (element.outgoing || []).map((out) => out.targetRef).filter((el) => el);
    let previousElement = null;
    if (outgoing.length > 1 && isNextElementTasks(outgoing)) {
      grid.adjustGridPosition(element);
    }
    outgoing.forEach((nextElement, index, arr) => {
      if (visited.has(nextElement)) {
        return;
      }
      if ((previousElement || stack.length > 0) && isFutureIncoming(nextElement, visited) && !checkForLoop(nextElement, visited)) {
        return;
      }
      if (!previousElement) {
        grid.addAfter(element, nextElement);
      } else if (is(element, "bpmn:ExclusiveGateway") && is(nextElement, "bpmn:ExclusiveGateway")) {
        grid.addAfter(previousElement, nextElement);
      } else {
        grid.addBelow(arr[index - 1], nextElement);
      }
      if (nextElement !== element) {
        previousElement = nextElement;
      }
      nextElements.unshift(nextElement);
      visited.add(nextElement);
    });
    nextElements = sortByType(nextElements, "bpmn:ExclusiveGateway");
    return nextElements;
  },
  "createConnectionDi": ({ element, row, col, layoutGrid, diFactory }) => {
    const outgoing = element.outgoing || [];
    return outgoing.map((out) => {
      const target = out.targetRef;
      const waypoints = connectElements(element, target, layoutGrid);
      const connectionDi = diFactory.createDiEdge(out, waypoints, {
        id: out.id + "_di"
      });
      return connectionDi;
    });
  }
};
function sortByType(arr, type) {
  const nonMatching = arr.filter((item) => !is(item, type));
  const matching = arr.filter((item) => is(item, type));
  return [...matching, ...nonMatching];
}
function checkForLoop(element, visited) {
  for (const incomingElement of element.incoming) {
    if (!visited.has(incomingElement.sourceRef)) {
      return findElementInTree(element, incomingElement.sourceRef);
    }
  }
}
function isFutureIncoming(element, visited) {
  if (element.incoming.length > 1) {
    for (const incomingElement of element.incoming) {
      if (!visited.has(incomingElement.sourceRef)) {
        return true;
      }
    }
  }
  return false;
}
function isNextElementTasks(elements) {
  return elements.every((element) => is(element, "bpmn:Task"));
}
var incomingHandler = {
  "addToGrid": ({ element, grid, visited }) => {
    const nextElements = [];
    const incoming = (element.incoming || []).map((out) => out.sourceRef).filter((el) => el);
    if (incoming.length > 1) {
      grid.adjustColumnForMultipleIncoming(incoming, element);
      grid.adjustRowForMultipleIncoming(incoming, element);
    }
    return nextElements;
  }
};
var handlers = [elementHandler, incomingHandler, outgoingHandler, attacherHandler];
var Layouter = class {
  constructor() {
    this.moddle = new SimpleBpmnModdle();
    this.diFactory = new DiFactory(this.moddle);
    this._handlers = handlers;
  }
  handle(operation, options) {
    return this._handlers.filter((handler) => isFunction(handler[operation])).map((handler) => handler[operation](options));
  }
  async layoutProcess(xml2) {
    const moddleObj = await this.moddle.fromXML(xml2);
    const { rootElement } = moddleObj;
    this.diagram = rootElement;
    const firstRootProcess = this.getProcess();
    if (firstRootProcess) {
      this.setExpandedPropertyToModdleElements(moddleObj);
      this.setExecutedProcesses(firstRootProcess);
      this.createGridsForProcesses();
      this.cleanDi();
      this.createRootDi(firstRootProcess);
      this.drawProcesses();
    }
    return (await this.moddle.toXML(this.diagram, { format: true })).xml;
  }
  createGridsForProcesses() {
    const processes = this.layoutedProcesses.sort((a, b) => b.level - a.level);
    for (const process2 of processes) {
      process2.grid = this.createGridLayout(process2);
      expandGridHorizontally(process2.grid);
      expandGridVertically(process2.grid);
      if (process2.isExpanded) {
        const [rowCount, colCount] = process2.grid.getGridDimensions();
        if (rowCount === 0) process2.grid.createRow();
        if (colCount === 0) process2.grid.createCol();
      }
    }
  }
  setExpandedPropertyToModdleElements(bpmnModel) {
    const allElements = bpmnModel.elementsById;
    if (allElements) {
      for (const element of Object.values(allElements)) {
        if (element.$type === "bpmndi:BPMNShape" && element.isExpanded === true) element.bpmnElement.isExpanded = true;
      }
    }
  }
  setExecutedProcesses(firstRootProcess) {
    this.layoutedProcesses = [];
    const executionStack = [firstRootProcess];
    while (executionStack.length > 0) {
      const executedProcess = executionStack.pop();
      this.layoutedProcesses.push(executedProcess);
      executedProcess.level = executedProcess.$parent === this.diagram ? 0 : executedProcess.$parent.level + 1;
      const nextProcesses = executedProcess.get("flowElements").filter((flowElement) => is(flowElement, "bpmn:SubProcess"));
      executionStack.splice(executionStack.length, 0, ...nextProcesses);
    }
  }
  cleanDi() {
    this.diagram.diagrams = [];
  }
  createGridLayout(root) {
    const grid = new Grid();
    const flowElements = root.flowElements || [];
    const elements = flowElements.filter((el) => !is(el, "bpmn:SequenceFlow"));
    if (!flowElements) {
      return grid;
    }
    bindBoundaryEventsWithHosts(flowElements);
    const visited = /* @__PURE__ */ new Set();
    while (visited.size < elements.filter((element) => !element.attachedToRef).length) {
      const startingElements = flowElements.filter((el) => {
        return !isConnection(el) && !isBoundaryEvent(el) && (!el.incoming || !hasOtherIncoming(el)) && !visited.has(el);
      });
      const stack = [...startingElements];
      startingElements.forEach((el) => {
        grid.add(el);
        visited.add(el);
      });
      this.handleGrid(grid, visited, stack);
      if (grid.getElementsTotal() !== elements.length) {
        const gridElements = grid.getAllElements();
        const missingElements = elements.filter((el) => !gridElements.includes(el) && !isBoundaryEvent(el));
        if (missingElements.length > 0) {
          stack.push(missingElements[0]);
          grid.add(missingElements[0]);
          visited.add(missingElements[0]);
          this.handleGrid(grid, visited, stack);
        }
      }
    }
    return grid;
  }
  generateDi(layoutGrid, shift, procDi) {
    const diFactory = this.diFactory;
    const prePlaneElement = procDi ? procDi : this.diagram.diagrams[0];
    const planeElement = prePlaneElement.plane.get("planeElement");
    layoutGrid.elementsByPosition().forEach(({ element, row, col }) => {
      const dis = this.handle("createElementDi", { element, row, col, layoutGrid, diFactory, shift }).flat();
      planeElement.push(...dis);
    });
    layoutGrid.elementsByPosition().forEach(({ element, row, col }) => {
      const dis = this.handle("createConnectionDi", { element, row, col, layoutGrid, diFactory, shift }).flat();
      planeElement.push(...dis);
    });
  }
  handleGrid(grid, visited, stack) {
    while (stack.length > 0) {
      const currentElement = stack.pop();
      const nextElements = this.handle("addToGrid", { element: currentElement, grid, visited, stack });
      nextElements.flat().forEach((el) => {
        stack.push(el);
        visited.add(el);
      });
    }
  }
  getProcess() {
    return this.diagram.get("rootElements").find((el) => el.$type === "bpmn:Process");
  }
  createRootDi(processes) {
    this.createProcessDi(processes);
  }
  createProcessDi(element) {
    const diFactory = this.diFactory;
    const planeDi = diFactory.createDiPlane({
      id: "BPMNPlane_" + element.id,
      bpmnElement: element
    });
    const diagramDi = diFactory.createDiDiagram({
      id: "BPMNDiagram_" + element.id,
      plane: planeDi
    });
    const diagram = this.diagram;
    diagram.diagrams.push(diagramDi);
    return diagramDi;
  }
  /**
   * Draw processes.
   * Root processes should be processed first for element expanding
   */
  drawProcesses() {
    const sortedProcesses = this.layoutedProcesses.sort((a, b) => a.level - b.level);
    for (const process2 of sortedProcesses) {
      if (process2.isExpanded) {
        const baseProcDi = this.getElementDi(process2);
        const diagram2 = this.getProcDi(baseProcDi);
        let { x, y } = baseProcDi.bounds;
        const { width, height } = getDefaultSize(process2);
        x += DEFAULT_CELL_WIDTH / 2 - width / 4;
        y += DEFAULT_CELL_HEIGHT - height - height / 4;
        this.generateDi(process2.grid, { x, y }, diagram2);
        continue;
      }
      const diagram = this.diagram.diagrams.find((diagram2) => diagram2.plane.bpmnElement === process2);
      this.generateDi(process2.grid, { x: 0, y: 0 }, diagram);
    }
  }
  getElementDi(element) {
    return this.diagram.diagrams.map((diagram) => diagram.plane.planeElement).flat().find((item) => item.bpmnElement === element);
  }
  getProcDi(element) {
    return this.diagram.diagrams.find((diagram) => diagram.plane.planeElement.includes(element));
  }
};
function bindBoundaryEventsWithHosts(elements) {
  const boundaryEvents = elements.filter((element) => isBoundaryEvent(element));
  boundaryEvents.forEach((boundaryEvent) => {
    const attachedTask = boundaryEvent.attachedToRef;
    const attachers = attachedTask.attachers || [];
    attachers.push(boundaryEvent);
    attachedTask.attachers = attachers;
  });
}
function expandGridHorizontally(grid) {
  const [numRows, maxCols] = grid.getGridDimensions();
  for (let i = maxCols - 1; i >= 0; i--) {
    const elementsInCol = [];
    for (let j = 0; j < numRows; j++) {
      const candidate = grid.get(j, i);
      if (candidate && candidate.isExpanded) elementsInCol.push(candidate);
    }
    if (elementsInCol.length === 0) continue;
    const maxColCount = elementsInCol.reduce((acc, cur) => {
      const [, curCols] = cur.grid.getGridDimensions();
      if (acc === void 0 || curCols > acc) return curCols;
      return acc;
    }, void 0);
    const shift = !maxColCount ? 2 : maxColCount;
    grid.createCol(i, shift);
  }
}
function expandGridVertically(grid) {
  const [numRows, maxCols] = grid.getGridDimensions();
  for (let i = numRows - 1; i >= 0; i--) {
    const elementsInRow = [];
    for (let j = 0; j < maxCols; j++) {
      const candidate = grid.get(i, j);
      if (candidate && candidate.isExpanded) elementsInRow.push(candidate);
    }
    if (elementsInRow.length === 0) continue;
    const maxRowCount = elementsInRow.reduce((acc, cur) => {
      const [curRows] = cur.grid.getGridDimensions();
      if (acc === void 0 || curRows > acc) return curRows;
      return acc;
    }, void 0);
    const shift = !maxRowCount ? 1 : maxRowCount;
    for (let index = 0; index < shift; index++) {
      grid.createRow(i);
    }
  }
}
function hasOtherIncoming(element) {
  const fromHost = element.incoming?.filter((edge) => edge.sourceRef !== element && edge.sourceRef.attachedToRef === void 0) || [];
  const fromAttached = element.incoming?.filter((edge) => edge.sourceRef !== element && edge.sourceRef.attachedToRef !== element);
  return fromHost?.length > 0 || fromAttached?.length > 0;
}
function layoutProcess(xml2) {
  return new Layouter().layoutProcess(xml2);
}

// layout-cli.js
var import_xmldom = __toESM(require_lib());

// postlayout.js
var NS = {
  bpmn: "http://www.omg.org/spec/BPMN/20100524/MODEL",
  bpmndi: "http://www.omg.org/spec/BPMN/20100524/DI",
  dc: "http://www.omg.org/spec/DD/20100524/DC",
  di: "http://www.omg.org/spec/DD/20100524/DI"
};
var XMLNS = "http://www.w3.org/2000/xmlns/";
var ROW_H = 100;
var LANE_PAD = 12;
var LANE_LABEL_W = 30;
var POOL_LABEL_W = 30;
var H_GAP = 20;
var EXT_POOL_H = 60;
var EXT_POOL_GAP = 30;
var POOL_MARGIN_X = 50;
var POOL_ORIGIN = { x: 40, y: 40 };
function byLocalName(root, local) {
  const out = [];
  const all = root.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if ((el.localName || el.nodeName.replace(/^.*:/, "")) === local) out.push(el);
  }
  return out;
}
function removeAll(doc, local) {
  byLocalName(doc, local).forEach(function(el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
}
function createFinishLayout(env) {
  const layoutProcess2 = env.layoutProcess;
  const DOMParserImpl = env.DOMParser;
  const XMLSerializerImpl = env.XMLSerializer;
  const parse = function(xml2) {
    return new DOMParserImpl().parseFromString(xml2, "text/xml");
  };
  const serialize = function(doc) {
    return new XMLSerializerImpl().serializeToString(doc);
  };
  return async function finishLayout2(xml2) {
    const semDoc = parse(xml2);
    const laneEls = byLocalName(semDoc, "lane");
    const lanes = laneEls.map(function(el) {
      return {
        id: el.getAttribute("id"),
        name: el.getAttribute("name") || el.getAttribute("id"),
        refs: byLocalName(el, "flowNodeRef").map(function(r) {
          return (r.textContent || "").trim();
        })
      };
    });
    const collabEl = byLocalName(semDoc, "collaboration")[0] || null;
    const participants = collabEl ? byLocalName(collabEl, "participant").map(function(el) {
      return {
        id: el.getAttribute("id"),
        name: el.getAttribute("name") || "",
        processRef: el.getAttribute("processRef")
      };
    }) : [];
    const messageFlows = collabEl ? byLocalName(collabEl, "messageFlow").map(function(el) {
      return {
        id: el.getAttribute("id"),
        sourceRef: el.getAttribute("sourceRef"),
        targetRef: el.getAttribute("targetRef")
      };
    }) : [];
    if (!lanes.length && !collabEl) {
      const plain = await layoutProcess2(xml2);
      return typeof plain === "string" ? plain : plain.xml;
    }
    const stripped = parse(xml2);
    removeAll(stripped, "laneSet");
    removeAll(stripped, "collaboration");
    removeAll(stripped, "BPMNDiagram");
    const laidRes = await layoutProcess2(serialize(stripped));
    const laidDoc = parse(typeof laidRes === "string" ? laidRes : laidRes.xml);
    const geo = {};
    byLocalName(laidDoc, "BPMNShape").forEach(function(sh) {
      const b = byLocalName(sh, "Bounds")[0];
      if (!b) return;
      geo[sh.getAttribute("bpmnElement")] = {
        x: parseFloat(b.getAttribute("x")),
        y: parseFloat(b.getAttribute("y")),
        w: parseFloat(b.getAttribute("width")),
        h: parseFloat(b.getAttribute("height"))
      };
    });
    const seqFlows = byLocalName(semDoc, "sequenceFlow").map(function(el) {
      return {
        id: el.getAttribute("id"),
        sourceRef: el.getAttribute("sourceRef"),
        targetRef: el.getAttribute("targetRef")
      };
    });
    const externalPools = participants.filter(function(p) {
      return !p.processRef;
    });
    const mainPool = participants.filter(function(p) {
      return !!p.processRef;
    })[0] || null;
    const nodeIds = Object.keys(geo);
    const poolX = POOL_ORIGIN.x;
    const poolY = POOL_ORIGIN.y + externalPools.length * (EXT_POOL_H + EXT_POOL_GAP);
    const laneBounds = {};
    let poolW;
    let poolH;
    if (lanes.length) {
      const laneOf = {};
      lanes.forEach(function(ln) {
        ln.refs.forEach(function(id) {
          laneOf[id] = ln.id;
        });
      });
      nodeIds.forEach(function(id) {
        if (!laneOf[id]) laneOf[id] = lanes[0].id;
      });
      const meanY = {};
      lanes.forEach(function(ln) {
        const ys = nodeIds.filter(function(id) {
          return laneOf[id] === ln.id;
        }).map(function(id) {
          return geo[id].y + geo[id].h / 2;
        });
        meanY[ln.id] = ys.length ? ys.reduce(function(a, b) {
          return a + b;
        }, 0) / ys.length : Infinity;
      });
      const ordered = lanes.slice().sort(function(a, b) {
        return meanY[a.id] - meanY[b.id];
      });
      const minX = Math.min.apply(
        null,
        nodeIds.map(function(id) {
          return geo[id].x;
        })
      );
      const shiftX = poolX + POOL_LABEL_W + LANE_LABEL_W + 30 - minX;
      let top = poolY;
      ordered.forEach(function(ln) {
        const members = nodeIds.filter(function(id) {
          return laneOf[id] === ln.id;
        }).sort(function(a, b) {
          return geo[a].x - geo[b].x || geo[a].y - geo[b].y;
        });
        const rowEnd = [];
        members.forEach(function(id) {
          const g = geo[id];
          let row = 0;
          while (row < rowEnd.length && g.x < rowEnd[row] + H_GAP) row++;
          rowEnd[row] = g.x + g.w;
          g.x += shiftX;
          g.y = top + LANE_PAD + row * ROW_H + (ROW_H - g.h) / 2;
        });
        const nRows = Math.max(rowEnd.length, 1);
        const h = 2 * LANE_PAD + nRows * ROW_H;
        laneBounds[ln.id] = { x: poolX + POOL_LABEL_W, y: top, h };
        top += h;
      });
      poolH = top - poolY;
    } else {
      const minX = Math.min.apply(null, nodeIds.map(function(id) {
        return geo[id].x;
      }));
      const minY = Math.min.apply(null, nodeIds.map(function(id) {
        return geo[id].y;
      }));
      const shiftX = poolX + POOL_LABEL_W + 30 - minX;
      const shiftY = poolY + 30 - minY;
      nodeIds.forEach(function(id) {
        geo[id].x += shiftX;
        geo[id].y += shiftY;
      });
      poolH = Math.max.apply(null, nodeIds.map(function(id) {
        return geo[id].y + geo[id].h;
      })) + 30 - poolY;
    }
    const maxX = Math.max.apply(
      null,
      nodeIds.map(function(id) {
        return geo[id].x + geo[id].w;
      })
    );
    poolW = maxX + POOL_MARGIN_X - poolX;
    Object.keys(laneBounds).forEach(function(id) {
      laneBounds[id].w = poolW - POOL_LABEL_W;
    });
    const extBounds = {};
    externalPools.forEach(function(p, i) {
      extBounds[p.id] = {
        x: poolX,
        y: POOL_ORIGIN.y + i * (EXT_POOL_H + EXT_POOL_GAP),
        w: poolW,
        h: EXT_POOL_H
      };
    });
    const center = function(g) {
      return { x: g.x + g.w / 2, y: g.y + g.h / 2 };
    };
    const route = function(s, t) {
      const sc = center(s);
      const tc = center(t);
      if (t.x >= s.x + s.w) {
        const sx = s.x + s.w;
        const tx = t.x;
        if (Math.abs(sc.y - tc.y) < 1) {
          return [
            [sx, sc.y],
            [tx, tc.y]
          ];
        }
        const mx = (sx + tx) / 2;
        return [
          [sx, sc.y],
          [mx, sc.y],
          [mx, tc.y],
          [tx, tc.y]
        ];
      }
      if (t.y > s.y + s.h || t.y + t.h < s.y) {
        const down = t.y > s.y;
        const sy = down ? s.y + s.h : s.y;
        const ty = down ? t.y : t.y + t.h;
        const my = (sy + ty) / 2;
        return [
          [sc.x, sy],
          [sc.x, my],
          [tc.x, my],
          [tc.x, ty]
        ];
      }
      const under = Math.max(s.y + s.h, t.y + t.h) + 30;
      return [
        [sc.x, s.y + s.h],
        [sc.x, under],
        [tc.x, under],
        [tc.x, t.y + t.h]
      ];
    };
    const root = semDoc.documentElement;
    ["bpmndi", "dc", "di"].forEach(function(p) {
      if (!root.getAttribute("xmlns:" + p)) {
        root.setAttributeNS(XMLNS, "xmlns:" + p, NS[p]);
      }
    });
    removeAll(semDoc, "BPMNDiagram");
    const mk = function(parent, qname, attrs) {
      const ns = NS[qname.split(":")[0]];
      const el = semDoc.createElementNS(ns, qname);
      Object.keys(attrs || {}).forEach(function(k) {
        el.setAttribute(k, String(attrs[k]));
      });
      parent.appendChild(el);
      return el;
    };
    const shape = function(plane2, id, ref, b, horizontal) {
      const sh = mk(plane2, "bpmndi:BPMNShape", { id, bpmnElement: ref });
      if (horizontal) sh.setAttribute("isHorizontal", "true");
      mk(sh, "dc:Bounds", { x: b.x, y: b.y, width: b.w, height: b.h });
      return sh;
    };
    const edge = function(plane2, id, ref, pts) {
      const ed = mk(plane2, "bpmndi:BPMNEdge", { id, bpmnElement: ref });
      pts.forEach(function(p) {
        mk(ed, "di:waypoint", { x: p[0], y: p[1] });
      });
      return ed;
    };
    const diagram = mk(root, "bpmndi:BPMNDiagram", { id: "BPMNDiagram_1" });
    const procEl = byLocalName(semDoc, "process")[0];
    const plane = mk(diagram, "bpmndi:BPMNPlane", {
      id: "BPMNPlane_1",
      bpmnElement: collabEl ? collabEl.getAttribute("id") : procEl.getAttribute("id")
    });
    if (mainPool) {
      shape(
        plane,
        "Shape_" + mainPool.id,
        mainPool.id,
        { x: poolX, y: poolY, w: poolW, h: poolH },
        true
      );
    }
    Object.keys(laneBounds).forEach(function(id) {
      shape(plane, "Shape_" + id, id, laneBounds[id], true);
    });
    externalPools.forEach(function(p) {
      shape(plane, "Shape_" + p.id, p.id, extBounds[p.id], true);
    });
    nodeIds.forEach(function(id) {
      shape(plane, "Shape_" + id, id, geo[id], false);
    });
    seqFlows.forEach(function(f) {
      const s = geo[f.sourceRef];
      const t = geo[f.targetRef];
      if (!s || !t) return;
      edge(plane, "Edge_" + f.id, f.id, route(s, t));
    });
    messageFlows.forEach(function(f) {
      const sPool = extBounds[f.sourceRef];
      const tPool = extBounds[f.targetRef];
      const s = sPool || geo[f.sourceRef];
      const t = tPool || geo[f.targetRef];
      if (!s || !t) return;
      const ax = center(tPool ? s : t).x;
      const pts = s.y + s.h <= t.y ? [
        [ax, s.y + s.h],
        [ax, t.y]
      ] : [
        [ax, s.y],
        [ax, t.y + t.h]
      ];
      edge(plane, "Edge_" + f.id, f.id, pts);
    });
    return serialize(semDoc);
  };
}

// layout-cli.js
var finishLayout = createFinishLayout({
  layoutProcess,
  DOMParser: import_xmldom.DOMParser,
  XMLSerializer: import_xmldom.XMLSerializer
});
var chunks = [];
process.stdin.on("data", (c) => chunks.push(c));
process.stdin.on("end", async () => {
  try {
    const input = Buffer.concat(chunks).toString("utf8");
    process.stdout.write(await finishLayout(input));
  } catch (e) {
    process.stderr.write(String(e && e.stack ? e.stack : e));
    process.exit(1);
  }
});
