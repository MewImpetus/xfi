import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, toNano } from '@ton/core';
import { Tweetfi } from '../wrappers/Tweetfi';
import '@ton/test-utils';
import { buildOnchainMetadata } from "../scripts/utils/jetton-helpers";

describe('Tweetfi', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tweetfi: SandboxContract<Tweetfi>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        const jettonParams = {
            name: "Tweetfi0",
            description: "TweetFi (TEF) is an innovative social media mining platform that aims to provide social media users with a share to earn channel by combining AI technology and blockchain token economics.",
            symbol: "TEF",
            image: "https://raw.githubusercontent.com/MewImpetus/xfi/main/logo.png",
        };
    
        let content = buildOnchainMetadata(jettonParams);
        let max_supply = toNano(1000000000);

        tweetfi = blockchain.openContract(await Tweetfi.fromInit( content,
            max_supply,
            {
                $$type: "ClaimInfo",
                merkle_root: "46469001986676634095880842404468938099931063840840827130771048724708574502014",
                set_at: BigInt(0),
                set_interval: BigInt(24),
                admin: Address.parse("UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs"),
                max_mint_today: toNano(10000000),
                minted_today: BigInt(0),
            }));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await tweetfi.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tweetfi.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tweetfi are ready to use


        
    });
});
