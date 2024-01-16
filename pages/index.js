import Header from "@/components/Header/header";
//import { NFTMarketplaceContext } from '@/context/NFTMarketContext';
import { useEffect,useState,useContext } from "react";
import { NFTMarketplaceContext } from "@/context/NFTMarketContext";
import Link from "next/link";



const Home = () => {

  const [fileUrl, setFileUrl] = useState(null);
  const [nameNFT,setNameNFT] = useState("");
  const [descriptionNFT,setDescriptionNFT] = useState("");
  const [priceNFT,setPriceNFT] = useState("");
  const [nfts, setNfts] = useState([]);
  const [nftsCopy, setNftsCopy] = useState([]);
  const [nftId, setNftId] = useState(0);

  const {
    checkWalletConnected,
    currentAccount,
    connectWallet,
    uploadFileIpfs,
    createNFT,
    fetchNFTs,
    stakingNFT,
    unStakingNFT,
    
  } = useContext(NFTMarketplaceContext);
 
  const imageUpload = async (e) => {
    const file = e.target.files[0];
    console.log("file: ",file);
    const url = await uploadFileIpfs(file);
    console.log("url: ",url);
    setFileUrl(url);
  }

  const createNFTItem = async () => {
    console.log("create NFT");
    createNFT(nameNFT,descriptionNFT,priceNFT,fileUrl);
  }

  const Staking = () =>{  
    console.log("Staking");
    stakingNFT(Number(nftId))
  }

  const Unstaking = () =>{
    console.log("Unstaking");
    unStakingNFT(Number(nftId));
  }


  useEffect(() => {
    checkWalletConnected();
    fetchNFTs().then((item)=>{
      setNfts(item.reverse());
      setNftsCopy(item);
      //console.log("NFT: ",item);
    })
  },[])

  


  return (
    <div className="ml-2">
      <Header/>
      <h1>hello</h1>
     {currentAccount==""? <p className="relative inline-block text-lg group mt-5">
        <span className="relative z-10 block px-5 py-3 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
        <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-gray-50"></span>
        <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gray-900 group-hover:-rotate-180 ease"></span>
        <button onClick={()=>connectWallet()} className="relative">Connect Wallet</button>
        </span>
        <span className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-gray-900 rounded-lg group-hover:mb-0 group-hover:mr-0" data-rounded="rounded-lg"></span>
      </p>:'Connected'}
      <div className="flex flex-col w-[200px] mt-2">
        <input type="file" placeholder="Upload image nft" onChange={(e)=>imageUpload(e)}/>
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT Name" onChange={(e)=>setNameNFT(e.target.value)}/>
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT Description" onChange={(e)=>setDescriptionNFT(e.target.value)}/>
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT Price" onChange={(e)=>setPriceNFT(e.target.value)}/>
        <button onClick={()=>createNFTItem()} className="relative inline-block px-4 py-2 font-medium group mt-2">
          <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
          <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
          <span className="relative text-black group-hover:text-white">Create NFT</span>
        </button>
      </div>
      <div className="flex flex-wrap mt-5">
        {nfts.map((item,index)=>{
          return(
            <Link href={`/nft/${item.tokenId}`} className="w-[200px] h-[200px] border border-gray-400 m-2" key={index}>
              <img src={item.images} className="w-full h-full object-cover"/>
              <div className="flex flex-col p-2">
                <p className="text-lg font-bold">{item.name}</p>
                <p className="text-sm">{item.description}</p>
                <p className="text-sm">{item.price}</p>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="flex mt-[90px]">
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT ID" onChange={(e)=>setNftId(e.target.value)}/>
      </div>
      <div className="flex">
        <div>
          <button onClick={()=>Staking()} className="relative px-5 py-3 overflow-hidden mt-[10px] font-medium text-gray-600 bg-gray-100 border border-gray-100 rounded-lg shadow-inner group">
            <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-600 group-hover:w-full ease"></span>
            <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-600 group-hover:w-full ease"></span>
            <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
            <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-600 group-hover:h-full ease"></span>
            <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100"></span>
            <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">Staking</span>
          </button>
        </div>
        <div>
          <button className="box-border relative z-30 inline-flex mt-[13px] ml-5 items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-indigo-600 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none">
            <span className="absolute bottom-0 right-0 w-8 h-20 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
            <span className="absolute top-0 left-0 w-20 h-8 -mt-1 -ml-12 transition-all duration-300 ease-out transform -rotate-45 -translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
            <span className="relative z-20 flex items-center text-sm">
            <svg className="relative w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Claim
            </span>
          </button>
        </div>
        <div>
          <button onClick={()=>Unstaking()} className="box-border relative z-30 inline-flex mt-[13px] ml-5 items-center justify-center w-auto px-8 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-indigo-600 rounded-md cursor-pointer group ring-offset-2 ring-1 ring-indigo-300 ring-offset-indigo-200 hover:ring-offset-indigo-500 ease focus:outline-none">
            <span className="absolute bottom-0 right-0 w-8 h-20 -mb-8 -mr-5 transition-all duration-300 ease-out transform rotate-45 translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
            <span className="absolute top-0 left-0 w-20 h-8 -mt-1 -ml-12 transition-all duration-300 ease-out transform -rotate-45 -translate-x-1 bg-white opacity-10 group-hover:translate-x-0"></span>
            <span className="relative z-20 flex items-center text-sm">
            <svg className="relative w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Unstaking
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home;
