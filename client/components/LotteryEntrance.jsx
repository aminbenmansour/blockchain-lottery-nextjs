import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddress } from "../constants"

const LotteryEntrance = () => {

    const { chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)

    // const { runContractFunction: enterRaffle } = useWeb3Contract({
    //   abi: usdcEthPoolAbi,
    //   contractAddress: usdcEthPoolAddress,
    //   functionName: "enterRaffle",
    //   params: { },
    //   msgValue: ,
    // });

    return ( 
        <div>

        </div>
     );
}
 
export default LotteryEntrance;