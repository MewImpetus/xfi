import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano, Cell, beginCell } from '@ton/core';
import { Tweetfi } from '../wrappers/Tweetfi';
import { TweetfiWallet } from '../wrappers/TweetfiWallet';
import '@ton/test-utils';
import { buildOnchainMetadata } from "../scripts/utils/jetton-helpers";



describe('TOken', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let alice: SandboxContract<TreasuryContract>;
    let jettonMaster: SandboxContract<Tweetfi>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        alice = await blockchain.treasury('alice');
       

        const jettonParams = {
            name: "jettonMaster1",
            description: "jettonMaster (TEF) is an innovative social media mining platform that aims to provide social media users with a share to earn channel by combining AI technology and blockchain token economics.",
            symbol: "TEF",
            image: "https://raw.githubusercontent.com/MewImpetus/xfi/main/logo.png",
        };

        let content = buildOnchainMetadata(jettonParams);
        let max_supply = toNano(10000000000);

        
        jettonMaster = blockchain.openContract(await Tweetfi.fromInit(
            owner.address,
            content,
            max_supply,
            {
                $$type: "MintConfig",
                merkle_root: "147596663615302291649424969521479109454",
                set_at: 0n,
                set_interval: 24n,
                admin: Address.parse("UQAVWJbfEIGvKOht-utclCtzpnitbaWm70HwRa24NoTpUJ9C"),
                max_mint_today: toNano(10000000),
                minted_today: 0n,
            }
        ));




        const deployResult = await jettonMaster.send(
            owner.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: owner.address,
            to: jettonMaster.address,
            deploy: true,
            success: true,
        });
    });


    it('Test: get Mint result', async () => {


        let cell2: Cell = beginCell()
            .storeUint(172282571249944562391355093940656328312n, 128)
            .storeUint(1, 1).endCell();

        let cell1: Cell = beginCell().storeRef(cell2)
            .storeUint(144943127676063095663117939959419744222n, 128)
            .storeUint(1, 1).endCell();

        let jd = await jettonMaster.getTestmint({
            $$type: "Mint",
            amount: toNano(10000),
            receiver: Address.parse("UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs"),
            receiver_str: "UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs",
            txid: "123",
            proof_length: BigInt(2),
            proof: cell1
        })

        console.log(jd)

    });


    it('Test: Mint', async () => {


        let cell2: Cell = beginCell()
            .storeUint(172282571249944562391355093940656328312n, 128)
            .storeUint(1, 1).endCell();

        let cell1: Cell = beginCell().storeRef(cell2)
            .storeUint(144943127676063095663117939959419744222n, 128)
            .storeUint(1, 1).endCell();

        const mintResult = await jettonMaster.send(

            owner.getSender(),
            {
                value: toNano('0.5'),
            },
            {
                $$type: "Mint",
                amount: toNano(10000),
                receiver: Address.parse("UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs"),
                receiver_str: "UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs",
                txid: "123",
                proof_length: 2n,
                proof: cell1
            }
        )
        
        expect(mintResult.transactions).toHaveTransaction({
            success: true,
        });

        let jd = await jettonMaster.getGetJettonData()

        console.log(jd.total_supply)

    });

    

});
