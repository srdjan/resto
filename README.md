RESTO 
==========================

Minimalistic, but feature reach, RESTfull application framework

Hypermedia applications built with RESTO are built declaratively
and emphasize models as 'single source of truth'.
It standardazes on HAL as generic media type and use of metadata 
for finer grained control.

It offers a generic client that doean't know ahead of time what 
behavior it is supposed to exhibit.
Instead, it is smart enough to follow hyperlinks and gather whatever 
information it needs to process any representation.

-Express domain's possible states
-Make actions constrained by states = declare invalid states
-Pattern matching for transitions
-Hypermedia as vehecle to drive through states
-Hypermedia as vehecle to retreive meta
-API uses resource’s URL as its unique identifier, not raw ID.


