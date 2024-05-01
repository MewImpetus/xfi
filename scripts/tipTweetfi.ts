import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TweetfiWallet } from '../wrappers/TweetfiWallet';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse("kQCCioUcVYfEmceu1a2XsR6G02LBhsl2gsTi0Jw5cAo5DqbY");


    const hub = provider.open(TweetfiWallet.fromAddress(address));

    

    await hub.send(
        provider.sender(),
        {
            value: toNano('1'),
        },
        {
            $$type: "Tip",
            query_id: 0n,
            amount: toNano(100),
            target: Address.parse("UQAVWJbfEIGvKOht-utclCtzpnitbaWm70HwRa24NoTpUJ9C"),
        }
    )

    
    ui.write('Waiting for send...');

    ui.write('successfully!');
}
