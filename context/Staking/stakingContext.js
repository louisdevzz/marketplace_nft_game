//nft address = 0x23FFd9BfA1074E04EE0efcB7bB5266697178Fa14
//staking adress = 0xB14Ab1951eF03777abed43Ca3C6f71ab3A6cB8DA

import React, {useEffect,useState,useContext} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
//import address contract
import { StakingAdress, StakingAbi } from "./context";


const fetchContract = (signerOrProvider) => new ethers.Contract(
    StakingAdress, 
    StakingAbi, 
    signerOrProvider
);


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

        console.log("contract", contract);
        return contract;
    }catch(error){
        console.log(error,"Something went wrong while connecting with contract");
    }
}


