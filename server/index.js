const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0468e5d293161d47facdae2f61083c914d919a89566192cd8d730952bdab06420845e36e8339b701a28b6c0d76467a66c8e26903230aeecbfc0da8a6e10c1d63b8": 100,
  "04cb8eb5c7db4f39ea63adba0dc79119f06fe5c73ed16bd80b3f1ee942aa152ebaca2783bf8c2a6eb68298ce36d934c03116a98c5a38a69e93ecce0782cc9b91e6": 50,
  "040b246bcb62fc2c0fe74c0089773c83520ff691bf9f3714c0d4a2d32703ba7c23883488895f47e57f4ec2ee197c2285f2c11278b3f5d10f9cb53db0c4b6e0108b": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  // TODO: get a signature from the client-side application
  // recover the public address from the signature

  const { sender, recipient, amount, signature, recovery } = req.body;

  if (!signature) res.status(404).send({ message: "signature not provided" });
  if (!recovery) res.status(400).send({ message: "recovery not provided" });

  try {
    const bytes = utf8ToBytes(JSON.stringify({ sender, recipient, amount }));
    const hash = keccak256(bytes);
    const sig = new Uint8Array(signature);
    const publicKey = await secp.recoverPublicKey(hash, sig, recovery);

    if (toHex(publicKey) !== sender) {
      res.status(400).send({ message: "signature no is valid" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
