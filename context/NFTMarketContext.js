import React, {useEffect,useState,useContext} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
//import address contract
import { NFTMarketplaceAdress, NFTMarketplaceAbi } from "./constants";
import { StakingAdress, StakingAbi } from "./Staking/context";
//config project ipfs
const projectId = "139dc1e86c7a730736f0";
const projectSecret = "196c07b24530bf180bff5806b4ead3fba4a2cd6436a3ac3f9e2efff6cb2467e3";



//fetching data from smart contract
const fetchContract = (signerOrProvider) => new ethers.Contract(
    NFTMarketplaceAdress, 
    NFTMarketplaceAbi, 
    signerOrProvider
);

const fetchStakingContract = (signerOrProvider) => new ethers.Contract(
    StakingAdress,
    StakingAbi,
    signerOrProvider
)
const gasPrice = async() =>{
    const web3Modal = new Web3Modal({
        cacheProvider:false
    });
    
    const connetion = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(connetion);
    const gas = (await provider.getFeeData()).gasPrice;
    return gas;
}

const connectStakingContract = async () => {
    try{
        const web3Modal = new Web3Modal({
            cacheProvider:false
        });
        
        const connetion = await web3Modal.connect();
        const provider = new ethers.BrowserProvider(connetion);
        //const p = new WalletConnectProvider(providerOptions);
        const signer = await provider.getSigner();
        const contract = fetchStakingContract(signer);

        console.log("contract", contract);
        return contract;
    }catch(error){
        console.log(error,"Something went wrong while connecting with contract");
    }
}


//connectiong smart contract
const connectSmartContract = async () => {
    try{
        const web3Modal = new Web3Modal({
            cacheProvider:false
        });
        
        const connetion = await web3Modal.connect();
        const provider = new ethers.BrowserProvider(connetion);
        //const p = new WalletConnectProvider(providerOptions);
        
        const signer = await provider.getSigner();
        const contract = fetchContract(signer);
        // setGasPrice((await provider.getFeeData()).gasPrice)
        console.log("contract", contract);
        return contract;
    }catch(error){
        console.log(error,"Something went wrong while connecting with contract");
    }
}

//const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
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
            }
            

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
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            window.location.reload();
        }catch(error){
            console.log(error,"Something went wrong while checking wallet connection");
        }
    }

    //uploading image to ipfs
    const uploadFileIpfs = async (file) => {
        try{
            if(file){
                const formData = new FormData();
                formData.append("file", file);
                const resFile = await axios({
                    method: "post",
                    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
                    data: formData,
                    headers: {
                        "Content-Type": `multipart/form-data`,
                        pinata_api_key: projectId,
                        pinata_secret_api_key: projectSecret
                    }
                })
                const url = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                return url;
            }
        }catch(error){
            console.log(error,"Something went wrong while uploading file to ipfs");
        }
    }

    //create market item
    const createNFT = async(name, description, price,fileUrl, router) => {
            if(!name || !description || !price || !fileUrl){
                return alert("Please fill all the fields");
            }
            try{
                const data = {
                    name:name, 
                    description:description, 
                    images:fileUrl
                };

                const resFile = await axios({
                    method: "post",
                    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                    data: JSON.stringify({
                        pinataContent: data
                    }),
                    headers: {
                        "Content-Type": `application/json`,
                        pinata_api_key: projectId,
                        pinata_secret_api_key: projectSecret
                    }
                })
                const url = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                console.log("url metadata: ",url);
                await createSale(url, price); 
            }catch(error){
                console.log(error,"Something went wrong while uploading file to ipfs");
            }
    }

    //create sale
    const createSale = async (url, formInputPrice, isReselling, id) => {
        try{
            const price = ethers.parseUnits(formInputPrice ,"ether");
            const contract = await connectSmartContract();
            const listingPrice = await contract.getListingPrice();
            const transtion = !isReselling ? await contract.createToken(url, price, {value: listingPrice}) : await contract.reSaleToken(url,price,{value: listingPrice}); 
            await transtion.wait();
            //const createToken = await contract.createToken(url, formatPrice, {value: listingPrice.toString()});
            console.log("transtion: ",transtion);  
        }catch(error){
            console.log(error,"Something went wrong while creating sale");
        }
    }

    //fetch nft
    const fetchNFTs = async () => {
        try{
            const provider = new ethers.BrowserProvider(window.ethereum)
            const contract = fetchContract(provider);

            const data = await contract.fetchMarketItem();
            //console.log(data,"data")
            const items = await Promise.all(data.map(async({tokenId, seller,owner,price: unformattedPrice})=>{
                const tokenUri = await contract.tokenURI(tokenId);

                const {data: {images, name, description}} = await axios.get(tokenUri);


                const price = ethers.formatUnits(unformattedPrice.toString(), "ether");
                const item = {
                    price,
                    tokenId: Number(tokenId),
                    seller,
                    owner,
                    images,
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

    useEffect(() => {
        fetchNFTs();
    },[])

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
            console.log(nft)
            const contract = await connectSmartContract();
            const price = ethers.parseUnits(nft.price,"ether");
            console.log(await gasPrice())
            //const tx = await contract.createMarketSale(nft.tokenId, { value: price})
            //console.log(price)
            //const transtion = await contract.createMarketSale(nft.tokenId, {value: price});
            //await tx.wait();
            //console.log("transtion buy nft: ",tx);
        }catch(error){
            console.log(error,"Something went wrong while buying nft");
        }
    }

    const stakingNFT = async (tokenId) => {
        try{
            const contract = await connectStakingContract();
            const transtion = await contract.stake(tokenId);
            await transtion.wait();
            console.log("transtion staking nft: ",transtion);
        }catch(error){
            console.log(error,"Something went wrong while staking nft");
        }
    }
    
    // const claimNFT = async (tokenId) => {
    //     try{
    //         const contract = await connectStakingContract();
    //         const transtion = await contract.claim(tokenId);
    //         await transtion.wait();
    //         console.log("transtion staking nft: ",transtion);
    //     }catch(error){
    //         console.log(error,"Something went wrong while staking nft");
    //     }
    // }

    const unStakingNFT = async (tokenId) => {
        try{
            const contract = await connectStakingContract();
            const transtion = await contract.unstake(tokenId);
            await transtion.wait();
            console.log("transtion staking nft: ",transtion);
        }catch(error){
            console.log(error,"Something went wrong while unstaking nft");
        }
    }

    const findNFT = async(tokenId) =>{
        try{
            const contract = await connectSmartContract();
            const transtion = await contract.tokenURI(tokenId);
            //await transtion.wait();
            console.log("transtion find nft: ",transtion);
        }catch(error){
            console.log(error)
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
            buyNFT,
            stakingNFT,
            findNFT,
            unStakingNFT
        }}>
            {children}
        </NFTMarketplaceContext.Provider>
    )
}
