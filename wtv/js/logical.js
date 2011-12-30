(function (v1z) {

    v1z.tree = {
        create: function (world) {
            var nodes = {};
            nodes[0] = world;

            return {
                replace: function (node) {
                    var old = nodes[node.id];
                    if (old && node.parent_id !== old.parent_id) {
                        nodes[old.parent_id].remove(old);
                        nodes[node.parent_id].add(node);
                    }
                    nodes[node.id] = node;
                },
                remove: function (id) {
                    var old = nodes[id];
                    nodes[old.parent_id].remove(old);
                },
                update: function (node) {
                    var old = nodes[node.id], property;
                    if (node.parent_id && node.parent_id !== old.parent_id) {
                        nodes[old.parent_id].remove(old);
                        nodes[node.parent_id].add(old);
                    }
                    for (property in node) {
                        if (node.hasOwnProperty(property)) {
                            old[property] = node[property];
                        }
                    }
                }
            };
        }
    };

} (window.v1z = window.v1z || {}));
