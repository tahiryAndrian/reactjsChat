
// call the packages we need
var express    = require('express');        // appell  express
var app        = express();                 // defini express js
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 8088;        //port emploie

var router = express.Router();              //instance express Router

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// logging middleware
router.use(function(req, res, next) {
    console.log('\nReceived:',{url: req.originalUrl, body: req.body, query: req.query});
    next();
});

// Simple'database'
const database = [
  { name: 'Master ', id: 0, users: ['Tahiry'], messages: [{name: 'Tahiry', message: 'Welcome !'}]},
  
  { name: 'Licence ', id: 6, users: ['Angelo'], messages: [{name: 'Angelo', message: 'welcome !'}]}
]


const findRoom = (roomId) => {
  const room = database.find((room) => {
    return room.id === parseInt(roomId)
  })
  if (room === undefined){
    return {error: `a room with id ${roomId} does not exist`}
  }
  return room
}

const logUser = (room, username) => {
  const userNotLogged = !room.users.find((user) => {
    return user === username
  })

  if (userNotLogged) {
    room.users.push(username)
  }
}

// API Routes
router.get('/rooms', function(req, res) {
    const rooms = database.map((room) => {
      return {name: room.name, id: room.id}
    })
    res.json(rooms);
});

router.get('/rooms/:roomId', function(req, res) {
  room = findRoom(req.params.roomId)
  if (room.error) {
    res.json(room)
  } else {
    console.log('Response:',{name: room.name, id: room.id, users: room.users})
    res.json({name: room.name, id: room.id, users: room.users});
  }
})

router.route('/rooms/:roomId/messages')
  .get(function(req, res) {
    room = findRoom(req.params.roomId)
    if (room.error) {
      console.log('Response:',room)
      res.json(room)
    } else {
      console.log('Response:',room.messages)
      res.json(room.messages);
    }
  })
  .post(function(req, res) {
    room = findRoom(req.params.roomId)
    if (room.error) {
      console.log('Response:',room)
      res.json(room)
    } else if (!req.body.name || !req.body.message) {
      console.log('Response:',{error: 'request missing name or message'})
      res.json({error: 'request missing name or message'});
    } else {
      logUser(room, req.body.name)
      room.messages.push({name: req.body.name, message: req.body.message})
      console.log('Response:',{message: 'OK!'})
      res.json({message: 'OK!'});
    }
  })

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`lancer dans le navigateur localhost:${port}`);