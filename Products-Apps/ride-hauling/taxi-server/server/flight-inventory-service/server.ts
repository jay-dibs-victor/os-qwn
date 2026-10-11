import http from 'http';
import app from './App';

const port = process.env.PORT || 12003;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);

server.on('listening', () => {
  console.log(`Flight Inventory Service listening on port ${port}`);
});
