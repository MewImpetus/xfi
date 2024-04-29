import "@stdlib/deploy";
import "./jetton";

message Mint {
    amount: Int;
    receiver: Address;
    receiver_str: String;
    txid: String;
    proof_length: Int as uint8;
    proof: Cell;
}

message MerkleRoot {
    value: String;
}

message MerkleAdmin {
    admin: Address;
}

message MintSetting {
    set_interval: Int as uint32;
    max_mint_today: Int as uint64;
}

struct ClaimInfo {
    merkle_root : String;
    set_at : Int as uint32 = 0;
    set_interval: Int as uint32 = 24 * 3600;
    admin : Address;
    max_mint_today : Int as uint64;  // Maximum mintable today
    minted_today : Int as uint64;   // minted amount today
}


contract Tweetfi with Jetton, Deployable {
    total_supply: Int as coins;
    owner: Address;
    content: Cell;
    mintable: Bool;
    claim_info: ClaimInfo;

    max_supply: Int as coins; // Extract parameter we set here. The Jetton Standards doesn't have this parameter.

    init(content: Cell, max_supply: Int, claim_info: ClaimInfo) {
        self.total_supply = 0;
        self.owner = sender();
        self.mintable = true;
        self.content = content;
        self.max_supply = max_supply;
        self.claim_info = claim_info;
    }


    receive(msg: Mint) { // 0xfc708bd2
        require(self.mintable, "Not mintable");
        require(self.total_supply + msg.amount <= self.max_supply, "Max supply exceeded");
        let sb: StringBuilder = beginString();
        sb.append(msg.txid);
        sb.append(msg.receiver_str);
        sb.append(msg.amount.toString());
        let current_hash:Int = sha256(sb.toString());
        // require(self.verify_proof(current_hash, msg.proof, msg.proof_length), "Illegal mint");

        self.mint(msg.receiver, msg.amount, self.owner, 666); // (to, amount, response_destination) 
    }

    receive("Mint: 100") { // Public Minting
        require(self.mintable, "Not mintable");
        require(self.total_supply + 100 <= self.max_supply, "Max supply exceeded");
        self.mint(sender(), 100, self.owner, 0); // 🔴 
    }

    receive("Owner: MintClose") {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Not owner");
        self.mintable = false;
    }

    receive(merkle_root: MerkleRoot) {
        require(sender() == self.claim_info.admin, "Only for Admin Use");
        require(now() - self.claim_info.set_at > self.claim_info.set_interval, "Setting Time Not Yet Cooled Down");
        self.claim_info.merkle_root = merkle_root.value;
        self.claim_info.set_at = now();
        self.claim_info.minted_today = 0;
    }

    receive(merkle_admin: MerkleAdmin) {
        self.requireOwner();
        self.claim_info.admin = merkle_admin.admin;
    }

    receive(settings: MintSetting) {
        self.requireOwner();
        self.claim_info.set_interval = settings.set_interval;
        self.claim_info.max_mint_today = settings.max_mint_today;
    }


    fun verify_proof(target_hash: Int, proof: Cell, proof_length: Int): Bool {
        let current_hash: String = target_hash.toString();
        let i: Int = 0;
        let parser: Slice = proof.beginParse();
        repeat (proof_length) {
            if (i > 0 && !parser.refsEmpty()) {
                parser = parser.loadRef().beginParse();
            }
            let _hash: Int = parser.loadUint(256);
            let _position: Int = parser.loadUint(1);

            let sb: StringBuilder = beginString();
            
            if (_position == 0) {
                sb.append(_hash.toString());
                sb.append(current_hash);
                current_hash = sha256(sb.toString()).toString();
            } else{
                sb.append(current_hash);
                sb.append(_hash.toString());
                current_hash = sha256(sb.toString()).toString();
            }
            i = i + 1;
        }
        return current_hash == self.claim_info.merkle_root;
    }
} 