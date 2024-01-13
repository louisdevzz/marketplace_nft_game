import React, {useEffect,useState,useContext} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import Router from "next/router";
import axios from "axios";
import {create, create as ipfsHttpClient} from "ipfs-http-client";
//import address contract
import { NFTMarketplaceAdress, NFTMarketplaceAbi } from "./constants";


//fetching data from smart contract
const fetchContract = (signerOrProvider) => new ethers.Contract(
    NFTMarketplaceAdress, 
    NFTMarketplaceAbi, 
    signerOrProvider
);

//connectiong smart contract
const connectSmartContract = async () => {
    try{
        const web3Modal = new Web3Modal();
        const connetion = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connetion);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        console.log("contract", contract);
        return contract;
    }catch(error){
        console.log(error,"Something went wrong while connecting with contract");
    }
}

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
export const NFTMarketplaceContext = React.createContext();
export const NFTMarketplaceProvider = ({children}) => {
    const titledata = "NFT Marketplace";

    //usestate for checking connection
    const [currentAccount, setCurrentAccount] = useState("");
    //check if wallet is connected
    const checkWalletConnected = async () => {
        try{
            if(!window.ethereum){
                return alert("Please install metamask");
            }
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if(accounts.length){
                const account = accounts[0];
                setCurrentAccount(account);
               
            }else{
                console.log("No account found");
                alert("No account found");
            }
            console.log("currentAccount", currentAccount);

        }catch(error){
            console.log(error,"Something went wrong while checking wallet connection");
        }
    }
    //connect wallet
    const connectWallet = async()=>{
        try{
            if(!window.ethereum){
                return alert("Please install metamask");
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccount' });
            setCurrentAccount(accounts[0]);
            window.location.reload();
        }catch(error){
            console.log(error,"Something went wrong while checking wallet connection");
        }
    }

    //uploading image to ipfs
    const uploadFileIpfs = async (file) => {
        try{
            const added = await client.add({content: file});
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            return url;
        }catch(error){
            console.log(error,"Something went wrong while uploading file to ipfs");
        }
    }

    //create market item
    const createNFT = async(formInput,fileUrl, router) => {
            const {name, description, price } = formInput;
            if(!name || !description || !price || !fileUrl){
                return alert("Please fill all the fields");
            }
            const data = JSON.stringify({name, description, image: fileUrl});
            try{
                const added  = await client.add(data);
                const url = `https://ipfs.infura.io/ipfs/${added.path}`;
                await createSale(url, price);
            }catch(error){
                console.log(error,"Something went wrong while uploading file to ipfs");
            }
    }

    //create sale
    const createSale = async (url, formInputPrice, isReselling, id) => {
        try{
            const price = ethers.utils.parseUnits(formInputPrice, "ether");
            const contract = await connectSmartContract();

            const listingPrice = await contract.getListingPrice();
            const transtion = !isReselling ? await contract.createToken(url, price, {value: listingPrice.toString()}) : await contract.reSaleToken(url,price,{value: listingPrice.toString()}); 
            await transtion.wait();   
        }catch(error){
            console.log(error,"Something went wrong while creating sale");
        }
    }

    //fetch nft
    const fetchNFTs = async () => {
        try{
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);

            const data = await contract.fetchMarketItems();
            //console.log(data,"data")
            const items = await Promise.all(data.map(async({tokenId, seller,owner,price: unformattedPrice})=>{
                const tokenUri = await contract.tokenURI(tokenId);

                const {data: {image, name, description}} = await axios.get(tokenUri);


                const price = ethers.utils.formatUnits(unformattedPrice.toString(), "ether");
                const item = {
                    price,
                    tokenId: tokenId.toNumber(),
                    seller,
                    owner,
                    image,
                    name,
                    description
                }
                return item;
            }))
            return items;
        }catch(error){
            console.log(error,"Something went wrong while fetching nft");
        }
    }

    const fetchMyNFTorListedNFT = async (type) => {
        try{
            const contract = await connectSmartContract();
            const data = type == "fetchItemsListed" ? await contract.fetchItemsListed() : await contract.fetchMyNFT();
            const items = Promise.all(data.map(async({tokenId, seller,owner,price: unformattedPrice})=>{
                const tokenUri = await contract.tokenURI(tokenId);

                const {data: {image, name, description}} = await axios.get(tokenUri);
                const price = ethers.utils.formatUnits(unformattedPrice.toString(), "ether");
                return {
                    price,
                    tokenId: tokenId.toNumber(),
                    seller,
                    owner,
                    image,
                    name,
                    description,
                    tokenUri
                }
            })); 
            return items;
        }catch(error){
            console.log(error,"Something went wrong while fetching nft");
        }
    }


    //buy nft
    const buyNFT = async (nft) => {
        try{
            const contract = await connectSmartContract();
            const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
            const transtion = await contract.createMarketSale(nft.tokenId, {value: price});
            await transtion.wait();
        }catch(error){
            console.log(error,"Something went wrong while buying nft");
        }
    }

    return(
        <NFTMarketplaceContext.Provider value={{
            titledata,
            currentAccount,
            checkWalletConnected,
            connectWallet,
            uploadFileIpfs,
            createNFT,
            fetchNFTs,
            fetchMyNFTorListedNFT,
            buyNFT
        }}>
            {children}
        </NFTMarketplaceContext.Provider>
    )
}
