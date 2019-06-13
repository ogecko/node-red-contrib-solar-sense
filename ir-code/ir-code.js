module.exports = function(RED) {
  "use strict";

  function parse(buffer) {
    return {
      type: buffer.readUInt16LE(8),
      code: buffer.readUInt16LE(10),
      val: buffer.readUInt32LE(12)
    };
  }

  // The main node definition - most things happen in here
  function irCode(n) {

    // Create a RED node
    RED.nodes.createNode(this, n);

    // Store local copies of the node configuration (as defined in the .html)
    this.device = "/dev/input/event0";  // gpio-ir and ir-keytable use this as the default event stream
    this.evtype = 1;                    // match EV_KEY events
    var node = this;

    var FS = require("fs");
    var options = { flags: "r", encoding: null, fd: null, autoClose: true };

    // Assume everything will be ok
    node.status({ fill: "green", shape: "dot", text: "linked" });

    // Open the input device as a readable stream
    var readStream = FS.createReadStream(this.device, options);

    readStream.on("data", function(buf) {
      var readElement = parse(buf);

      if (readElement != undefined) {
        if (readElement.type == node.evtype) {

          // send a node message with the EV_KEY code as the payload
          node.send({ payload: readElement.code });
        }
      }
    });

    readStream.on("error", function(e) {
      // indicate a problem opening the device stream
      node.status({ fill: "red", shape: "dot", text: "no device" });
      console.error(e);
    });

    this.on("close", function(readstream) {
      readstream.destroy();
    });
  }

  // Register the node by name. 
  // This must be called before overriding any of the Node functions.
  RED.nodes.registerType("ir code", irCode);
};
