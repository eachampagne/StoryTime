# StoryTime

Do you have an interest in collaborative storytelling? Do you want to spark your creativity for writing?
## About The Project
Give Storytime a try! Storytime is a collaborative storytelling app that empowers you to set your imagination free while sharing
inspiration with others. Our app prompts you with words to spark your creativity when you are starting a new story, and then allows
others to pick up the story from wherever you left off. The app is designed to allow users to create, share, and enjoy stories with ease.
Whether you are a seasoned writer or just looking to share your thoughts and ideas, this app can make your storytelling experience
enjoyable and engaging.

Storytime offers four primary user-facing features:

**Creating a New Story**
To encourage creative writing, Storytime prompts users with 5 randomly selected words to use in their new story. Each newly written story is
posted to the feed on the homepage where the community votes on which stories they found to be the most interesting. Every hour, on the hour,
the story with the most upvotes is displayed at the top of the page and becomes the current "canon".

**Collaborating On an Existing Story**
Any user can add to the current "canon" story, their addition will also appear in the feed to be voted on and potentially become "canon". This
is the heart of Storytime: allowing users to collaborate with one another, and collectively decide where the story is going next.

**Badges and Awards** - When a story ends, different badges will be sent out to users that accomplished the best in certain categories Like ‘Most Overall Likes’, ‘Most Contributions’, ‘Most Matched Words’. Their Badges will appear in their user profile. Depending how many badges they have collected will determine the style of their badge.

**Upvote** - A system for users to increment and decrement the like count of responses to other users responses to Story. The response with the most likes are added to the main story and the others are added to the users profile page.



### Built With

* React-Hooks
* DayJs
* Trello
* Google Auth (Passport)
* Express
* Socket IO
* Mysql
* Axios
* Sequelize
* Babel
* Webpack
* API: https://random-word-api
* Greenfield hosted with AWS ec2
* Legacy hosted with Microsoft Azure Virtual Machine

### Contributors

* [@NasthiaVillavicencio] (https://github.com/nasthia861)
* [@DarrylMcdonald] (https://github.com/ddmcdona06)
* [@DejuanEllsworth] (https://github.com/yeauxdejuan)
* [@LoganYoung] (https://github.com/lyoun318)
* [@AJBell] (https://github.com/abell10101)

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```
  npm install npm@latest -g
  ```
* mySQL
  ```
  Mac: brew install mysql
  Windows: sudo apt install mysql-server
  ```

### Installation

1. Clone the repo
   ```
   git clone 'https://github.com/Dev-Dawgz/Greenfield.git'
   ```
2. Install NPM packages
   ```
   npm install
   ```
3. Run build
   ```
   npm run build:dev
   ```
4. Start Mysql
   ```
   Mac: mysql.start server
   Windows: sudo service mysql start
   ```
5. Create Database
   ```
    mysql -uroot
    create database stories;
   ```
6. Start server
   ```
   npm start
   ```

### Environment Variables

The random words API does not require an API key, so (as of now) there is no sensitive data in the .env file.

* USE_LIVE_DATA - toggles whether the server generates new prompts by querying the API, or by using the data in /server/data.js.
* MS_BETWEEN_PROMPTS - sets the time for a single round in milliseconds. 20000-30000 (20-30 s) is good for testing, but in production this should probably be on the order of an hour (3600000 ms).

### Architecture

See [websocket and architecture README](README-architecture.md).

### BUGS

* After logging in, on reload user becomes logged out and has to log back in to experience app functionality.
* If user is eligible for more than one badge, they just receive one instead of multiple.
* User can upvote/downvote more than once.
* Sometimes the Timer gets out of sync from when the round and story ends.


### Contributing

1. Fork the Project
2. Create your Temp Branch (`git checkout -b TempBranch`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


