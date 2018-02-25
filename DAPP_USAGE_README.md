# dApp Usage Documentation

## Summary

* Web dApp: http://neoalias.com/
* Contract is available on 'NEO Testnet'
* Contract hash: `83d3ddd44f4c197152b827f3660b00a49fcb5d22` (version 18)
* You may refer to [Smoke Test Document](SMOKE_TEST_README.md) for example contract invocations via `neo-python`

---

## Web dApp Usage

### To Create a new Alias

* Browse to http://neoalias.com/
* Find 'Set Alias' module on the page and populate the form asking for basic information in order to perform this task.
  * Please supply a WIF to a wallet with some GAS in it as required to invoke the contract.
* By click on the submit button, button itself will disappear to avoid accidental duplicate entries.
* Wait for few seconds before seeing a notification callout.
* If you get a success message, the newly created alias should be on blockchain within a minute.
* If you get a failed message, there are few possibilities:
  * Invalid input parameters
  * Blockchain unable to process this invocation instance for some reason, you may get a success if retry.
* You may create another new alias by refresh the page to bring back the submit button.

### To View Aliases of a Given Address

* Browse to alias listing page with URL format: `http://neoalias.com/?w={ADDRESS}`
* The web app should load up list of aliases associated with the specified address.
* If there's no aliases available to the specified address, the alias table will remain empty.

### To Cast Vote on an Alias

* Browse to alias listing page with URL format: `http://neoalias.com/?w={ADDRESS}`
* The web app should load up list of aliases associated with the specified address.
* Populate the "Your WIF" field of a wallet with some GAS in it as required to invoke the contract.
* Click on 'Vote Up' or 'Vote Down' to cast a vote. Link will disappear to avoid accidental duplicate entries.
* Wait for few seconds before seeing a notification callout.
* If you get a success message, the vote should be on blockchain within a minute.
* If you get a failed message, there are few possibilities:
  * Invalid input parameters
  * The wallet of given WIF may have already cast a vote to the specified alias and is restricted from casting multiple votes.
  * Blockchain unable to process this invocation instance for some reason, you may get a success if retry.
