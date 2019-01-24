var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('users', { 
      title: 'users',
  });
});
router.get('/uChannel/:id', function(req, res, next) {
  res.render(`./userChannel/channel`, { 
      chName : `channel0${req.params.id}`
  });
});

module.exports = router;



/*module.exports = (io)=>{
    const app = require('express');
    const router = app.Router();
    io.on('connection', (socket)=>{
        console.log('connect');
    })
    router.get('/', function(req, res, next) {
      res.send('respond with a resource');
    });
    
    return router;
}*/
