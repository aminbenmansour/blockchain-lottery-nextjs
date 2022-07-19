import { useMoralis } from "react-moralis";

const ManualHeader = () => {

    const { enableWeb3 } = useMoralis()
    return (
    <div>
        <button onClick={() => (await enableWeb3()) }>Connect</button>
    </div>);
}

export default ManualHeader;