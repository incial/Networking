const { v4: uuidv4 } = require("uuid");

function generateSlug() {
  return uuidv4();
}

module.exports = generateSlug;