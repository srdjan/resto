RESThyper -- RESThyper.com
==========================

Minimalistic, but feature reach, RESTfull application framework

Hypermedia applications built with 'restHyper' are built declaratively
and emphasize models as 'single source of truth'.
It generalizes over resources, over Media Type processing code
and over the internal workings of our RESTful client.
It tandardazes on HAL as generic media type and use metatdata for finer grained control.

We offer a client that doean't know ahead of time what behavior it is supposed to exhibit.
Instead, all of its behavior is learned dynamicaly, by referencing hyperlinks (actions) and
metadata (display, interaction, validation), that is - it is smart enough to follow hyperlinks
and gather whatever information it needs to process any representation.

-Express domain's possible states
-Make actions constrained by states = declare invalid states
-Pattern matching for transitions
-Hypermedia as vehecle to drive through states
-Hypermedia as vehecle to retreive meta
-API uses resource’s URL as its unique identifier, not raw ID.


-Entity m2m Resource
-Resource 12m Representation
-Content-Type 12m Representation

metadata endpoint:
GET /users
=>
200 OK
Content-Type: application/hal+json
Content-Length: xxx
{
  "_links": {
      "self": {
        "href": "/api/users" //-> using /api/todos/meta to get current metadata for users
      }
    },
    "name" : "Dr Who"
    "address" : {
      "street" : "101 Restful way",
      "city" : "Down Hill",
      "country" : "LaLa Land"
    }
}

-----------------------------------------------------------------------
Author: Srdjan Strbanovic (@djidja8)
Copyright (c) 2014 Srdjan Strbanovic.
License MIT
