import { useMoralis } from "react-moralis";
import { useEffect } from "react";

const ManualHeader = () => {

    const { enableWeb3, account, isWeb3Enabled } = useMoralis()

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined")
            if (window.localStorage.getItem("connected"))
                enableWeb3()
 
    }, [isWeb3Enabled])

    return (
    <div>
        { account ? (
            <div>Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}</div>
        ) : (
        <button 
            onClick={async () => {
                await enableWeb3()
                window.localStorage.setItem("connected", "inject")
            }}
        > Connect </button>
        
        )}
        
    </div>)
}

export default ManualHeader;