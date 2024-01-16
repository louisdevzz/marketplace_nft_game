import React,{ useState,useEffect,useContext } from "react";
import { useRouter } from "next/router";
import {NFTMarketplaceContext} from '@/context/NFTMarketContext'

const NFT = () =>{
    const router = useRouter()
    const {fetchNFTs, buyNFT, currentAccount} = useContext(NFTMarketplaceContext);
    const [nftId, setNftId] = useState(0);
    const [nfts, setNfts] = useState([]);
    const [nftItem, setNftItem] = useState();
    useEffect(()=>{
        if(!router.isReady) return;
        const {nft_id} = router.query;
        setNftId(nft_id)
        fetchNFTs().then((item)=>{
            setNfts(item.reverse());
        })
    },[router.isReady])
    
    const buyNFTS = () =>{
        nfts.map((item)=>{
            if(item.tokenId == nftId){
                buyNFT(item)
            }
        })
        //buyNFT(nfts)
    }

    return(
        <div>
            <h1>NFT detail</h1>
            {nfts.map((item,index)=>{
                if(item.tokenId == nftId){
                    return(
                        <div className="w-[200px] h-[200px] border border-gray-400 m-2" key={index}>
                        <img src={item.images} className="w-full h-full object-cover"/>
                        <div className="flex flex-col p-2">
                            <p className="text-lg font-bold">{item.name}</p>
                            <p className="text-sm">{item.description}</p>
                            <p className="text-sm">{item.price}</p>
                        </div>
                        </div>
                    )
                }
                
            })}
            <div className="mt-[100px] ml-5">
                <button onClick={()=>buyNFTS()} className="relative inline-block px-4 py-2 font-medium group mt-2">
                <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
                <span className="relative text-black group-hover:text-white">Buy NFT</span>
                </button>
            </div>
        </div>
    )
}

export default NFT;