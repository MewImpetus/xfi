import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { Tweetfi } from '../wrappers/Tweetfi';
import '@ton/test-utils';

describe('Tweetfi', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tweetfi: SandboxContract<Tweetfi>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tweetfi = blockchain.openContract(await Tweetfi.fromInit());

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
