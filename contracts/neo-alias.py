from boa.blockchain.vm.System.ExecutionEngine import GetScriptContainer
from boa.blockchain.vm.Neo.Transaction import *
from boa.blockchain.vm.Neo.Runtime import Log, Notify, GetTrigger, CheckWitness
from boa.blockchain.vm.Neo.Blockchain import GetHeight, GetHeader
from boa.blockchain.vm.Neo.TriggerType import Application, Verification
from boa.blockchain.vm.Neo.Storage import GetContext, Get, Put
from boa.blockchain.vm.Neo.Output import GetScriptHash
from boa.code.builtins import concat, list, range


# Global
VERSION = 18
OWNER = b'\x96P\xac\xd6\xb7S,\xb4\xeaiU\xedK\x0f\xd3\xaa\xa9\xc9Q\x87'  # Script has for AVUfegS354LWRoBuCzuKjGCYkT3tnpFFTD


# -- Chain of command


def Main(operation: str, args: list) -> bytearray:
    trigger = GetTrigger()

    # Though there's no explicit verification usage involved in this project, this is placed here to better align with NEP5 template
    if trigger == Verification():
        is_owner = CheckWitness(OWNER)
        Notify('Check is_owner:')
        Notify(is_owner)
        if is_owner:
            return True
        return False

    # Proceed with standard operation determininations
    elif trigger == Application():
        if operation == 'version':          # Output hard coded version value within the contract (not to be confused with metadata value in `getContractState`)
            result = do_version()
            return result
        elif operation == 'is_owner':       # Checking if invoker is the owner of the smart contract
            result = do_is_owner()
            return result

        # Standard Operations
        elif operation == 'count_alias':    # Count numbers of alias assigned to the specified address
            result = do_count_alias(args)
            return result
        elif operation == 'set_alias':      # Append a new alias to the specified address
            result = do_set_alias(args)
            return result
        elif operation == 'get_alias':      # Fetch alias name to the specified address of a specified index
            result = do_get_alias(args)
            return result
        elif operation == 'get_alias_score':  # Fetch score value of the specified address of a specified index
            result = do_get_alias_score(args)
            return result
        elif operation == 'get_aliases':    # Fetch all aliases to the specified address # NOTE: Deprecating, not been used
            result = do_get_aliases(args)
            return result
        elif operation == 'vote_alias':     # Cast your vote to the specified address of a specified index
            result = do_vote_alias(args)
            return result

        # Stats Operations
        elif operation == 'count_all':      # Count total alias created in this contract
            result = do_count_all_aliases()
            return result
        elif operation == 'get_all_index':  # Get the alias key of specified 'all index'
            result = do_get_all_index(args)
            return result

        # Admin Utilities
        elif operation == 'get_storage':    # Direct read access to a storage key. Can only be invoked by contract owner
            result = do_get_storage(args)
            return result
        elif operation == 'set_storage':    # Direct write access to a storage key. Can only be invoked by contract owner
            result = do_set_storage(args)
            return result
        elif operation == 'my_address':     # Output invoker's address. Asset attachment is required to invoke this operation
            result = get_invoker_address()
            return result

        Notify('unknown operation')
        return False

    Notify('invalid request')
    return False


# -- Operation delegator with input validation


def do_version() -> int:
    version = VERSION + 0
    Notify('version:')
    Notify(version)
    return version


def do_is_owner() -> bool:
    return CheckWitness(OWNER)


def do_count_alias(args: list) -> int:
    # Notify('do_count_alias triggered.')
    # Notify('args:')
    # Notify(args)
    if len(args) > 0:
        context = GetContext()
        address = args[0]   # Expect a string value
        result = get_alias_count(context, address)
        return result
    Notify('invalid argument length')
    return False


def do_set_alias(args: list) -> bool:
    if len(args) > 2:
        context = GetContext()
        invoker_address = args[0]   # Expect a string value
        target_address = args[1]    # Expect a string value
        new_alias = args[2]         # Expect a string value
        # -- Ignore invoker validation for now
        # is_match = CheckWitness(invoker_address)
        # Notify('Check is_match:')
        # Notify(is_match)
        # if is_match == False:  # Validate invoker
        #     Notify('mismatch invoker address')
        #     return False
        result = set_alias(context, invoker_address, target_address, new_alias)
        return result
    Notify('invalid argument length')
    return False


def do_get_alias(args: list) -> str:
    if len(args) > 1:
        context = GetContext()
        address = args[0]   # Expect a string value
        index = args[1]     # Expect an integer
        result = get_alias(context, address, index)
        return result
    Notify('invalid argument length')
    return False


def do_get_alias_score(args: list) -> int:
    if len(args) > 1:
        context = GetContext()
        address = args[0]   # Expect a string value
        index = args[1]     # Expect an integer
        score = get_alias_score(context, address, index)
        return score
    Notify('invalid argument length')
    return False


def do_get_aliases(args: list) -> list:
    if len(args) > 0:
        context = GetContext()
        address = args[0]   # Expect a string value
        result = get_aliases(context, address)
        return result
    Notify('invalid argument length')
    return False


def do_vote_alias(args: list) -> int:
    if len(args) > 3:
        context = GetContext()
        invoker_address = args[0]           # Expect a string value
        target_address = args[1]            # Expect a string value
        index = args[2]                     # Expect an integer
        point = args[3]                     # Expect an integer
        count = get_alias_count(context, target_address)
        if (index < 0 or index >= count):   # Validate target index
            Notify('invalid index value provided')
            return False
        if point != 1 and point != -1:      # Validate vote point value. Currently only support value of '1' or '-1' to represent 'up' and 'down' votes
            Notify('invalid vote point provided')
            return False
        else:
            # -- Ignore Invoker validation for now
            # is_match = CheckWitness(invoker_address)
            # Notify('Check is_match:')
            # Notify(is_match)
            # if is_match == False:  # Validate invoker
            #     Notify('mismatch invoker address')
            #     return False
            result = vote_alias(context, invoker_address, target_address, index, point)
            return result
    Notify('invalid argument length')
    return False


def do_count_all_aliases() -> number:
    context = GetContext()
    address = 'all'
    result = get_alias_count(context, address)
    return result


def do_get_all_index(args: list) -> bytearray:
    Notify('do_get_all_index triggered.')
    if len(args) > 0:
        context = GetContext()
        index = args[0]     # Expect an integer
        Notify('index:')
        Notify(index)
        key = prepare_alias_key('all', index)
        Notify('key:')
        Notify(key)
        result = Get(context, key)
        Notify('result:')
        Notify(result)
        return result
    Notify('invalid argument length')
    return False


def do_get_storage(args: list) -> bytearray:
    Notify('do_get_storage triggered.')
    is_owner = CheckWitness(OWNER)
    if is_owner == False:
        Notify('permission denied')
        return False
    if len(args) > 0:
        context = GetContext()
        key = args[0]   # Expect a string value
        Notify('key:')
        Notify(key)
        value = Get(context, key)
        Notify('value:')
        Notify(value)
        return value
    Notify('invalid argument length')
    return False


def do_set_storage(args: list) -> bytearray:
    Notify('do_set_storage triggered.')
    is_owner = CheckWitness(OWNER)
    if is_owner == False:
        Notify('permission denied')
        return False
    if len(args) > 1:
        context = GetContext()
        key = args[0]   # Expect a string value
        Notify('key:')
        Notify(key)
        value = args[1] # Expect a string value
        Notify('value:')
        Notify(value)
        Put(context, key, value)
        return True
    Notify('invalid argument length')
    return False


# -- Concrete methods with business logic


def get_alias_count(context, address: str) -> int:
    # TODO: validate target address
    Notify('get_alias_count triggered.')
    key = prepare_count_key(address)
    Notify('key:')
    Notify(key)
    value = Get(context, key)
    if value == None:       # Must use ==. use of 'is' will provides false negative
        Notify('oh, value detected to be None.')
        value = 0
    else:
        value = value + 0   # trick value to always be an integer # NOTE: is this even a real hack?
    Notify('value:')
    Notify(value)
    return value


def set_alias_count(context, address: str, count: int) -> bool:
    key = prepare_count_key(address)
    Put(context, key, count)
    return True


def increment_alias_count(context, address: str, existing_count: int) -> bool:
    new_count = existing_count + 1
    is_success = set_alias_count(context, address, new_count)
    return is_success


def set_alias(context, invoker_address: str, target_address: str, new_alias: str) -> bool:
    # TODO: get invokers address
    # TODO: verify if this is the first time invoker assigning alias to target address
    Notify('set_alias triggered.')
    index = get_alias_count(context, target_address)                # Obtain the current alias count of specified address. This will then serve as the next index for this alias assignment.
    Notify('index:')
    Notify(index)
    key = prepare_alias_key(target_address, index)
    Notify('key:')
    Notify(key)
    Put(context, key, new_alias)
    # Update counter of this address
    new_count = index + 1
    Notify('new_count:')
    Notify(new_count)
    set_alias_count(context, target_address, new_count)
    # Keep track of all records
    all_index = get_all_count(context)
    Notify('all_index:')
    Notify(all_index)
    set_all_alias(context, all_index, key)                          # Store alias key as value for all records
    increment_all_count(context, all_index)
    # log invoker's address assignment by cast default 1 point vote
    vote_alias(context, invoker_address, target_address, index, 1)  # TODO: we can reduce GAS cost by omit check_has_voted()
    return True


def get_alias(context, address: str, index: int) -> str:
    key = prepare_alias_key(address, index)
    alias = Get(context, key)
    Notify('alias:')
    Notify(alias)
    return alias


def get_aliases(context, address: str) -> list:
    # NOTE: Untested code
    count = get_alias_count(context, address)
    i = 0
    alias_list = []
    while (i < count):
        alias = get_alias(context, address, i)
        alias_list.append(alias)
        i = i + 1
    return alias_list


def vote_alias(context, invoker_address: str, target_address: str, index: int, point: int) -> int:
    Notify('vote_alias triggered.')
    # check if already voted previously
    has_voted = check_has_voted(context, invoker_address, target_address, index)
    Notify('has_voted:')
    Notify(has_voted)
    if has_voted == False:
        existing_score = get_alias_score(context, target_address, index)        # Get stored score for this alias
        Notify('existing_score:')
        Notify(existing_score)
        new_score = existing_score + point                                      # Update value
        Notify('new_score:')
        Notify(new_score)
        set_alias_score(context, target_address, index, new_score)              # Store new score
        log_vote(context, invoker_address, target_address, index, new_score)    # Set vote log
        return new_score
    else:
        Notify('invoker has already voted for this alias')
        return False


def get_alias_score(context, address: str, index: int) -> int:
    Notify('get_alias_score triggered.')
    key = prepare_score_key(address, index)
    value = Get(context, key)
    if value == None:
        Notify('existing score value detected to be None.')
        value = 0
    return value


def set_alias_score(context, address: str, index: int, score: int) -> bool:
    key = prepare_score_key(address, index)
    Put(context, key, score)
    return True


def get_all_count(context) -> int:
    result = get_alias_count(context, 'all')
    return result


def set_all_alias(context, index: int, value: str) -> bool:
    key = prepare_alias_key('all', index)
    Put(context, key, value)
    return True


def increment_all_count(context, existing_count: int) -> bool:
    result = increment_alias_count(context, 'all', existing_count)
    return result


def check_has_voted(context, invoker_address: str, target_address: str, index: int) -> bool:
    Notify('check_has_voted triggered')
    key = prepare_log_vote_key(invoker_address, target_address, index)
    value = Get(context, key)
    Notify('value:')
    Notify(value)
    if value == None:
        return False
    else:
        return True


def log_vote(context, invoker_address: str, target_address: str, index: int, score: int) -> bool:
    key = prepare_log_vote_key(invoker_address, target_address, index)
    Put(context, key, score)
    return True


# -- Dumb, functional methods


def prepare_count_key(address: str) -> str:
    # Format: {address}_count
    key = concat(address, '_count')
    return key


def prepare_alias_key(address: str, index: int) -> str:
    # Format: {address}_{index}
    key = concat(address, '_')
    key = concat(key, index)
    return key


def prepare_score_key(address: str, index: int) -> str:
    # Format: {address}_{index}_score
    key = concat(address, '_')
    key = concat(key, index)
    key = concat(key, '_score')
    return key


def prepare_log_vote_key(invoker_address: str, target_address: str, index: int) -> str:
    # Format: {target_address}_{alias_index}_{invoker_address}
    key = concat(target_address, '_')
    key = concat(key, index)
    key = concat(key, '_')
    key = concat(key, invoker_address)
    return key


def get_invoker_address() -> str:
    '''
    I don't think you can Notify() tx, references nor reference.
    Also you cannot really have validators in place, usages like "if tx is not None" will error'ed out.
    '''
    Notify('get_invoker_address triggered.')
    tx = GetScriptContainer()
    references = tx.References
    reference = references[0]
    sender_addr = reference.ScriptHash
    Notify('sender_addr:')
    Notify(sender_addr)
    return sender_addr
