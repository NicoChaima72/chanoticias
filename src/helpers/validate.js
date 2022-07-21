const Validator = require("validatorjs"); /**https://www.npmjs.com/package/validatorjs */
const _ = require("underscore");

Validator.useLang("es");
const messages = Validator.getMessages("es");

const deleteAttributeInMessage = (messages) => {
  for (const key in messages) {
    if (typeof messages[key] === "string") {
      messages[key] = messages[key].replace(" :attribute ", " ");
    } else {
      if (messages[key]) deleteAttributeInMessage(messages[key]); //**recursion */
    }
  }
};

deleteAttributeInMessage(messages);
// custom messages
Validator.setMessages("es", messages);

const validator = (body, rules, customMessages, callback) => {
  const validation = new Validator(body, rules, customMessages);

  validation.passes(() => callback(null, true));
  validation.fails(() => {
    const fails = validation.errors.errors;

    // console.log(validation.errors.all());
    // const errors = [];

    // for (const key in fails) {
    // 	errors.push({ [key]: { message: fails[key][0] } });
    // }

    const errors = {};

    for (const key in fails) {
      errors[key] = { message: fails[key][0] };
    }

    return callback(errors, false);
  });
};

module.exports = validator;
