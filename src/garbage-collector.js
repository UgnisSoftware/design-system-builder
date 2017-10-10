const R = require('ramda')

module.exports = function collectGarbage(definition) {
    let cleanDefinition = {
        id: definition.id,
        version: definition.version,
        reactPath: definition.reactPath,
        reactNativePath: definition.reactNativePath,
        eventData: definition.eventData,
        state: definition.state,
        table: definition.table,
        nameSpace: definition.nameSpace,
        toLowerCase: {},
        toUpperCase: {},
        equal: {},
        and: {},
        or: {},
        not: {},
        length: {},
        split: {},
        branch: {},
        pipe: {},
        join: {},
        add: {},
        subtract: {},
        multiply: {},
        divide: {},
        remainder: {},
        vNodeBox: {},
        vNodeText: {},
        vNodeInput: {},
        vNodeList: {},
        vNodeIf: {},
        vNodeImage: {},
        style: {},
        push: {},
        row: {},
        column: {},
        mutator: {},
        event: {},
    }

    const vNodeNames = ['vNodeBox', 'vNodeText', 'vNodeInput', 'vNodeList', 'vNodeIf', 'vNodeImage']

    function updateCleanDefinition(transformation) {
        cleanDefinition = R.evolve(transformation, cleanDefinition)
    }

    function findNode(ref) {
        return definition[ref.ref][ref.id]
    }

    function cacheColumn(ref) {
        const column = findNode(ref)

        updateCleanDefinition({ column: R.assoc(ref.id, column) })
        resolve(column.value)
    }

    // Cache columns used by tables.
    R.values(definition.table).forEach(table => {
        table.columns.forEach(stateRef => {
            R.forEachObjIndexed((column, id) => {
                if (R.equals(R.prop('state', column), stateRef)) {
                    cacheColumn({ ref: 'column', id })
                }
            }, definition.column)
        })
    })

    function cacheTransformation(ref) {
        const transformation = findNode(ref)

        updateCleanDefinition({ [ref.ref]: R.assoc(ref.id, transformation) })

        if (R.has('value', transformation)) {
            resolve(transformation.value)
        }

        if (R.has('row', transformation)) {
            resolve(transformation.row)
        }
    }

    function cachePipe(ref) {
        const pipe = findNode(ref)

        updateCleanDefinition({ pipe: R.assoc(ref.id, pipe) })
        resolve(pipe.value)
        pipe.transformations.forEach(cacheTransformation)
    }

    function cacheStyle(ref) {
        const style = findNode(ref)

        updateCleanDefinition({ style: R.assoc(ref.id, style) })
        R.values(style).forEach(resolve)
    }

    function cacheMutator(ref) {
        const mutator = findNode(ref)

        updateCleanDefinition({ mutator: R.assoc(ref.id, mutator) })
        resolve(mutator.mutation)
    }

    function cacheEvent(ref) {
        const event = findNode(ref)

        updateCleanDefinition({ event: R.assoc(ref.id, event) })
        event.mutators.forEach(cacheMutator)
    }

    function cacheBranch(ref) {
        const branch = findNode(ref)

        updateCleanDefinition({ branch: R.assoc(ref.id, branch) })
        R.values(branch).forEach(resolve)
    }

    function cacheSplit(ref) {
        const split = findNode(ref)

        updateCleanDefinition({ split: R.assoc(ref.id, split) })
        resolve(split.defaultValue)
        split.branches.forEach(cacheBranch)
    }

    function cacheVnode(ref) {
        const node = findNode(ref)

        updateCleanDefinition({ [ref.ref]: R.assoc(ref.id, node) })

        if (R.has('style', node)) {
            resolve(node.style)
        }

        if (R.has('value', node)) {
            resolve(node.value)
        }

        if (R.has('src', node)) {
            resolve(node.src)
        }

        if (R.has('events', node)) {
            node.events.forEach(cacheEvent)
        }

        if (R.has('children', node)) {
            node.children.forEach(resolve)
        }
    }

    function cacheRow(ref) {
        updateCleanDefinition({ row: R.assoc(ref.id, findNode(ref)) })
    }

    function resolve(ref) {
        if (R.contains(ref.ref, [undefined, 'eventData', 'state', 'table'])) {
            return
        }

        if (ref.ref === 'split') {
            cacheSplit(ref)
            return
        }

        if (ref.ref === 'pipe') {
            cachePipe(ref)
            return
        }

        if (R.contains(ref.ref, vNodeNames)) {
            cacheVnode(ref)
            return
        }

        if (ref.ref === 'style') {
            cacheStyle(ref)
            return
        }

        if (ref.ref === 'row') {
            cacheRow(ref)
            return
        }

        throw new Error(JSON.stringify(ref))
    }

    resolve({ ref: 'vNodeBox', id: '_rootNode' })

    return cleanDefinition
}
