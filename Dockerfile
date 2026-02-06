# Minimal test Dockerfile
FROM node:22-alpine

WORKDIR /app

# Create a minimal server that just responds on port 8080
RUN echo 'const http = require("http"); const server = http.createServer((req, res) => { res.writeHead(200); res.end("OK"); }); server.listen(8080, () => console.log("Server running on 8080"));' > server.js

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
