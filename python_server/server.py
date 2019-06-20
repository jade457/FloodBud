from flask import Flask, request, jsonify
app = Flask(__name__)
import importlib

@app.route("/")
def gateway():
    arguments = request.args
    if 'file' not in arguments:
        return jsonify("No file passed")
    if 'function' not in arguments:
        return jsonify("No function passed")

    module = importlib.import_module(arguments["file"])

    modified_arguments = {k: v for (k, v) in arguments.items() if k not in ["file", "function"]}
    return jsonify(getattr(module, arguments["function"])(**modified_arguments))

if __name__ == "__main__":
    app.run(debug=True)
