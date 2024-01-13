// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/// @custom:security-contact louisdevzz04@gmail.com
contract NFTMarket is ERC721, ERC721URIStorage, ERC721Pausable, Ownable, ERC721Burnable {

    uint256 private _nextTokenId;
    uint256 private _nextMarketItem;
    uint256 public listingPrice = 0.00025 ether;
    // uint256 public MAX_SUPPLY = 10000;
    
    address payable _owner;

    mapping (uint256 => _nextMarketItem) private idMarketItems;

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
        require(msg.sender == _owner, "Only owner of the marketplace can change the listing price");
        _;
    }

    constructor() ERC721("NFT Pixel Marketplace", "NPX"){
        _owner == payable(msg.sender);
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

    //let create a function to create a new NFT
    function createToken(string memory _tokenURI, uint256 price) public returns (uint256) {
        _nextTokenId++;
        _mint(msg.sender, _nextTokenId);
        _setTokenURI(_nextTokenId, _tokenURI);
        createMarketItem(_nextTokenId, price);
        return _nextTokenId;
    }


    //creating market item
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
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
