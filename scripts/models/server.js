var Server = function Server(data) {
  this.data = data;
};

Server.prototype.id = function() {
  return this.data.id;
};

Server.prototype.name = function() {
  return this.data.name;
};

Server.find = function(http, value, callback) {
  var server = null;
  var _this = this;

  this.fetch(http, function(servers) {
    server = _this.__findById(servers, value);
    if (server == null) { server = _this.__findByExactName(servers, value); }
    if (server == null) { server = _this.__findByFuzzyName(servers, value); }

    callback(server);
  });
};

Server.fetch = function(http, callback) {
  http("systems.json").get()(function(err, res, body) {
    var servers = [];

    if (res.statusCode === 200) {
      response = JSON.parse(body);
      for (var i = 0; i < response.length; i++) {
        var server = response[i];
        servers.push(new Server(server));
      }
    }

    if (callback) {
      callback(servers);
    }
  });
};

Server.__findById = function(servers, id) {
  for (var i = 0; i < servers.length; i++) {
    server = servers[i];
    if (server.id() === id) {
      return server;
    }
  }

  return null;
};

Server.__findByExactName = function(servers, name) {
  var name = name.toLowerCase();
  for (var i = 0; i < servers.length; i++) {
    server = servers[i];
    if (server.name().toLowerCase() === name) {
      return server;
    }
  }

  return null;
};

Server.__findByFuzzyName = function(servers, name) {
  var name = name.toLowerCase();
  for (var i = 0; i < servers.length; i++) {
    var server = servers[i];
    if (server.name().toLowerCase().indexOf(name) !== -1) {
      return server;
    }
  }

  return null;
};

module.exports = Server;
