import EvmRpc "canister:evm_rpc";

import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";

actor {
  public func getFeeHistory() : async ?EvmRpc.FeeHistory {

    // Configure RPC request
    let services = #EthMainnet(null);
    let config = null;

    // Add cycles to next call
    Cycles.add<system>(2000000000);

    // Call an RPC method
    let result = await EvmRpc.eth_feeHistory(
      services,
      config,
      {
        blockCount = 3;
        newestBlock = #Latest;
        rewardPercentiles = null;
      },
    );

    // Process results

    switch result {
      // Consistent, successful results
      case (#Consistent(#Ok history)) {
        Debug.print("Success: " # debug_show history);
        history
      };
      // Consistent error message
      case (#Consistent(#Err error)) {
        Debug.trap("Error: " # debug_show error);
      };
      // Inconsistent results between RPC providers
      case (#Inconsistent(_results)) {
        Debug.trap("Inconsistent results");
      };
    };
  };
};