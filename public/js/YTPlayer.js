var player;

var video =(function (){

  // tutte le informazioni sul video corrente
  var thisVideoId, title = "", dbTitle, secondTitle, thirdTitle, artist = "", dbArtist, genre = "", recommender = "", prevVideoId = "";
  // informazioni sullo stato di caricamento delle infprmazioni del video corrente
  var commentLoaded = false, infoLoaded = false, wikiLoaded = false;
  // informazioni sullo stato di visualizzazione del video
  var timer, visualizzato = false, newVideo = true, watchedOneTime = new Array(), recent = document.cookie.split(",");

  //setta il titolo del video
  function setTitle(tit){
    dbTitle = tit.split(" ");
    dbTitle = dbTitle.join("_");
    if(tit.indexOf(' (') == -1){
      title = tit;
    } else {
      title = tit.substring(0,tit.indexOf(' ('));
    }
  }
  //setta i titoli di riserva da usare dai recommender similarity nel caso non si sia trovato il titolo su dbpedia
  function setSecondaryTitle(first, second){
    let a = first.split("_") ;
    secondTitle = a.join(" ");
    let b = second.split("_");
    thirdTitle = b.join(" ");

  }
  //setta l'artista del video
  function setArtist(art){
    dbArtist = art.split(" ");
    dbArtist = dbArtist.join("_");
    if(art.indexOf(' (') == -1){
      artist = art;
    } else {
      artist = art.substring(0,art.indexOf(' ('));
    }
  }
  //gestisce tutti i processi di caricamento di un nuovo video
  function load(rec, id){
    scroll_to('.container');
    $('#listaIniziale-tab').hide();
    if(watchedOneTime.indexOf(thisVideoId) != -1){
      this.setPrevVideo(thisVideoId);
    }
    this.setVideo(id);
    if(visualizzato){
      visualizzato = false;
    } else {
      clearTimeout(timer);
    }
    player.loadVideoById(thisVideoId);
    newVideo = true;
    this.setRecommender(rec);
    clearVideo();
    mostraCommenti();
    mostraInfo();
    $("#related-tab").click();
  }
  //gestisce tutti i processi di ricaricamento di un video già caricato
  function reload(state){
    $('html,body').scrollTop(0);
    this.setPrevVideo(state.prevVideoId);
    this.setVideo(state.videoId);
    if(visualizzato){
      visualizzato = false;
    } else {
      clearTimeout(timer);
    }
    player.loadVideoById(state.videoId);
    newVideo = true;
    this.setRecommender(state.recommender);
    clearVideo();
    this.setTitle(state.title);
    this.setGenre(state.genre);
    this.setArtist(state.artist);
    $('#info-wiki').html(state.infoWiki);
    $('#info-video').html(state.infoVideo);
    $('#comments').html(state.comments);
    $( "#related-tab" ).click();
  }
  //controlla se le informazioni di un video sono state interamente caricate nella pagina
  function pageOk(){
    if(commentLoaded && infoLoaded && wikiLoaded){
      var state = new History($('#info-video').html(), $('#info-wiki').html(), $('#comments').html());
      window.history.pushState(state, 'title', '/#' + thisVideoId);
      commentLoaded = false;
      infoLoaded = false;
      wikiLoaded = false;
    }
  }
  //gestisce le operazioni da compiere dopo la visualizzazione del video
  function visual(){
    visualizzato = true;
    if(watchedOneTime.indexOf(thisVideoId) == -1){
      watchedOneTime.push(thisVideoId);
    }
    if(recent.indexOf(thisVideoId) != -1){
      let add = recent.splice(recent.indexOf(thisVideoId), 1);
    }
    recent.unshift(thisVideoId);
    document.cookie = recent.join(",");
    var dati = {
      "videoId": thisVideoId,
      "reason": recommender,
      "prevVideo": prevVideoId
    }
    $.ajax({
      url: '/',
      type: "POST",
      data: dati,
    });
  }

  return{
    thisVideo: function(){return thisVideoId},
    thisTitle: function(){return title},
    thisSecondTitle: function(){return secondTitle},
    thisThirdTitle: function(){return thirdTitle},
    thisDbTitle: function(){return dbTitle},
    thisArtist: function(){return artist},
    thisDbArtist: function(){return dbArtist},
    thisGenre: function(){return genre},
    thisRecommender: function(){return recommender},
    thisPrevVideo: function(){return prevVideoId},
    thisCommentLoaded: function(){return commentLoaded},
    thisInfoLoaded: function(){return infoLoaded},
    thisWikiLoaded: function(){return wikiLoaded},
    getRecent: function(){return recent},
    newVideo: function(){return newVideo },

    notNewvideo: function(){newVideo = false},
    setVideo: function(id){ thisVideoId = id;},
    setTitle: setTitle,
    setSecondaryTitle: setSecondaryTitle,
    setArtist: setArtist,
    setGenre: function(gen){ genre = gen;},
    setRecommender: function(rec){ recommender = rec;},
    setPrevVideo: function(id){ prevVideoId = id;},
    setTimer: function(time){timer = time},

    visual: visual,
    load: load,
    reload: reload,
    commentOk: function(){commentLoaded = true},
    infoOk: function(){infoLoaded = true},
    wikiOk: function(){wikiLoaded = true},
    pageOk: pageOk,

  }
})()


//carica il video di youtube nella pagina
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '700',
    videoId: '',
    events: {'onReady': recommenderIniziale,
             'onStateChange': timer,
             }
  });
}

//timer di visualizzazione del video
function timer(event) {
  if (event.data == YT.PlayerState.PLAYING && video.newVideo()) {
    var timer = setTimeout(video.visual,15000);
    video.setTimer(timer);
    video.notNewvideo();
  }
}

//oggetto che contiene tutte le informaziomi della pagina in un determinato istante
History = function (infoVideo, infoWiki, comments){
  this.videoId = video.thisVideo();
  this.prevVideoId = video.thisPrevVideo();
  this.title = video.thisTitle();
  this.artist = video.thisArtist();
  this.genre = video.thisGenre();
  this.recommender = video.thisRecommender();
  this.infoVideo = infoVideo;
  this.infoWiki = infoWiki;
  this.comments = comments;
}

//salva nella cronologia lo stato corrente di una pagina
function getLocationHash() {
  return window.location.hash.substring(1);
}

//ricarica la pagina corrispondente ogni volta che si scorre nella cronologia
window.onhashchange = function(e) {
  video.reload(history.state);
}


function trova(array, x){
  for(let k in array){if(array[k] == x){return 1;}}
  return 0;
}

function indexArray(dati){
  var index = new Array();
  let i = 0;
  for(let n in dati){
    index[i] = n;
    i++;
  }
  return index;
}
