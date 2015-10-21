var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');
var request = require('request');

var CHANGE_EVENT = 'change';
var DEFAULT_PORT = 9999;
var DEFAULT_HOSTNAME = 'localhost';
var TODO_PATH = '/todo';

var todoRequest = request.defaults({
  baseUrl: 'http://' + DEFAULT_HOSTNAME + ':' + DEFAULT_PORT + TODO_PATH
});

/**
 * Create a TODO item.
 * @param  {string} text The content of the TODO
 */
function create(text) {

  todoRequest.post('/' + text);
}

/**
 * Update a TODO item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(id, updates) {

  todoRequest.put('/' + id + '/' + JSON.stringify(updates));
}

/**
 * Update all of the TODO items with the same object.
 *     the data to be updated.  Used to mark all TODOs as completed.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.

 */
function updateAll(updates) {

  todoRequest.put('/' + JSON.stringify(updates));
}

/**
 * Delete a TODO item.
 * @param  {string} id
 */
function destroy(id) {

  todoRequest.del('/' + id);
}

/**
 * Delete all the completed TODO items.
 */
function destroyCompleted() {

  todoRequest.del('/allCompleted');
}

var DatabaseTodoStore = assign({}, EventEmitter.prototype, {

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function () {

    var data = '';
    todoRequest
      .get('/areAllComplete')
      .on('data', function (chunk) {
        data += chunk;
      })
      .on('end', function () {
        var responseObj = JSON.parse(data);
        return responseObj && responseObj.areAllComplete;
      }).on('error', function () {
        return false;
      });
  },

  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function () {

    var data = '';

    todoRequest
      .get('/all')
      .on('data', function (chunk) {
        data += chunk;
      })
      .on('end', function () {
        var todos = JSON.parse(data);
        return todos;
      })
      .on('error', function () {
        return [];
      });
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
