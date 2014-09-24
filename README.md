RESThyper -- RESThyper.com
==========================

Minimalistic RESTfull application framework

Hypermedia applications built with 'restHyper' are built declaratively and emphasize models
as 'single source of truth'.

We generalize over resources, over Media Type processing code
and over the internal workings of our RESTful client.

We standardaze on HAL as generic media type and use metatdata for finer grained control.

We offer a client that doean't know ahead of time what behavior it is supposed to exhibit.
Instead, all of its behavior is learned by referencing hyperlinks (actions) and
metadata (display, interaction, validation), that is - it is smart enough to follow hyperlinks
and gather whatever information it needs to dynamically process any representation.

-Express domain's possible states
-Make actions constrained by states = declare invalid states
-Pattern matching for transitions
-Hypermedia as vehecle to drive through states
-Hypermedia as vehecle to retreive meta
-API uses resource’s URL as its unique identifier, not raw ID.


  Entity m2m Resource
  Resource 12m Representation
  Content-Type 12m Representation
Off-topic: Content-Type vs Media-Type

Can anyone shed some light on the differences, if any?

I tend to take Content-Type as referring to the HTTP header, and thus it can be
application/json; charset=utf-8, while Media-Type refers to the {type, subtype}
tuple alone, without the parameters - application/json. That's what you see in a
couple of places as well. But if you take a quick look at the HTTP grammar though,
you can clearly see that's an opinionated definition.



Question of metadata - read docs here or use this metadata here?
this way?:

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
