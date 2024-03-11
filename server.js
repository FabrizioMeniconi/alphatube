'use strict';

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('public'));

//restituisce la data corrente secondo le specifiche del progetto
function thisDate(){
  var data = new Date();
  var h, m, s, d, day, mo, y ;
  var week = ['Sun','Mon','Tue','Wed','Thu','Fry','Sat'];
  var month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  h = data.getUTCHours();
  m = data.getUTCMinutes();
  s = data.getUTCSeconds();
  d = data.getUTCDay();
  day = data.getUTCDate()
  mo = data.getUTCMonth();
  y = data.getUTCFullYear();
  d = week[d];
  mo = month[mo];
  return d + ", " + day + " " + mo + " " + y + ", " + h + ":" + m + ":" + s + " GMT"
}

//restituisce il nome del recommender secondo le specifiche del progetto
function feffa(rec){
  var r;
  switch (rec) {
    case "search":
      r = "Search";
      break;
    case "fVitali":
      r = "Fvitali";
      break;
    case "random":
      r = "Random";
      break;
    case "related":
      r = "Related";
      break;
    case "similarityGenre":
      r = "GenreSimilarity";
      break;
    case "similarityArtist":
      r = "ArtistSimilarity";
      break;
    case "absoluteLocalPopularity":
      r = "LocalPopularity";
      break;
    case "globalPopularity":
      r = "GlobalPopularity";
      break;
    case "recent":
      r  = "Recent";
      break;

  }
  return r
}

//restituisce i dati di popolarità locale secondo le specifiche del progetto
app.get("/globpop", function(req, res){
  fs.readFile('json/watched.json', (err, data) => {
    if (err) throw err;
    let dati = JSON.parse(data);
    let itId;
    if(req._parsedOriginalUrl.query){
      let query = req._parsedOriginalUrl.query;
      if(query.indexOf("=") != -1){
        let it = query.split('=');
        if(it[0] == "id"){
          itId = it[1];
        } else {itId = null;}
      } else {itId = null;}
    } else {itId = null;}

    if(itId){
      var resp = `{
        "site": "site1862.tw.cs.unibo.it",
        "recommender": "${itId}",
        "lastWatched": "${thisDate()}",
        "recommended": []
      }`;
    } else {
      var resp = `{
        "site": "site1862.tw.cs.unibo.it",
        "lastWatched": "${thisDate()}",
        "recommended": []
      }`;
    }

    var response = JSON.parse(resp);
    if(dati.length){
      for(let i in dati){
        var prevReason = feffa(dati[i].prevalentReason);
        var a = `{
          "videoId": "${dati[i].videoId}",
          "timesWatched": ${dati[i].timesWatched},
          "prevalentReason": "${prevReason}",
          "lastSelected": "${dati[i].lastSelected}"
        }`
        var add = JSON.parse(a);
        response.recommended.push(add);
      }
    }
    res.send(response);
  });
})

//gestisce la memorizzazione dei dati sei video visaulizzati e li ordina in base al numero di visualizzazioni
app.post("/", function (req,res){
  fs.readFile('json/watched.json', (err, data) => {
    if (err) throw err;
    let dati = JSON.parse(data);
    let presente = false;
    let video;
    for(let i in dati){
      if(req.body.videoId == dati[i].videoId){
        presente = true;
        video = dati[i];
        video.timesWatched++;
        video.lastSelected = thisDate();
        if(i > 0){
          let min = false, temp = 0;
          while(temp < i && !min) {
            if(dati[temp].timesWatched < video.timesWatched){
              min = true;
            }
            temp++;
          }
          if(min){
            temp--;
            let tt = dati[i];
            dati[i] = dati[temp];
            dati[temp] = tt;
            video = dati[temp];
          }
        }
      }
    }
    if(!presente){
      video = `{"videoId": "${req.body.videoId}",
                "timesWatched": 1,
                "search": 0,
                "fVitali": 0,
                "random": 0,
                "related": 0,
                "recent": 0,
                "similarityGenre": 0,
                "similarityArtist": 0,
                "absoluteLocalPopularity": 0,
                "globalPopularity": 0,
                "prevalentReason": "random",
                "lastSelected": "${thisDate()}",
                "relative": []}`;
      video = JSON.parse(video);
      dati.push(video);
    }
    var reason;
    if (req.body.reason == "listaIniziale"){
      reason = "random";
    } else {if(req.body.reason == "relativeLocalPopularity"){
      reason = "absoluteLocalPopularity";
      } else {
        reason = req.body.reason;
      }
    }
    video[reason]++;
    if(video[reason] >= video[video.prevalentReason]){
      video.prevalentReason =  reason;
    }

    if(req.body.prevVideo != ""){
      let pres = false;
      let vid;
      let v = 0;

      while(dati[v].videoId != req.body.prevVideo){
        v++;
      }

      for(let n in dati[v].relative){
        if(dati[v].relative[n].videoId == req.body.videoId){
          pres = true;
          vid = dati[v].relative[n];
          vid.timesWatched++;
          if(n > 0){
            let min = false, temp = 0;
            while(temp < n && !min) {
              if(dati[v].relative[temp].timesWatched < vid.timesWatched){
                min = true;
              }
              temp++;
            }
            if(min){
              temp--;
              let tt = dati[v].relative[n];
              dati[v].relative[n] = dati[v].relative[temp];
              dati[v].relative[temp] = tt;
              vid = dati[v].relative[temp];
            }
          }
        }
      }
      if(!pres){
        vid = `{"videoId": "${req.body.videoId}",
                "timesWatched": 1}`;
        vid = JSON.parse(vid);
        dati[v].relative.push(vid);
      }
    }
    let fine = JSON.stringify(dati, null, 2);
    fs.writeFileSync('json/watched.json', fine);
  });
})

//restituisce un array di id dei video di popolarità locale già ordinato
app.get("/absoluteLocal", function(req, res){
  fs.readFile('json/watched.json', (err, data) => {
    if (err) throw err;
    let dati = JSON.parse(data);
    if(dati.length){
      var absoluteLocal = new Array();
      for(let i in dati){
        absoluteLocal.push(dati[i].videoId);
      }
      res.send(absoluteLocal);
    }

  });
})

//restituisce lìarray di id dei video di popolarità relativa già ordinato
app.post("/relativeLocal", function(req, res){
  fs.readFile('json/watched.json', (err, data) => {
    if (err) throw err;
    let dati = JSON.parse(data);
    let trovato = false;
    let pos;
    for(let i in dati){
      if(req.body.id == dati[i].videoId && dati[i].relative.length){
        trovato = true;
        pos = i;
      }
    }
    if(trovato){
      var relativeLocal = new Array();
      for(let n in dati[pos].relative){
        relativeLocal.push(dati[pos].relative[n].videoId);
      }
      res.send(relativeLocal);
    }
  });
})

app.listen(1862,function(){
  console.log("Server is listening in port 1862");
})
