import ABI from "C:/Users/zhang/Desktop/my-app/src/ABI.json"

const address = "0xfcb4c5f555deb0d38e2d0d52a7f3aec5c7397c46";

const newContract = (web3) => {
    return new web3.eth.Contract(ABI, address);
};

export default newContract;