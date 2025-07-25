import EvmRpc "canister:evm_rpc";

import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";

actor {
  public func call() : async ?Text {

    // Configure RPC request
    let services = #EthMainnet(null);
    let config = null;

    // Add cycles to next call
    Cycles.add<system>(2000000000);

    // Call an Ethereum smart contract. The smart contract's information in this example is hard-coded.
    let result = await EvmRpc.eth_call(services, config, {
      block = null;
      transaction = {
        to = ?"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        input = ?"0x70a08231000000000000000000000000b25eA1D493B49a1DeD42aC5B1208cC618f9A9B80"; // ABI-encoded
        accessList = null;
        blobVersionedHashes = null;
        blobs = null;
        chainId = null;
        from = null;
        gas = null;
        gasPrice = null;
        maxFeePerBlobGas = null;
        maxFeePerGas = null;
        maxPriorityFeePerGas = null;
        nonce = null;
        type_ = null;
        value = null
      };
    });

    // Process results
    switch result {
      // Prints the response if each RPC provider returns a consistent, successful result
      case (#Consistent(#Ok response)) {
        Debug.print("Success: " # debug_show response);
        ?response // ABI-encoded
      };
      // Trap is an RPC provider that returns an error message consistent with the response of the other providers
      case (#Consistent(#Err error)) {
        Debug.trap("Error: " # debug_show error);
        null
      };
      // Trap if an RPC provider returns a response inconsistent with the other providers
      case (#Inconsistent(_results)) {
        Debug.trap("Inconsistent results");
        null
      };
    };
  };
};