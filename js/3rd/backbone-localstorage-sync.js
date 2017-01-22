/*

backbone-localstorage-sync
Original: https://github.com/srackham/backbone-localstorage-sync
Adapted to support a few extra features:
1. Use of jQuery promises
2. Integrated with Cordova Native Storage (if exists). See device.js for details.
3. Allows sharding of data
4. Initialize with boilerplate data

*/
'use strict';

// Constructor function for creating Backbone sync adaptor objects.
var BackboneLocalStorage = function(name, options) {
  options || (options = {});
  if (!name) throw('Please specify a name for the Backbone sync adaptor.');
  if (typeof name != 'string') throw('Invalid Backbone sync adaptor name "' + name + '". It must be a string.');
  this.name = name;

  // Option to segregate values based on a filter of key/value attributes
  this.shard = options.shard;

  this.shardAttribute = options.shardAttribute;
  if (this.shardAttribute && !(this.shardType == 'single' || this.shardType == 'list'))
    throw 'Invalid shardType value. Must be single or list.';
  this.shardType = options.shardType;
  this.shardValue = options.shardValue;

  // this.data is keyed by model model id and contains model attribute hashes.
  function setInitialData(optionsData, storageData) {
    if (storageData == undefined && optionsData) {
      this.data = optionsData;
        window.localStorage[this.name] = JSON.stringify(this.data);
    } else {
      this.data = (typeof storageData == 'object' && storageData) || (storageData && JSON.parse(storageData)) || {};
    }
  }
  setInitialData.call(this, options.data, window.localStorage[this.name]);

  this.sync = this.sync.bind(this);
};

if (window.module && window.module.exports) {
  var syncCache = {};
  // Returns a Backbone sync function which is bound to a
  // BackboneLocalStorage instance. The `key` argument is
  // a string which identifies the browser LocalStorage key/value pair.
  // This factory function returns a per LocalStorage item singleton function.
  module.exports = function(key) {
    // Ensure there is only on sync adapter per localStorage item.
    if (!syncCache[key]) {
      var localStorage = new BackboneLocalStorage(key);
      syncCache[key] = localStorage.sync.bind(localStorage);
    }
    return syncCache[key];
  };
}

BackboneLocalStorage.prototype = {

  hasAccess: function(model) {
    if (typeof this.shard != 'object') return true;

    var json = model.attributes || model;
    return Object.keys(this.shard).every(function(attr) {
      if (json[attr] === undefined) return true;
      if (_.isArray(json[attr]) && json[attr].indexOf(this.shard[attr]) == -1 ||
          !_.isArray(json[attr]) && json[attr] != this.shard[attr]) {
        console.log('hasAccess failed', {name: this.name, shardAttr: attr, shardValue: this.shard[attr], modelValue: json[attr]});
        return false;
      }
      return true;
    }.bind(this));
  },

  saveData: function() {
    window.localStorage[this.name] = JSON.stringify(this.data);
    if (Backbone.persistLocalStorage) Backbone.persistLocalStorage.save();
  },

  create: function(model) {
    if (!model.id) {
      model.id = model.attributes.id = guid();
    }
    return this.update(model);
  },

  update: function(model) {
    var json = model.toJSON();
    if (!this.hasAccess(json)) throw 'No access';
    this.data[model.id] = json;
    this.saveData();
    return model.toJSON();
  },

  find: function(model) {
    return this.hasAccess(this.data[model.id]) ? this.data[model.id] : undefined;
  },

  findAll: function() {
    // Return array of all models attribute hashes.
    return Object.keys(this.data).reduce(function(result, id) {
      if (this.hasAccess(this.data[id])) result.push(this.data[id]);
      return result;
    }.bind(this), []);
  },

  destroy: function(model) {
    if (!this.hasAccess(this.data[model.id])) throw 'No access';
    delete this.data[model.id];
    this.saveData();
    return model.toJSON();
  },

  /*
   Overrides Backbone.sync function.

   Called by Backbone Model fetch, save and destroy APIs (with the `model` argument set
   to the bound Model) and by the Collection fetch API (with the `model` argument set
   to the bound Collection).

   Backbone exposes a success/error style callback interface to the fetch, save, and destroy APIs.
   This is to accommodate asynchronous client/server interactions e.g. using AJAX. But because
   all localStorage requests synchronously the fetch, save and destroy APIs behave synchronous.

   */
  sync: function(method, model, options) {
    options || (options = {});
    if (options.shard !== undefined) this.shard = options.shard;

    var resp; // JSON response from the "server".
    switch (method) {
      case 'read':    // Model/Collection `fetch` APIs.
        resp = model.id !== undefined ? this.find(model) : this.findAll();
        break;
      case 'create':  // Model `save` API.
        resp = this.create(model);
        break;
      case 'update':  // Model `save` API.
        resp = this.update(model);
        break;
      case 'delete':  // Model `destroy` API.
        resp = this.destroy(model);
        break;
    }

    console.log('sync', this.name, method, model.id);

    var deferred = new $.Deferred();
    if (resp) {
      // 1. If necessary update the model (set)/collection (set or reset).
      // 2. Execute the fetch/save/destroy `options.success` callback.
      // 3. Emit a "sync" event with arguments model,resp,options.
      if (typeof options.success == 'function') options.success(resp);
      deferred.resolve(resp);
    } else {
      // 1. Execute the fetch/save/destroy `options.error` callback.
      // 2. Emit an "error" event with arguments model,resp,options.
      if (typeof options.error == 'function') options.error(method);
      deferred.reject(method);
    }

    return deferred.promise();
  }

};

// Generate four random hex digits.
function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
  return _.now();
  //return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
}

