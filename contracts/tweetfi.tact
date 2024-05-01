import "@stdlib/deploy";
import "./JettonMaster";
import "./JettonWallet";


message  Mint {
    receiver: Address;      // address of receiver
    amount: Int;            // amount of jettons to mint
    receiver_str: String;  // the str(receiver address)
    txid: String; // the reward tx id
    proof_length: Int as uint8;
    proof: Cell;
}

struct MintConfig {
    merkle_root : String;
    set_at : Int as uint32 = 0;
    set_interval: Int as uint32 = 24 * 3600;
    admin : Address;
    max_mint_today : Int as uint64;  // Maximum mintable today
    minted_today : Int as uint64;   // minted amount today
}

message MerkleRoot {
    value: String;
}

message MerkleAdmin {
    admin: Address;
}

message Tip {
    query_id: Int as uint64;                
    amount: Int as coins;                   
    destination: Address;                   
    response_destination: Address;          
    custom_payload: Cell?;                  
    forward_ton_amount: Int as coins;       
    forward_payload: Slice as remaining;    
}



contract TweetfiWallet with JettonWallet {
    balance: Int as coins = 0;
    illiquid_balance: Int as coins = 0;
    owner: Address;
    jetton_master: Address;
    claimed: map<Int, Bool>;

    init(owner: Address, jetton_master: Address) {
        self.owner = owner;
        self.jetton_master = jetton_master;
    }

  

    receive(msg: Tip) {

        let ctx: Context = context();
        self.illiquid_balance = self.illiquid_balance - msg.amount;
        require(self.illiquid_balance >= 0, "JettonWallet: Not enough illiquid jettons to transfer");
        // 90% to the destination
        let burn_amount : Int = msg.amount / 10;
        require(msg.amount - burn_amount > 0, "JettonWallet: Not enough jettons to burn");
        let _msg: JettonTransfer = JettonTransfer {
                query_id: msg.query_id,
                amount: msg.amount - burn_amount,
                destination: msg.destination,
                response_destination: msg.response_destination,
                custom_payload: msg.custom_payload,
                forward_ton_amount: msg.forward_ton_amount,
                forward_payload: msg.forward_payload
        };
        self._transfer_validate(ctx, _msg);
        self._transfer_estimate_remain_value(ctx, _msg);
        // require(ctx.sender != msg.target, "Cannot tip oneself");
        // 90% transfer
        self._transfer_jetton(ctx, _msg);
        // 10% to burning
        self._burn_tokens(ctx, JettonBurn {
                    query_id: msg.query_id,        
                    amount: burn_amount,           
                    response_destination: msg.response_destination,
                    custom_payload: msg.custom_payload
        });
    }

        

    receive(msg: JettonInternalTransfer) {
        let ctx: Context = context();
        // claim settings
        let cash: Int = msg.amount;
        let parser : Slice = msg.forward_payload;
        if (parser.bits() == 32 + 16 + 256){
            let op: Int = parser.loadUint(16);
            let check_code: Int = parser.loadUint(16);
            if (op==0 && check_code == 9999) {
                let txid: Int = parser.loadUint(256);
                require(self.claimed.get(txid) != true, "Duplicate transaction!");
                cash = msg.amount / 2;
                self.illiquid_balance = self.illiquid_balance + msg.amount - cash;
                require(self.balance >= 0, "JettonWallet: Not allow negative balance after internal transfer");
                self.claimed.set(txid, true);
            }
        
        }
        self.balance = self.balance + cash;
        require(self.balance >= 0, "JettonWallet: Not allow negative balance after internal transfer");
        self._internal_transfer_validate(ctx, msg);
        let remain: Int = self._internal_transfer_estimate_remain_value(ctx, msg);
        if (msg.forward_ton_amount > 0){
            self._internal_transfer_notification(ctx, msg);
        }
        self._internal_transfer_excesses(ctx, msg, remain);
    }

    bounced(src: bounced<JettonInternalTransfer>) {
        self.balance = self.balance + src.amount;
    }

    bounced(src: bounced<JettonBurnNotification>) {
        self.balance = self.balance + src.amount;
    }
   

    get fun get_illiquid_balance(): String {
        return self.illiquid_balance.toString();
    }

    override inline fun calculate_jetton_wallet_init(owner_address: Address): StateInit {
        return initOf TweetfiWallet(owner_address, self.jetton_master);
    }


}

contract Tweetfi with JettonMaster, Deployable {
    total_supply: Int as coins = 0;
    mintable: Bool = true;
    owner: Address;
    jetton_content: Cell;

    max_supply: Int as coins;
    mint_config: MintConfig;

    init(owner: Address, jetton_content: Cell, max_supply: Int, mint_config: MintConfig){
        self.owner = owner;
        self.jetton_content = jetton_content;  
        self.max_supply = max_supply;
        self.mint_config = mint_config;
    }

    receive(msg: Mint) {
        let ctx: Context = context();
        let _msg: JettonMint = JettonMint{
            origin: ctx.sender,
            receiver: ctx.sender,
            amount: msg.amount,
            custom_payload: emptyCell(),
            forward_ton_amount: 0,
            forward_payload: beginCell().storeUint(0, 32).storeUint(2024, 16).storeUint(sha256(msg.txid), 256).endCell().asSlice()
        };
        require(self.total_supply + msg.amount <= self.max_supply, "");
        require(self.mint_config.minted_today + msg.amount <= self.mint_config.max_mint_today, "Mining cap reached today");
        require(self.mintable, "JettonMaster: Jetton is not mintable");
        self._merkel_mint_validate(msg);
        self._mint(ctx, _msg);
    }

    receive(merkle_root: MerkleRoot) {
        require(sender() == self.mint_config.admin, "No permission to operate");
        require(now() - self.mint_config.set_at > self.mint_config.set_interval, "Setting Time Not Yet Cooled Down");
        self.mint_config.merkle_root = merkle_root.value;
        self.mint_config.set_at = now();
        self.mint_config.minted_today = 0;
    }

    receive(merkle_admin: MerkleAdmin) {
        require(sender() == self.owner, "No permission to operate");
        self.mint_config.admin = merkle_admin.admin;
    }


    get fun max_supply() : Int {
        return self.max_supply;
    }


    fun _sha128(s: String) : String {
        return (sha256(s) >> 128).toString();
    }

    fun _merkel_mint_validate(msg: Mint) {
        let ctx: Context = context();
        let sb: StringBuilder = beginString();
        sb.append(msg.txid);
        sb.append(msg.receiver_str);
        sb.append(msg.amount.toString());
        let tx_str :String = sb.toString();
        require(self.verify_proof(self._sha128(tx_str), msg.proof, msg.proof_length) == true, "Merkel tree verification failed");
    }

    override inline fun calculate_jetton_wallet_init(owner_address: Address): StateInit {
        return initOf TweetfiWallet(owner_address, myAddress());
    }


 
    fun verify_proof(target_hash: String, proof: Cell, proof_length: Int): Bool {
        let current_hash: String = target_hash;
        let frist_cell: Bool = true; 
        let parser : Slice = proof.beginParse();
        repeat (proof_length) {
            if (!frist_cell) {
                if !parser.refsEmpty() {
                    parser = parser.loadRef().beginParse();
                }
            }
            let _hash: Int = parser.loadUint(128);
            let _position: Int = parser.loadUint(1);
            let sb: StringBuilder = beginString();

            // Efficiently build the string based on the position
            if (_position == 0) {
                sb.append(_hash.toString());
                sb.append(current_hash);
            } else {
                sb.append(current_hash);
                sb.append(_hash.toString());
            }

            current_hash = self._sha128(sb.toString());  // Update the hash after building the string
            frist_cell = false;
        }

        return current_hash == self.mint_config.merkle_root;
    }

    //======================================================
    // Just For Test TODO remove 
    //======================================================
    get fun testmint(msg: Mint) : Bool {
        let sb: StringBuilder = beginString();
        sb.append(msg.txid);
        sb.append(msg.receiver_str);
        sb.append(msg.amount.toString());
        let current_hash:String = self._sha128(sb.toString());

        return self.verify_proof(current_hash, msg.proof, msg.proof_length);
    }

    get fun testcell() : Int {
            let a : Slice = beginCell().storeUint(0, 32).storeUint(2024, 16).storeUint(sha256("123"), 256).endCell().asSlice();
            let b : Int = a.loadUint(32);
            return b;
    }


    receive("Mint:1") {
        let ctx: Context = context();
        let msg: JettonMint = JettonMint{
            origin: ctx.sender,
            receiver: ctx.sender,
            amount: ton("1"),
            custom_payload: emptyCell(),
            forward_ton_amount: 0,
            forward_payload: emptySlice()
        };
        // self._mint_validate(ctx, msg);
        self._mint(ctx, msg);
    }

    //======================================================
    // Just For Test TODO remove 
    //======================================================

}