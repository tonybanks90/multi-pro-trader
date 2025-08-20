import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Char "mo:base/Char";
import Int "mo:base/Int";

actor PumpPortal {

    // Types for HTTP outcalls (updated with new features)
    type HttpRequestArgs = {
        url : Text;
        max_response_bytes : ?Nat64;
        headers : [HttpHeader];
        body : ?[Nat8];
        method : HttpMethod;
        transform : ?TransformRawResponseFunction;
        // New fields for enhanced outcalls
        ip_version : ?IpVersion;
        replicated : ?Bool;
    };

    type IpVersion = {
        #ipv4;
        #ipv6;
        #any;
    };

    type HttpHeader = {
        name : Text;
        value : Text;
    };

    type HttpMethod = {
        #get;
        #post;
        #head;
    };

    type HttpResponsePayload = {
        status : Nat;
        headers : [HttpHeader];
        body : [Nat8];
    };

    type TransformRawResponseFunction = {
        function : shared query TransformRawResponse -> async HttpResponsePayload;
        context : Blob;
    };

    type TransformRawResponse = {
        status : Nat;
        body : [Nat8];
        headers : [HttpHeader];
        context : Blob;
    };

    // Token metadata type
    type TokenMetadata = {
        address: Text;
        name: ?Text;
        symbol: ?Text;
        decimals: ?Nat;
        description: ?Text;
        image: ?Text;
        supply: ?Text;
        error: ?Text;
    };

    // Transform function for HTTP responses
    public query func transform_response(raw : TransformRawResponse) : async HttpResponsePayload {
        let transformed : HttpResponsePayload = {
            status = raw.status;
            body = raw.body;
            headers = [
                {
                    name = "Content-Security-Policy";
                    value = "default-src 'self'";
                },
                {
                    name = "Referrer-Policy";
                    value = "strict-origin";
                },
                {
                    name = "Permissions-Policy";
                    value = "geolocation=(),microphone=(),camera=()";
                },
                {
                    name = "Strict-Transport-Security";
                    value = "max-age=63072000";
                },
                {
                    name = "X-Frame-Options";
                    value = "DENY";
                },
                {
                    name = "X-Content-Type-Options";
                    value = "nosniff";
                },
            ];
        };
        transformed;
    };

    // Helper function to convert [Nat8] to Text
    private func nat8ArrayToText(bytes : [Nat8]) : Text {
        let chars = Array.map<Nat8, Char>(bytes, func (byte) {
            Char.fromNat32(Nat32.fromNat(Nat8.toNat(byte)))
        });
        Text.fromIter(Iter.fromArray(chars));
    };

    // Parse JSON response to extract token metadata
    private func parseTokenMetadata(address: Text, jsonText: Text) : TokenMetadata {
        // Simple JSON parsing - in production, use a proper JSON parser
        let metadata : TokenMetadata = {
            address = address;
            name = extractJsonField(jsonText, "name");
            symbol = extractJsonField(jsonText, "symbol");
            decimals = switch (extractJsonField(jsonText, "decimals")) {
                case (?decimalsText) { 
                    switch (parseNat(decimalsText)) {
                        case (?n) { ?n };
                        case null { null };
                    };
                };
                case null { null };
            };
            description = extractJsonField(jsonText, "description");
            image = extractJsonField(jsonText, "image");
            supply = extractJsonField(jsonText, "supply");
            error = null;
        };
        metadata;
    };

    // Simple JSON field extractor (basic implementation)
    private func extractJsonField(json: Text, field: Text) : ?Text {
        let pattern = "\"" # field # "\":";
        let chars = Iter.toArray(json.chars());
        let patternChars = Iter.toArray(pattern.chars());
        
        // Find pattern in text
        var found = false;
        var startIndex = 0;
        
        for (i in Iter.range(0, chars.size() - patternChars.size())) {
            var match = true;
            for (j in Iter.range(0, patternChars.size() - 1)) {
                if (chars[i + j] != patternChars[j]) {
                    match := false;
                };
            };
            if (match) {
                found := true;
                startIndex := i + patternChars.size();
            };
        };
        
        if (not found) {
            return null;
        };
        
        // Skip whitespace
        while (startIndex < chars.size() and chars[startIndex] == ' ') {
            startIndex += 1;
        };
        
        if (startIndex >= chars.size()) {
            return null;
        };
        
        // Extract value
        if (chars[startIndex] == '"') {
            // String value
            startIndex += 1; // Skip opening quote
            var endIndex = startIndex;
            while (endIndex < chars.size() and chars[endIndex] != '"') {
                endIndex += 1;
            };
            if (endIndex >= chars.size()) {
                return null;
            };
            let valueChars = Array.subArray(chars, startIndex, endIndex - startIndex);
            ?Text.fromIter(Iter.fromArray(valueChars));
        } else {
            // Number or other value
            var endIndex = startIndex;
            while (endIndex < chars.size() and 
                   chars[endIndex] != ',' and 
                   chars[endIndex] != '}' and 
                   chars[endIndex] != ']' and 
                   chars[endIndex] != ' ') {
                endIndex += 1;
            };
            let valueChars = Array.subArray(chars, startIndex, endIndex - startIndex);
            ?Text.fromIter(Iter.fromArray(valueChars));
        };
    };

    // Parse natural number from text
    private func parseNat(text: Text) : ?Nat {
        var result : Nat = 0;
        for (char in text.chars()) {
            let n = Char.toNat32(char);
            if (n >= 48 and n <= 57) { // '0' to '9'
                result := result * 10 + Nat32.toNat(n - 48);
            } else {
                return null;
            };
        };
        ?result;
    };

    // Enhanced fetch function with IP version and replication options
    private func fetchSingleMetadataWithOptions(
        address: Text, 
        ipVersion: IpVersion, 
        replicated: Bool
    ) : async TokenMetadata {
        let ic : actor {
            http_request : HttpRequestArgs -> async HttpResponsePayload;
        } = actor ("aaaaa-aa");

        let url = "https://api.solana.fm/v1/tokens/" # address;
        
        let request : HttpRequestArgs = {
            url = url;
            max_response_bytes = ?2048;
            headers = [
                { name = "Accept"; value = "application/json" },
                { name = "User-Agent"; value = "IC-HTTP-Client/1.0" },
                { name = "Cache-Control"; value = "no-cache" }
            ];
            body = null;
            method = #get;
            transform = if (replicated) {
                ?{
                    function = transform_response;
                    context = Text.encodeUtf8("transform");
                }
            } else {
                null // No transform needed for non-replicated calls
            };
            ip_version = ?ipVersion;
            replicated = ?replicated;
        };

        // Adjust cycles based on replication setting
        let cyclesNeeded = if (replicated) {
            230_949_972_000 // Full cycles for replicated calls
        } else {
            115_474_986_000 // Reduced cycles for non-replicated calls
        };

        try {
            let response = await (with (cyclesNeeded) ic.http_request(request));
            
            if (response.status == 200) {
                let responseText = nat8ArrayToText(response.body);
                parseTokenMetadata(address, responseText);
            } else {
                {
                    address = address;
                    name = null;
                    symbol = null;
                    decimals = null;
                    description = null;
                    image = null;
                    supply = null;
                    error = ?"HTTP Error: " # Nat.toText(response.status) # " (IP: " # (switch (ipVersion) {
                        case (#ipv4) { "IPv4" };
                        case (#ipv6) { "IPv6" };
                        case (#any) { "Any" };
                    }) # ")";
                };
            };
        } catch (error) {
            {
                address = address;
                name = null;
                symbol = null;
                decimals = null;
                description = null;
                image = null;
                supply = null;
                error = ?"Request failed: " # Error.message(error);
            };
        };
    };

    // Fetch metadata for a single token address (with non-replicated call)
    private func fetchSingleMetadata(address: Text) : async TokenMetadata {
        await fetchSingleMetadataWithOptions(address, #ipv4, false);
    };

    // Public function to fetch metadata for multiple addresses (basic version)
    public func getTokensMetadata(addresses: [Text]) : async [TokenMetadata] {
        let results = Buffer.Buffer<TokenMetadata>(addresses.size());
        
        // Process addresses sequentially to avoid overwhelming the API
        for (address in addresses.vals()) {
            let metadata = await fetchSingleMetadata(address);
            results.add(metadata);
        };
        
        Buffer.toArray(results);
    };

    // Fast non-replicated version for high-performance needs
    public func getTokensMetadataFast(addresses: [Text]) : async [TokenMetadata] {
        let results = Buffer.Buffer<TokenMetadata>(addresses.size());
        
        for (address in addresses.vals()) {
            let metadata = await fetchSingleMetadataWithOptions(address, #ipv4, false);
            results.add(metadata);
        };
        
        Buffer.toArray(results);
    };

    // Replicated version for consensus-critical applications
    public func getTokensMetadataReplicated(addresses: [Text]) : async [TokenMetadata] {
        let results = Buffer.Buffer<TokenMetadata>(addresses.size());
        
        for (address in addresses.vals()) {
            let metadata = await fetchSingleMetadataWithOptions(address, #any, true);
            results.add(metadata);
        };
        
        Buffer.toArray(results);
    };

    // Batch fetch with different IP versions for redundancy
    public func getTokensMetadataRobust(addresses: [Text]) : async [TokenMetadata] {
        let results = Buffer.Buffer<TokenMetadata>(addresses.size());
        
        // Process addresses with fallback IP version support
        for (address in addresses.vals()) {
            var metadata : ?TokenMetadata = null;
            
            // Try IPv4 first (usually faster and more compatible)
            try {
                let ipv4Result = await fetchSingleMetadataWithOptions(address, #ipv4, false);
                metadata := ?ipv4Result;
            } catch (error) {
                Debug.print("IPv4 failed for " # address # ": " # Error.message(error));
                
                // Fallback to IPv6 if IPv4 fails
                try {
                    let ipv6Result = await fetchSingleMetadataWithOptions(address, #ipv6, false);
                    metadata := ?ipv6Result;
                } catch (error2) {
                    Debug.print("IPv6 also failed for " # address # ": " # Error.message(error2));
                };
            };
            
            switch (metadata) {
                case (?result) { results.add(result) };
                case null {
                    // Add error result if all attempts failed
                    results.add({
                        address = address;
                        name = null;
                        symbol = null;
                        decimals = null;
                        description = null;
                        image = null;
                        supply = null;
                        error = ?"All network attempts failed";
                    });
                };
            };
        };
        
        Buffer.toArray(results);
    };

    // Example function with sample addresses
    public func getSampleMetadata() : async [TokenMetadata] {
        let sampleAddresses = [
            "5zCETicUCJqJ5Z3wbfFPZqtSpHPYqnggs1wX7ZRpump", // Your example address
            "So11111111111111111111111111111111111111112",    // Wrapped SOL
            "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"    // USDC
        ];
        
        await getTokensMetadata(sampleAddresses);
    };

    // Get metadata for a single token (convenience function)
    public func getTokenMetadata(address: Text) : async TokenMetadata {
        await fetchSingleMetadata(address);
    };

    // Health check function
    public func health() : async Text {
        "Token Metadata Fetcher is running. Current time: " # Int.toText(Time.now());
    };
}