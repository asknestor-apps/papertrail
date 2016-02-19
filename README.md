## Nestorbot App for Papertrail

A collection of nestorbot scripts from your friendly folks at Papertrail.

Includes support for:

- [Papertrail](https://papertrailapp.com/). Run "help papertrail" for a list of commands

### Installation
Obtain the Papertrail API Token from the [account page](https://papertrailapp.com/account/profile)

and set it in Slack with the command `setenv NESTOR_PAPERTRAIL_API_TOKEN=nestor-papertrail-api-token`


### Usage

Basic querying with "log me" or "papertrail me"

```
nestorbot log me 127.0.0.1
nestorbot papertrail me 127.0.0.1
```

Limit to a group:

```
nestorbot log me group=redis -"saved on disk"
```

Limit to a host:

```
nestorbot log me host=worker1
```


### TODO

- create list

### License

See LICENSE file.

Copyright (c) 2014 Papertrail Inc.
