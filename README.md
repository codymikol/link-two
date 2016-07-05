# js13kgames game jam server

Project skeleton for js13kgames.com game jam entries in server category. 

## Install

    git clone ...
    cd js13kserver
    npm install

## Test enviroment

    npm start

## Code structure

All your code must be in the public folder. Put your server side code into 
the `server.js` file. The `shared.js` file is loaded at the begining of the
`server.js` file. You can also use this code on the client side.

## Deploy to Heroku

1. Push your files to your GitHub repository
2. Create new WebApp on heroku
3. Connect your WebApp with the GitHub repo
4. Deploy your code 

## Submit your entry

1. Zip all files in the `public` folder.
2. Submit your entry on the [js13kgames.com](http://js13kgames.com) site.
3. Add js13kgames as collaborator to your Heroku app.

## Server category rules

1. Do not touch the `procfile` and the `index.js` file.

## FAQ

1. Can I minify the server side code?
  - Yes, but you have to keep the readable code also.

2. Can I add more npm packages?
  - Yes, but you cannot use them in your game code.
 
3. What files count in the 13kb limit?
  - All files in the `public` folder.

4. Can I deploy new code after I submited the entry?
  - Yes, but you have to resubmit your entry on the site also.

5. Can I modify the `procfile` or the `index.js` file?
  - No
