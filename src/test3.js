// API

function createElement(tagName){
    return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName){
    return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text){
    return document.createTextNode(text);
}

function insertBefore(parentNode, newNode, referenceNode){
    parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child){
    node.removeChild(child);
}

function appendChild(node, child){
    node.appendChild(child);
}

function parentNode(node){
    return node.parentElement;
}

function nextSibling(node){
    return node.nextSibling;
}

function tagName(node){
    return node.tagName;
}

function setTextContent(node, text){
    node.textContent = text;
}

// /API


// static
const nodes = [
    {
        type: 'box',
        children: [1],
    },
    {
        type: 'text',
        value: 'Hi',
    }
]

nodesToHTML(nodes);

function nodesToHTML(nodes){
    function nodeToHTML(node) {
        if (node.type === 'box'){
            const newNode = createElement('div')
            if (node.children){
                node.children.forEach(function(id){
                    newNode.appendChild(nodeToHTML(nodes[id]))
                })
            }
            return newNode
        }
        if (node.type === 'text'){
            return createTextNode(node.value)
        }
        throw new Error('Mistake in a node definition' + JSON.stringify(node))
    }
    const node = nodeToHTML(nodes[0])

    document.body.appendChild(node)
}