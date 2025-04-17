# orionlotto
Full-stack casino app built with Solid.js, Express.js, and Socket.IO. Features deposit and withdrawal of crypto (Stellar USDC). Only has one game, crash:
- Place your bet before the round starts.
- Once the round begins, the multiplier starts at 1x and starts increasing.
- Cash out before the crash. The crash multiplier is determined by a [provably fair](https://orion.ebra.dev/fair) chain of SHA hashes. 
- If you cashed out before the crash, the multiplier during your cash out determines your winnings.

Demo available [here](https://orion.ebra.dev/)! An account (no email needed), and some USDC in a stellar wallet is needed to play (you can fork and remove this).

## Screenshots
<img src="https://raw.githubusercontent.com/beans42/orionlotto/main/demo.png" alt="main page" height="300px"> <img src="https://raw.githubusercontent.com/beans42/orionlotto/main/demo1.png" alt="while betting" height="300px"> <img src="https://raw.githubusercontent.com/beans42/orionlotto/main/demo2.png" alt="between rounds" height="300px">
