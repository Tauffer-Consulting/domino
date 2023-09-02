from bottle import run, Bottle, request
from domino.testing.dry_run import piece_dry_run
import json

app = Bottle()


@app.route('/test', method='POST')
def run_test():
    dry_run_args = json.loads(request.body.read())
    output_data = piece_dry_run(**dry_run_args)
    return output_data


@app.route("/health-check")
def health_check():
    return {"status": "ok"}


if __name__ == '__main__':
    run(app=app, host='0.0.0.0', port=8080)