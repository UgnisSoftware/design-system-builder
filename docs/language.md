Ugnis-script is a declarative functional reactive reflective self-hosting language

every functions has a _type
?complex data types have _definition

whats displayed != whats written != how it runs

interpreter reads the code and executes

code is json

state is a subset of json

code can be others state

vdom
vstate

app(def, defaultState)

{
  _type: app
  view: {}
  state: {}
  actions: {}
  mutators: {}
  defaultState: {}
}

_type: app
definition: {
    view: {
      _type: 'collection'
    }
    state:
}


what should be displayed => how to write it and run it

whats displayed != whats written != how it runs
whats displayed != whats written != how it runs
whats displayed != whats written != how it runs
whats displayed != whats written != how it runs








what if one collections keeps a reference to another collection
nesting?

example:

toad:
  - completed: boolean
  - text: string


1.what is should do?

when using a collection
  - can be listed (data, reference) / filtered / reduced / reversed / sliced / sorted
  - can be accessed by reference / searched

2.how to display?

3.how it's written down?

collection:
  - written by reference
  - can be accessed with reference or order number

4.how it runs?




toads = {
    _title: 'toad list'
    _description: {
        completed: 'boolean',
        text: 'string',
    },
    _order: [id_1, id_2, id_3],
    id_1: {
        completed: true
        text: 'first tod'
    },
    id_2: {
        completed: false
        text: 'second toad'
    },
    id_3: {
        completed: true
        text: 'last toad'
    },
}

list = {
    title: 'string list'
    description: string
    order: [id_1, id_2, id_3],
}


SAVE_ACTION = {
    state: state.state
    view: state.view
    events: state.events
    mutators: state.mutators
}



When I get a reference to an object in a collection





Why do I need collections?
