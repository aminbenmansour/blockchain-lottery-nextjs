import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants"
import { ethers } from "ethers"
const LotteryEntrance = () => {

    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, setEntranceFee] = useState("0")

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: { },
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: { },
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            async function updateUI() {
                const entranceFeeFromContract = (await getEntranceFee()).toString()
                setEntranceFee(entranceFeeFromContract)
            }
            updateUI()
        }
    }, [isWeb3Enabled])

    return ( 
        <div>
            {raffleAddress ? (
                <>
                    <div>
                        Fee for lottery entrance is { ethers.utils.formatEther(entranceFee) } ETH
                        
                    </div>
                    <div>
                        <button onClick={async () => {
                            await enterRaffle()
                        }}>Enter Raffle</button>
                    </div>
                </>
            ) : (
                <div>
                    No raffle address found!
                </div>
            )}
        </div>
     );
}
 
export default LotteryEntrance;