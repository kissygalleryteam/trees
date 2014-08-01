config({
    'kg/trees/index': {requires: ["kg/trees/store", "kg/trees/base", "kg/trees/tree", "kg/trees/viewstore", "kg/trees/view", "kg/trees/list", "kg/trees/select", "kg/trees/city"]},
    "kg/trees/store": {requires: ['core']},
    "kg/trees/base": {requires: ['kg/trees/store', 'xtemplate', 'core']},
    "kg/trees/tree": {requires: ['tree', 'kg/trees/base', 'kg/trees/tree.css']},
    "kg/trees/view": {requires: ['kg/trees/base', 'kg/trees/viewstore']},
    "kg/trees/viewstore": {requires: ['kg/trees/store']},
    "kg/trees/list": {requires: ['kg/trees/view', 'kg/trees/list.css']},
    "kg/trees/select": {requires: ['kg/trees/view']},
    "kg/trees/city": {requires: ['kg/trees/select']}
});