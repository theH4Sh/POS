import pkg from "node-machine-id";
import crypto from "crypto";

const { machineIdSync } = pkg;

function getMachineHash() {
    return crypto
        .createHash("sha256")
        .update(machineIdSync({ original: true }))
        .digest("hex");
}

console.log(getMachineHash());
