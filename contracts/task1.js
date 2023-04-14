const ethers = require('ethers');
const fs = require('fs');
const solc = require('solc');
const readlineSync = require('readline-sync');

function myCompiler(solc, fileName, contractName, contractCode) {
    // настраиваем структуру input для компилятора
    let input = {
        language: 'Solidity',
        sources: {
            [fileName]: {
                content: contractCode
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    let output = JSON.parse(solc.compile(JSON.stringify(input)));
    let ABI = output.contracts[fileName][contractName].abi;
    let bytecode = output.contracts[fileName][contractName].evm.bytecode.object;

    fs.writeFileSync(__dirname + '/' + contractName + '.abi', JSON.stringify(ABI));
    fs.writeFileSync(__dirname + '/' + contractName + '.bin', bytecode);
}

async function main() {
    const fName = 'example.sol';
    const cName = 'Example';
    const cCode = fs.readFileSync(__dirname + '/' + fName, 'utf-8')
    
    myCompiler(solc, fName, cName, cCode);

    const ABI = JSON.parse(fs.readFileSync(__dirname + '/' + 'Example.abi', 'utf-8'));
    const bytecode = fs.readFileSync(__dirname + '/' + 'Example.bin', 'utf-8');

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
    const list = await provider.listAccounts();
    const signer = provider.getSigner(list[0]);
    let exampleFactory = new ethers.ContractFactory(ABI, bytecode, signer);
    console.log(exampleFactory.interface.functions);
    let exampleContract = await exampleFactory.deploy(0, 0, "");
    await exampleContract.deployTransaction.wait().then(console.log);

    while (true) {
        let choice = readlineSync.question(`
        Выберите функцию для вызова: 
        1. setStr(string)
        2. setXY(uint256,uint256)
        3. getXY()
        4. init(uint256)
        5. addToMap(address,(uint256,string))
        6. getData()
        7. getX()
        8. getY()
        9. getStr()
        10. map(address)
        0. Cancel
    `)
    if (choice === '1') {
        let _str = readlineSync.question('Введите стоку: ');
        console.log(await exampleContract.setStr(_str));
    } if (choice === '2') {
        let _x = readlineSync.question('Введите число x: ');
        let _y = readlineSync.question('Введите число y: ');
        console.log(await exampleContract.setXY(_x, _y));
    } if (choice === '3') {
        console.log(await exampleContract.getXY());
    } if (choice === '4') {
        let coin = readlineSync.question('Введите число: ');
        console.log(await exampleContract.init(coin));
    } if (choice === '5') {
        let adr = readlineSync.question('Введите адрес: ');
        let _x = readlineSync.question('Введите число x: ');
        let _str = readlineSync.question('Введите стоку: ');
        let st = {x: _x, str: _str}
        console.log(await exampleContract.addToMap(adr, st));
    } if (choice === '6') {
        console.log(await exampleContract.getData());
    } if (choice === '7') {
        console.log(await exampleContract.x());
    } if (choice === '8') {
        console.log(await exampleContract.y());
    } if (choice === '9') {
        console.log(await exampleContract.str());
        process.exit(1);
    } if (choice === '10') {
        let adr = readlineSync.question('Введите адрес: ');
        console.log(await exampleContract.map(adr));
    } if (choice === '0') {
        break;
    }
    }
}

main();