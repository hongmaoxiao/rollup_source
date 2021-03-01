import walk from '../ast/walk';
import { hasOwnProp } from './object';

export default function replaceIdentifiers (statement, snippet, names) {
  const replacementStack = [names];

  const keys = Object.keys(names);

  if (keys.length === 0) {
    return;
  }

  walk(statement, {
    enter(node, parent) {
      const scope = node._scope;

      if (scope) {
        let newNames = {};
        let hasReplacements;

        keys.forEach(key => {
          if (!~scope.names.indexOf(key)) {
            newNames[key] = names[key];
            hasReplacements = true;
          }
        });

        if (!hasReplacements) {
          return this.skip();
        }

        replacementStack.push(newNames);
      }
      
      if (node.type === 'Identifier' && parent.type !== 'MemberExpression') {
        let name = node.name;

        while (hasOwnProp.call(names, name) && name !== names[name]) {
          name = names[name];
        }

        if (name && name !== node.name) {
          snippet.overwrite(node.start, node.end, name);
        }
      }
    },
    leave(node) {
      if (node._scope) {
        replacementStack.pop();
        names = replacementStack[replacementStack.length - 1];
      }
    }
  });
}