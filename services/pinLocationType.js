import ApiWrapper from '../services/api';
const Api = new ApiWrapper();

global.pinLocationTypeNames = [];
global.pinLocationTypes = [];

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export const getPinLocationTypes = async userId => {
  const types = await Api.getPinLocationTypes();
  global.pinLocationTypes = types;

  for (type in types) {
    for (key in types[type]) {
      if ((key = 'Name')) {
        if (!global.pinLocationTypeNames.includes[types[type][key]]) {
          global.pinLocationTypeNames.push(types[type][key]);
        }
      }
    }
  }

  return uniqueTypes;
};
