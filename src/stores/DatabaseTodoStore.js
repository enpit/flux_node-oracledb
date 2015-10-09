var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var TodoConstants = require('../constants/TodoConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _todos = {};

/**
 * Create a TODO item.
 * @param  {string} text The content of the TODO
 */
function create (text) {

  console.log('create todo: ' + text);
  // var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  // _todos[id] = {
  // 	id: id,
  // 	complete: false,
  // 	text: text
  // };
}

/**
 * Update a TODO item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update (id, updates) {

  console.log('update todo: ' + id);
  // _todos[id] = assign({}, _todos[id], updates);
}

/**
 * Update all of the TODO items with the same object.
 *     the data to be updated.  Used to mark all TODOs as completed.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.

 */
function updateAll (updates) {

  console.log('updateall');
  for (var id in _todos) {
    // update(id, updates);
  }
}

/**
 * Delete a TODO item.
 * @param  {string} id
 */
function destroy (id) {

  console.log('delete todo :' + id);
  delete _todos[id];
}

/**
 * Delete all the completed TODO items.
 */
function destroyCompleted () {

  console.log('destory completed');
  // for (var id in _todos) {
  // 	if (_todos[id].complete) {
  // 		destroy(id);
  // 	}
  // }
}

var DatabaseTodoStore = assign({}, EventEmitter.prototype, {

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function () {
    for (var id in _todos) {
      if (!_todos[id].complete) {
        return false;
      }
    }
    return true;
  },

  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function () {
    return _todos;
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
