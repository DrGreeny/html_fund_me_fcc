//use import keyword
import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
console.log(ethers)

async function connect() {
    if (typeof window.ethereum != "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("Connected")
        document.getElementById("connectButton").innerHTML = "Connected"
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please install Metamask"
    }
}
async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum) // finds the http endpoint and puts it into provider
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum != "undefined") {
        //provider / connection to the blockchain
        // sgner / wallet / someone with some gas
        // contracct that we are interacting with
        // abi + address
        const provider = new ethers.providers.Web3Provider(window.ethereum) // finds the http endpoint and puts it into provider
        const signer = provider.getSigner() // returns the connected Metamask ACcount (JSONRpcSigner)
        const contract = new ethers.Contract(contractAddress, abi, signer) // here we need abi and address

        try {
            //Now you can start making tranwsactions
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //listen for the tx to be mined
            // listen for an event
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //return new Promise()
    //Create listener for blockchain, but wait for this to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Comleteted with ${transactionReceipt.confirmation} confirmations`
            )
            resolve() // promise onnly resolves, after this event is firing
        })
    })
}
//fund function

//withdraw
async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing....")
        const provider = new ethers.providers.Web3Provider(window.ethereum) // finds the http endpoint and puts it into provider
        const signer = provider.getSigner() // returns the connected Metamask ACcount (JSONRpcSigner)
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
