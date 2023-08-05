const ccxt = require('ccxt');
const moment = require('moment');


const binance = new ccxt.binance({
    apiKey: 'q9Ksth7qxFokdmIn5rFJTe7rw426mCZYCgOwDsTyBqxMTsXKzbxOkY4jf7XChp2x',
    secret: 'dXbiudyyPkei8vJPAG4rYLLbAqr7JvXVVch3OhoVJUBURauxmnAenxgd37Pci9eQ',
});
binance.setSandboxMode(true);

async function printBalance(btcPrice){
    const balance = await binance.fetchBalance();
    const total = balance.total;
    console.log(`Balance: BTC ${total.BTC}, USDT: ${total.USDT}`);
    console.log(`Total USDT: ${(total.BTC - 1)* btcPrice + total.USDT}. \n`);

}



async function tick(){
    const prices = await binance.fetchOHLCV('BTC/USDT', '1m', undefined, 5);
    const bPrices = prices.map(price => {
        return{
            timestamp: moment(price[0]).format(),
            open: price[1],
            high: price[2], 
            low: price[3], 
            close: price[4], 
            volume: price[5]
        }
    });
    const averagePrice = bPrices.reduce((acc, price) => acc + price.close, 0)/5;
    const lastPrice = bPrices[bPrices.length - 1].close;

    console.log(bPrices.map(p => p.close), averagePrice, lastPrice);

    const direction = lastPrice > averagePrice ? 'sell' : 'buy';

    const TRADE_SIZE = 100;
    const quantity = TRADE_SIZE/lastPrice;

    console.log(`Average price: ${averagePrice}. Last price: ${lastPrice}`);
    const order = await binance.createMarketOrder('BTC/USDT', direction, quantity);
    console.log(`${moment().format()}: ${direction}${quantity} BTC at ${lastPrice}`);
    
    printBalance(lastPrice);

}
async function main() {
    setInterval(async () => {
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }, 60 * 1000);
  }


main()
