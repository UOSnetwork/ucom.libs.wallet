# How to use

## Interactions with backend.u.community

### Notes ###
* All transactions are sent to the blockchain through backend.u.community application.
* Client goal - sign transaction and send it to the backend.u.community

### Trust transactions

1. Get signed transaction as string using `SocialApi.getTrustUserSignedTransactionsAsJson`.
2. Add this string to form-data, field name is `signed_transaction`.
