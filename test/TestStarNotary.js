//import { assert } from "console";




const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    let newUser = accounts[1];
    let starId  = 6;
    await instance.createStar('New Awesome Star', starId, {from: newUser});
   let name = await instance.starName();
   let symbol = await instance.starSymbol();
   assert.equal(name, 'Dimeji Token');
   assert.equal(symbol, 'DT');

});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let newUser1 = accounts[0];
    let newUser2 = accounts[1];
    let newUserId1 =  7;
    let newUserId2 = 8;
    // 1. create 2 Stars with different tokenId
    await instance.createStar('new star 1', newUserId1, {from: newUser1});
    await instance.createStar('new star 2', newUserId2, {from: newUser2});
    await instance.approve(newUser2, newUserId1, {from: newUser1});
    await instance.approve(newUser1, newUserId2, {from: newUser2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(newUserId1, newUserId2, {from: newUser1});
    let firstStar = await instance.ownerOf.call(newUserId1);
    let secondStar = await instance.ownerOf.call(newUserId2);
    // 3. Verify that the owners changed
    assert.equal(firstStar, newUser2);
    assert.equal(secondStar, newUser1)
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let newUser1 = accounts[0];
    let newUser2 = accounts[1]
    let starId  = 9;
    await instance.createStar('New Star ', starId, {from: newUser1});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(newUser2, starId, {from: newUser1});
    // 3. Verify the star owner changed.
    let starUser = await instance.ownerOf.call(starId);
    assert.equal(starUser, newUser2);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let newUser1 = accounts[0];
    let starId  = 10;
    let starName = 'Latest Star'
    await instance.createStar(starName, starId, {from: newUser1});
    // 2. Call your method lookUptokenIdToStarInfo
   let response =  await instance.lookUptokenIdToStarInfo(starId);
    // 3. Verify if you Star name is the same
    assert.equal(response, starName);
});