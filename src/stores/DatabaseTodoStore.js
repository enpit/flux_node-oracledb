var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');
var http = require('http');

var CHANGE_EVENT = 'change';

var requestOptions = {
  hostname: 'localhost',
  port: 7002,
  method: 'GET', // will be overwritten for every request
  path: '/todo/?' // will be overwritten for every request
};

/**
 * Convenience method for sending a http request
 * @param {string} method the http method that should be used for this request
 * @param {string} path the path that should be appended to the url
 * @param {function} fun the function to pass as a callback to the http.request call
 */
function sendRequest(method, path, fun) {

  requestOptions.method = method;
  requestOptions.path = path;
  http.request(requestOptions, fun).end();
}

/**
 * Create a TODO item.
 * @param  {string} text The content of the TODO
 */
function create(text) {

  console.log('create todo: ' + text);
  sendRequest('POST', '/todo/' + text);
}

/**
 * Update a TODO item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(id, updates) {

  console.log('update todo: ' + id);
  sendRequest('PUT', '/todo/' + id + '/' + JSON.stringify(updates));
}

/**
 * Update all of the TODO items with the same object.
 *     the data to be updated.  Used to mark all TODOs as completed.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.

 */
function updateAll(updates) {

  console.log('updateall');
  sendRequest('PUT', '/todo/' + JSON.stringify(updates));
}

/**
 * Delete a TODO item.
 * @param  {string} id
 */
function destroy(id) {

  console.log('delete todo :' + id);
  sendRequest('DEL', '/todo/' + id);
}

/**
 * Delete all the completed TODO items.
 */
function destroyCompleted() {

  console.log('destory completed');
  sendRequest('DEL', '/todo/allCompleted');
}

var DatabaseTodoStore = assign({}, EventEmitter.prototype, {

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function () {

    sendRequest('GET', '/todo/areAllComplete', function (res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        var responseObj =  JSON.parse(data);
        return responseObj && responseObj.areAllComplete;
      });
    });
    return false;
  },

  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function () {

    var req = sendRequest('GET', '/todo/all', function (res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        todos = JSON.parse(data);
        return todos;
      });
    });

    req.on('error', function () {
      return [];
    })
  },

  emitChange: function () {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function (callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function (callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

// Register callback to handle all updates
AppDispatcher.register(function (action) {
  var text;

  switch (action.actionType) {
    case TodoConstants.TODO_CREATE:
      text = action.text.trim();
      if (text !== '') {
        create(text);
        DatabaseTodoStore.emitChange();
      }
      break;

    case TodoConstants.TODO_TOGGLE_COMPLETE_ALL:
      if (DatabaseTodoStore.areAllComplete()) {
        updateAll({
          complete: false
        });
      } else {
        updateAll({
          complete: true
        });
      }
      DatabaseTodoStore.emitChange();
      break;

    case TodoConstants.TODO_UNDO_COMPLETE:
      update(action.id, {
        complete: false
      });
      DatabaseTodoStore.emitChange();
      break;

    case TodoConstants.TODO_COMPLETE:
      update(action.id, {
        complete: true
      });
      DatabaseTodoStore.emitChange();
      break;

    case TodoConstants.TODO_UPDATE_TEXT:
      text = action.text.trim();
      if (text !== '') {
        update(action.id, {
          text: text
        });
        DatabaseTodoStore.emitChange();
      }
      break;

    case TodoConstants.TODO_DESTROY:
      destroy(action.id);
      DatabaseTodoStore.emitChange();
      break;

    case TodoConstants.TODO_DESTROY_COMPLETED:
      destroyCompleted();
      DatabaseTodoStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = DatabaseTodoStore;
