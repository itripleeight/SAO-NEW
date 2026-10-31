# Square checkout for the wrap builder

When a customer finishes building a wrap at `/build-your-shawarma` and clicks **Order Online**, the
site creates the order in Square for the store they picked (their nearest store by default) and
sends them to Square's secure checkout with the wrap already in it. They only enter their contact
details and pay. The order arrives at that store as a pickup order.

How it fits together:

- `functions/` holds a small Firebase Cloud Function (`wrapOrders`). It reads the "Shawarma Wrap"
  item and its options and prices from your Square catalog, and creates the checkout link.
- `functions/wrap.js` maps each builder choice to its name on your Square menu (for example
  `gyro` → "Gyro Meat"). If an option is renamed in Square, update it there.
- The builder shows Square's prices and a running total, and falls back to the wrap on your Square
  Online menu if checkout can't start.

Everything starts in Square's **sandbox**: fake money, fake orders, nothing reaches your stores.

## 1. Try it with the sandbox

1. Go to <https://developer.squareup.com/apps>, sign in with your Square account, and create an
   application (for example "Shawarma Alley website").
2. Open the app, choose **Sandbox** at the top, and copy the **Sandbox Access token** from the
   Credentials page.
3. Paste it into `functions/.secret.local` after `SQUARE_ACCESS_TOKEN=`. Keep this file to yourself.
   It never gets deployed or committed.
4. Create a test copy of the Shawarma Wrap in the sandbox:

   ```bash
   npm --prefix functions run seed:sandbox
   ```

5. Start the function and the site, in two terminals:

   ```bash
   npm run functions:dev
   ```

   ```bash
   npm run dev
   ```

6. Open <http://localhost:5173/build-your-shawarma>, build a wrap, and click **Order Online**. Square's
   sandbox checkout opens. Pay with a sandbox test card such as `4111 1111 1111 1111`, any future
   expiry date and CVV `111` ([more test values](https://developer.squareup.com/docs/devtools/sandbox/payments)).
7. You land back on the builder with a "Thanks, your order is in!" message. To see the order, open
   **Sandbox test accounts** in the Developer Console and choose **Open in Square Dashboard**, then
   go to Orders.

In the sandbox every order goes to the sandbox's own test location, whichever store was picked.

## 2. Go live

1. **Firebase plan:** Cloud Functions need the Blaze (pay-as-you-go) plan on the `shawaramaalley`
   Firebase project. Its free monthly allowance (about 2 million function calls) is far more than
   this needs.
2. **Production token:** in your Square app, switch to **Production** and copy the access token. Store
   it in Firebase (it asks you to paste the token):

   ```bash
   npx firebase functions:secrets:set SQUARE_ACCESS_TOKEN
   ```

3. **Settings:** in `functions/.env`, set
   - `SQUARE_ENVIRONMENT=production`
   - `SQUARE_WRAP_ITEM_ID=ZSFS6Y7A54CAST7CU5Q36YBV` (the live Shawarma Wrap)
   - `ALLOWED_ORIGINS`: add your website's address, for example `https://www.yourdomain.com`
4. **Deploy:**

   ```bash
   npx firebase deploy --only functions,hosting
   ```

   **Heads-up:** this folder deploys to the same Firebase project as the live website, so this
   replaces the live site with this version. Do it once you're happy for these changes to go live.
5. **Check one real order:** place a small order, make sure it shows up on that store's Square POS and
   kitchen printer as a pickup order, then refund it from the Square Dashboard.

## Good to know

- **Menu changes:** prices update by themselves. If you rename or remove one of the wrap's options in
  Square, checkout stops for that wrap and customers get the link to your Square menu instead, so a
  wrong order never goes through. Fix it by matching the name in `functions/wrap.js`.
- **Only the wrap:** Square's checkout page only holds what was built, so customers can't add drinks or
  sides there. A drinks-and-sides step in the builder would cover that.
- **Tips** are off. To offer them, add `allow_tipping: true` to `checkout_options` in `functions/index.js`.
- **Pickup time:** orders are marked ready in `PICKUP_PREP_MINUTES` (15 by default) in `functions/.env`.
- **Tests:** `npm run functions:test` checks the order building against a fake Square, with no account needed.
