App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  //Set up web3.js - library that allows our client-side application to interface with blockchain.
  initWeb3: function() {
    // if (typeof web3 !== 'undefined') {
    //   // If a web3 instance is already provided by Meta Mask.
    //   App.web3Provider = web3.currentProvider;
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // Specify default instance if no web3 instance provided
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    //   web3 = new Web3(App.web3Provider);
    // }
    // Specify default instance if no web3 instance provided
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  //Fetch the deployed instance of the smart contract (JSON), initialise TruffleContract and attach Web3 provider.
  initContract: function() {
    $.getJSON("SongRegistry.json", function(songRegistryArtifact) {
      // Load JSON artifact and try to use it to initialize a TruffleContract instance
      App.contracts.SongRegistry = TruffleContract(songRegistryArtifact);
      // Connect provider to interact with contract
      App.contracts.SongRegistry.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  //Render function updates web page with data from the smart contract.
  render: function() {
    var songRegistryInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#coinbaseAddress").html("Coinbase Account Address: " + account);
      }
    });

    // Load contract data
    App.contracts.SongRegistry.deployed().then(function(instance) {
      songRegistryInstance = instance;
      return songRegistryInstance.getNumberOfRegisteredSongs();
    }).then(function(songsCount) {
      var tableSongs = $("#tableSongs");
      tableSongs.empty();

      for (var i = 0; i <= songsCount; i++) {
        songRegistryInstance.songs(i).then(function(song) {
          var songOwnerAddress = song[0];
          var songTitle = song[1];
          var songURL = song[2];
          var songCost = song[3];

          // Render songs 
          var songEntry = "<tr><td>" + songOwnerAddress + "</td><td>" + songTitle + "</td><td>" + 
          songURL + "</td><td>" + songCost +  + "</td></tr>"
          tableSongs.append(songEntry);
        });
        var numSongs = $("#numSongs");
        numSongs.html(songsCount.toString());

      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  registerSong: function() {
    var inputSongName = $('#inputSongName').val();
    var inputSongURL = $('#inputSongURL').val();
    var inputSongCost = $('#inputSongCost').val();
    var solidityContext = {from: web3.eth.accounts[1], gas:3000000}; //add gas to avoid out of gas exception

    App.contracts.SongRegistry.deployed().then(function(instance) {
      //registerSong("Song 1", "www.uct.ac.za", 34);
      console.log("registerSong Click");

      return instance.registerSong(inputSongName, inputSongURL, inputSongCost, solidityContext);
    }).then(function(){
      $("#formRegisterSong").get(0).reset() // or $('form')[0].reset()
    }).catch(function(err) {
      console.error(err);
    });
  },

  listenForEvents: function() {
    App.contracts.SongRegistry.deployed().then(function(instance) {
      instance.registeredSongEvent({}, {
       // fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event);
        TriggerAlertOpen("#divNotificationBar", '"divSongRegisterAlert"', "Song Registered");
        // var divSongRegisterNotificationHtml = '<div id="divSongRegisterAlert" class="alert alert-success fade in show"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button><strong>Song Registered</strong></div>'
        // $('#divSongRegisterNotification').html(divSongRegisterNotificationHtml);
        TriggerAlertClose("#divSongRegisterAlert");
        // Reload when a new song is registered
        App.render();        
      });
    });
  }
};

function TriggerAlertOpen(parentDivID, alertDivID, alertMessage) {
  //open  alert box after 1 seconds (1000 milliseconds):
  console.log("TriggerAlertOpen")
  var divNotificationHtml = '<div id='+alertDivID+' class="alert alert-success fade in show"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button><strong>'+alertMessage+'</strong></div>'
  console.log(divNotificationHtml)
  $(parentDivID).html(divNotificationHtml);
};

function TriggerAlertClose(alertDivID) {
  //remove  alert box after 5 seconds (5000 milliseconds):
  window.setTimeout(function () {
      $(alertDivID).fadeTo(1000, 0).slideUp(1000, function () {
          $(this).remove();
      });
  }, 5000);
};

$('#numSongsButton').click(function (e) {
  e.preventDefault()
  //alert("Window Loaded");
  App.contracts.SongRegistry.deployed().then(function(instance) {
  songRegistryInstance = instance;
  return songRegistryInstance.getNumberOfRegisteredSongs();
    }).then(function(songsCount) {
      console.log("numSongButton Click - " + songsCount.toString());
      var divNumSongsHtml = '<div class="alert alert-success fade in show"><button type="button" class="close close-alert" data-dismiss="alert" aria-hidden="true">×</button><strong>Number of Songs </strong>' + songsCount.toString() +'</div>'
      $('#divNumSongs').html(divNumSongsHtml);
    }).catch(function(error) {
      console.warn(error);
    });
});

// app.js is included in index.html
// when index.html is opened in the browser, load function is executed when complete page is fully loaded, including all frames, objects and images
$(window).on('load', function () {
  //alert("Window Loaded");
  App.init();
});