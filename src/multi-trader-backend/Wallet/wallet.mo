import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

// Management Canister Interface for ECDSA
actor {
    // Types for ECDSA
    public type EcdsaCurve = {
        #secp256k1;
    };

    public type EcdsaKeyId = {
        curve: EcdsaCurve;
        name: Text;
    };

    public type EcdsaPublicKeyArgument = {
        canister_id: ?Principal;
        derivation_path: [Blob];
        key_id: EcdsaKeyId;
    };

    public type EcdsaPublicKeyResult = {
        public_key: Blob;
        chain_code: Blob;
    };

    // EVM RPC Types
    public type RpcServices = {
        #EthMainnet: ?[{#PublicNode; #Ankr; #BlockPi}];
        #EthSepolia: ?[{#PublicNode; #Ankr; #BlockPi}];
    };

    public type RpcError = {
        code: Int64;
        message: Text;
    };

    public type RequestResult = {
        #Ok: Text;
        #Err: RpcError;
    };

    public type RequestCostResult = {
        #Ok: Nat;
        #Err: RpcError;
    };

    // Management Canister Actor
    let ic : actor {
        ecdsa_public_key : EcdsaPublicKeyArgument -> async EcdsaPublicKeyResult;
    } = actor("aaaaa-aa");

    // EVM RPC Canister Actor  
    let evmRpc : actor {
        request : (RpcServices, Text, Nat64) -> async RequestResult;
        requestCost : (RpcServices, Text, Nat64) -> async RequestCostResult;
    } = actor("7hfb6-caaaa-aaaar-qadga-cai"); // EVM RPC canister ID

    // Utility function to convert bytes to hex
    private func bytesToHex(bytes: [Nat8]) : Text {
        let hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
        var result = "";
        for (byte in bytes.vals()) {
            result := result # hexChars[Nat8.toNat(byte / 16)] # hexChars[Nat8.toNat(byte % 16)];
        };
        result
    };

    // Keccak256 hash implementation (simplified - you might want to use a proper crypto library)
    private func keccak256(data: [Nat8]) : [Nat8] {
        // This is a placeholder - in production, use a proper Keccak256 implementation
        // For now, we'll use a simple hash function
        // You should replace this with actual Keccak256 implementation
        let result = Array.init<Nat8>(32, 0);
        for (i in data.keys()) {
            result[i % 32] := result[i % 32] ^ data[i];
        };
        Array.freeze(result)
    };

    // Convert ECDSA public key to Ethereum address
    private func publicKeyToEthAddress(publicKey: [Nat8]) : Text {
        // Remove the 0x04 prefix if present (uncompressed public key format)
        let keyBytes = if (publicKey.size() == 65 and publicKey[0] == 0x04) {
            Array.subArray<Nat8>(publicKey, 1, 64)
        } else {
            publicKey
        };
        
        // Hash the public key with Keccak256
        let hash = keccak256(keyBytes);
        
        // Take the last 20 bytes as the address
        let addressBytes = Array.subArray<Nat8>(hash, 12, 20);
        
        // Convert to hex with 0x prefix
        "0x" # bytesToHex(addressBytes)
    };

    // Generate Ethereum address for the caller
    public shared(msg) func generateEthereumAddress() : async {#ok: {address: Text; publicKey: Text}; #err: Text} {
        let caller = Principal.toBlob(msg.caller);
        
        try {
            let publicKeyResult = await ic.ecdsa_public_key({
                canister_id = null;
                derivation_path = [caller];
                key_id = { 
                    curve = #secp256k1; 
                    name = "key_1"; // Use "dfx_test_key" for local development
                };
            });
            
            let publicKeyBytes = Blob.toArray(publicKeyResult.public_key);
            let publicKeyHex = bytesToHex(publicKeyBytes);
            let ethAddress = publicKeyToEthAddress(publicKeyBytes);
            
            #ok({
                address = ethAddress;
                publicKey = publicKeyHex;
            })
        } catch (error) {
            #err("Failed to generate Ethereum address: " # Error.message(error))
        }
    };

    // Query Ethereum balance for a given address
    public func getEthereumBalance(address: Text) : async {#ok: {balance: Text; balanceWei: Text}; #err: Text} {
        let service = #EthMainnet(?[#PublicNode]); // Use Sepolia testnet: #EthSepolia(?[#PublicNode])
        let jsonRequest = "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"" # address # "\",\"latest\"],\"id\":1}";
        let maxResponseBytes : Nat64 = 1000;
        
        try {
            // Get the cost first
            let costResult = await evmRpc.requestCost(service, jsonRequest, maxResponseBytes);
            let cycles = switch (costResult) {
                case (#Ok(cost)) { cost };
                case (#Err(error)) { 
                    return #err("Failed to get request cost: " # error.message);
                };
            };
            
            // Add cycles for the request
            Cycles.add<system>(cycles);
            
            // Make the request
            let result = await evmRpc.request(service, jsonRequest, maxResponseBytes);
            
            switch (result) {
                case (#Ok(response)) {
                    // Parse the response to extract the balance
                    // The response should contain the balance in Wei as a hex string
                    #ok({
                        balance = response;
                        balanceWei = response; // You can add Wei to ETH conversion here
                    })
                };
                case (#Err(error)) {
                    #err("Failed to get balance: " # error.message)
                };
            }
        } catch (error) {
            #err("Request failed: " # Error.message(error))
        }
    };

    // Combined function: generate address and get its balance
    public shared(msg) func generateAddressAndGetBalance() : async {#ok: {address: Text; balance: Text}; #err: Text} {
        // First generate the address
        let addressResult = await generateEthereumAddress();
        
        switch (addressResult) {
            case (#ok(addressInfo)) {
                // Then get the balance
                let balanceResult = await getEthereumBalance(addressInfo.address);
                
                switch (balanceResult) {
                    case (#ok(balanceInfo)) {
                        #ok({
                            address = addressInfo.address;
                            balance = balanceInfo.balance;
                        })
                    };
                    case (#err(balanceError)) {
                        #err("Generated address but failed to get balance: " # balanceError)
                    };
                }
            };
            case (#err(addressError)) {
                #err("Failed to generate address: " # addressError)
            };
        }
    };

    // Helper function to convert Wei to ETH (as text)
    public func weiToEth(weiHex: Text) : Text {
        // Remove "0x" prefix if present
        let cleanHex = if (Text.startsWith(weiHex, #text("0x"))) {
            Text.trimStart(weiHex, #text("0x"))
        } else {
            weiHex
        };
        
        // This is a simplified conversion - in production you'd want proper big number arithmetic
        // For now, just return the hex value
        "0x" # cleanHex # " Wei"
    };
}