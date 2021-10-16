const http = require("http");
const port = process.env.PORT || 3000;

const requestHandler = (request, response) => {
    console.log(request.url);
    response.end(`Hello Node.js Server! - ${new Date().toISOString()}`);
}

const server =  http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        console.error('Something bad happened', err);
        process.exit(1);
    }

    console.log(`Server listening on http://localhost:${port}`);
})