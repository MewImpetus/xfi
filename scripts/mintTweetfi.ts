import { Address, toNano, Cell, beginCell, Slice } from '@ton/core';
import { Tweetfi } from '../wrappers/Tweetfi';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse("EQDDOwbhfCSzFNhgRo-QDzj-zQARjXRndfW5tX8W4upJO_ba");


    const hub = provider.open(Tweetfi.fromAddress(address));


    // await hub.send(
    //     provider.sender(),
    //     {
    //         value: toNano('0.05'),
    //     },
    //     "Mint: 100"
    // );



    let cell2: Cell = beginCell()
    .storeUint(46248862118385798773055515178124195033433472036846087530465803139634289864007n, 256)
    .storeUint(1, 1).endCell();

    let cell1: Cell = beginCell().storeRef(cell2)
    .storeUint(49321590554534533049099385644279491224900104974179533593752405396217931868711n, 256)
    .storeUint(1, 1).endCell();
    
    

    // let counterBefore = await hub.getMintinfo( {
    //     $$type: "Proof",
    //     proof: cell1
    // });

    // console.log(`a:${counterBefore}`)
    

    await hub.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: "Mint",
            amount: toNano(1),
            receiver: Address.parse("EQCWXkzi8us8luuowT1A5m5UWXVbbNZiIzMf363kusGxCPQr"),
            receiver_str: "UQAkZEqn5O4_yI3bCBzxpLEsO1Z10QSGDK5O4buL9nQrWNAs",
            txid: "123",
            proof_length: BigInt(2),
            proof: cell1
        }
    )

    
    ui.write('Waiting for send...');

    // ui.write('successfully!');
}
