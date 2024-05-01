import { Address, toNano, beginCell } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TweetfiWallet } from '../wrappers/TweetfiWallet';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse("kQBsEO-l_zcFoSd3ilM5PkZHhpIlyRNdB8S9d4BIzSSZhPHD");


    const hub = provider.open(TweetfiWallet.fromAddress(address));

    

    await hub.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        {
            $$type: "Tip",
            query_id: 0n,
            amount: toNano(100),
            destination: Address.parse("UQAQIFfuMdPuWacwN93eD-jJU9f8uUpjAGE1HGtiHyM7274s"),

        }
    )

    
    ui.write('Waiting for send...');

    ui.write('successfully!');
}
