// import the contract artifact
const SongRegistry = artifacts.require('SongRegistry')

//The variable may or may not be reassigned, and the variable may or may not be used for an entire function, or just for the purpose of a block or loop.
//`const` is a signal that the identifier won’t be reassigned.
//`let`, is a signal that the variable may be reassigned, such as a counter in a loop, or a value swap in an algorithm.

//we always have 10 accounts in local ganache env

contract (SongRegistry, function (accounts) {
    //predefine parameters
    const songTitle = "Cool Song"
    const songUrl = "example.com"
    const songPrice = web3.utils.toWei("1", "ether")

    // // first test: check if zero songs at beginning
    // it("should contain zero songs in the beginning", async function () {
    //     // fetch the instance of the contract
    //     let SongRegistryInstance = await SongRegistry.deployed()
    //     // Song[] public songs;minter is a public variable in the contract so you can get it directly via the created call function
    //     let songCounter = await SongRegistryInstance.songs()
    //     // check whether minter is equal to account 0
    //     assert.equal(songs.length(), 0, "songs array does not seem empty at start")
    // })

    it('Sabines should contain two songs in the beginning', async function () {
        // fetch instance of SongRegistry contract
        let SongRegistryInstance = await SongRegistry.deployed()
        // get the number of songs
        let songCounter = await SongRegistryInstance.getNumberOfRegisteredSongs()
        // check that there are no songs initially
        assert.equal(songCounter, 0, 'initial number not equal to zero')
      })
})