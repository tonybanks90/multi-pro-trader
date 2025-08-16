import EvmRpc "canister:evm_rpc";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Array "mo:base/Array";

// Simulating EVM RPC canister interface
module {
  public type JsonRpcResult = {
    result: ?Text;
    error: ?Text;
  };

  public type RpcRequest = {
    jsonrpc: Text;
    method: Text;
    params: [Text];
    id: Nat;
  };

  public type RpcResponse = {
    jsonrpc: Text;
    result: ?Text;
    error: ?{ code: Int; message: Text };
    id: Nat;
  };

  public actor class EthereumWalletManager() = this {

    // Store user's generated Ethereum addresses
    stable var userWallets : HashMap.HashMap<Principal, [Text]> = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);

    // Counter for RPC request IDs
    var requestId : Nat = 0;

    // Generate a new Ethereum address via ChainFusion EVM RPC canister
    public shared (msg) func generateEthAddress() : async Text {
      let caller = msg.caller;

      requestId += 1;

      let request : RpcRequest = {
        jsonrpc = "2.0";
        method = "wallet_newAccount"; // Assuming this is supported — might require a custom endpoint
        params = [];
        id = requestId;
      };

      // Simulating EVM RPC call
      let response = await EvmRpc.call(JSON.stringify(request));
      let parsed : RpcResponse = JSON.parse<RpcResponse>(response);

      switch (parsed.result) {
        case (?ethAddress) {
          // Store the new address
          let current = switch (userWallets.get(caller)) {
            case (?arr) arr;
            case null [];
          };
          userWallets.put(caller, Array.append(current, [ethAddress]));
          return ethAddress;
        };
        case null {
          Debug.print("Error generating address: " # debug_show(parsed.error));
          return "Error: Could not generate address.";
        };
      };
    };

    // Get all Ethereum addresses for the logged-in user
    public query func getMyEthAddresses(principal : Principal) : async [Text] {
      switch (userWallets.get(principal)) {
        case (?addresses) addresses;
        case null [];
      };
    };

    // (Optional stub) send tokens from one of the addresses
    public shared (msg) func sendEth(fromAddress: Text, toAddress: Text, amountWei: Text) : async Text {
      requestId += 1;
      let txParams = [
        "{ \"from\": \"" # fromAddress # "\", \"to\": \"" # toAddress # "\", \"value\": \"" # amountWei # "\" }"
      ];

      let txRequest : RpcRequest = {
        jsonrpc = "2.0";
        method = "eth_sendTransaction";
        params = txParams;
        id = requestId;
      };

      let response = await EvmRpc.call(JSON.stringify(txRequest));
      let parsed : RpcResponse = JSON.parse<RpcResponse>(response);

      switch (parsed.result) {
        case (?txHash) txHash;
        case null "Error sending transaction.";
      };
    };
  };
}
