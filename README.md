# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)
This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://fastify.dev/docs/latest/).


# Developer's Note
## API
The main api endpoint exposed is `/users`. It is a GET route that accepts query strings as requested. The route parameters include:

- id `String`
- name `String`
- age `Number`
- active `Boolean`
- last_login: `Date` (as per ISO/JIS)
- search_name: `String`

For [example](http://localhost:3000/users?search_name=davi&active=true)

## Docker
I created a dockerfile for the app. You either build the image and run the container, or run the app locally with Node 18+.

## Developing the App
This was my first time using Fastify for a backend framework. I choose so as a challenge to myself, and to learn something new while completing the task. And I'll definitely be looking more into it later.

I kept most of the logic in `/routes/users` for simplicity's sake.

## Caveats
- I used [lunrJS](https://lunrjs.com/) for fuzzy search implementation. Since in this case the users were in a static file, it was acceptable to use it as I did. However, in a production environment, I would build and save/cache the indexes on run or whenever the file is updated, instead of re-building the index on every request.

- I did not get to build a simple frontend to display the data. Instead, you can try this Json-prettifying Chrome [extension](https://chromewebstore.google.com/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh)

- I did not fully cover testing the `last_login` date input with all date formats. I'm assuming it matches `YYYY-MM-DD`.

- The user schema maps & validates the given query strings. However, it will not return a `400 Bad Request` if more fields than expected are passed. It will simply ignore them.
