// Simplified Readability implementation for the extension
// Provides minimal article extraction to avoid issues with the previous
// corrupted library file.

function Readability(doc, options) {
  this._doc = doc;
  this._options = options || {};
}

Readability.prototype.parse = function () {
  var article =
    this._doc.querySelector('article') ||
    this._doc.querySelector('main') ||
    this._doc.body;

  if (!article) {
    return null;
  }

  var titleNode =
    article.querySelector('h1') ||
    this._doc.querySelector('title');

  var title = '';
  if (titleNode && titleNode.textContent) {
    title = titleNode.textContent.trim();
  }

  return {
    title: title || this._doc.title || '',
    content: article.innerHTML
  };
};

if (typeof module === 'object') {
  module.exports = Readability;
}
