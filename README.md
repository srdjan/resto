resto
=====

Minimalistic RESTfull application framework


Express domain's possible states
Make actions constrained by states = declare invalid states
Pattern matching for transitions
Hypermedia as vehecle to drive through states
API uses resource’s URL as its unique identifier, not raw ID.

Question of metadata - read docs here or use this metadata here?

I preffer it this way:

GET /address/99
=> 200 OK
Content-Type: application/json/hal+
Content-Length: 508

{
  "_meta" : {
    "href" : "domain/pplication/vnd.gabba.berg"
  },
  "_links" : {
    "href" : "..."
  },
  "address" : {
    "street" : "1 youville way",
    "city" : "Mysteryville",
    "postcode" : "H3P 2Z9",
    "country" : "Canada"
  }
}

Licence ???
Copyright (c) 2014 Srdjan Strbanovic.
Released under the ??? licence.
