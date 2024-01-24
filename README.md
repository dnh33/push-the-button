# Push the Button Minigame with Panda Wallet Integration 🎮

This project is a template for a fun and interactive minigame where players can push a button to increase their score. It's integrated with Panda Wallet for user authentication and uses an SQLite database to store scores.

This project is dedicated to Joefroobs 🦧 (@joefroobs).

## Tech Stack 🛠️

-   HTML, CSS, JavaScript
-   [Panda Wallet](https://panda-wallet.gitbook.io/provider-api/quick-start/getting-started)
-   [Express.js](https://expressjs.com/)
-   [SQLite](https://www.sqlite.org/index.html)

## Getting Started 🚀

1. Clone the repository to your local machine.
2. Run `npm install` to install the necessary packages.
3. Remove the existing game.db, and create a new file with the same name
4. Start the server with `node server.js`.

The Express server will serve the website files from the `/public` directory.

## Hosting Your Express.js Powered Web App on Glitch (1000 hours free tier)

Hosting your Express.js powered web app on Glitch is a straightforward process. This platform is ideal for beginners due to its simplicity and ease of use. Follow these steps to host your web app:

1. **Create a Glitch Account**: Visit [Glitch](https://glitch.com/) and sign up for a free account.

2. **Import Your Project**: After signing in, click on `New Project` > `Import from GitHub`. Enter the URL of your GitHub repository where your Express.js project is hosted.

3. **Configure Your Project**: Once your project is imported, you can edit the project files directly in your browser. Ensure your project has a `package.json` file, which lists all the dependencies your project needs to run.

4. **Start Your App**: Click on `Tools` > `Terminal` to open the terminal in your Glitch editor. Run `node server.js` to start your app and apply any changes you made.

5. **Access Your App**: Your app is now running and can be accessed via the URL provided by Glitch, which is displayed at the top of your screen.

Please note that Glitch has some limitations. The starter plan only offers 1000 "project hours" per month, which is reset monthly. This is used when you're actively editing the site or if someone is accessing it. If no one is accessing or editing the site it will sleep. The starter plan environment has a limited amount of container RAM and storage space. Custom domains are not well supported (at time of writing). However, considering that a typical Express.js application runs continuously and does not consume much CPU or memory, 1000 project hours should be more than sufficient to run your app for free every month.

## Happy Hacking! 💻

Feel free to explore the codebase and make any modifications you like. Happy hacking!

## License 📄

This project is licensed under the GPL-3 License. See the `LICENSE` file for details.
