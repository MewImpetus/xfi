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
        symbol: "TEF0.5.13",
        image: "https://raw.githubusercontent.com/MewImpetus/xfi/main/logo.png",
    };

    let content = buildOnchainMetadata(jettonParams);
    let max_supply = toNano(1000000000);

    const tweetfi = provider.open(await Tweetfi.fromInit(
        Address.parse("UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs"),
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



    await tweetfi.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );





    await provider.waitForDeploy(tweetfi.address);

    // run methods on `tweetfi`
}
