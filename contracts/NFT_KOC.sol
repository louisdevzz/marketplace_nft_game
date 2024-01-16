// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";


/// @custom:security-contact louisdevzz04@gmail.com
contract NFT_KingOfCat is ERC721, ERC721URIStorage, ERC721Pausable, ERC721Burnable {

    uint256 private _nextTokenId;
    uint256 private _nextMarketItem;
    uint256 public listingPrice = 0.00025 ether;
    uint256 private maxMintAmount = 5;

    address payable owner;

    constructor() ERC721("NFT King Of Cat", "NKOC"){
        owner == payable(msg.sender);
    }


    mapping (uint256 => MarketItem) private idMarketItems;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event idMarketItemsCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner of the marketplace can change the listing price");
        _;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    

    function withdraw() public payable onlyOwner() {
        require(payable(msg.sender).send(address(this).balance));
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner() {
            maxMintAmount = _newmaxMintAmount;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

   
    function updateListingPrice(uint256 _listingPrice) 
        public 
        payable
        onlyOwner 
    {
        listingPrice = _listingPrice;
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function currentToken() public view returns (uint256){
        return _nextTokenId;
    }

    //let create a function to create a new NFT
    function createToken(string memory _tokenURI, uint256 price) public payable  returns (uint256) {
        _nextTokenId++;
        _mint(msg.sender, _nextTokenId);
        _setTokenURI(_nextTokenId, _tokenURI);
        createMarketItem(_nextTokenId, price);
        return _nextTokenId;
    }


    //creating market item
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(_ownerOf(tokenId) != address(0), "ERC721: operator query for nonexistent token");
        require(price > 0, "Price must be at least 1 wei");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        //_nextMarketItem++;
        idMarketItems[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);

        emit idMarketItemsCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    //creating function resale Token
    function reSaleToken(uint256 tokenId, uint256 price) public payable{
        require(idMarketItems[tokenId].owner == msg.sender, "You are not the owner of this token");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        idMarketItems[tokenId].sold = false;
        idMarketItems[tokenId].price = price;
        idMarketItems[tokenId].seller = payable(msg.sender);
        idMarketItems[tokenId].owner = payable(address(this));

        _nextMarketItem = tokenId;
        _transfer(msg.sender, address(this), tokenId);
    }

    //creating function create market sale
    function createMarketSale(uint256 tokenId) public payable {
        uint256 price = idMarketItems[tokenId].price;
        require(msg.value == price, "Please submit the asking price in order to complete the purchase");

        idMarketItems[tokenId].owner = payable(msg.sender);
        idMarketItems[tokenId].sold = true;
        idMarketItems[tokenId].owner = payable(address(0));

        _nextMarketItem = tokenId;

        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(idMarketItems[tokenId].seller).transfer(msg.value);
    }

    //geting unsold nft data
    function fetchMarketItem() public view returns(MarketItem[] memory){
        uint256 itemCount = _nextTokenId;
        uint256 unsoldItemCount = _nextTokenId - _nextMarketItem;
        uint256 currentIndex = 0;
        
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for(uint256 i = 0; i < itemCount; i++){
            if(idMarketItems[i + 1].owner == address(this)){
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idMarketItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //purchase items
    function fetchMyNFT() public view returns(MarketItem[] memory){
        uint256 totalItemCount = _nextTokenId;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for(uint256 i = 0; i < totalItemCount; i++){
            if(idMarketItems[i + 1].owner == msg.sender){
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for(uint256 i = 0; i < totalItemCount; i++){
            if(idMarketItems[i + 1].owner == msg.sender){
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    //singule user items
    function fetchItemsListed()public view returns(MarketItem[] memory){
        uint256 totalItemCount = _nextTokenId;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for(uint256 i = 0; i < totalItemCount; i++){
            if(idMarketItems[i + 1].seller == msg.sender){
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for(uint256 i = 0; i < totalItemCount; i++){
            if(idMarketItems[i + 1].seller == msg.sender){
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

}