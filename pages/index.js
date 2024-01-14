import Header from "@/components/Header/header";
import { NFTMarketplaceContext } from '@/context/NFTMarketContext';
import { useContext, useEffect,useState } from "react";

const Home = () => {

  const [fileUrl, setFileUrl] = useState(null);
  const [nameNFT,setNameNFT] = useState("");
  const [descriptionNFT,setDescriptionNFT] = useState("");
  const [priceNFT,setPriceNFT] = useState("");

  
  const {checkWalletConnected,currentAccount,connectWallet,uploadFileIpfs,createNFT} = useContext(NFTMarketplaceContext);
 
  const imageUpload = async (e) => {
    const file = e.target.files[0];
    console.log("file: ",file);
    const url = await uploadFileIpfs(file);
    console.log("url: ",url);
    setFileUrl(url);
  }

  const createNFTItem = async () => {
    createNFT(nameNFT,descriptionNFT,priceNFT,"https://gateway.pinata.cloud/ipfs/QmbuebGF655LMH3v4AHctFwRnykiJ4w1jkJYF58zLbBTCr");
  }

  useEffect(() => {
    checkWalletConnected();
  },[])
  
  return (
    <div>
      <Header/>
      <h1>hello</h1>
      {currentAccount == ""?<button onClick={()=>connectWallet()}>Connection</button>:<button >Create NFT</button>}
        <div className="flex flex-col w-[200px] mt-2">
        <input type="file" placeholder="Upload image nft" onChange={(e)=>imageUpload(e)}/>
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT Name" onChange={(e)=>setNameNFT(e.target.value)}/>
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT Description" onChange={(e)=>setDescriptionNFT(e.target.value)}/>
        <input type="text" className="border border-gray-400 px-3 py-2 mt-2" placeholder="Enter NFT Price" onChange={(e)=>setPriceNFT(e.target.value)}/>
        <button onClick={()=>createNFTItem()}>Create NFT</button>
      </div>
    </div>
  )
}

export default Home;
