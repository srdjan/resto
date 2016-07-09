RESTO POC (alpha)
==========================

Minimalistic, experimatal RESTfull application framework

[List of forks] (https://github.com/srdjan/resto/network/members)

To run the example:
- clone git repo: 
   git clone https://github.com/Srdjan/resto.git

- goto resto folder
    cd resto

- run
    npm install
    npm buidl

- run build script
    build // on windows
    ./build.sh // on linux/OSX

- navigate to ./examples/apple-farm

- run: node app.js

- in the browser, open: localhost:8080/
- in the 'Explorer' entry field type: /api/apples, and follow the links

JSON format for 'Create':
    {
      "weight": 10,
      "color": "red"
    }

JSON format for 'Grow':
    {
      "weightIncr": 120,
    }

...
