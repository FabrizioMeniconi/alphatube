//url per esegure query su youtube o dbpedia
var videoQuery = "https://www.googleapis.com/youtube/v3/videos?key=AIzaSyAk8VSun9ROa8gpvTTcV1wc7IpybXk0Bvg&part=snippet,statistics,contentDetails&fields=items(id,snippet(title,description,thumbnails(medium(url)),channelTitle),contentDetails(duration),statistics)&id=";
var searchQuery = "https://www.googleapis.com/youtube/v3/search?key=AIzaSyAk8VSun9ROa8gpvTTcV1wc7IpybXk0Bvg&part=id,snippet&fields=items(id,snippet(title, channelId))&type=video";
var commentQuery = "https://www.googleapis.com/youtube/v3/commentThreads?key=AIzaSyAk8VSun9ROa8gpvTTcV1wc7IpybXk0Bvg&part=snippet&fields=items(snippet(topLevelComment(snippet(authorDisplayName,authorProfileImageUrl,authorChannelUrl,textDisplay,likeCount))))&videoId=";
var dbpedia = "http://dbpedia.org/sparql?query=";
var wikipedia = "https://it.wikipedia.org/wiki/";

//si occupa della visualizzazione su schermo dei recommender
function mostraRecommender(urll, scopo){
  var destinazione;
  var list;
  let init;
  switch(scopo) {
    case "listaIniziale":
      destinazione = $('#listaIniziale');
      list = "recIniziale";
      break;
    case "fVitali":
      destinazione = $('#fVitali');
      list = "recfVitali";
      init = "<h3>Recommender Fabio Vitali</h3><h5>Questi sono i video trovati nel recommender del docente</h5>";
      break;
    case "search":
      destinazione = $('#search');
      list = "recSearch";
      init = "<h3>Risultati ricerca</h3><h5>La tua ultima ricerca ha dato i seguenti risultati</h5>";
      break;
    case "related":
      destinazione = $('#related');
      list = "recRelated";
      init = "<h3>Lista Related</h3><h5>Questa lista contiene i video correlati di YouTube al video corrente</h5>";
      break;
    case "random":
      destinazione = $('#random');
      list = "recRandom";
      init = "<h3>Lista Random</h3><h5>Questa lista constiene video casuali</h5>";
      break;
    case "similarityArtist":
      destinazione = $('#similarityArtist');
      list = "recSimilarityArtist";
      init = "<h3>Similarity Artist</h3><h5>Altro da questo artista...</h5>";
      break;
    case "similarityGenre":
      destinazione = $('#similarityGenre');
      list = "recSimilarityGenre";
      init = "<h3>Similarity Genre</h3><h5>Altri video su questo genere musicale...</h5>";
      break;
    case "recent":
      destinazione = $('#recent');
      list = "recRecent";
      init = "<h3>Recent</h3><h5>Lista dei video che hai visualizzato recentemente</h5>";
      break;
    case "absoluteLocalPopularity":
      destinazione = $('#absoluteLocalPopularity');
      list = "recAbsoluteLocalPopularity";
      init = "<h3>Popolarità Locale Assoluta</h3><h5>Lista dei video più popolari di questo progetto</h5>";
      break;
    case "relativeLocalPopularity":
      destinazione = $('#relativeLocalPopularity');
      list = "recRelativeLocalPopularity";
      init = "<h3>Popolarità Locale Relativa</h3><h5>Lista dei video più visti dopo quello che stai visitando ora dagli utenti di questo progetto</h5>";
      break;
    case "globalPopularity":
      destinazione = $('#globalPopularity');
      list = "recGlobalPopularity";
      init = "<h3>Popolarità Globale</h3><h5>Lista dei video più popolari di tutti i progetti del corso</h5>";
      break;
  }
  if(scopo != "listaIniziale"){destinazione.html(init);}
  $.get(urll).done((data)=>{
    if(data.items.length > 0){
      let dati = data.items;
      destinazione.append(`<div class='list-group' id='${list}'></div>`);
      $.each(dati, function(index, element) {
        let immagine = element.snippet.thumbnails.medium.url;
        let sx = `<div class='col-4'><img src='${immagine}'></div>`;
        let dx = `<div class='col-8'><h4>${element.snippet.title}</h4><p>${element.snippet.channelTitle}</p><p>Visualizzazioni: ${element.statistics.viewCount} </p><p>Suggerito tramite: ${scopo} </p></div>`
        destinazione.append(`<div class='list-group-item' onclick="video.load('${scopo}', '${element.id}')"><div class='row'> ${sx} ${dx} </div></div>`);
      });
      destinazione.append("</div>");
    }
    if(scopo != "listaIniziale"){
      if(destinazione.html() == init){
        destinazione.append("<p>Nessun elemento ancora disponiblile...</p>");
      }
    }
  });
}

//si occupa della visualizzazione su schermo dei commenti
function mostraCommenti(){
  let urll = commentQuery + video.thisVideo();
  $.get(urll).done((data)=>{
      var bo = data.items;
      $.each(bo, function(index, element) {
        let datic = element.snippet.topLevelComment.snippet;
        let sx = `<div class='col-2'><img src='${datic.authorProfileImageUrl}' width='50' height='50'></div>`;
        let dx = `<div class='col-10'><h6><a href='${datic.authorChannelUrl}'> ${datic.authorDisplayName } </a></h6><p>${datic.textDisplay}</p> <i class='fa fa-thumbs-up'> ${datic.likeCount} </i> <i class='fa fa-thumbs-down'> 0 </i></div>`;
        $('#comments').append("<div class='comm'><div class='row'>" + sx + dx + "</div></div>");
      });
      video.commentOk();
      video.pageOk();
  });
}

// si occupa della visualizzazione su schermo di tutta l'area info
function mostraInfo() {
  let urll = videoQuery + video.thisVideo();
  $.get(urll).done((data)=>{
    $('#info-video').html("<h4>Informazioni sul video</h4>");
    $('#info-video').append(`<h6>Titolo Video : </h6><p>${data.items[0].snippet.title} </p>`);
    $('#info-video').append(`<h6>Codice Youtube : </h6><p>${video.thisVideo()} </p>`);
    $('#info-video').append(`<h6>Canale : </h6><p>${data.items[0].snippet.channelTitle} </p>`);
    $('#info-video').append(`<h6>Statistiche : </h6><p> ${data.items[0].statistics.viewCount} visual <i class='fa fa-thumbs-up'> ${data.items[0].statistics.likeCount} </i> <i class='fa fa-thumbs-down'> ${data.items[0].statistics.dislikeCount}  </i> </p>`);
    $('#info-video').append(`<h6>Descrizione Youtube : </h6><p>${data.items[0].snippet.description} </p>`);
    var res= getTitle(data.items[0].snippet.title, data.items[0].snippet.channelTitle );
    video.setSecondaryTitle(res[4],res[9]);
    var dbUrl0 = creaUrl(res[0]);
    var dbUrl1 = creaUrl(res[1]);
    var dbUrl2 = creaUrl(res[2]);
    var dbUrl3 = creaUrl(res[3]);
    var dbUrl4 = creaUrl(res[4]);
    var dbUrl5 = creaUrl(res[5]);
    var dbUrl6 = creaUrl(res[6]);
    var dbUrl7 = creaUrl(res[7]);
    var dbUrl8 = creaUrl(res[8]);
    var dbUrl9 = creaUrl(res[9]);
    mostraWiki(dbUrl0, dbUrl1, dbUrl2, dbUrl3, dbUrl4, 0);
    mostraWiki(dbUrl5, dbUrl6, dbUrl7, dbUrl8, dbUrl9, 1);
    video.infoOk();
    video.pageOk();
  });
}

//prova 5 query diverse a dbpedia cercando informazioni
function mostraWiki(dbUrl0, dbUrl1, dbUrl2, dbUrl3, dbUrl4, n){
  $.get(dbUrl0).done((data)=>{
    let dati = data.results.bindings;
    if(dati.length){ wiki(dati); }else{
      $.get(dbUrl1).done((data)=>{
        let dati = data.results.bindings;
        if(dati.length){ wiki(dati); }else{
          $.get(dbUrl2).done((data)=>{
            let dati = data.results.bindings;
            if(dati.length){ wiki(dati); }else{
              $.get(dbUrl3).done((data)=>{
                let dati = data.results.bindings;
                if(dati.length){wiki(dati); }else{
                  $.get(dbUrl4).done((data)=>{
                    let dati = data.results.bindings;
                    if(dati.length){
                      wiki(dati);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    if(n){
      video.wikiOk();
      video.pageOk();
    }
  });
}

//si occupa della visualizzazione sullo schermo della sezione wiki e categorizza de informazioni salvandole nel videoplayer
function wiki(dati){
  let index = indexArray(dati[0]);
  if(trova(index,'release') || trova(index,'album') || trova(index,'artist')){
    $('#titoloCanzone').html(`<a href="${wikipedia}${dati[0].label.value}">${dati[0].label.value}</a>`);
    video.setTitle(dati[0].label.value);
    $('#descCanzone').html(dati[0].abstract.value);
    if(trova(index,'release')){$('#dataCanzone').html(`<a href="${wikipedia}${dati[0].release.value}">${dati[0].release.value}</a>`);}
    if(trova(index,'album')){$('#titoloAlbum').html(`<a href="${wikipedia}${dati[0].album.value}">${dati[0].album.value}</a>`);}
    if(trova(index,'albumDesc')){$('#descAlbum').html(dati[0].albumDesc.value);}
    if(trova(index,'artist')){
      $('#titoloArtista').html(`<a href="${wikipedia}${dati[0].artist.value}">${dati[0].artist.value}</a>`);
      video.setArtist(dati[0].artist.value);
    }
    if(trova(index,'artDesc')){$('#descArtista').html(dati[0].artDesc.value);}
    if(trova(index,'artBorn')){$('#bornArtista').html(dati[0].artBorn.value);}
    if(trova(index,'genreAlbum')){
      if(!video.thisGenre){video.setGenre(dati[0].genreAlbum.value);}}
    if(trova(index,'genre')){video.setGenre(dati[0].genre.value);}
  }else{
    if(!video.thisArtist()){
      $('#titoloArtista').html(`<a href="${wikipedia}${dati[0].label.value}">${dati[0].label.value}</a>`);
      video.setArtist(dati[0].label.value);
      $('#descArtista').html(dati[0].abstract.value);
      if(trova(index,'born')){$('#bornArtista').html(dati[0].born.value);}
      if(trova(index,'genre')){video.setGenre(dati[0].genre.value);}
    }
  }
}

//elimina tutte le informazioni nella pagina
function clearVideo (){
  video.setTitle("");
  video.setGenre("");
  video.setArtist("");
  $('#random').html(".");
  $('#similarityArtist').html(".");
  $('#similarityGenre').html(".");
  $('#related').html(".");
  $('#recent').html(".");
  $('#absoluteLocalPopularity').html(".");
  $('#relativeLocalPopularity').html(".");
  $('#globalPopularity').html(".");
  $('#titoloCanzone').text('Nessun risultato trovato');
  $('#descCanzone').text('Nessun risultato trovato');
  $('#dataCanzone').text('Nessun risultato trovato');
  $('#titoloAlbum').text('Nessun risultato trovato');
  $('#descAlbum').text('Nessun risultato trovato');
  $('#titoloArtista').text('Nessun risultato trovato');
  $('#descArtista').text('Nessun risultato trovato');
  $('#bornArtista').text('Nessun risultato trovato');
  $('#info-video').html("");
  $('#comments').html("");
}

//cerca di estrapolare le giuste informazione dal titolo di youtube e le riscrive per formulare la query a dbpedia
function getTitle(title, channel){
  let a = title.split('-');
  b = a[0].split(':');
  let finalTitle;
  let finalArtist;
  if(b.length == 1){
    if(a.length == 1){
      finalTitle = clearTitle(a[0], 0);
      finalArtist = clearTitle(channel, 1);
    }
    if(a.length > 1){
      finalTitle = clearTitle(a[1], 0);
      finalArtist = clearTitle(a[0], 0);
    }
  }
  if(b.length > 1){
    finalTitle = clearTitle(b[1], 0);
    finalArtist = clearTitle(b[0], 0);
  }
  let finalResult = [finalTitle + "_(" + finalArtist + "_song)" ,finalTitle + "_(song)", finalTitle + "_(group)", finalTitle + "_(band)", finalTitle,
                     finalArtist + "_(" + finalTitle + "_song)" ,finalArtist + "_(song)",finalArtist + "_(group)", finalArtist + "_(band)", finalArtist];
  return finalResult;
}

//cerca di individuare titolo e artista dal titolo di youtube
function clearTitle(title, chan){
  title = title.replace('"', "");
  title = title.replace('"', "");
  if(chan == 1){
    title = title.replace('OFFICIAL', "");
    title = title.replace('Official', "");
    title = title.replace('official', "");
    title = title.replace('VEVO', "");
    title = title.replace('Vevo', "");
  }
  if(title.indexOf('(') != -1){
    let c = title.indexOf('(');
    title = title.substring(0,c-1);
  }
  if(title.indexOf('[') != -1){
    let c = title.indexOf('[');
    title = title.substring(0,c-1);
  }
  while(title[0] == " " || title[title.length - 1] == " "){
    if(title[0] == " "){title = title.substring(1,title.length);
    }else{title = title.substring(0,title.length - 1)}
  }
  let d = title.split(' ');
  for(let k in d){
    d[k] = d[k].toLowerCase();
    if(k == 0 || (k > 0 && d[k] != "in" && d[k] != "by" && d[k] != "and" && d[k] != "of" && d[k] != "the" && d[k] != "a" && d[k] != "upon" && d[k] != "as" && d[k] != "to" && d[k] != "on")){
      d[k] = d[k].charAt(0).toUpperCase() + d[k].slice(1);
    }
  }
  let finalTitle = d.join('_');
  return finalTitle
}

//costruisce l'url per mandare la query a dbpedia
function creaUrl(titolo){
  let resource = "<http://dbpedia.org/resource/" + titolo + ">";
  let query = `SELECT distinct ?abstract ?label ?born ?release ?artist ?artBorn ?artDesc ?album ?albumDesc ?genre ?genreAlbum WHERE {
    ${resource} dbo:abstract ?abstract .
    ${resource} rdfs:label ?label.
    OPTIONAL{${resource} dbo:genre ?g.
      ?g rdfs:label ?genre.
      FILTER  (langMatches(lang(?genre),'en')).}
    OPTIONAL{{${resource} dbo:releaseDate ?release.}
      UNION {${resource} dbp:relyear ?release.}
      UNION {${resource} dbp:released ?release.}
      ${resource} dbo:genre ?g.
      ?g rdfs:label ?genre.
      {${resource} dbo:artist ?a.}
      UNION {${resource} dbo:musicalArtist ?a.}
      UNION {${resource} dbo:musicalBand ?a.}
      ?a rdfs:label ?artist.
      ?a dbo:abstract ?artDesc.
      ?a dbo:activeYearsStartYear ?artBorn.
      FILTER (langMatches(lang(?artist),'en') && langMatches(lang(?artDesc),'en')).}
    OPTIONAL{${resource} dbo:album ?b.
      ?b rdfs:label ?album.
      ?b dbo:abstract ?albumDesc.
      ?b dbo:genre ?ge.
      ?ge rdfs:label ?genreAlbum.
      FILTER(langMatches(lang(?album),'en') && langMatches(lang(?albumDesc),'en')  && langMatches(lang(?genreAlbum),'en')).}
    OPTIONAL{${resource} dbo:activeYearsStartYear ?born.}
    FILTER (langMatches(lang(?abstract),'en') && langMatches(lang(?label),'en')).}
    LIMIT 30`;
  var queryUrl = dbpedia + encodeURIComponent(query) + "&format=json";
  return queryUrl;
}

function scroll_to(div){
  $('html, body').animate({scrollTop: $(div).offset().top	},3000);
}
