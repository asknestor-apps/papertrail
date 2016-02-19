var Group = function Group(data) {
  this.data = data;
};

Group.prototype.id = function() {
  return this.data.id;
};

Group.prototype.name = function() {
  return this.data.name;
};

Group.prototype.searchUrl = function() {
  return this.data._links.search;
};

Group.prototype.systemCount = function() {
  return this.data.systems.length;
};

Group.prototype.description = function() {
  return this.name();
};

Group.find = function(http, value, callback) {
  var group = null;
  var _this = this;

  this.fetch(http, function(groups) {
    group = this.__findById(value);
    if (group == null) { group = this.__findByExactName(value); }
    if (group == null) { group = this.__findByFuzzyName(value); }

    callback(group);
  });
};

Group.fetch = function(http, callback) {
  http("groups.json").get()(function(err, res, body) {
    var groups = [];

    if (res.statusCode === 200) {
      response = JSON.parse(body);
      for(var i = 0; i < response.length; i++) {
        group = response[i];
        groups.push(new Group(group));
      }
    }

    if (callback) {
      callback(groups);
    }
  });
};

Group.__findById = function(groups, id) {
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    if (group.id() === id) {
      return group;
    }
  }

  return null;
};

Group.__findByExactName = function(groups, name) {
  var name = name.toLowerCase();
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    if (group.name().toLowerCase() === name) {
      return group;
    }
  }

  return null;
};

Group.__findByFuzzyName = function(groups, name) {
  var name = name.toLowerCase();
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];
    if (group.name().toLowerCase().indexOf(name) !== -1) {
      return group;
    }
  }

  return null;
};


module.exports = Group;
