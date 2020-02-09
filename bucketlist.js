//Require the express package and use express.Router() - hi
const express = require('express');
const https = require('https');
const router = express.Router();
const bucketlist = require('../models/List');
const mongoose = require('mongoose');

//GET HTTP method to /bucketlist
router.get('/',(req,res) => {
    bucketlist.getAllLists((err, lists)=> {
        if(err) {
            res.json({success:false, message: `Failed to load all lists. Error: ${err}`});
        }
        else {
            res.write(JSON.stringify({success: true, lists:lists},null,2));
            res.end();
			console.log("Response sent" + JSON.stringify({success: true, lists:lists},null,2));

    }
    });
});

//POST HTTP method to /bucketlist


router.post('/', (req,res,next) => {
	
console.log('GameID: ' + req.body.GameID);

var URL = 'https://stats.nba.com/js/data/boxscorebreakdowns/2020/boxscore_breakdown_' + req.body.GameID + '.json';

console.log('URL: ' + URL);

https.get(URL, (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    var i;
	var body = JSON.parse(data);
for (i=0; i < body.results.length; i++){
        console.log(body.results[i].GameID + ' : ' + body.results[i].HomeTeam.teamName + ' : ' + body.results[i].VisitorTeam.teamName);
		
		 let newList = new bucketlist({
        GameID: body.results[i].GameID,
        Breakdown: body.results[i].Breakdown,
		HomeTeam: body.results[i].HomeTeam.teamName,
		VisitorTeam: body.results[i].VisitorTeam.teamName
    });
console.log('GID: ' + body.results[i].GameID);
bucketlist.addList(newList,(err, list) => {
     //   if(err) {
     //       res.json({success: false, message: `Failed to create a new list. Error: ${err}`});

     //   }
     //   else
    //        res.json({success:true, message: "Added successfully."});
		console.log('GID: Added' + JSON.stringify(list));

    });
   }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});


res.json({success:true, message: "Added successfully."});

});

//DELETE HTTP method to /bucketlist. Here, we pass in a param which is the object id.

router.delete('/:id', (req,res,next)=> {
  //access the parameter which is the id of the item to be deleted
    let id = req.params.id;
  //Call the model method deleteListById
    bucketlist.deleteListById(id,(err,list) => {
        if(err) {
            res.json({success:false, message: `Failed to delete the list. Error: ${err}`});
        }
        else if(list) {
            res.json({success:true, message: "Deleted successfully"});
        }
        else
            res.json({success:false});
    })
});

module.exports = router;
