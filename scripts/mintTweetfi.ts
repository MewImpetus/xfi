import { Address, toNano, Cell, beginCell, Slice } from '@ton/core';
import { Tweetfi } from '../wrappers/Tweetfi';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse("EQBTmYcJQVHGEQ5BhV_SjnZL4rGnebA11dQtAJQQhnc4s5mM");


    const hub = provider.open(Tweetfi.fromAddress(address));




    let cell2: Cell = beginCell()
    .storeUint(172282571249944562391355093940656328312n, 128)
    .storeUint(1, 1).endCell();

    let cell1: Cell = beginCell().storeRef(cell2)
    .storeUint(144943127676063095663117939959419744222n, 128)
    .storeUint(1, 1).endCell();
    
    

    // let res = await hub.getTestmint( {
    //     $$type: "Mint",
    //     amount: toNano(10000),
    //     receiver: Address.parse("UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs"),
    //     receiver_str: "UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs",
    //     txid: "123",
    //     proof_length: BigInt(2),
    //     proof: cell1
    // });

    // console.log(`a:${res}`)

    await hub.send(
        provider.sender(),
        {
            value: toNano('0.5'),
        },
        "Mint:1"
    )
    

    // await hub.send(
    //     provider.sender(),
    //     {
    //         value: toNano('1'),
    //     },
    //     {
    //         $$type: "Mint",
    //         amount: toNano(10000),
    //         receiver: Address.parse("UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs"),
    //         receiver_str: "UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs",
    //         txid: "123",
    //         proof_length: BigInt(2),
    //         proof: cell1
    //     }
    // )

    
    ui.write('Waiting for send...');

    ui.write('successfully!');
}
