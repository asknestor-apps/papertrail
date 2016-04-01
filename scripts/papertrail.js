var Group = require('./models/group');
var Server = require('./models/server');

module.exports = function(robot) {
  var baseUrl = "https://papertrailapp.com/api/v1/"
  var http = function(path) {
    return robot.http(baseUrl + path).
           header("X-Papertrail-Token", process.env.NESTOR_PAPERTRAIL_API_TOKEN);
  };

  robot.respond(/papertrail me(?: group=(?:"([^"]+)"|(\S+)))?(?: (?:server|host|system|source)=(\S+))?(?: (.*))?$/, { suggestions: ["papertrail me [group=<group>] [server|host|system|source=<source>] [query]"] }, function(msg, done) {
    var fetchResults = function(queryOptions, done) {
      var htmlUrl;

      if (queryOptions.group_id != null) {
        htmlUrl = "https://papertrailapp.com/groups/" + queryOptions.group_id + "/events";
      } else if (queryOptions.system_id != null) {
        htmlUrl = "https://papertrailapp.com/systems/" + queryOptions.system_id + "/events";
      } else {
        htmlUrl = "https://papertrailapp.com/events";
      }

      if (queryOptions.q != null) {
        htmlUrl += "?q=" + (escape(queryOptions.q));
      }

      http("events/search.json").query(queryOptions).get()(function(err, res, body) {
        var event, events, matchText, response;
        if (res.statusCode !== 200) {
          msg.send("Error talking to papertrail:" + body, done);
        } else {
          var events = [];
          var response = JSON.parse(body);

          for(var i = 0; i < response.events.length; i++) {
            event = response.events[i];
            events.push("*" + event.display_received_at + " " + event.source_name + " " + event.program + "*: " + event.message);
          }

          if (events.length === 0) {
            msg.send("\"" + (queryOptions.q || "") + "\": No matches were found in time. Search harder at: " + htmlUrl, done);
          } else {
            matchText = events.length === 1 ? "match" : "matches";

            msg.send("Found " + events.length + " " + matchText + " for query:" + "\"" + queryOptions.q + "\"" + " – " + htmlUrl).then(function() {
              msg.send(events, done);
            });
          }
        }
      });
    };

    var groupName = msg.match[1] || msg.match[2];
    var serverName = msg.match[3];
    var query = msg.match[4] || "";

    if (groupName != null) {
      Group.find(http, groupName, function(group) {
        if (group != null) {
          fetchResults({
            q: query,
            group_id: group.id()
          }, done);
        } else {
          Group.fetch(http, function(groups) {
            if (groups.length == 0) {
              msg.send("Looks like you don't have any Papertrail groups :(", done);
            } else {
              results = [];
              for(var i = 0; i < groups.length; i++) {
                results.push("* " + groups[i].description());
              }
              msg.send("Oops, couldn't find this group. Here are the groups available to you:\n" + results, done);
            }
          });
        }
      });
    } else if (serverName != null) {
      Server.find(serverName, function(server) {
        if (server != null) {
          return fetchResults({
            q: query,
            system_id: server.id()
          }, done);
        } else {
          msg.send("Could not find server \"" + serverName + "\". Use \"/papertrail servers\" for possible options", done);
        }
      });
    } else {
      fetchResults({
        q: query
      }, done);
    }
  });

  robot.respond(/papertrail groups/, { suggestions: ["papertrail groups"] }, function(msg, done) {
    msg.reply("Fetching papertrail groups...").then(function() {
      Group.fetch(http, function(groups) {
        if (groups.length == 0) {
          msg.send("Oops, couldn't find any Papertrail groups :(", done);
        } else {
          results = [];
          for(var i = 0; i < groups.length; i++) {
            results.push(groups[i].description());
          }
          msg.send(results, done);
        }
      });
    });
  });

  robot.respond(/papertrail group (.*)/, { suggestions: ["papertrail group <group-name>"] }, function(msg, done) {
    var groupName = msg.match[1];
    Group.find(http, groupName, function(group) {
      if (group != null) {
        msg.send([group.description(), "Systems: " + group.systemCount()], done);
      } else {
        msg.send("Could not find group " + groupName, done);
      }
    });
  });

  robot.respond(/papertrail (?:servers|sources|hosts|systems)$/, { suggestions: ["papertrail <servers|sources|hosts|systems>"] }, function(msg, done) {
    msg.reply("Fetching papertrail servers...").then(function() {
      Server.fetch(http, function(servers) {
        if (servers.length == 0) {
          msg.send("Oops, couldn't find any Papertrail servers :(", done);
        } else {
          results = [];
          for(var i = 0; i < servers.length; i++) {
            results.push(servers[i].name());
          }
          msg.send(results, done);
        }
      });
    });
  });

  robot.respond(/papertrail (?:server|source|host|system) (.*)/,  { suggestions: ["papertrail <server|source|host|system> <source-name>"] }, function(msg, done) {
    var serverName;
    serverName = msg.match[1];

    Server.find(http, serverName, function(server) {
      if (server != null) {
        msg.send(server.name(), done);
      } else {
        msg.send("Could not find server " + serverName, done);
      }
    });
  });
};
