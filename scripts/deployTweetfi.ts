import { toNano, Address } from '@ton/core';
import { Tweetfi } from '../wrappers/Tweetfi';
import { NetworkProvider } from '@ton/blueprint';
import { buildOnchainMetadata } from "./utils/jetton-helpers";

export async function run(provider: NetworkProvider) {

    const deployer = provider.sender();
    console.log('Deploying contract with deployer address', deployer.address);

    const jettonParams = {
        name: "Tweetfi",
        description: "TweetFi (TEF) is an innovative social media mining platform that aims to provide social media users with a share to earn channel by combining AI technology and blockchain token economics.",
        symbol: "TEF",
        image: "https://raw.githubusercontent.com/MewImpetus/xfi/main/logo.png",
    };

    let content = buildOnchainMetadata(jettonParams);
    let max_supply = toNano(1000000000);

    const tweetfi = provider.open(await Tweetfi.fromInit(
        content,
        max_supply,
        {
            $$type: "ClaimInfo",
            merkle_root: "81358221309625082040606256653695893517429502780182147497941063822898109247493",
            set_at: BigInt(0),
            set_interval: BigInt(24),
            admin: Address.parse("UQAVWJbfEIGvKOht-utclCtzpnitbaWm70HwRa24NoTpUJ9C"),
            max_mint_today: toNano(10000000),
            minted_today: BigInt(0),
        }));

        await tweetfi.send(
            provider.sender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );




    

    await provider.waitForDeploy(tweetfi.address);

    // run methods on `tweetfi`
}
