
function recommenderIniziale(event) {
  $('#listaIniziale').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
  $.get('http://site1825.tw.cs.unibo.it/video.json').done((data)=>{
    if(window.location.hash){
      video.setVideo(window.location.hash.substring(1));
    } else {
      let i = Math.floor(Math.random() * 119);
      video.setVideo(data[i]['videoID']);
    }
    video.setRecommender('listaIniziale');
    player.loadVideoById(video.thisVideo());
    let lista = data;
    let init = "<h3>Lista Iniziale</h3><h5>In questa lista si trovano un serie di video con cui è possibile iniziare la navigazione</h5>";
    $('#listaIniziale').html(init);
    for(let k in lista){
      let urll = videoQuery + lista[k].videoID;
      mostraRecommender(urll,'listaIniziale');
    }
    if($('#listaIniziale').html() == init){$('#listaIniziale').append("<p>Nessun elemento ancora disponiblile...</p>");}
    mostraCommenti();
    mostraInfo();
  });
}


function recommenderFVitali(){
  if($('#fVitali').text() == "."){
    $('#fVitali').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    $.get('http://site1825.tw.cs.unibo.it/TW/globpop').done((data)=>{
      let lista = data.recommended;
      let urll = videoQuery;
      for(let k in lista){
        urll = urll + lista[k].videoID + ",";
    }
      urll = urll.substring(0, urll.length - 1);
      mostraRecommender(urll,'fVitali');
    });
  }
}


function recommenderSearch(richiesta){
  if(richiesta){
    $('#search').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    var searchUrl = searchQuery + "&maxResults=30&q=" + richiesta;
    $.get(searchUrl).done((data)=>{
      let urll = videoQuery;
      $.each(data.items, function(index, element) {
        urll = urll + element.id.videoId + ",";
      });
      urll = urll.substring(0, urll.length - 1);
      mostraRecommender(urll,'search');
      jQuery('#search-tab').trigger('click');
      scroll_to('#recommenderTab');
      $('#formText').val("");
    });
  }
}

function recommenderRelated(){
  if($('#related').text() == "."){
    $('#related').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    let relatedUrll = searchQuery + "&maxResults=30&relatedToVideoId=" + video.thisVideo();
    $.get(relatedUrll).done((data)=>{
      let urll = videoQuery;
      $.each(data.items, function(index, element) {
        urll = urll + element.id.videoId + ",";
      });
      urll = urll.substring(0, urll.length - 1);
      mostraRecommender(urll,'related');
    });
  }
}

function recommenderRandom(){
  if($('#random').text() == "."){
    $('#random').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    let arr = ['christian music', 'classical music', 'country music', 'electronic music', 'hip hop', 'indipendent music', 'jazz', 'asian music', 'latin america music', 'pop music', 'reggae', 'blues', 'rock', 'soul', 'heavy metal', 'trap music', 'rap'];
    var ids = new Array();
    var count = 0;
    for(let n = 0; n < 20; n++){
      let num = (Math.floor(Math.random() * 17));
      let urll = searchQuery + "&maxResults=50&topicId=/m/04rlf&q=" + arr[num];
      $.get(urll).done((data)=>{
        let nn = (Math.floor(Math.random() * 50));
        while(ids.indexOf(data.items[nn].id.videoId) != -1){
          nn = (Math.floor(Math.random() * 50));
        }
        data.items[nn].id.videoId;
        ids.push(data.items[nn].id.videoId);
        count++;
      });
    }
    var interval = setInterval(all, 1000);
    function all(){
      if(count == 20){
        clearInterval(interval);
        let b = ids.join(",");
        let url = videoQuery + b;
        mostraRecommender(url,'random');
      }
    }
  }
}


function recommenderSimilarityArtist(){
  if($('#similarityArtist').text() == "."){
    $('#similarityArtist').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    if(video.thisArtist()){
      var title = "";
      if(video.thisTitle()){
        title = video.thisTitle().toLowerCase();
      } else {
        if(video.thisArtist().toLowerCase() != video.thisSecondTitle().toLowerCase()){
          title = video.thisSecondTitle().toLowerCase();
        } else {
          if(video.thisArtist().toLowerCase() != video.thisThirdTitle().toLowerCase()){
            title = video.thisSecondTitle().toLowerCase();
          }
        }
      }
      if(title){
        let url = searchQuery + "&maxResults=50&topicId=/m/04rlf&q=" + video.thisArtist();
        $.get(url).done((data)=>{
          var n = 0, v, videoTitle, urll = videoQuery;
          $.each(data.items, function(index, element) {
            if(n<30){
              videoTitle = element.snippet.title.toLowerCase();
              if(videoTitle.indexOf(title) == -1){
                urll = urll + element.id.videoId + ",";
                n++;
              }
            }

          });
          urll = urll.substring(0, urll.length - 1);
          mostraRecommender(urll,'similarityArtist');
        });
      } else {
        mostraRecommender(videoQuery,'similarityArtist');
      }
    } else {
      mostraRecommender(videoQuery,'similarityArtist');
    }
  }
}


function recommenderSimilarityGenre(){
  if($('#similarityGenre').text() == "."){
    $('#similarityGenre').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    if(video.thisGenre() && video.thisArtist()){
      var genere = video.thisGenre().toLowerCase();
      var topic = "";
      if(genere.indexOf('christian') != -1){ topic = topic + "/m/02mscn,"; }
      if(genere.indexOf('classical') != -1){ topic = topic + "/m/0ggq0m,"; }
      if(genere.indexOf('country') != -1){ topic = topic + "/m/01lyv,"; }
      if(genere.indexOf('electronic') != -1){ topic = topic + "/m/02lkt,"; }
      if(genere.indexOf('hip hop') != -1){ topic = topic + "/m/0glt670,"; }
      if(genere.indexOf('indipendent') != -1){ topic = topic + "/m/05rwpb,"; }
      if(genere.indexOf('jazz') != -1){ topic = topic + "/m/03_d0,"; }
      if(genere.indexOf('asia') != -1){ topic = topic + "/m/028sqc,"; }
      if(genere.indexOf('latin america') != -1){ topic = topic + "/m/0g293,"; }
      if(genere.indexOf('pop') != -1){ topic = topic + "/m/064t9,"; }
      if(genere.indexOf('reggae') != -1){ topic = topic + "/m/06cqb,"; }
      if(genere.indexOf('blues') != -1){ topic = topic + "/m/06j6l,"; }
      if(genere.indexOf('rock') != -1){ topic = topic + "/m/06by7,"; }
      if(genere.indexOf('soul') != -1){ topic = topic + "/m/0gywn,"; }
      if(topic == ""){ topic = "/m/04rlf"}
      var urlll = searchQuery + "&maxResults=30&topicId=" + topic + "&q=";
      var genreUrl = creaGenreUrl(video.thisDbArtist());
      $.get(genreUrl).done((data)=>{
        if(data.results.bindings.length){
          let j = 30 / data.results.bindings.length;
          let dati = data.results.bindings;
          let jj = 0;
          let idss = "";
          $.each(dati, function(index, element) {
            let url = urlll + element.artist.value;
              $.get(url).done((d)=>{
                for(let g = 0; g < j; g++){
                  let artist = video.thisArtist().toLowerCase();
                  let videoTitle = d.items[g].snippet.title.toLowerCase();
                  let videoChannel = d.items[g].snippet.channelId.toLowerCase();
                  if(videoTitle.indexOf(artist) == -1 && videoChannel.indexOf(artist) == -1){
                    idss = idss + d.items[g].id.videoId + ",";
                  }
                }
                jj++;
              });
          });
          var interval = setInterval(all, 1000);
          function all(){

            if(jj == dati.length){
              clearInterval(interval);
              var url = videoQuery + idss;
              mostraRecommender(url, 'similarityGenre');
            }
          }
        } else {
          urlll = urlll + video.thisGenre();
          $.get(urlll).done((data)=>{
            var n = 0, v, artist, videoTitle, videoChannel, urll = videoQuery;
            $.each(data.items, function(index, element) {
              artist = video.thisArtist().toLowerCase();
              videoTitle = element.snippet.title.toLowerCase();
              videoChannel = element.snippet.channelId.toLowerCase();
              if(videoTitle.indexOf(artist) == -1 && videoChannel.indexOf(artist) == -1){
                urll = urll + element.id.videoId + ",";
                n++;
              }
            });
            mostraRecommender(urll,'similarityGenre');
          });
        }
      });
    } else {
      mostraRecommender(videoQuery,'similarityGenre');
    }
  }
}

//crea la query per il recommender similarityGenre
function creaGenreUrl(titolo){
  let resource = "<http://dbpedia.org/resource/" + titolo + ">";
  let query = `SELECT distinct ?artist WHERE {
    {${resource} dbo:associatedBand ?a.}
    UNION {${resource} dbo:associatedMusicalArtist ?a.}
    ?a rdfs:label ?artist.
    FILTER(langMatches(lang(?artist),'en')).}
    LIMIT 30`;
  var queryUrl = dbpedia + encodeURIComponent(query) + "&format=json";
  return queryUrl;
}

function recommenderRecent(){
  if($('#recent').text() == "."){
    $('#recent').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    var recent = video.getRecent();
    let url = videoQuery + recent.join(",");
    mostraRecommender(url, 'recent');
  }
}

function recommenderAbsoluteLocalPopularity(){
  if($('#absoluteLocalPopularity').text() == "."){
    $('#absoluteLocalPopularity').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    $.get("/absoluteLocal").done((data)=>{
      if(data.length){
        let url = videoQuery;
        for(let y = 0; y < 30; y++){
          url = url + data[y] + ",";
        }
        mostraRecommender(url, 'absoluteLocalPopularity');
      } else {
        mostraRecommender(videoQuery, 'absoluteLocalPopularity');
      }
    });
  }
}

function recommenderRelativeLocalPopularity(){
  if($('#relativeLocalPopularity').text() == "."){
    $('#relativeLocalPopularity').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    $.post('/relativeLocal',{
		    'id': video.thisVideo()
	     }).done((data)=>{
         if(data.length){
           let url = videoQuery;
           for(let y = 0; y < 30; y++){
             url = url + data[y] + ",";
           }
           mostraRecommender(url, 'relativeLocalPopularity');
         } else {
           mostraRecommender(videoQuery, 'relativeLocalPopularity');
         }
    });
  }
}


function recommenderGlobalPopularity(){
  if($('#globalPopularity').text() == "."){
    $('#globalPopularity').html("<img src='img/loading.gif' class='loading-gif'/><h3>Loading...</h3>Please wait.");
    var projects = [25,29,28,38,39,46,22,47,31,27,48,24,30,36,50,49,51,61,23,63,34];
    var globalPop = new Array();
    let done = 0;
    for(let i in projects){
      var urll = `https://cors-anywhere.herokuapp.com/site18${projects[i]}.tw.cs.unibo.it/globpop?id=${video.thisVideo()}`;
      $.ajax({
			url: urll,
			success: function(data){
        if(trova(indexArray(data),'recommended')){
          let dati = data.recommended;
          if(dati.length){
            var localPop = new Array();
            for(let n in dati){
              if(trova(indexArray(dati[n]),'videoId')){
                var v = `{
                  "videoId": "${dati[n].videoId}",
                  "timesWatched": "${dati[n].timesWatched}"
                }`;
                var vid = JSON.parse(v);
                localPop.push(vid);
              } else{if(trova(indexArray(dati[n]),'videoID')) {
                var v = `{
                  "videoId": "${dati[n].videoID}",
                  "timesWatched": "${dati[n].timesWatched}"
                }`;

                var vid = JSON.parse(v);
                localPop.push(vid);
              }}
            }
            var prog = new Prog(localPop);
            globalPop.push(prog);
          }
        }
        done++;
      },
			error: function(err){
				done++;
			}
		});
    }
    var interval = setInterval(all, 1000);
    function all(){

      if(done == projects.length){
        clearInterval(interval);
        let res = vidSort(globalPop);
        var url = videoQuery + res.join(",");
        mostraRecommender(url, 'globalPopularity');
      }
    }

  }
}
//oggetto ausiliare per il recommender global popularity
Prog = function (pop){
  this.num = 0;
  this.pop = pop;
}
//si occupa di gestire e ordinare tutte le informazione provenienti dagli altri progetti
function vidSort(globalPop){
  var res = new Array();
  var max = 0;
  var maxPos;
  for(let i = 0; i < 30; i++){
    for(let n in globalPop){
      let a = globalPop[n].num;
      if(globalPop[n].pop[a].timesWatched > max && res.indexOf(globalPop[n].pop[a].videoId) == -1){
        max = globalPop[n].pop[a].timesWatched;
        maxPos = n;
      }
    }
    let b = globalPop[maxPos].num;
    res.push(globalPop[maxPos].pop[b].videoId);
    globalPop[maxPos].num ++;
    max = 0;
  }
  return res;
}
