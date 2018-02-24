# Smock Test for NeoAlias

## Summary

* Ensure smart contract event is enabled: `config sc-events on`

## Against PrivNet

### Global attributes

``` sh
build ./contracts/neo-alias.py test 0710 05 True False version
build ./contracts/neo-alias.py test 0710 05 True False is_owner
build ./contracts/neo-alias.py test 0710 05 True False count_all
build ./contracts/neo-alias.py test 0710 05 True False get_all_index [0]
build ./contracts/neo-alias.py test 0710 05 True False get_storage ['all_\x00']
```

### Alias assignments

* Cannot have space characters
* UTF-8 characters seems fine

``` sh
build ./contracts/neo-alias.py test 0710 05 True False count_alias ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy']
build ./contracts/neo-alias.py test 0710 05 True False get_alias ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
build ./contracts/neo-alias.py test 0710 05 True False set_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy','ayu']

build ./contracts/neo-alias.py test 0710 05 True False count_alias ['AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU']
build ./contracts/neo-alias.py test 0710 05 True False get_alias ['AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU',0]
build ./contracts/neo-alias.py test 0710 05 True False set_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU','azrel.adams']
build ./contracts/neo-alias.py test 0710 05 True False set_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU','azrel.adams签名']
```

### Alias score check

``` sh
build ./contracts/neo-alias.py test 0710 05 True False get_alias_score ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
build ./contracts/neo-alias.py test 0710 05 True False get_alias_score ['AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU',0]
```

### Cast votes

```sh
build ./contracts/neo-alias.py test 0710 05 True False vote_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0,1]
build ./contracts/neo-alias.py test 0710 05 True False get_alias_score ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
```

Cast vote with a mismatch invoker address

```sh
build ./contracts/neo-alias.py test 0710 05 True False vote_alias ['BAD','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0,1]
```

Switch to `neo-privnet.wallet` for casting vote

```sh
build ./contracts/neo-alias.py test 0710 05 True False vote_alias ['AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0,1]
build ./contracts/neo-alias.py test 0710 05 True False get_alias_score ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
```

---

## Against TestNet

### Global attributes

``` sh
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 version
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 is_owner
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 count_all
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_all_index [0]
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_storage ['all_\x00']
```

### Alias assignments

* Cannot have space characters
* UTF-8 characters seems fine

``` sh
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 count_alias ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy']
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_alias ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 set_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy','ayu']

testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 count_alias ['AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU']
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_alias ['AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU',0]
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 set_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU','azrel.adams']
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 set_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU','azrel.adams签名']
```

### Alias score check

``` sh
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_alias_score ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_alias_score ['AZLvNpvTmDvEL4Qc5AH64vniSJe11LHzWU',0]
```

### Cast votes

```sh
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 vote_alias ['AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0,1]
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_alias_score ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
```

Cast vote with a mismatch invoker address

```sh
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 vote_alias ['BAD','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0,1]
```

Switch to `neo-privnet.wallet` for casting vote

```sh
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 vote_alias ['AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y','AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0,1]
testinvoke 83d3ddd44f4c197152b827f3660b00a49fcb5d22 get_alias_score ['AYUhHYViEoXEWeLQsXU9y1taps4nvjAHiy',0]
```
