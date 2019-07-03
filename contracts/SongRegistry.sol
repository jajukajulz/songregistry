pragma solidity ^0.5.0; //1. Enter solidity version here

//2. Create contract here
contract SongRegistry {

    /*a struct holding the song’s title (string), owner (address)
    a url where it can be downloaded (string) and a price */
    struct Song {
        address payable owner;
        string title;
        string url;
        uint price; //wei
    } //Structs allow you to create more complicated data types that have multiple properties.

    Song[] public songs;  //array of songs made public because I have length method

    /*A mapping is essentially a key-value store for storing and looking up data.
    In the first example, the key is an address and the value is a uint
    mapping (address => uint) balances;*/

    //a mapping of song id to an array of addresses that holds the buyers per song
    mapping (uint => address[]) public songIdToBuyers;

    constructor () public {
        registerSong("Song 1", "www.uct.ac.za", 34);
        registerSong("Song 2", "www.uct.ac.za", 42);
    }

    event registeredSongEvent (
        uint indexed _songId
    );
    
    function registerSong (string memory _title, string memory _url, uint _price) public returns(uint) {
        /*
            a function to register a song
            it should add the song to the array of songs
            it should set the owner to be the first buyer - msg.sender?
            calldata similar to memory
            made external because it will be called by a web application, if it was called by another smart contract then make public
        */

        //msg.sender is address of the person (or smart contract) who called the current function.
        address payable _owner = msg.sender;

        //create a new Song
        Song memory newSong = Song(_owner, _title, _url, _price);

        //add the song to the array
        uint id = songs.push(newSong) - 1;

        //or in one line
        //songs.push(Song(_title, _owner, _url, _price));

        // trigger registeredSong event
        emit registeredSongEvent(id);

        return id;
    }

    function getNumberOfRegisteredSongs () external view returns(uint) {
        /*
            a function to get the number of songs registered i.e. length of songs array
        */
        return songs.length;
    }

    function _checkRegisteredBuyer (uint _songId) external view returns (bool) {
        /*
            a function to check whether the sender is a registered buyer given the song id
        */
        bool regBuyer = false;
        address _sender = msg.sender;
        address[] memory songBuyers = songIdToBuyers[_songId];
        uint numOfElements = this.getNumberOfRegisteredSongs();
        for (uint i = 0; i < numOfElements; i++) {
            address _songBuyer = songBuyers[i];
            if (_sender == _songBuyer ){
                regBuyer = true;
                break;
            }
        }
        return regBuyer;
    }

    function buySong (uint _songId) external payable {
        /*
            a function to buy a song given the song id
            it should retrieve the song from the songs array
            it should check that the message value is equal to the price
            it should add the sender’s address to the array of buyers for that song id
            it should transfer the money to the song’s owner
            external because it is called by web application and payable as it involves money
        */

        Song memory songToBuy = songs[_songId];
        uint buyerSendAmount = msg.value;
        address buyerAddress = msg.sender;
        // if (buyerSendAmount == songToBuy.price){
        //     songIdToBuyers[_songId].push(buyerAddress); //add senders address to array of buyers?
        //     songToBuy.owner.transfer(buyerSendAmount); //transfer money to song's owner?
        // }
        require(buyerSendAmount == songToBuy.price, 'Price is not sufficient or too much');
        songIdToBuyers[_songId].push(buyerAddress); //add senders address to array of buyers?
        songToBuy.owner.transfer(buyerSendAmount); //transfer money to song's owner?
    }
    //https://www.codementor.io/rogargon/exercise-simple-solidity-smart-contract-for-ethereum-blockchain-m736khtby
    //http://www.dappuniversity.com/articles/the-ultimate-ethereum-dapp-tutorial
    //https://medium.com/coinmonks/solidity-and-web3-js-141115b0f8c5
}
