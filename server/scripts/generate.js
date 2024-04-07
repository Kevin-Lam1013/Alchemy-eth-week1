const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privatekey = secp.utils.randomPrivateKey();

console.log("Private key: ", toHex(privatekey));

const publicKey = secp.getPublicKey(privatekey);

console.log("public key: ", toHex(publicKey));
