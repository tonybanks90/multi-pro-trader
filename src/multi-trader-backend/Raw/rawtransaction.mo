import EvmRpc "canister:evm_rpc";

import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";

actor {
  public func sendRawTransaction() : async ?EvmRpc.SendRawTransactionStatus {

    // Configure RPC request
    let services = #EthMainnet(null);
    let config = null;

    // Add cycles to next call
    Cycles.add<system>(2000000000);

    // Call an RPC method
    let result = await EvmRpc.eth_sendRawTransaction(
      services,
      config,
      "0xf86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83",
    );

    switch result {
      // Consistent, successful results
      case (#Consistent(#Ok status)) {
        Debug.print("Status: " # debug_show status);
        ?status
      };
      // Consistent error message
      case (#Consistent(#Err error)) {
        Debug.trap("Error: " # debug_show error);
        null
      };
      // Inconsistent results between RPC providers
      case (#Inconsistent(_results)) {
        Debug.trap("Inconsistent results");
        null
      };
    };
  };
};