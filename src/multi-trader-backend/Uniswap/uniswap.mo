import EvmRpc "canister:evm_rpc";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";

actor {
  public func call() : async ?Text {
    let services : EvmRpc.RpcServices = #EthMainnet(
      ?[
        #Llama,
        // #Alchemy,
        // #Cloudflare
      ]
    );
    let config = null;

    // Add cycles for RPC call
    Cycles.add<system>(2000000000);

    // Uniswap V2 USDC/WETH Pair contract address
    let contractAddress = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";

    // ABI-encoded method call for `getReserves()`
    let methodSignature = "0x0902f1ac";

    // Send eth_call
    let result = await EvmRpc.eth_call(services, config, {
      block = null;
      transaction = {
        to = ?contractAddress;
        input = ?methodSignature;
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

    switch result {
      case (#Consistent(#Ok response)) {
        Debug.print("Success: " # debug_show response);
        ?response
      };
      case (#Consistent(#Err error)) {
        Debug.trap("Error: " # debug_show error);
        null
      };
      case (#Inconsistent(results)) {
  Debug.print("Warning: Inconsistent results across RPC providers.");
  Debug.print(debug_show results);
  null
};

    };
  };
};
