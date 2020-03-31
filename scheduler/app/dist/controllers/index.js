"use strict";

module.exports = {
  helloWorld: (req, res) => {
    return res.json({
      'msg': 'Hello World'
    });
  },
  square: (req, res) => {
    const number = parseInt(req.params.number, 10);
    const result = number * number;
    return res.json({
      result
    });
  }
};